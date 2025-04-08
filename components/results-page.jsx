"use client"

import { Trophy, FileJson, FileSpreadsheet, Check, ArrowRight, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { scrollToTop } from "@/utils/scroll-utils"
import { useEffect, useState } from "react"
import Sparkle from "./sparkle.jsx"
import MasonryGrid from "./masonry-grid.jsx"

export default function ResultsPage({ uploadedImages, resetComparison, downloadResults }) {
  const handleResetComparison = () => {
    scrollToTop()
    resetComparison()
  }

  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Ensure no ties in rankings
  const ensureNoTies = (images) => {
    // First sort by score (descending)
    const sortedByScore = [...images].sort((a, b) => (b.score || 0) - (a.score || 0))

    // Then assign unique ranks (if scores are tied, the earlier image in the array gets the higher rank)
    return sortedByScore.map((image, index) => ({
      ...image,
      rank: index + 1,
    }))
  }

  // Apply no-ties ranking
  const rankedImages = ensureNoTies(uploadedImages)

  // Custom layout for the winner (first place)
  const customRenderItem = (item, index) => {
    const isWinner = item.rank === 1
    const color = getColor(item.rank)

    // Determine grid span based on rank
    const gridClasses = isWinner ? "col-span-2 row-span-2" : item.rank <= 3 ? "col-span-1 row-span-1" : ""

    return (
      <div className="relative group overflow-hidden h-full border-2 border-black flex items-center justify-center bg-gray-100">
        <img
          src={item.url || "/placeholder.svg"}
          alt={`Rank #${item.rank} photo`}
          className="max-w-full max-h-full object-contain"
          style={{ width: "auto", height: "auto" }}
        />

        {/* Rank indicator */}
        <div
          className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
          style={{
            backgroundColor: color,
            fontSize: isWinner ? "20px" : "16px",
          }}
        >
          {item.rank}
        </div>

        {/* Trophy and sparkles for #1 */}
        {isWinner && showAnimation && (
          <>
            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm p-2 rounded-full">
              <Trophy className="h-6 w-6" style={{ color: "#ffba08" }} />
            </div>

            {/* Colorful Sparkles */}
            <Sparkle className="-top-4 left-[15%] animate-sparkle-1" style={{ color: "#ffba08" }} />
            <Sparkle className="-top-6 left-[45%] animate-sparkle-2" style={{ color: "#f17105" }} />
            <Sparkle className="-top-3 right-[20%] animate-sparkle-3" style={{ color: "#d11149" }} />
            <Sparkle className="top-[30%] -left-4 animate-sparkle-4" style={{ color: "#b1cf5f" }} />
            <Sparkle className="top-[40%] -right-4 animate-sparkle-2" style={{ color: "#7b89ef" }} />
            <Sparkle className="-bottom-4 left-[25%] animate-sparkle-3" style={{ color: "#90e0f3" }} />
            <Sparkle className="-bottom-6 right-[35%] animate-sparkle-1" style={{ color: "#7b89ef" }} />
          </>
        )}

        {/* Confidence Badge */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
          {/* Confidence level */}
          <Badge
            className="bg-white/80 backdrop-blur-sm text-xs flex items-center gap-1 rounded-full"
            style={{
              color: getConfidenceColor(item.confidence || 0),
              borderColor: getConfidenceColor(item.confidence || 0),
              borderWidth: 1,
            }}
          >
            {item.confidence >= 80 ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {item.confidence || 0}% Confidence
          </Badge>

          {/* Compressed Badge if applicable */}
          {item.compressed && (
            <Badge className="bg-white/80 backdrop-blur-sm text-xs flex items-center gap-1 rounded-full">
              <Check className="h-3 w-3" style={{ color: "#b1cf5f" }} /> Compressed
            </Badge>
          )}
        </div>
      </div>
    )
  }

  // Get a color from the palette based on rank
  const getColor = (rank) => {
    if (rank === 1) return "#ffba08" // selective_yellow
    if (rank === 2) return "#7b89ef" // tropical_indigo
    if (rank === 3) return "#d11149" // cardinal
    if (rank <= 5) return "#f17105" // pumpkin
    if (rank <= 7) return "#b1cf5f" // yellow_green
    if (rank <= 10) return "#90e0f3" // non_photo_blue
    return "#d11149" // cardinal
  }

  // Get color based on confidence level
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "#b1cf5f" // yellow_green - high confidence
    if (confidence >= 60) return "#ffba08" // selective_yellow - medium confidence
    return "#d11149" // cardinal - low confidence
  }

  return (
    <div className="editorial-container py-12">
      <div className="mb-16">
        <h1 className="editorial-heading mb-8 text-center">FINAL RANKINGS</h1>

        <div className="border-t-2 border-b-2 border-black py-4 mb-12 flex justify-between items-center">
          <div className="text-lg font-bold">TOTAL PHOTOS: {rankedImages.length}</div>
          <div className="text-lg font-bold">WINNER: PHOTO #{rankedImages[0]?.rank || 1}</div>
        </div>
      </div>

      {/* Masonry Grid Layout */}
      <div className="mb-16">
        <MasonryGrid
          items={rankedImages}
          gap={12}
          columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
          showAnimation={showAnimation}
          renderItem={customRenderItem}
        />
      </div>

      {/* Download Section */}
      <div className="border-2 border-black p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center font-display">DOWNLOAD RESULTS</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => downloadResults("csv")}
            className="flex-1 flex items-center justify-center py-4 px-6 bg-white text-black font-bold rounded-full border-2 border-black hover:bg-gray-100 transition-all duration-200"
          >
            <FileSpreadsheet className="h-6 w-6 mr-2" />
            DOWNLOAD CSV
          </button>

          <button
            onClick={() => downloadResults("json")}
            className="flex-1 flex items-center justify-center py-4 px-6 bg-yellow_green text-black font-bold rounded-full hover:shadow-lg transition-all duration-200"
          >
            <FileJson className="h-6 w-6 mr-2" />
            DOWNLOAD JSON
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center mb-12">
        <button
          onClick={handleResetComparison}
          className="px-12 py-4 text-xl font-bold text-black bg-yellow_green rounded-full hover:shadow-lg transition-all duration-200 flex items-center"
        >
          START NEW COMPARISON
          <ArrowRight className="ml-2 h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
