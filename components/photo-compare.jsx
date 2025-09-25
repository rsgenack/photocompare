'use client';

import { useMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/utils/analytics';
import { debugLog, monitorFocus } from '@/utils/debug-utils';
import {
  calculateConfidence,
  DEFAULT_RATING,
  DEFAULT_UNCERTAINTY,
  findMostInformativePair,
  hasEnoughConfidenceEnhanced,
  updateRatingsAdaptive,
  updateUncertainties,
} from '@/utils/elo-rating';
import { formatNumber } from '@/utils/format';
import { scrollToTop } from '@/utils/scroll-utils';
import { useCallback, useEffect, useState } from 'react';
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
  const [allPairs, setAllPairs] = useState([]);
  const [currentPair, setCurrentPair] = useState(null);
  const [remainingPairs, setRemainingPairs] = useState([]);
  const [completedComparisons, setCompletedComparisons] = useState({});
  const [zoom, setZoom] = useState(100);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showDimensionWarning, setShowDimensionWarning] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75); // Minimum confidence to stop comparisons
  const [minComparisons, setMinComparisons] = useState(3); // Minimum comparisons per image
  const [autoAdvance, setAutoAdvance] = useState(true); // Whether to automatically advance to results when confident
  const isMobile = useMobile();
  const [imageAspectRatio, setImageAspectRatio] = useState(null);
  const [processingSelection, setProcessingSelection] = useState(false); // Add state to track selection processing
  const [overlayMode, setOverlayMode] = useState('slider'); // For versions: 'slider' or 'side-by-side'

  // Derived completion flag
  const isDone = allPairs.length > 0 && Object.keys(completedComparisons).length >= allPairs.length;

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

  const memoizedFindMostInformativePair = useCallback((images, pairs) => {
    return findMostInformativePair(images, pairs);
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

  // Calculate final rankings based on Elo rating
  const calculateFinalRankings = useCallback(() => {
    try {
      // Ensure default ratings are present
      const normalized = uploadedImages.map((img) => ({
        ...img,
        rating: img.rating ?? DEFAULT_RATING,
        uncertainty: img.uncertainty ?? DEFAULT_UNCERTAINTY,
        comparisons: img.comparisons ?? 0,
      }));

      // Sort by rating desc
      let updatedImages = [...normalized].sort((a, b) => (b.rating || 0) - (a.rating || 0));

      // Assign ranks based on rating (ties share rank)
      let currentRank = 1;
      let previousRating = Number.POSITIVE_INFINITY;

      updatedImages.forEach((img, index) => {
        if (img.rating !== previousRating) {
          previousRating = img.rating;
          currentRank = index + 1;
        }
        img.rank = currentRank;
      });

      // Sort by rank
      updatedImages = updatedImages.sort((a, b) => (a.rank || 999) - (b.rank || 999));

      setUploadedImages(updatedImages);
      setError(null);
    } catch (err) {
      console.error('Error calculating rankings:', err);
      setError('Error calculating final rankings');
    }
  }, [uploadedImages, completedComparisons]);

  // Helper to compute median confidence for current images
  const getMedianConfidence = (images) => {
    if (!images || images.length === 0) return 0;
    const confs = images
      .map((img) => calculateConfidence(img.uncertainty ?? DEFAULT_UNCERTAINTY))
      .sort((a, b) => a - b);
    const mid = Math.floor(confs.length / 2);
    return confs.length % 2 === 0 ? Math.round((confs[mid - 1] + confs[mid]) / 2) : confs[mid];
  };

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
      if (isDone) return;
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
        const pairKey = left.id < right.id ? `${left.id}-${right.id}` : `${right.id}-${left.id}`;
        const loserId = left.id === winnerId ? right.id : left.id;
        const updatedCompletedComparisons = {
          ...completedComparisons,
          [pairKey]: winnerId,
        };
        // Update images (Elo rating, uncertainties, comparisons)
        const winnerImage = uploadedImages.find((img) => img.id === winnerId);
        const loserImage = uploadedImages.find((img) => img.id === loserId);
        const winnerRating = winnerImage?.rating ?? DEFAULT_RATING;
        const loserRating = loserImage?.rating ?? DEFAULT_RATING;
        const winnerUnc = winnerImage?.uncertainty ?? DEFAULT_UNCERTAINTY;
        const loserUnc = loserImage?.uncertainty ?? DEFAULT_UNCERTAINTY;

        const { winner: newWinnerRating, loser: newLoserRating } = updateRatingsAdaptive(
          winnerRating,
          loserRating,
          winnerUnc,
          loserUnc,
        );
        const { winner: newWinnerUnc, loser: newLoserUnc } = updateUncertainties(
          winnerUnc,
          loserUnc,
        );

        const updatedImages = uploadedImages.map((img) => {
          if (img.id === winnerId) {
            return {
              ...img,
              rating: newWinnerRating,
              uncertainty: newWinnerUnc,
              comparisons: (img.comparisons || 0) + 1,
            };
          }
          if (img.id === loserId) {
            return {
              ...img,
              rating: newLoserRating,
              uncertainty: newLoserUnc,
              comparisons: (img.comparisons || 0) + 1,
            };
          }
          return img;
        });
        setUploadedImages(updatedImages);
        // Remove the current pair from remainingPairs
        const newRemainingPairs = remainingPairs.filter((pair) => {
          const match =
            (pair[0] === left.id && pair[1] === right.id) ||
            (pair[0] === right.id && pair[1] === left.id);
          return !match;
        });
        // Set the next pair if available
        if (newRemainingPairs.length > 0) {
          // Choose most informative next pair based on updated images
          const bestPair = memoizedFindMostInformativePair(updatedImages, newRemainingPairs);
          if (bestPair) {
            const [nextLeftId, nextRightId] = bestPair;
            const nextLeft = updatedImages.find((img) => img.id === nextLeftId);
            const nextRight = updatedImages.find((img) => img.id === nextRightId);
            if (nextLeft && nextRight) {
              setCurrentPair([nextLeft, nextRight]);
              setRemainingPairs(
                newRemainingPairs.filter(
                  (pair) =>
                    !(
                      (pair[0] === nextLeftId && pair[1] === nextRightId) ||
                      (pair[0] === nextRightId && pair[1] === nextLeftId)
                    ),
                ),
              );
            } else {
              setCurrentPair(null);
            }
          } else {
            // Fallback to first remaining pair
            const [nextLeftId, nextRightId] = newRemainingPairs[0];
            const nextLeft = updatedImages.find((img) => img.id === nextLeftId);
            const nextRight = updatedImages.find((img) => img.id === nextRightId);
            if (nextLeft && nextRight) {
              setCurrentPair([nextLeft, nextRight]);
              setRemainingPairs(newRemainingPairs.slice(1));
            } else {
              setCurrentPair(null);
            }
          }
        } else {
          calculateFinalRankings();
          changeStep('results');
        }
        setCompletedComparisons(updatedCompletedComparisons);
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
      remainingPairs,
      uploadedImages,
      completedComparisons,
      calculateFinalRankings,
      changeStep,
      processingSelection,
      isDone,
    ],
  );

  // Add keyboard support with improved handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process keyboard events when in compare mode with a valid pair
      if (step !== 'compare' || !currentPair || !currentPair[0] || !currentPair[1]) return;
      if (isDone) return;

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
  }, [step, currentPair, selectWinner, processingSelection, isDone]);

  const handleImagesUploaded = useCallback(
    (newImages) => {
      setUploadedImages((prev) => {
        // Check for duplicates by name
        const existingNames = new Set(prev.map((img) => img.name));
        const uniqueNewImages = newImages
          .filter((img) => !existingNames.has(img.name))
          .map((img) => ({
            ...img,
            rating: DEFAULT_RATING,
            uncertainty: DEFAULT_UNCERTAINTY,
            comparisons: 0,
          }));

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
      changeStep('compare');
      setCompletedComparisons({});
      setError(null);
    } else if (comparisonType === 'versions') {
      // Don't proceed if dimensions check failed for versions
      // The error message is already set in checkImageDimensions
    } else {
      // For "different" type, we can proceed regardless
      changeStep('compare');
      setCompletedComparisons({});
      setError(null);
    }
  }, [changeStep, checkImageDimensions, setError, comparisonType]);

  const handleProceedWithDifferentType = useCallback(() => {
    setComparisonType('different');
    setShowDimensionWarning(false);
    changeStep('compare');
    setCompletedComparisons({});
    setError(null);
  }, [changeStep, setError]);

  const resetComparison = useCallback(() => {
    changeStep('type');
    setComparisonType('');
    setCompletedComparisons({});
    setCurrentPair(null);
    setAllPairs([]);
    setRemainingPairs([]);
    setProgress(0);
    setUploadedImages([]);
    setError(null);
    setProcessingSelection(false);
  }, [changeStep, setError]);

  const downloadResults = useCallback(
    (format) => {
      try {
        if (format === 'csv') {
          const csvContent =
            'data:text/csv;charset=utf-8,' +
            'Rank,Filename,Rating,Comparisons,Compressed\n' +
            uploadedImages
              .map(
                (img) =>
                  `${img.rank},"${img.name}",${img.rating || 0},${img.comparisons || 0},${
                    img.compressed ? 'Yes' : 'No'
                  }`,
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
            rating: img.rating || 0,
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
      // Remove the image from uploadedImages
      setUploadedImages((prev) => {
        const updated = prev.filter((img) => img.id !== imageId);

        // If no images left, reset to upload page
        if (updated.length < 2 && step === 'compare') {
          setError('At least 2 images are required for comparison');
          changeStep('upload');
        }

        return updated;
      });

      // Remove any pairs containing this image from remainingPairs
      setRemainingPairs((prev) =>
        prev.filter(([leftId, rightId]) => leftId !== imageId && rightId !== imageId),
      );

      // Remove any pairs containing this image from allPairs
      setAllPairs((prev) =>
        prev.filter(([leftId, rightId]) => leftId !== imageId && rightId !== imageId),
      );

      // Remove any completed comparisons involving this image
      setCompletedComparisons((prev) => {
        const updatedComparisons = { ...prev };
        // Filter out any pair keys that contain the removed image id
        Object.keys(updatedComparisons).forEach((pairKey) => {
          if (pairKey.includes(imageId) || updatedComparisons[pairKey] === imageId) {
            delete updatedComparisons[pairKey];
          }
        });
        return updatedComparisons;
      });

      // If current pair contains the removed image, move to next pair
      if (currentPair && (currentPair[0]?.id === imageId || currentPair[1]?.id === imageId)) {
        if (remainingPairs.length > 0) {
          // Find the next most informative pair
          const updatedImages = uploadedImages.filter((img) => img.id !== imageId);
          const bestPair = memoizedFindMostInformativePair(updatedImages, remainingPairs);

          if (bestPair) {
            const [nextLeftId, nextRightId] = bestPair;
            const nextLeft = updatedImages.find((img) => img.id === nextLeftId);
            const nextRight = updatedImages.find((img) => img.id === nextRightId);

            if (nextLeft && nextRight) {
              setCurrentPair([nextLeft, nextRight]);
              // Remove this pair from remaining pairs
              setRemainingPairs((prev) =>
                prev.filter(
                  (pair) =>
                    !(
                      (pair[0] === nextLeftId && pair[1] === nextRightId) ||
                      (pair[0] === nextRightId && pair[1] === nextLeftId)
                    ),
                ),
              );
            }
          } else if (remainingPairs.length > 0) {
            // If no best pair found but pairs remain, just use the first one
            const [nextLeftId, nextRightId] = remainingPairs[0];
            const nextLeft = updatedImages.find((img) => img.id === nextLeftId);
            const nextRight = updatedImages.find((img) => img.id === nextRightId);

            if (nextLeft && nextRight) {
              setCurrentPair([nextLeft, nextRight]);
              setRemainingPairs((prev) => prev.slice(1));
            }
          }
        } else {
          // If no more pairs, go to results
          calculateFinalRankings();
          changeStep('results');
        }
      }
    },
    [
      uploadedImages,
      remainingPairs,
      currentPair,
      calculateFinalRankings,
      changeStep,
      step,
      memoizedFindMostInformativePair,
    ],
  );

  // Initialize pairs and start comparison when images are uploaded or comparison type changes
  useEffect(() => {
    if (!(uploadedImages.length >= 2 && comparisonType)) return;
    // If we're already comparing and pairs are initialized, don't reset them on rating updates
    if (step === 'compare' && allPairs.length > 0) return;

    // Ensure Elo defaults are present only if missing to avoid loops
    const needsNormalization = uploadedImages.some(
      (img) => img.rating == null || img.uncertainty == null || img.comparisons == null,
    );
    if (needsNormalization) {
      setUploadedImages((prev) =>
        prev.map((img) => ({
          ...img,
          rating: img.rating ?? DEFAULT_RATING,
          uncertainty: img.uncertainty ?? DEFAULT_UNCERTAINTY,
          comparisons: img.comparisons ?? 0,
        })),
      );
      return;
    }

    // Generate all possible pairs of images (excluding self-comparisons)
    const newPairs = [];
    for (let i = 0; i < uploadedImages.length; i++) {
      for (let j = i + 1; j < uploadedImages.length; j++) {
        // Only create pairs with different images
        if (uploadedImages[i].id !== uploadedImages[j].id) {
          newPairs.push([uploadedImages[i].id, uploadedImages[j].id]);
        }
      }
    }

    // Initialize allPairs and remainingPairs
    setAllPairs(newPairs);
    setRemainingPairs(newPairs);

    // Find the best pair to start with
    const bestPair = findMostInformativePair(uploadedImages, newPairs);

    if (bestPair) {
      const [nextLeftId, nextRightId] = bestPair;
      const nextLeft = uploadedImages.find((img) => img.id === nextLeftId);
      const nextRight = uploadedImages.find((img) => img.id === nextRightId);

      if (nextLeft && nextRight) {
        setCurrentPair([nextLeft, nextRight]);
        // Remove this pair from remaining pairs
        setRemainingPairs((prev) =>
          prev.filter(
            (pair) =>
              !(
                (pair[0] === nextLeftId && pair[1] === nextRightId) ||
                (pair[0] === nextRightId && pair[1] === nextLeftId)
              ),
          ),
        );
      }
    }

    // Reset progress
    setProgress(0);

    // Reset processing flag
    setProcessingSelection(false);
  }, [uploadedImages, comparisonType, step, allPairs.length]);

  // Update progress based on completed comparisons
  useEffect(() => {
    if (allPairs.length > 0) {
      const completedCount = Object.keys(completedComparisons).length;
      const newProgress = (completedCount / allPairs.length) * 100;
      setProgress(newProgress);
      // Auto-finish when we have completed all pairs
      if (step === 'compare') {
        // Stronger stop condition for full ordering
        const canStop = hasEnoughConfidenceEnhanced(uploadedImages, {
          minConfidence: confidenceThreshold,
          minComparisons,
          adjacentMargin: 30,
        });
        if (canStop || completedCount >= allPairs.length) {
          calculateFinalRankings();
          changeStep('results');
        }
      }
    }
  }, [completedComparisons, allPairs.length]);

  // Auto-advance to results if confidence is high enough
  useEffect(() => {
    if (autoAdvance && step === 'compare' && uploadedImages.length > 0) {
      // Check if all images have been compared enough times
      const allComparedEnough = uploadedImages.every(
        (img) => (img.comparisons || 0) >= minComparisons,
      );

      // Calculate average confidence
      const avgConfidence =
        uploadedImages.reduce((sum, img) => {
          return sum + calculateConfidence(img.uncertainty || DEFAULT_UNCERTAINTY);
        }, 0) / uploadedImages.length;

      if (allComparedEnough && avgConfidence >= confidenceThreshold) {
        calculateFinalRankings();
        changeStep('results');
      }
    }
  }, [
    autoAdvance,
    step,
    uploadedImages,
    confidenceThreshold,
    minComparisons,
    calculateFinalRankings,
    changeStep,
  ]);

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
        {/* Mini Home Button - toned down, non-sticky */}
        <button
          onClick={() => changeStep('type')}
          className="mt-4 ml-4 hover:opacity-80 transition-opacity duration-150 text-left"
        >
          <span
            className="relative inline-block font-bold break-words"
            style={{
              fontSize: '1.25rem',
              lineHeight: '1.3rem',
              backgroundImage:
                'linear-gradient(to right, rgb(209, 17, 73), rgb(241, 113, 5), rgb(255, 186, 8), rgb(177, 207, 95), rgb(144, 224, 243), rgb(123, 137, 239))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.85,
            }}
          >
            VOTOGRAPHER
          </span>
        </button>
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
      </>
    );
  }

  if (step === 'upload') {
    return (
      <>
        {/* Mini Home Button - toned down, non-sticky */}
        <button
          onClick={() => changeStep('type')}
          className="mt-4 ml-4 hover:opacity-80 transition-opacity duration-150 text-left"
        >
          <span
            className="relative inline-block font-bold break-words"
            style={{
              fontSize: '1.25rem',
              lineHeight: '1.3rem',
              backgroundImage:
                'linear-gradient(to right, rgb(209, 17, 73), rgb(241, 113, 5), rgb(255, 186, 8), rgb(177, 207, 95), rgb(144, 224, 243), rgb(123, 137, 239))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.85,
            }}
          >
            VOTOGRAPHER
          </span>
        </button>
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
      </>
    );
  }

  if (step === 'compare' && currentPair) {
    return (
      <div className="max-w-4xl mx-auto relative">
        {/* Mini Home Button */}
        <button
          onClick={() => changeStep('type')}
          className="absolute top-4 left-4 z-50 hover:scale-105 transition-transform duration-200 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-black"
        >
          <span
            className="relative inline-block font-bold break-words"
            style={{
              fontSize: '2rem',
              lineHeight: '2.01rem',
              backgroundImage:
                'linear-gradient(to right, rgb(209, 17, 73), rgb(241, 113, 5), rgb(255, 186, 8), rgb(177, 207, 95), rgb(144, 224, 243), rgb(123, 137, 239))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'rgb(209, 17, 73)', // Fallback color
            }}
          >
            VOTOGRAPHER
          </span>
        </button>

        <ErrorMessage />
        <div className="border-2 border-black p-4 md:p-8 mb-6 md:mb-12 bg-white">
          <h1 className="text-2xl md:text-3xl mb-4 text-center font-bold text-black font-display">
            COMPARE PHOTOS
          </h1>

          <div className="border-t-2 border-b-2 border-black py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-2 mb-4 md:mb-6">
            <div className="text-base md:text-lg font-medium text-black">
              {(() => {
                const base = remainingPairs.length;
                if (base === 0) return 0;
                const canStop = hasEnoughConfidenceEnhanced(uploadedImages, {
                  minConfidence: confidenceThreshold,
                  minComparisons,
                  adjacentMargin: 30,
                });
                if (canStop) return 0;
                const median = getMedianConfidence(uploadedImages);
                const baseline = 50; // min confidence baseline
                const target = Math.max(baseline + 1, confidenceThreshold);
                const ratio = Math.max(0, Math.min(1, (median - baseline) / (target - baseline)));
                // Scale down remaining up to 50% as confidence approaches threshold
                let effective = Math.ceil(base * (1 - 0.5 * ratio));
                // Ensure per-image coverage requirement isn’t under-reported
                const coveragePairs = Math.ceil(
                  uploadedImages.reduce(
                    (sum, img) => sum + Math.max(0, minComparisons - (img.comparisons || 0)),
                    0,
                  ) / 2,
                );
                effective = Math.max(coveragePairs, Math.min(base, effective));
                return formatNumber(effective);
              })()}{' '}
              COMPARISONS REMAINING
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
            remaining={formatNumber(remainingPairs.length)}
            leftImage={currentPair[0]}
            rightImage={currentPair[1]}
            onSelectLeft={() => {
              if (!isDone) {
                trackEvent('select_photo', { side: 'left' });
                selectWinner(currentPair[0].id);
              }
            }}
            onSelectRight={() => {
              if (!isDone) {
                trackEvent('select_photo', { side: 'right' });
                selectWinner(currentPair[1].id);
              }
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
              if (!isDone) selectWinner(currentPair[0].id);
            }}
            onSelectRight={() => {
              if (!isDone) selectWinner(currentPair[1].id);
            }}
            onRemoveImage={handleRemoveImage}
            aspectRatio={comparisonType === 'versions' ? imageAspectRatio : null}
            overlayMode={comparisonType === 'versions' ? overlayMode : undefined}
          />

          {/* Skip to results button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                trackEvent('skip_to_results');
                calculateFinalRankings();
                changeStep('results');
              }}
              className="px-6 py-2 bg-cardinal text-white font-bold rounded-full"
            >
              SKIP TO RESULTS
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
