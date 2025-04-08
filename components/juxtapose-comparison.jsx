"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Maximize, Minimize, X } from "lucide-react"
import { logger } from '../utils/logger'

export default function JuxtaposeComparison({
  leftImage,
  rightImage,
  onSelectLeft,
  onSelectRight,
  onRemoveImage,
  aspectRatio,
}) {
  const containerRef = useRef(null)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [fitMode, setFitMode] = useState("contain")
  const isDragging = useRef(false)
  const [isInteractive, setIsInteractive] = useState(true)

  // Toggle fit mode
  const toggleFitMode = () => {
    setFitMode((prev) => (prev === "contain" ? "cover" : "contain"))
  }

  // Handle mouse/touch events
  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging.current || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
      const position = Math.max(0, Math.min(x - rect.left, rect.width))
      const percentage = (position / rect.width) * 100
      
      logger.debug('Slider position updated', { position, percentage })
      setSliderPosition(percentage)
    }

    const handleEnd = () => {
      isDragging.current = false
      document.body.style.cursor = "default"
      setIsInteractive(true)
    }

    const handleStart = (e) => {
      e.preventDefault()
      isDragging.current = true
      document.body.style.cursor = "ew-resize"
      setIsInteractive(false)
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('mouseleave', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)
      document.removeEventListener('mouseleave', handleEnd)
    }
  }, [])

  // Handle image selection
  const handleLeftSelect = (e) => {
    e.preventDefault()
    e.stopPropagation()
    logger.info('Left side selected', { imageId: leftImage?.id })
    onSelectLeft()
  }

  const handleRightSelect = (e) => {
    e.preventDefault()
    e.stopPropagation()
    logger.info('Right side selected', { imageId: rightImage?.id })
    onSelectRight()
  }

  // Handle image removal
  const handleRemoveLeft = (e) => {
    e.stopPropagation()
    logger.info('Left image removal requested', { imageId: leftImage?.id })
    if (onRemoveImage && leftImage?.id) {
      onRemoveImage(leftImage.id)
    }
  }

  const handleRemoveRight = (e) => {
    e.stopPropagation()
    logger.info('Right image removal requested', { imageId: rightImage?.id })
    if (onRemoveImage && rightImage?.id) {
      onRemoveImage(rightImage.id)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Fit mode toggle */}
      <div className="flex justify-end mb-2">
        {!aspectRatio && (
          <button
            onClick={toggleFitMode}
            className="flex items-center gap-2 text-sm font-bold text-black bg-yellow_green px-3 py-1.5 rounded-full border-2 border-black transition-colors"
          >
            {fitMode === "contain" ? (
              <>
                <Maximize className="h-4 w-4" />
                <span>FILL CONTAINER</span>
              </>
            ) : (
              <>
                <Minimize className="h-4 w-4" />
                <span>SHOW FULL IMAGE</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 py-3 text-center font-bold bg-cardinal text-white border-2 border-black">
          CLICK LEFT SIDE OR PRESS <ArrowLeft className="h-5 w-5 mx-1 inline" /> TO SELECT
        </div>
        <div className="flex-1 py-3 text-center font-bold bg-selective_yellow text-black border-2 border-black">
          CLICK RIGHT SIDE OR PRESS <ArrowRight className="h-5 w-5 mx-1 inline" /> TO SELECT
        </div>
      </div>

      {/* Slider container */}
      <div className="w-full">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden select-none border-2 border-black"
          style={{
            ...(aspectRatio ? { aspectRatio: aspectRatio } : { height: "300px", minHeight: "300px" }),
            backgroundColor: "white",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Left image */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              clipPath: `inset(0 ${sliderPosition}% 0 0)`,
              backgroundColor: "white",
            }}
          >
            <button
              className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer z-10"
              onClick={handleLeftSelect}
              aria-label="Select left image"
            >
              <img
                src={leftImage?.url || "/placeholder.svg"}
                alt="Left comparison image"
                className={`w-full h-full ${
                  aspectRatio ? "object-contain" : fitMode === "contain" ? "object-contain" : "object-cover"
                }`}
              />
            </button>

            {/* Remove button */}
            {onRemoveImage && leftImage && (
              <button
                onClick={handleRemoveLeft}
                className="absolute top-3 left-3 bg-cardinal text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-30"
                title="Remove left image from comparisons"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Right image */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              clipPath: `inset(0 0 0 ${sliderPosition}%)`,
              backgroundColor: "white",
            }}
          >
            <button
              className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer z-10"
              onClick={handleRightSelect}
              aria-label="Select right image"
            >
              <img
                src={rightImage?.url || "/placeholder.svg"}
                alt="Right comparison image"
                className={`w-full h-full ${
                  aspectRatio ? "object-contain" : fitMode === "contain" ? "object-contain" : "object-cover"
                }`}
              />
            </button>

            {/* Remove button */}
            {onRemoveImage && rightImage && (
              <button
                onClick={handleRemoveRight}
                className="absolute top-3 right-3 bg-cardinal text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-30"
                title="Remove right image from comparisons"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-emerald-500 cursor-ew-resize z-40"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={(e) => {
              e.preventDefault()
              isDragging.current = true
              document.body.style.cursor = "ew-resize"
              setIsInteractive(false)
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              isDragging.current = true
              setIsInteractive(false)
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-emerald-500">
              <div className="flex">
                <ArrowLeft className="h-4 w-4 text-emerald-600" />
                <ArrowRight className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Instruction label */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 text-sm font-medium rounded-full shadow-md z-20">
            Drag slider to compare
          </div>
        </div>
      </div>
    </div>
  )
}
