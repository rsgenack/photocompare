"use client"

import { useState, useEffect, useCallback } from "react"
import { ZoomIn, ZoomOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import IntroPage from "./intro-page"
import ComparisonTypePage from "./comparison-type-page"
import UploadPage from "./upload-page"
import ComparisonView from "./comparison-view"
import JuxtaposeComparison from "./juxtapose-comparison"
import ResultsPage from "./results-page"
import { useMobile } from "@/hooks/use-mobile"

export default function PhotoCompare() {
  const [step, setStep] = useState("intro")
  const [comparisonType, setComparisonType] = useState("")
  const [uploadedImages, setUploadedImages] = useState([])
  const [allPairs, setAllPairs] = useState([])
  const [currentPair, setCurrentPair] = useState(null)
  const [remainingPairs, setRemainingPairs] = useState([])
  const [completedComparisons, setCompletedComparisons] = useState({})
  const [zoom, setZoom] = useState(100)
  const [activeTab, setActiveTab] = useState("side-by-side")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const isMobile = useMobile()

  // Generate all possible pairs when starting comparison
  useEffect(() => {
    if (uploadedImages.length >= 2 && step === "compare") {
      try {
        const pairs = []

        // Generate all possible pairs
        for (let i = 0; i < uploadedImages.length; i++) {
          for (let j = i + 1; j < uploadedImages.length; j++) {
            pairs.push([uploadedImages[i].id, uploadedImages[j].id])
          }
        }

        // Shuffle the pairs for randomization
        const shuffledPairs = [...pairs].sort(() => Math.random() - 0.5)

        setAllPairs(pairs)
        setRemainingPairs(shuffledPairs)
        setError(null)

        // Set the first pair
        if (shuffledPairs.length > 0) {
          const [leftId, rightId] = shuffledPairs[0]
          const leftImage = uploadedImages.find((img) => img.id === leftId)
          const rightImage = uploadedImages.find((img) => img.id === rightId)

          if (leftImage && rightImage) {
            setCurrentPair([leftImage, rightImage])
          } else {
            setError("Error loading image pair")
            setStep("upload")
          }
        } else {
          // All comparisons done (shouldn't happen here but just in case)
          calculateFinalRankings()
          setStep("results")
        }
      } catch (err) {
        console.error("Error generating pairs:", err)
        setError("Error generating comparison pairs")
        setStep("upload")
      }
    }
  }, [uploadedImages, step])

  // Update progress and set next pair
  useEffect(() => {
    if (step === "compare") {
      try {
        const totalPairs = allPairs.length
        const completedPairs = Object.keys(completedComparisons).length
        setProgress(totalPairs > 0 ? (completedPairs / totalPairs) * 100 : 0)

        if (remainingPairs.length === 0 && completedPairs > 0 && completedPairs === totalPairs) {
          // All comparisons done
          calculateFinalRankings()
          setStep("results")
        }
      } catch (err) {
        console.error("Error updating progress:", err)
        setError("Error updating progress")
      }
    }
  }, [completedComparisons, allPairs.length, remainingPairs.length, step])

  // Add keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (step !== "compare" || !currentPair) return

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()

        if (e.key === "ArrowLeft") {
          selectWinner(currentPair[0].id)
        } else if (e.key === "ArrowRight") {
          selectWinner(currentPair[1].id)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true })
  }, [step, currentPair])

  const handleImagesUploaded = useCallback((newImages) => {
    setUploadedImages((prev) => [...prev, ...newImages])
    setError(null)
  }, [])

  const handleImageDelete = useCallback((id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const startComparison = useCallback(() => {
    if (uploadedImages.length >= 2) {
      setStep("compare")
      setCompletedComparisons({})
      setError(null)
    } else {
      setError("Please upload at least 2 images")
    }
  }, [uploadedImages.length])

  const selectWinner = useCallback(
    (winnerId) => {
      if (!currentPair) return

      try {
        const [left, right] = currentPair
        const pairKey = left.id < right.id ? `${left.id}-${right.id}` : `${right.id}-${left.id}`

        setCompletedComparisons((prev) => ({
          ...prev,
          [pairKey]: winnerId,
        }))

        const updatedRemainingPairs = remainingPairs.filter((pair, idx) => idx !== 0)
        setRemainingPairs(updatedRemainingPairs)

        if (updatedRemainingPairs.length > 0) {
          const [nextLeftId, nextRightId] = updatedRemainingPairs[0]
          const nextLeft = uploadedImages.find((img) => img.id === nextLeftId)
          const nextRight = uploadedImages.find((img) => img.id === nextRightId)

          if (nextLeft && nextRight) {
            setCurrentPair([nextLeft, nextRight])
          } else {
            setError("Error loading next image pair")
            setStep("upload")
          }
        }
      } catch (err) {
        console.error("Error selecting winner:", err)
        setError("Error selecting winner")
      }
    },
    [currentPair, remainingPairs, uploadedImages],
  )

  const calculateFinalRankings = useCallback(() => {
    try {
      // Calculate scores
      const scores = {}
      uploadedImages.forEach((img) => {
        scores[img.id] = 0
      })

      Object.entries(completedComparisons).forEach(([_, winnerId]) => {
        scores[winnerId] = (scores[winnerId] || 0) + 1
      })

      // Update images with scores
      let updatedImages = uploadedImages.map((img) => ({
        ...img,
        score: scores[img.id] || 0,
      }))

      // Sort by score
      updatedImages = updatedImages.sort((a, b) => (b.score || 0) - (a.score || 0))

      // Assign ranks
      let currentRank = 1
      let previousScore = -1

      updatedImages.forEach((img, index) => {
        if (img.score !== previousScore) {
          previousScore = img.score
          currentRank = index + 1
        }
        img.rank = currentRank
      })

      // Sort by rank
      updatedImages = updatedImages.sort((a, b) => (a.rank || 999) - (b.rank || 999))

      setUploadedImages(updatedImages)
      setError(null)
    } catch (err) {
      console.error("Error calculating rankings:", err)
      setError("Error calculating final rankings")
    }
  }, [uploadedImages, completedComparisons])

  const resetComparison = useCallback(() => {
    setStep("intro")
    setComparisonType("")
    setCompletedComparisons({})
    setCurrentPair(null)
    setAllPairs([])
    setRemainingPairs([])
    setProgress(0)
    setActiveTab("side-by-side")
    setUploadedImages([])
    setError(null)
  }, [])

  const downloadResults = useCallback(
    (format) => {
      try {
        if (format === "csv") {
          const csvContent =
            "data:text/csv;charset=utf-8," +
            "Rank,Filename,Score\n" +
            uploadedImages.map((img) => `${img.rank},${img.name},${img.score}`).join("\n")

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
            score: img.score,
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
    [uploadedImages],
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

  // Render the appropriate page based on the current step
  if (step === "intro") {
    return <IntroPage onGetStarted={() => setStep("type")} />
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
              setStep("upload")
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
      </>
    )
  }

  if (step === "compare" && currentPair) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage />
        <div className="modern-card p-4 md:p-8 mb-6 md:mb-12">
          <h1 className="text-2xl md:text-3xl mb-4 text-center font-bold text-gray-800">Step 3: Compare Photos</h1>

          <div className="border-t border-b border-gray-200 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-2 mb-4 md:mb-6">
            <div className="text-base md:text-lg font-medium text-gray-700">
              {remainingPairs.length} Comparisons Remaining
            </div>
            <div className="text-base md:text-lg font-medium text-indigo-600">{Math.round(progress)}% Complete</div>
          </div>

          <div className="mb-4 md:mb-6">
            <div className="h-3 md:h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {comparisonType === "versions" ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="bg-gray-50 rounded-xl mb-4 md:mb-6 p-1">
                <TabsList className="grid w-full grid-cols-2 p-0">
                  <TabsTrigger
                    value="side-by-side"
                    className={`py-2 md:py-3 text-base md:text-lg font-medium rounded-lg ${activeTab === "side-by-side" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"}`}
                  >
                    Side by Side
                  </TabsTrigger>
                  <TabsTrigger
                    value="overlay"
                    className={`py-2 md:py-3 text-base md:text-lg font-medium rounded-lg ${activeTab === "overlay" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"}`}
                  >
                    Slider Comparison
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="side-by-side" className="m-0 pt-0 border-0">
                <ComparisonView
                  leftImage={currentPair[0]}
                  rightImage={currentPair[1]}
                  zoom={zoom}
                  onSelectLeft={() => selectWinner(currentPair[0].id)}
                  onSelectRight={() => selectWinner(currentPair[1].id)}
                />
              </TabsContent>

              <TabsContent value="overlay" className="m-0 pt-0 border-0">
                <JuxtaposeComparison
                  leftImage={currentPair[0]}
                  rightImage={currentPair[1]}
                  onSelectLeft={() => selectWinner(currentPair[0].id)}
                  onSelectRight={() => selectWinner(currentPair[1].id)}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <ComparisonView
              leftImage={currentPair[0]}
              rightImage={currentPair[1]}
              zoom={zoom}
              onSelectLeft={() => selectWinner(currentPair[0].id)}
              onSelectRight={() => selectWinner(currentPair[1].id)}
            />
          )}

          <div className="bg-gray-50 rounded-xl p-3 md:p-4 mt-4 md:mt-6 shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <ZoomOut className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              <Slider
                value={[zoom]}
                min={50}
                max={200}
                step={5}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1 h-3 md:h-4"
              />
              <ZoomIn className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              <span className="text-base md:text-lg font-medium w-12 md:w-16 text-right text-gray-700">{zoom}%</span>
            </div>
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
      </>
    )
  }

  return <IntroPage onGetStarted={() => setStep("type")} />
}

