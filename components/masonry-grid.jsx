"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Sparkle from "./sparkle"

/**
 * MasonryGrid Component
 *
 * A responsive masonry layout for displaying images in a grid with preserved aspect ratios.
 *
 * @param {Object} props
 * @param {Array} props.items - Array of image objects to display
 * @param {number} props.gap - Gap between grid items in pixels (default: 12)
 * @param {Object} props.columns - Object specifying number of columns at different breakpoints
 * @param {number} props.columns.sm - Columns on small screens (default: 2)
 * @param {number} props.columns.md - Columns on medium screens (default: 3)
 * @param {number} props.columns.lg - Columns on large screens (default: 4)
 * @param {number} props.columns.xl - Columns on extra large screens (default: 5)
 * @param {Function} props.renderItem - Custom render function for each item (optional)
 * @param {boolean} props.showAnimation - Whether to show animations (default: false)
 */
export default function MasonryGrid({
  items = [],
  gap = 12,
  columns = { sm: 2, md: 3, lg: 4, xl: 5 },
  renderItem,
  showAnimation = false,
}) {
  const [currentColumns, setCurrentColumns] = useState(columns.sm)
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Determine number of columns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width >= 1280) {
        setCurrentColumns(columns.xl)
      } else if (width >= 1024) {
        setCurrentColumns(columns.lg)
      } else if (width >= 768) {
        setCurrentColumns(columns.md)
      } else {
        setCurrentColumns(columns.sm)
      }
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [columns])

  // Set loading state
  useEffect(() => {
    if (items.length > 0) {
      setLoading(false)
    }
  }, [items])

  // Default render function for items
  const defaultRenderItem = (item, index) => {
    const isWinner = item.rank === 1
    const color = getColorByRank(item.rank)

    return (
      <div
        key={item.id}
        className="relative group overflow-hidden h-full border-2 border-black flex items-center justify-center bg-gray-100"
      >
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

        {/* Compressed Badge if applicable */}
        {item.compressed && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-white/80 backdrop-blur-sm text-xs flex items-center gap-1 rounded-full">
              <Check className="h-3 w-3" style={{ color: "#b1cf5f" }} /> Compressed
            </Badge>
          </div>
        )}
      </div>
    )
  }

  // Helper function to get color based on rank
  const getColorByRank = (rank) => {
    if (rank === 1) return "#ffba08" // selective_yellow
    if (rank === 2) return "#7b89ef" // tropical_indigo
    if (rank === 3) return "#d11149" // cardinal
    if (rank <= 5) return "#f17105" // pumpkin
    if (rank <= 7) return "#b1cf5f" // yellow_green
    if (rank <= 10) return "#90e0f3" // non_photo_blue
    return "#d11149" // cardinal
  }

  // Create column arrays for masonry layout
  const createMasonryLayout = () => {
    const columns = Array.from({ length: currentColumns }, () => [])

    // Distribute items across columns
    items.forEach((item, index) => {
      const columnIndex = index % currentColumns
      columns[columnIndex].push(item)
    })

    return columns
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center p-4 border-2 border-cardinal bg-cardinal/10 rounded">
        <p className="text-cardinal font-bold">Error loading images: {error}</p>
      </div>
    )
  }

  // Handle empty state
  if (items.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded">
        <p className="text-gray-500">No images to display</p>
      </div>
    )
  }

  const masonryColumns = createMasonryLayout()

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {masonryColumns.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} className="flex flex-col gap-3">
          {column.map((item, itemIndex) => (
            <div
              key={`item-${item.id || itemIndex}`}
              className={`${item.rank === 1 ? "aspect-square" : "aspect-[3/4]"}`}
            >
              {renderItem ? renderItem(item, itemIndex) : defaultRenderItem(item, itemIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
