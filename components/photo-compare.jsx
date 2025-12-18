'use client';

import { useMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/utils/analytics';
import { debugLog, monitorFocus } from '@/utils/debug-utils';
import {
    calculateConfidence,
    DEFAULT_RATING,
    DEFAULT_UNCERTAINTY,
    buildCandidatePairs,
    findMostInformativePair,
    hasEnoughConfidenceEnhanced,
    makePairKey,
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
  const [currentPair, setCurrentPair] = useState(null);
  const [comparisonQueue, setComparisonQueue] = useState([]);
  const [completedComparisons, setCompletedComparisons] = useState({});
  const [zoom, setZoom] = useState(100);
  const [progress, setProgress] = useState(0);
  const [remainingEstimate, setRemainingEstimate] = useState(0);
  const [error, setError] = useState(null);
  const [showDimensionWarning, setShowDimensionWarning] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75); // Minimum confidence to stop comparisons
  const [minComparisons, setMinComparisons] = useState(3); // Minimum comparisons per image
  const [autoAdvance, setAutoAdvance] = useState(true); // Whether to automatically advance to results when confident
  const isMobile = useMobile();
  const [imageAspectRatio, setImageAspectRatio] = useState(null);
  const [processingSelection, setProcessingSelection] = useState(false); // Add state to track selection processing
  const [overlayMode, setOverlayMode] = useState('slider'); // For versions: 'slider' or 'side-by-side'

  const imageCount = uploadedImages.length;

  // Dynamically relax comparison requirements and stopping thresholds for large
  // sets so users don't have to make an excessive number of selections while
  // still keeping the top of the ranking accurate.
  let dynamicMinComparisons = minComparisons;
  let dynamicConfidenceThreshold = confidenceThreshold;
  let dynamicAdjacentMargin = 30;
  let dynamicTopK = null;

  if (imageCount > 0 && imageCount <= 40) {
    // Small sets: keep original behavior.
    dynamicMinComparisons = minComparisons;
    dynamicConfidenceThreshold = confidenceThreshold;
    dynamicAdjacentMargin = 30;
    dynamicTopK = null;
  } else if (imageCount > 40 && imageCount <= 120) {
    // Medium sets: slightly relax requirements and focus on the top band.
    dynamicMinComparisons = Math.min(2, minComparisons);
    dynamicConfidenceThreshold = Math.min(confidenceThreshold, 72);
    dynamicAdjacentMargin = 25;
    dynamicTopK = 20;
  } else if (imageCount > 120) {
    // Large sets (e.g., 100–200+): aggressively reduce per-image coverage,
    // lower confidence a bit, and focus on a larger top band.
    dynamicMinComparisons = Math.min(1, minComparisons);
    dynamicConfidenceThreshold = Math.min(confidenceThreshold, 68);
    dynamicAdjacentMargin = 20;
    dynamicTopK = 30;
  }

  const effectiveMinComparisons = Math.min(
    dynamicMinComparisons,
    Math.max(1, imageCount - 1),
  );

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

  const memoizedFindMostInformativePair = useCallback((images, pairs, options = {}) => {
    return findMostInformativePair(images, pairs, options);
  }, []);

  const replenishQueue = useCallback(
    (images, completedMap, existingQueue = [], extraExclusions = []) => {
      if (!images || images.length < 2) return [];

      const targetSize = Math.max(6, images.length * 2);
      const queue = [...existingQueue];
      const queueKeys = new Set(queue.map(([a, b]) => makePairKey(a, b)));
      const exclude = new Set([...queueKeys, ...extraExclusions]);
      Object.keys(completedMap || {}).forEach((key) => exclude.add(key));

      // For large sets, bias candidate pairs toward a focus band defined by
      // current ratings so most comparisons refine the most important photos.
      const sortedByRating = [...images].sort(
        (a, b) => (b.rating ?? DEFAULT_RATING) - (a.rating ?? DEFAULT_RATING),
      );
      const focusCount =
        dynamicTopK && dynamicTopK < sortedByRating.length ? dynamicTopK : null;
      const focusIds =
        focusCount != null
          ? new Set(sortedByRating.slice(0, focusCount).map((img) => img.id))
          : null;

      const suggestions = buildCandidatePairs(images, {
        exclude,
        minComparisons: effectiveMinComparisons,
        focusIds,
        limit: targetSize * 2,
      });

      for (const pair of suggestions) {
        const key = makePairKey(pair[0], pair[1]);
        if (queueKeys.has(key)) continue;
        queue.push(pair);
        queueKeys.add(key);
        if (queue.length >= targetSize) break;
      }

      if (queue.length < targetSize) {
        const imageMap = new Map(images.map((img) => [img.id, img]));
        const fallbackExclude = new Set(queueKeys);
        const fallbackSuggestions = buildCandidatePairs(images, {
          exclude: fallbackExclude,
          minComparisons: effectiveMinComparisons,
          focusIds,
          limit: targetSize * 2,
        });

        for (const pair of fallbackSuggestions) {
          const key = makePairKey(pair[0], pair[1]);
          if (queueKeys.has(key)) continue;
          const imgA = imageMap.get(pair[0]);
          const imgB = imageMap.get(pair[1]);
          if (!imgA || !imgB) continue;
          const needsCoverage =
            (imgA.comparisons || 0) < effectiveMinComparisons ||
            (imgB.comparisons || 0) < effectiveMinComparisons;
          if (!needsCoverage) continue;
          queue.push(pair);
          queueKeys.add(key);
          if (queue.length >= targetSize) break;
        }
      }

      return queue;
    },
    [effectiveMinComparisons, dynamicTopK],
  );

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

        const filteredQueue = comparisonQueue.filter((pair) => makePairKey(pair[0], pair[1]) !== pairKey);
        const refilledQueue = replenishQueue(updatedImages, updatedCompletedComparisons, filteredQueue);
        let nextPairIds = null;
        let nextQueue = refilledQueue;

        if (refilledQueue.length > 0) {
          const bestPair = memoizedFindMostInformativePair(updatedImages, refilledQueue, {
            minComparisons: effectiveMinComparisons,
          });
          if (bestPair) {
            const nextKey = makePairKey(bestPair[0], bestPair[1]);
            nextPairIds = bestPair;
            nextQueue = refilledQueue.filter((pair) => makePairKey(pair[0], pair[1]) !== nextKey);
          }
        }

        if (nextPairIds) {
          const [nextLeftId, nextRightId] = nextPairIds;
          const nextLeft = updatedImages.find((img) => img.id === nextLeftId);
          const nextRight = updatedImages.find((img) => img.id === nextRightId);
          if (nextLeft && nextRight) {
            setCurrentPair([nextLeft, nextRight]);
            setComparisonQueue(nextQueue);
          } else {
            setCurrentPair(null);
            setComparisonQueue(nextQueue);
          }
        } else {
          setCurrentPair(null);
          setComparisonQueue([]);
          const canStop = hasEnoughConfidenceEnhanced(updatedImages, {
            minConfidence: dynamicConfidenceThreshold,
            minComparisons: effectiveMinComparisons,
            adjacentMargin: dynamicAdjacentMargin,
            topK: dynamicTopK,
          });
          if (canStop || Object.keys(updatedCompletedComparisons).length > 0) {
            calculateFinalRankings();
            changeStep('results');
          }
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
      comparisonQueue,
      uploadedImages,
      completedComparisons,
      calculateFinalRankings,
      changeStep,
      processingSelection,
      memoizedFindMostInformativePair,
      replenishQueue,
      confidenceThreshold,
      effectiveMinComparisons,
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
      setComparisonQueue([]);
      setCurrentPair(null);
      setProcessingSelection(false);
      setError(null);
    } else if (comparisonType === 'versions') {
      // Don't proceed if dimensions check failed for versions
      // The error message is already set in checkImageDimensions
    } else {
      // For "different" type, we can proceed regardless
      changeStep('compare');
      setCompletedComparisons({});
      setComparisonQueue([]);
      setCurrentPair(null);
      setProcessingSelection(false);
      setError(null);
    }
  }, [changeStep, checkImageDimensions, setError, comparisonType]);

  const handleProceedWithDifferentType = useCallback(() => {
    setComparisonType('different');
    setShowDimensionWarning(false);
    changeStep('compare');
    setCompletedComparisons({});
    setComparisonQueue([]);
    setCurrentPair(null);
    setProcessingSelection(false);
    setError(null);
  }, [changeStep, setError]);

  const resetComparison = useCallback(() => {
    changeStep('type');
    setComparisonType('');
    setCompletedComparisons({});
    setCurrentPair(null);
    setComparisonQueue([]);
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

      let filteredQueue = comparisonQueue.filter(
        ([leftId, rightId]) => leftId !== imageId && rightId !== imageId,
      );

      let nextPair = currentPair;
      if (currentPair && (currentPair[0]?.id === imageId || currentPair[1]?.id === imageId)) {
        const refilledQueue = replenishQueue(updatedImages, filteredComparisons, filteredQueue);
        filteredQueue = refilledQueue;
        if (refilledQueue.length > 0) {
          const bestPair = memoizedFindMostInformativePair(updatedImages, refilledQueue, {
            minComparisons: effectiveMinComparisons,
          });
          if (bestPair) {
            const [nextLeftId, nextRightId] = bestPair;
            const nextLeft = updatedImages.find((img) => img.id === nextLeftId);
            const nextRight = updatedImages.find((img) => img.id === nextRightId);
            if (nextLeft && nextRight) {
              nextPair = [nextLeft, nextRight];
              const nextKey = makePairKey(nextLeftId, nextRightId);
              filteredQueue = refilledQueue.filter(
                (pair) => makePairKey(pair[0], pair[1]) !== nextKey,
              );
            } else {
              nextPair = null;
            }
          } else {
            nextPair = null;
          }
        } else {
          nextPair = null;
        }
      } else if (nextPair) {
        const nextLeft = updatedImages.find((img) => img.id === nextPair[0]?.id);
        const nextRight = updatedImages.find((img) => img.id === nextPair[1]?.id);
        if (nextLeft && nextRight) {
          nextPair = [nextLeft, nextRight];
        } else {
          nextPair = null;
        }
      }

      setUploadedImages(updatedImages);
      setCompletedComparisons(filteredComparisons);
      setComparisonQueue(filteredQueue);
      setCurrentPair(nextPair);

      if (!nextPair && step === 'compare' && updatedImages.length >= 2) {
        const canStop = hasEnoughConfidenceEnhanced(updatedImages, {
          minConfidence: dynamicConfidenceThreshold,
          minComparisons: effectiveMinComparisons,
          adjacentMargin: dynamicAdjacentMargin,
          topK: dynamicTopK,
        });
        if (canStop || filteredQueue.length === 0) {
          calculateFinalRankings();
          changeStep('results');
        }
      }
    },
    [
      uploadedImages,
      currentPair,
      calculateFinalRankings,
      changeStep,
      step,
      memoizedFindMostInformativePair,
      comparisonQueue,
      completedComparisons,
      replenishQueue,
      confidenceThreshold,
      effectiveMinComparisons,
    ],
  );

  useEffect(() => {
    if (!(uploadedImages.length >= 2 && comparisonType && step === 'compare')) return;

    if (
      currentPair ||
      comparisonQueue.length > 0 ||
      Object.keys(completedComparisons).length > 0 ||
      processingSelection
    ) {
      return;
    }

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

    const seededQueue = replenishQueue(uploadedImages, {}, []);
    let nextPair = null;
    let nextQueue = seededQueue;

    if (seededQueue.length > 0) {
      const bestPair = memoizedFindMostInformativePair(uploadedImages, seededQueue, {
        minComparisons: effectiveMinComparisons,
      });
      const selected = bestPair || seededQueue[0];
      if (selected) {
        const [leftId, rightId] = selected;
        const leftImage = uploadedImages.find((img) => img.id === leftId);
        const rightImage = uploadedImages.find((img) => img.id === rightId);
        if (leftImage && rightImage) {
          nextPair = [leftImage, rightImage];
          const selectedKey = makePairKey(leftId, rightId);
          nextQueue = seededQueue.filter((pair) => makePairKey(pair[0], pair[1]) !== selectedKey);
        }
      }
    }

    setCurrentPair(nextPair);
    setComparisonQueue(nextQueue);
    setProgress(0);
    setProcessingSelection(false);
  }, [
    uploadedImages,
    comparisonType,
    step,
    currentPair,
    comparisonQueue.length,
    completedComparisons,
    processingSelection,
    replenishQueue,
    memoizedFindMostInformativePair,
    effectiveMinComparisons,
  ]);

  useEffect(() => {
    const completedCount = Object.keys(completedComparisons).length;
    const outstanding = comparisonQueue.length + (currentPair ? 1 : 0);
    const targetBase = uploadedImages.length
      ? (uploadedImages.length * effectiveMinComparisons) / 2
      : 0;
    const target = Math.max(targetBase, completedCount + outstanding);

    if (target > 0) {
      setProgress(Math.min(100, (completedCount / target) * 100));
    } else {
      setProgress(0);
    }

    if (step === 'compare') {
      const canStop = hasEnoughConfidenceEnhanced(uploadedImages, {
        minConfidence: dynamicConfidenceThreshold,
        minComparisons: effectiveMinComparisons,
        adjacentMargin: dynamicAdjacentMargin,
        topK: dynamicTopK,
      });

      if (canStop) {
        calculateFinalRankings();
        changeStep('results');
      }
    } else {
      estimatedRemaining = 0;
    }
  }, [
    completedComparisons,
    comparisonQueue.length,
    currentPair,
    uploadedImages,
    effectiveMinComparisons,
    confidenceThreshold,
    calculateFinalRankings,
    changeStep,
    step,
  ]);

  // Auto-advance to results if confidence is high enough
  useEffect(() => {
    if (autoAdvance && step === 'compare' && uploadedImages.length > 0) {
      // Check if all images have been compared enough times
      const allComparedEnough = uploadedImages.every(
        (img) => (img.comparisons || 0) >= effectiveMinComparisons,
      );

      // Calculate average confidence
      const avgConfidence =
        uploadedImages.reduce((sum, img) => {
          return sum + calculateConfidence(img.uncertainty || DEFAULT_UNCERTAINTY);
        }, 0) / uploadedImages.length;

      if (allComparedEnough && avgConfidence >= dynamicConfidenceThreshold) {
        calculateFinalRankings();
        changeStep('results');
      }
    }
  }, [
    autoAdvance,
    step,
    uploadedImages,
    confidenceThreshold,
    effectiveMinComparisons,
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
              {(() => {
                const base = comparisonQueue.length;
                if (base === 0) return 0;
                const canStop = hasEnoughConfidenceEnhanced(uploadedImages, {
                  minConfidence: dynamicConfidenceThreshold,
                  minComparisons: effectiveMinComparisons,
                  adjacentMargin: dynamicAdjacentMargin,
                  topK: dynamicTopK,
                });
                if (canStop) return 0;
                const median = getMedianConfidence(uploadedImages);
                const baseline = 50; // min confidence baseline
                const target = Math.max(baseline + 1, dynamicConfidenceThreshold);
                const ratio = Math.max(0, Math.min(1, (median - baseline) / (target - baseline)));
                // Scale down remaining up to 50% as confidence approaches threshold
                let effective = Math.ceil(base * (1 - 0.5 * ratio));
                // Ensure per-image coverage requirement isn’t under-reported
                const coveragePairs = Math.ceil(
                  uploadedImages.reduce(
                    (sum, img) =>
                      sum + Math.max(0, effectiveMinComparisons - (img.comparisons || 0)),
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
            remaining={formatNumber(comparisonQueue.length)}
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
