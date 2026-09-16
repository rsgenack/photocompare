'use client';

import { useMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/utils/analytics';
import { debugLog, monitorFocus } from '@/utils/debug-utils';
import { formatNumber } from '@/utils/format';
import {
    applyComparison,
    countRemainingComparisons,
    isRankingStable,
    makePairKey,
    pairFromIds,
    rankImages,
    rankingProgress,
    selectNextPair,
    withTrueSkillDefaults,
} from '@/utils/ranking';
import { scrollToTop } from '@/utils/scroll-utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import ComparisonTypePage from './comparison-type-page.jsx';
import ComparisonView from './comparison-view.jsx';
import DimensionWarningModal from './dimension-warning-modal.jsx';
import FullScreenCompare from './fullscreen-compare.jsx';
import IntroPage from './intro-page.jsx';
import ResultsPage from './results-page.jsx';
import SplashScreen from './splash-screen.jsx';
import UploadPage from './upload-page.jsx';

// =====================================================================
// LOCKED COMPONENT - VERSION 6
// This component's slider comparison functionality has been locked to
// Version 6. Do not modify the slider comparison code or its behavior.
// =====================================================================

export default function PhotoCompare() {
  // State declarations
  const [step, setStep] = useState('splash');
  const [comparisonType, setComparisonType] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentPair, setCurrentPair] = useState(null);
  const [completedComparisons, setCompletedComparisons] = useState({});
  const [zoom, setZoom] = useState(100);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showDimensionWarning, setShowDimensionWarning] = useState(false);
  const isMobile = useMobile();
  const [imageAspectRatio, setImageAspectRatio] = useState(null);
  const [processingSelection, setProcessingSelection] = useState(false); // Add state to track selection processing
  const [overlayMode, setOverlayMode] = useState('slider'); // For versions: 'slider' or 'side-by-side'
  const lastComparedKeyRef = useRef(null);
  const allowAutoStopRef = useRef(true);

  // Add this inside the component body, after the state declarations:
  useEffect(() => {
    // Monitor focus changes to help debug keyboard navigation
    monitorFocus();

    // Log component mounting
    debugLog('PhotoCompare', 'Component mounted');

    return () => {
      debugLog('PhotoCompare', 'Component unmounted');
    };
  }, []);

  const chooseNextPair = useCallback((images, lastPairKey = lastComparedKeyRef.current) => {
    return pairFromIds(images, selectNextPair(images, { lastPairKey }));
  }, []);

  // Handle step changes with scroll to top
  const changeStep = useCallback((newStep) => {
    scrollToTop();
    setStep(newStep);
    // push slug to URL so refresh preserves state
    try {
      const slug = newStep === 'intro' ? 'start' : newStep;
      const url = `/${slug}`;
      window.history.pushState({ step: newStep }, '', url);
    } catch {}
  }, []);

  // Rank by TrueSkill μ without resetting ratings so users can keep ranking.
  const calculateFinalRankings = useCallback((images = uploadedImages) => {
    try {
      setUploadedImages(rankImages(images.map(withTrueSkillDefaults)));
      setError(null);
    } catch (err) {
      console.error('Error calculating rankings:', err);
      setError('Error calculating final rankings');
    }
  }, [uploadedImages]);

  const keepRanking = useCallback(() => {
    // If the user continues after auto-stop, don't bounce back to results.
    // Early SEE RANKINGS still allows auto-stop once adjacent pairs separate.
    if (isRankingStable(uploadedImages)) {
      allowAutoStopRef.current = false;
    }
    changeStep('compare');
  }, [changeStep, uploadedImages]);

  const beginFreshComparison = useCallback(() => {
    lastComparedKeyRef.current = null;
    allowAutoStopRef.current = true;
    setCompletedComparisons({});
    setCurrentPair(null);
    setProcessingSelection(false);
    setError(null);
    setProgress(0);
  }, []);

  // Check if images have different dimensions
  const checkImageDimensions = useCallback(() => {
    const checkDimensions = async () => {
      try {
        if (comparisonType !== 'versions' || uploadedImages.length < 2) return true;

        // Create a function to get image dimensions
        const getImageDimensions = (url) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Add this to avoid CORS issues
            img.onload = () => {
              resolve({
                width: img.width,
                height: img.height,
                aspectRatio: img.width / img.height,
              });
            };
            img.onerror = () => {
              console.error(`Error loading image: ${url}`);
              resolve({ width: 0, height: 0, aspectRatio: 0 });
            };
            img.src = url;
          });
        };

        // Check all images against the first one
        const dimensions = await Promise.all(
          uploadedImages.map((img) =>
            getImageDimensions(img.url).catch((err) => {
              console.error(`Error loading image: ${img.name}`, err);
              return { width: 0, height: 0, aspectRatio: 0 }; // Default dimensions on error
            }),
          ),
        );

        const firstDimension = dimensions[0];

        // Check for different aspect ratios (with a small tolerance for rounding errors)
        const ASPECT_RATIO_TOLERANCE = 0.01;
        const hasDifferentAspectRatios = dimensions.some(
          (dim) => Math.abs(dim.aspectRatio - firstDimension.aspectRatio) > ASPECT_RATIO_TOLERANCE,
        );

        if (hasDifferentAspectRatios) {
          // Warn, but allow proceeding. Keep aspect ratio from first image for slider layout
          setError(
            'Warning: Some images have different aspect ratios. Results may be less accurate for version comparisons.',
          );
          setShowDimensionWarning(true);
          setImageAspectRatio(firstDimension.aspectRatio);
          return true;
        }

        // Store the aspect ratio in state for the comparison view
        setImageAspectRatio(firstDimension.aspectRatio);
        return true;
      } catch (err) {
        console.error('Error checking dimensions:', err);
        setError('Failed to check image dimensions. Please try again.');
        return false; // Don't proceed on error
      }
    };

    // Start the check
    return checkDimensions();
  }, [comparisonType, uploadedImages, setError]);

  // Add debug logging to the selectWinner function
  const selectWinner = useCallback(
    (winnerId) => {
      if (processingSelection) {
        return;
      }
      setProcessingSelection(true);
      if (!currentPair || !currentPair[0] || !currentPair[1]) {
        setProcessingSelection(false);
        return;
      }
      try {
        const [left, right] = currentPair;
        const pairKey = makePairKey(left.id, right.id);
        const loserId = left.id === winnerId ? right.id : left.id;
        const updatedCompletedComparisons = {
          ...completedComparisons,
          [pairKey]: winnerId,
        };
        lastComparedKeyRef.current = pairKey;

        const updatedImages = applyComparison(uploadedImages, winnerId, loserId);
        setUploadedImages(updatedImages);
        setCompletedComparisons(updatedCompletedComparisons);

        const nextPair = chooseNextPair(updatedImages, pairKey);
        setCurrentPair(nextPair);

        if (!nextPair && Object.keys(updatedCompletedComparisons).length > 0) {
          calculateFinalRankings(updatedImages);
          changeStep('results');
        }
      } catch (err) {
        setError('Error selecting winner');
      } finally {
        setTimeout(() => {
          setProcessingSelection(false);
        }, 100);
      }
    },
    [
      currentPair,
      uploadedImages,
      completedComparisons,
      calculateFinalRankings,
      changeStep,
      processingSelection,
      chooseNextPair,
    ],
  );

  // Add keyboard support with improved handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process keyboard events when in compare mode with a valid pair
      if (step !== 'compare' || !currentPair || !currentPair[0] || !currentPair[1]) return;

      // Check for arrow keys
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Prevent default browser behavior (like scrolling)
        e.preventDefault();
        e.stopPropagation();

        // Don't process if we're already handling a selection
        if (processingSelection) {
          console.log('Selection in progress, ignoring key press');
          return;
        }

        console.log(`Key pressed: ${e.key}`);

        // Process the key press
        if (e.key === 'ArrowLeft') {
          console.log('Selecting left image:', currentPair[0].id);
          selectWinner(currentPair[0].id);
        } else if (e.key === 'ArrowRight') {
          console.log('Selecting right image:', currentPair[1].id);
          selectWinner(currentPair[1].id);
        }
      }
    };

    // Add event listener with capture phase to ensure it gets first priority
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    // Clean up the event listener when component unmounts or dependencies change
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [step, currentPair, selectWinner, processingSelection]);

  const handleImagesUploaded = useCallback(
    (newImages) => {
      setUploadedImages((prev) => {
        // Check for duplicates by name
        const existingNames = new Set(prev.map((img) => img.name));
        const uniqueNewImages = newImages
          .filter((img) => !existingNames.has(img.name))
          .map((img) => withTrueSkillDefaults({ ...img, comparisons: 0 }));

        if (uniqueNewImages.length < newImages.length) {
          setError(`${newImages.length - uniqueNewImages.length} duplicate image(s) were skipped`);
        } else {
          setError(null);
        }

        return [...prev, ...uniqueNewImages];
      });
    },
    [setError],
  );

  const handleImageDelete = useCallback((id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const startComparison = useCallback(async () => {
    // Check dimensions if comparing versions
    const dimensionsOk = await checkImageDimensions();

    if (dimensionsOk) {
      beginFreshComparison();
      changeStep('compare');
    } else if (comparisonType === 'versions') {
      // Don't proceed if dimensions check failed for versions
      // The error message is already set in checkImageDimensions
    } else {
      // For "different" type, we can proceed regardless
      beginFreshComparison();
      changeStep('compare');
    }
  }, [beginFreshComparison, changeStep, checkImageDimensions, comparisonType]);

  const handleProceedWithDifferentType = useCallback(() => {
    setComparisonType('different');
    setShowDimensionWarning(false);
    beginFreshComparison();
    changeStep('compare');
  }, [beginFreshComparison, changeStep]);

  const resetComparison = useCallback(() => {
    beginFreshComparison();
    changeStep('type');
    setComparisonType('');
    setUploadedImages([]);
  }, [beginFreshComparison, changeStep]);

  const downloadResults = useCallback(
    (format) => {
      try {
        if (format === 'csv') {
          const csvContent =
            'data:text/csv;charset=utf-8,' +
            'Rank,Filename,Mu,Sigma,Rating,Comparisons,Compressed\n' +
            uploadedImages
              .map(
                (img) =>
                  `${img.rank},"${img.name}",${(img.mu ?? img.rating) || 0},${img.sigma ?? 0},${
                    img.rating || img.mu || 0
                  },${img.comparisons || 0},${img.compressed ? 'Yes' : 'No'}`,
              )
              .join('\n');

          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'photo_rankings.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (format === 'json') {
          const jsonData = uploadedImages.map((img) => ({
            rank: img.rank,
            filename: img.name,
            mu: (img.mu ?? img.rating) || 0,
            sigma: img.sigma ?? 0,
            rating: img.rating || img.mu || 0,
            comparisons: img.comparisons || 0,
            compressed: img.compressed || false,
          }));

          const jsonContent =
            'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonData, null, 2));
          const link = document.createElement('a');
          link.setAttribute('href', jsonContent);
          link.setAttribute('download', 'photo_rankings.json');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error('Error downloading results:', err);
        setError('Error downloading results');
      }
    },
    [uploadedImages, setError],
  );

  // Error display component
  const ErrorMessage = () => {
    if (!error) return null;

    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    );
  };

  const handleRemoveImage = useCallback(
    (imageId) => {
      const updatedImages = uploadedImages.filter((img) => img.id !== imageId);

      if (updatedImages.length < 2 && step === 'compare') {
        setError('At least 2 images are required for comparison');
        changeStep('upload');
      }

      const filteredComparisons = Object.fromEntries(
        Object.entries(completedComparisons).filter(([pairKey, winner]) => {
          return !pairKey.includes(imageId) && winner !== imageId;
        }),
      );

      const nextPair = chooseNextPair(updatedImages);
      setUploadedImages(updatedImages);
      setCompletedComparisons(filteredComparisons);
      setCurrentPair(nextPair);

      if (!nextPair && step === 'compare' && updatedImages.length >= 2) {
        calculateFinalRankings(updatedImages);
        changeStep('results');
      }
    },
    [
      uploadedImages,
      calculateFinalRankings,
      changeStep,
      step,
      completedComparisons,
      chooseNextPair,
    ],
  );

  useEffect(() => {
    if (!(uploadedImages.length >= 2 && comparisonType && step === 'compare')) return;
    if (currentPair || processingSelection) return;

    const needsNormalization = uploadedImages.some(
      (img) => img.mu == null || img.sigma == null || img.comparisons == null,
    );
    if (needsNormalization) {
      setUploadedImages((prev) => prev.map(withTrueSkillDefaults));
      return;
    }

    setCurrentPair(chooseNextPair(uploadedImages));
    setProcessingSelection(false);
  }, [
    uploadedImages,
    comparisonType,
    step,
    currentPair,
    processingSelection,
    chooseNextPair,
  ]);

  useEffect(() => {
    setProgress(rankingProgress(uploadedImages));

    if (step === 'compare' && allowAutoStopRef.current && isRankingStable(uploadedImages)) {
      calculateFinalRankings();
      changeStep('results');
    }
  }, [uploadedImages, calculateFinalRankings, changeStep, step]);

  // =====================================================================
  // LOCKED SLIDER COMPARISON CODE - VERSION 6
  // This section contains the slider comparison functionality that has
  // been locked to Version 6. Do not modify this code.
  // =====================================================================

  // Restore step based on URL on mount
  useEffect(() => {
    try {
      const path = (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';
      const seg = path.replace(/^\//, '').toLowerCase();
      const urlStep = seg === '' ? 'splash' : seg === 'start' ? 'intro' : seg;
      const allowed = new Set(['splash', 'intro', 'type', 'upload', 'compare', 'results']);
      if (allowed.has(urlStep)) {
        setStep(urlStep);
      }
      window.addEventListener('popstate', (e) => {
        const p = window.location.pathname.replace(/^\//, '');
        const s = p === '' ? 'splash' : p === 'start' ? 'intro' : p;
        if (allowed.has(s)) setStep(s);
      });
    } catch {}
  }, []);

  // Render the appropriate page based on the current step
  if (step === 'splash') {
    return <SplashScreen onComplete={() => changeStep('intro')} />;
  }

  if (step === 'intro') {
    return <IntroPage onGetStarted={() => changeStep('type')} />;
  }

  if (step === 'type') {
    return (
      <>
        <ErrorMessage />
        <ComparisonTypePage
          comparisonType={comparisonType}
          setComparisonType={setComparisonType}
          onNext={() => {
            if (comparisonType) {
              changeStep('upload');
            } else {
              setError('Please select a comparison type');
            }
          }}
        />
        {/* Bottom logo moved to global footer */}
      </>
    );
  }

  if (step === 'upload') {
    return (
      <>
        <ErrorMessage />
        <UploadPage
          uploadedImages={uploadedImages}
          handleImagesUploaded={handleImagesUploaded}
          handleImageDelete={handleImageDelete}
          startComparison={startComparison}
        />
        <DimensionWarningModal
          isOpen={showDimensionWarning}
          onClose={() => setShowDimensionWarning(false)}
          onProceed={handleProceedWithDifferentType}
        />
        {/* Bottom logo moved to global footer */}
      </>
    );
  }

  if (step === 'compare' && !currentPair) {
    return (
      <div className="max-w-4xl mx-auto relative">
        <ErrorMessage />
        <div className="border-2 border-black p-4 md:p-8 mb-6 md:mb-12 bg-white text-center">
          <h1 className="text-2xl md:text-3xl mb-4 font-bold text-black font-display">
            COMPARE PHOTOS
          </h1>
          <p className="text-base md:text-lg font-medium text-black mb-6">
            Preparing the next comparison…
          </p>
          <button
            onClick={() => {
              trackEvent('see_rankings');
              calculateFinalRankings();
              changeStep('results');
            }}
            className="px-6 py-2 bg-cardinal text-white font-bold rounded-full"
          >
            SEE RANKINGS
          </button>
        </div>
      </div>
    );
  }

  if (step === 'compare' && currentPair) {
    return (
      <div className="max-w-4xl mx-auto relative">
        {/* Removed floating logo button per user request */}

        <ErrorMessage />
        <div className="border-2 border-black p-4 md:p-8 mb-6 md:mb-12 bg-white">
          <h1 className="text-2xl md:text-3xl mb-4 text-center font-bold text-black font-display">
            COMPARE PHOTOS
          </h1>

          <div className="border-t-2 border-b-2 border-black py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-2 mb-4 md:mb-6">
            <div className="text-base md:text-lg font-medium text-black">
              {formatNumber(countRemainingComparisons(uploadedImages))} COMPARISONS REMAINING
            </div>
            <div className="text-base md:text-lg font-medium text-black">
              {formatNumber(Math.min(Math.round(progress), 100))}% COMPLETE
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <div className="h-3 md:h-4 bg-gray-100 overflow-hidden border border-black">
              <div className="h-full bg-yellow_green" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {comparisonType === 'versions' && (
            <div className="mb-4 flex items-center justify-center gap-3">
              <button
                className={`px-3 py-1 border-2 border-black font-bold ${
                  overlayMode === 'slider' ? 'bg-yellow_green' : 'bg-white'
                }`}
                onClick={() => {
                  setOverlayMode('slider');
                  trackEvent('overlay_mode', { mode: 'slider' });
                }}
              >
                SLIDER
              </button>
              <button
                className={`px-3 py-1 border-2 border-black font-bold ${
                  overlayMode === 'side-by-side' ? 'bg-yellow_green' : 'bg-white'
                }`}
                onClick={() => {
                  setOverlayMode('side-by-side');
                  trackEvent('overlay_mode', { mode: 'side-by-side' });
                }}
              >
                SIDE-BY-SIDE
              </button>
            </div>
          )}

          {/* Fullscreen controls */}
          <FullScreenCompare
            progress={progress}
            remaining={formatNumber(countRemainingComparisons(uploadedImages))}
            leftImage={currentPair[0]}
            rightImage={currentPair[1]}
            onSelectLeft={() => {
              trackEvent('select_photo', { side: 'left' });
              selectWinner(currentPair[0].id);
            }}
            onSelectRight={() => {
              trackEvent('select_photo', { side: 'right' });
              selectWinner(currentPair[1].id);
            }}
            onRemoveLeft={(id) => handleRemoveImage(id)}
            onRemoveRight={(id) => handleRemoveImage(id)}
            disabled={isMobile}
          />

          <ComparisonView
            leftImage={currentPair[0]}
            rightImage={currentPair[1]}
            zoom={zoom}
            setZoom={setZoom}
            onSelectLeft={() => {
              selectWinner(currentPair[0].id);
            }}
            onSelectRight={() => {
              selectWinner(currentPair[1].id);
            }}
            onRemoveImage={handleRemoveImage}
            aspectRatio={comparisonType === 'versions' ? imageAspectRatio : null}
            overlayMode={comparisonType === 'versions' ? overlayMode : undefined}
          />

          {/* Pause anytime — current TrueSkill ranking is already usable */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                trackEvent('see_rankings');
                calculateFinalRankings();
                changeStep('results');
              }}
              className="px-6 py-2 bg-cardinal text-white font-bold rounded-full"
            >
              SEE RANKINGS
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <>
        <ErrorMessage />
        <ResultsPage
          uploadedImages={uploadedImages}
          resetComparison={resetComparison}
          downloadResults={downloadResults}
          changeStep={changeStep}
          onKeepRanking={keepRanking}
        />
        <DimensionWarningModal
          isOpen={showDimensionWarning}
          onClose={() => setShowDimensionWarning(false)}
          onProceed={handleProceedWithDifferentType}
        />
      </>
    );
  }

  return <IntroPage onGetStarted={() => changeStep('type')} />;
}
