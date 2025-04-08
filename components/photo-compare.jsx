"use client"

import { useState, useEffect, useCallback } from "react"
import { ZoomIn, ZoomOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import SplashScreen from "./splash-screen.jsx"
import IntroPage from "./intro-page.jsx"
import ComparisonTypePage from "./comparison-type-page.jsx"
import UploadPage from "./upload-page.jsx"
import ComparisonView from "./comparison-view.jsx"
import ResultsPage from "./results-page.jsx"
import DimensionWarningModal from "./dimension-warning-modal.jsx"
import { useMobile } from "@/hooks/use-mobile"
import { scrollToTop } from "@/utils/scroll-utils"
import {
  updateRatings,
  updateUncertainties,
  findMostInformativePair,
  calculateConfidence,
  DEFAULT_RATING,
  DEFAULT_UNCERTAINTY,
} from "@/utils/elo-rating"
import { debugLog, monitorFocus } from "@/utils/debug-utils"

// =====================================================================
// LOCKED COMPONENT - VERSION 6
// This component's slider comparison functionality has been locked to
// Version 6. Do not modify the slider comparison code or its behavior.
// =====================================================================

export default function PhotoCompare() {
  // State declarations
  const [step, setStep] = useState("splash")
  const [comparisonType, setComparisonType] = useState("")
  const [uploadedImages, setUploadedImages] = useState([])
  const [allPairs, setAllPairs] = useState([])
  const [currentPair, setCurrentPair] = useState(null)
  const [remainingPairs, setRemainingPairs] = useState([])
  const [completedComparisons, setCompletedComparisons] = useState({})
  const [zoom, setZoom] = useState(100)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [showDimensionWarning, setShowDimensionWarning] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState(75) // Minimum confidence to stop comparisons
  const [minComparisons, setMinComparisons] = useState(3) // Minimum comparisons per image
  const [autoAdvance, setAutoAdvance] = useState(true) // Whether to automatically advance to results when confident
  const isMobile = useMobile()
  const [imageAspectRatio, setImageAspectRatio] = useState(null)
  const [processingSelection, setProcessingSelection] = useState(false) // Add state to track selection processing

  // Add this inside the component body, after the state declarations:
  useEffect(() => {
    // Monitor focus changes to help debug keyboard navigation
    monitorFocus()

    // Log component mounting
    debugLog("PhotoCompare", "Component mounted")

    return () => {
      debugLog("PhotoCompare", "Component unmounted")
    }
  }, [])

  const memoizedFindMostInformativePair = useCallback((images, pairs) => {
    return findMostInformativePair(images, pairs)
  }, [])

  // Handle step changes with scroll to top
  const changeStep = useCallback((newStep) => {
    scrollToTop()
    setStep(newStep)
  }, [])

  // Calculate final rankings based on Elo ratings
  const calculateFinalRankings = useCallback(() => {
    try {
      // Sort by rating (descending)
      let updatedImages = [...uploadedImages].sort((a, b) => (b.rating || 0) - (a.rating || 0))

      // Assign ranks
      updatedImages = updatedImages.map((img, index) => ({
        ...img,
        rank: index + 1,
        score: img.rating || 0,
        confidence: calculateConfidence(img.uncertainty || DEFAULT_UNCERTAINTY),
      }))

      setUploadedImages(updatedImages)
      setError(null)
    } catch (err) {
      console.error("Error calculating rankings:", err)
      setError("Error calculating final rankings")
    }
  }, [uploadedImages])

  // Check if images have different dimensions
  const checkImageDimensions = useCallback(() => {
    const checkDimensions = async () => {
      try {
        if (comparisonType !== "versions" || uploadedImages.length < 2) return true

        // Create a function to get image dimensions
        const getImageDimensions = (url) => {
          return new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = "anonymous" // Add this to avoid CORS issues
            img.onload = () => {
              resolve({
                width: img.width,
                height: img.height,
                aspectRatio: img.width / img.height,
              })
            }
            img.onerror = () => {
              console.error(`Error loading image: ${url}`)
              resolve({ width: 0, height: 0, aspectRatio: 0 })
            }
            img.src = url
          })
        }

        // Check all images against the first one
        const dimensions = await Promise.all(
          uploadedImages.map((img) =>
            getImageDimensions(img.url).catch((err) => {
              console.error(`Error loading image: ${img.name}`, err)
              return { width: 0, height: 0, aspectRatio: 0 } // Default dimensions on error
            }),
          ),
        )

        const firstDimension = dimensions[0]

        // Check for different aspect ratios (with a small tolerance for rounding errors)
        const ASPECT_RATIO_TOLERANCE = 0.01
        const hasDifferentAspectRatios = dimensions.some(
          (dim) => Math.abs(dim.aspectRatio - firstDimension.aspectRatio) > ASPECT_RATIO_TOLERANCE,
        )

        if (hasDifferentAspectRatios) {
          setError("When comparing versions of the same photo, all images must have the same aspect ratio.")
          return false
        }

        // Store the aspect ratio in state for the comparison view
        setImageAspectRatio(firstDimension.aspectRatio)
        return true
      } catch (err) {
        console.error("Error checking dimensions:", err)
        setError("Failed to check image dimensions. Please try again.")
        return false // Don't proceed on error
      }
    }

    // Start the check
    return checkDimensions()
  }, [comparisonType, uploadedImages, setError])

  // Add debug logging to the selectWinner function
  const selectWinner = useCallback(
    (winnerId) => {
      // Prevent multiple selections being processed at once
      if (processingSelection) {
        console.log("Selection already in progress, ignoring this selection")
        return
      }

      setProcessingSelection(true)

      debugLog("PhotoCompare", "selectWinner called", { winnerId })

      // Add at the beginning of the selectWinner function
      console.log("Selecting winner:", winnerId)
      console.log("Current pair:", currentPair)
      console.log("Remaining pairs before:", remainingPairs.length)

      console.log("=== SELECT WINNER CALLED ===")
      console.log("Winner ID:", winnerId)
      console.log("Current pair:", currentPair)
      console.log("Processing selection:", processingSelection)
      console.log("Remaining pairs:", remainingPairs.length)

      if (!currentPair || !currentPair[0] || !currentPair[1]) {
        debugLog("PhotoCompare", "selectWinner aborted - no current pair")
        setProcessingSelection(false)
        return
      }

      try {
        const [left, right] = currentPair
        const pairKey = left.id < right.id ? `${left.id}-${right.id}` : `${right.id}-${left.id}`
        const loserId = left.id === winnerId ? right.id : left.id

        // Update completed comparisons
        const updatedCompletedComparisons = {
          ...completedComparisons,
          [pairKey]: winnerId,
        }

        // Initialize default ratings and uncertainties
        let newRatings = { winner: DEFAULT_RATING, loser: DEFAULT_RATING }
        let newUncertainties = { winner: DEFAULT_UNCERTAINTY, loser: DEFAULT_UNCERTAINTY }

        // Update Elo ratings
        const winner = uploadedImages.find((img) => img.id === winnerId)
        const loser = uploadedImages.find((img) => img.id === loserId)

        if (winner && loser) {
          // Calculate new ratings
          newRatings = updateRatings(winner.rating || DEFAULT_RATING, loser.rating || DEFAULT_RATING)

          // Calculate new uncertainties
          newUncertainties = updateUncertainties(
            winner.uncertainty || DEFAULT_UNCERTAINTY,
            loser.uncertainty || DEFAULT_UNCERTAINTY,
          )
        }

        // Create a copy of the uploaded images with updated ratings
        const updatedImages = uploadedImages.map((img) => {
          if (img.id === winnerId) {
            return {
              ...img,
              rating: newRatings.winner,
              uncertainty: newUncertainties.winner,
              comparisons: (img.comparisons || 0) + 1,
            }
          } else if (img.id === loserId) {
            return {
              ...img,
              rating: newRatings.loser,
              uncertainty: newUncertainties.loser,
              comparisons: (img.comparisons || 0) + 1,
            }
          }
          return img
        })

        // Update state with the new ratings
        setUploadedImages(updatedImages)
        setCompletedComparisons(updatedCompletedComparisons)

        // Make a copy of remaining pairs to avoid race conditions
        const currentRemainingPairs = [...remainingPairs]
        console.log("Current remaining pairs:", currentRemainingPairs.length)

        // Find the next most informative pair
        const bestPair = findMostInformativePair(updatedImages, currentRemainingPairs)

        if (bestPair) {
          const [nextLeftId, nextRightId] = bestPair
          const nextLeft = updatedImages.find((img) => img.id === nextLeftId)
          const nextRight = updatedImages.find((img) => img.id === nextRightId)

          if (nextLeft && nextRight) {
            // IMPORTANT: First filter out the best pair from remaining pairs
            const newRemainingPairs = currentRemainingPairs.filter((pair) => {
              const match =
                (pair[0] === nextLeftId && pair[1] === nextRightId) ||
                (pair[0] === nextRightId && pair[1] === nextLeftId)
              return !match // Keep pairs that don't match
            })

            console.log("Setting next pair:", [nextLeft.id, nextRight.id])
            console.log("Remaining pairs after filtering:", newRemainingPairs.length)

            // Set the current pair first, then update remaining pairs
            setCurrentPair([nextLeft, nextRight])
            setRemainingPairs(newRemainingPairs)
          } else {
            console.error("Could not find next images in the best pair")
            setError("Error loading next image pair")
            changeStep("upload")
          }
        } else if (currentRemainingPairs.length > 0) {
          // If no best pair found but pairs remain, just use the first one
          const [nextLeftId, nextRightId] = currentRemainingPairs[0]
          const nextLeft = updatedImages.find((img) => img.id === nextLeftId)
          const nextRight = updatedImages.find((img) => img.id === nextRightId)

          if (nextLeft && nextRight) {
            setCurrentPair([nextLeft, nextRight])
            setRemainingPairs(currentRemainingPairs.slice(1))
            console.log("Using first available pair:", [nextLeft.id, nextRight.id])
          } else {
            console.error("Could not find next images in the first pair")
            setError("Error loading next image pair")
          }
        } else {
          // No more pairs, go to results
          console.log("No more pairs, going to results")
          calculateFinalRankings()
          changeStep("results")
        }
      } catch (err) {
        console.error("Error selecting winner:", err)
        setError("Error selecting winner")
      } finally {
        // Always reset the processing flag when done with a small delay
        setTimeout(() => {
          console.log("Resetting processing flag")
          setProcessingSelection(false)
        }, 100)
      }
    },
    [
      currentPair,
      remainingPairs,
      uploadedImages,
      changeStep,
      setError,
      completedComparisons,
      calculateFinalRankings,
      processingSelection,
    ],
  )

  // Add keyboard support with improved handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process keyboard events when in compare mode with a valid pair
      if (step !== "compare" || !currentPair || !currentPair[0] || !currentPair[1]) return

      // Check for arrow keys
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // Prevent default browser behavior (like scrolling)
        e.preventDefault()
        e.stopPropagation()

        // Don't process if we're already handling a selection
        if (processingSelection) {
          console.log("Selection in progress, ignoring key press")
          return
        }

        console.log(`Key pressed: ${e.key}`)

        // Process the key press
        if (e.key === "ArrowLeft") {
          console.log("Selecting left image:", currentPair[0].id)
          selectWinner(currentPair[0].id)
        } else if (e.key === "ArrowRight") {
          console.log("Selecting right image:", currentPair[1].id)
          selectWinner(currentPair[1].id)
        }
      }
    }

    // Add event listener with capture phase to ensure it gets first priority
    window.addEventListener("keydown", handleKeyDown, { capture: true })

    // Clean up the event listener when component unmounts or dependencies change
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true })
    }
  }, [step, currentPair, selectWinner, processingSelection])

  const handleImagesUploaded = useCallback(
    (newImages) => {
      setUploadedImages((prev) => {
        // Check for duplicates by name
        const existingNames = new Set(prev.map((img) => img.name))
        const uniqueNewImages = newImages.filter((img) => !existingNames.has(img.name))

        if (uniqueNewImages.length < newImages.length) {
          setError(`${newImages.length - uniqueNewImages.length} duplicate image(s) were skipped`)
        } else {
          setError(null)
        }

        return [...prev, ...uniqueNewImages]
      })
    },
    [setError],
  )

  const handleImageDelete = useCallback((id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const startComparison = useCallback(async () => {
    // Check dimensions if comparing versions
    const dimensionsOk = await checkImageDimensions()

    if (dimensionsOk) {
      changeStep("compare")
      setCompletedComparisons({})
      setError(null)
    } else if (comparisonType === "versions") {
      // Don't proceed if dimensions check failed for versions
      // The error message is already set in checkImageDimensions
    } else {
      // For "different" type, we can proceed regardless
      changeStep("compare")
      setCompletedComparisons({})
      setError(null)
    }
  }, [changeStep, checkImageDimensions, setError, comparisonType])

  const handleProceedWithDifferentType = useCallback(() => {
    setComparisonType("different")
    setShowDimensionWarning(false)
    changeStep("compare")
    setCompletedComparisons({})
    setError(null)
  }, [changeStep, setError])

  const resetComparison = useCallback(() => {
    changeStep("splash")
    setComparisonType("")
    setCompletedComparisons({})
    setCurrentPair(null)
    setAllPairs([])
    setRemainingPairs([])
    setProgress(0)
    setUploadedImages([])
    setError(null)
    setProcessingSelection(false)
  }, [changeStep, setError])

  const downloadResults = useCallback(
    (format) => {
      try {
        if (format === "csv") {
          const csvContent =
            "data:text/csv;charset=utf-8," +
            "Rank,Filename,Rating,Confidence,Comparisons,Compressed\n" +
            uploadedImages
              .map(
                (img) =>
                  `${img.rank},"${img.name}",${img.rating || 0},${img.confidence || 0}%,${img.comparisons || 0},${img.compressed ? "Yes" : "No"}`,
              )
              .join("\n")

          const encodedUri = encodeURI(csvContent)
          const link = document.createElement("a")
          link.setAttribute("href", encodedUri)
          link.setAttribute("download", "photo_rankings.csv")
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else if (format === "json") {
          const jsonData = uploadedImages.map((img) => ({
            rank: img.rank,
            filename: img.name,
            rating: img.rating || 0,
            confidence: img.confidence || 0,
            comparisons: img.comparisons || 0,
            compressed: img.compressed || false,
          }))

          const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData, null, 2))
          const link = document.createElement("a")
          link.setAttribute("href", jsonContent)
          link.setAttribute("download", "photo_rankings.json")
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (err) {
        console.error("Error downloading results:", err)
        setError("Error downloading results")
      }
    },
    [uploadedImages, setError],
  )

  // Error display component
  const ErrorMessage = () => {
    if (!error) return null

    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    )
  }

  const handleRemoveImage = useCallback(
    (imageId) => {
      // Remove the image from uploadedImages
      setUploadedImages((prev) => {
        const updated = prev.filter((img) => img.id !== imageId)

        // If no images left, reset to upload page
        if (updated.length < 2 && step === "compare") {
          setError("At least 2 images are required for comparison")
          changeStep("upload")
        }

        return updated
      })

      // Remove any pairs containing this image from remainingPairs
      setRemainingPairs((prev) => prev.filter(([leftId, rightId]) => leftId !== imageId && rightId !== imageId))

      // Remove any pairs containing this image from allPairs
      setAllPairs((prev) => prev.filter(([leftId, rightId]) => leftId !== imageId && rightId !== imageId))

      // Remove any completed comparisons involving this image
      setCompletedComparisons((prev) => {
        const updatedComparisons = { ...prev }
        // Filter out any pair keys that contain the removed image id
        Object.keys(updatedComparisons).forEach((pairKey) => {
          if (pairKey.includes(imageId) || updatedComparisons[pairKey] === imageId) {
            delete updatedComparisons[pairKey]
          }
        })
        return updatedComparisons
      })

      // If current pair contains the removed image, move to next pair
      if (currentPair && (currentPair[0]?.id === imageId || currentPair[1]?.id === imageId)) {
        if (remainingPairs.length > 0) {
          // Find the next most informative pair
          const updatedImages = uploadedImages.filter((img) => img.id !== imageId)
          const bestPair = memoizedFindMostInformativePair(updatedImages, remainingPairs)

          if (bestPair) {
            const [nextLeftId, nextRightId] = bestPair
            const nextLeft = updatedImages.find((img) => img.id === nextLeftId)
            const nextRight = updatedImages.find((img) => img.id === nextRightId)

            if (nextLeft && nextRight) {
              setCurrentPair([nextLeft, nextRight])
              // Remove this pair from remaining pairs
              setRemainingPairs((prev) =>
                prev.filter(
                  (pair) =>
                    !(
                      (pair[0] === nextLeftId && pair[1] === nextRightId) ||
                      (pair[0] === nextRightId && pair[1] === nextLeftId)
                    ),
                ),
              )
            }
          } else if (remainingPairs.length > 0) {
            // If no best pair found but pairs remain, just use the first one
            const [nextLeftId, nextRightId] = remainingPairs[0]
            const nextLeft = updatedImages.find((img) => img.id === nextLeftId)
            const nextRight = updatedImages.find((img) => img.id === nextRightId)

            if (nextLeft && nextRight) {
              setCurrentPair([nextLeft, nextRight])
              setRemainingPairs((prev) => prev.slice(1))
            }
          }
        } else {
          // If no more pairs, go to results
          calculateFinalRankings()
          changeStep("results")
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
  )

  // Initialize pairs and start comparison when images are uploaded or comparison type changes
  useEffect(() => {
    if (uploadedImages.length >= 2 && comparisonType) {
      // Generate all possible pairs of images
      const newPairs = []
      for (let i = 0; i < uploadedImages.length; i++) {
        for (let j = i + 1; j < uploadedImages.length; j++) {
          newPairs.push([uploadedImages[i].id, uploadedImages[j].id])
        }
      }

      // Initialize allPairs and remainingPairs
      setAllPairs(newPairs)
      setRemainingPairs(newPairs)

      // Find the best pair to start with
      const bestPair = findMostInformativePair(uploadedImages, newPairs)

      if (bestPair) {
        const [nextLeftId, nextRightId] = bestPair
        const nextLeft = uploadedImages.find((img) => img.id === nextLeftId)
        const nextRight = uploadedImages.find((img) => img.id === nextRightId)

        if (nextLeft && nextRight) {
          setCurrentPair([nextLeft, nextRight])
          // Remove this pair from remaining pairs
          setRemainingPairs((prev) =>
            prev.filter(
              (pair) =>
                !(
                  (pair[0] === nextLeftId && pair[1] === nextRightId) ||
                  (pair[0] === nextRightId && pair[1] === nextLeftId)
                ),
            ),
          )
        }
      }

      // Reset progress
      setProgress(0)

      // Reset processing flag
      setProcessingSelection(false)
    }
  }, [uploadedImages, comparisonType])

  // Update progress based on completed comparisons
  useEffect(() => {
    if (allPairs.length > 0) {
      const completedCount = Object.keys(completedComparisons).length
      const newProgress = (completedCount / allPairs.length) * 100
      setProgress(newProgress)
    }
  }, [completedComparisons, allPairs.length])

  // Auto-advance to results if confidence is high enough
  useEffect(() => {
    if (autoAdvance && step === "compare" && uploadedImages.length > 0) {
      // Check if all images have been compared enough times
      const allComparedEnough = uploadedImages.every((img) => (img.comparisons || 0) >= minComparisons)

      // Calculate average confidence
      const avgConfidence =
        uploadedImages.reduce((sum, img) => {
          return sum + calculateConfidence(img.uncertainty || DEFAULT_UNCERTAINTY)
        }, 0) / uploadedImages.length

      if (allComparedEnough && avgConfidence >= confidenceThreshold) {
        calculateFinalRankings()
        changeStep("results")
      }
    }
  }, [autoAdvance, step, uploadedImages, confidenceThreshold, minComparisons, calculateFinalRankings, changeStep])

  // =====================================================================
  // LOCKED SLIDER COMPARISON CODE - VERSION 6
  // This section contains the slider comparison functionality that has
  // been locked to Version 6. Do not modify this code.
  // =====================================================================

  // Render the appropriate page based on the current step
  if (step === "splash") {
    return <SplashScreen onComplete={() => changeStep("intro")} />
  }

  if (step === "intro") {
    return <IntroPage onGetStarted={() => changeStep("type")} />
  }

  if (step === "type") {
    return (
      <>
        <ErrorMessage />
        <ComparisonTypePage
          comparisonType={comparisonType}
          setComparisonType={setComparisonType}
          onNext={() => {
            if (comparisonType) {
              changeStep("upload")
            } else {
              setError("Please select a comparison type")
            }
          }}
        />
      </>
    )
  }

  if (step === "upload") {
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
      </>
    )
  }

  if (step === "compare" && currentPair) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage />
        <div className="border-2 border-black p-4 md:p-8 mb-6 md:mb-12 bg-white">
          <h1 className="text-2xl md:text-3xl mb-4 text-center font-bold text-black font-display">COMPARE PHOTOS</h1>

          <div className="border-t-2 border-b-2 border-black py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-2 mb-4 md:mb-6">
            <div className="text-base md:text-lg font-medium text-black">
              {remainingPairs.length} COMPARISONS REMAINING
            </div>
            <div className="text-base md:text-lg font-medium text-black">
              {Math.min(Math.round(progress), 100)}% COMPLETE
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <div className="h-3 md:h-4 bg-gray-100 overflow-hidden border border-black">
              <div className="h-full bg-yellow_green" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <ComparisonView
            leftImage={currentPair[0]}
            rightImage={currentPair[1]}
            zoom={zoom}
            setZoom={setZoom}
            onSelectLeft={() => selectWinner(currentPair[0].id)}
            onSelectRight={() => selectWinner(currentPair[1].id)}
            onRemoveImage={handleRemoveImage}
            aspectRatio={comparisonType === "versions" ? imageAspectRatio : null}
          />

          <div className="bg-gray-100 p-3 md:p-4 mt-4 md:mt-6 border border-black">
            <div className="flex items-center gap-3 md:gap-4">
              <ZoomOut className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
              <Slider
                value={[zoom]}
                min={50}
                max={200}
                step={5}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1 h-3 md:h-4"
              />
              <ZoomIn className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
              <span className="text-base md:text-lg font-medium w-12 md:w-16 text-right text-gray-800">{zoom}%</span>
            </div>
          </div>

          {/* Skip to results button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                calculateFinalRankings()
                changeStep("results")
              }}
              className="px-6 py-2 bg-cardinal text-white font-bold rounded-full"
            >
              SKIP TO RESULTS
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "results") {
    return (
      <>
        <ErrorMessage />
        <ResultsPage
          uploadedImages={uploadedImages}
          resetComparison={resetComparison}
          downloadResults={downloadResults}
        />
        <DimensionWarningModal
          isOpen={showDimensionWarning}
          onClose={() => setShowDimensionWarning(false)}
          onProceed={handleProceedWithDifferentType}
        />
      </>
    )
  }

  return <IntroPage onGetStarted={() => changeStep("type")} />
}
