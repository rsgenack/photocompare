"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function JuxtaposeComparison({ leftImage, rightImage, onSelectLeft, onSelectRight }) {
  const containerRef = useRef(null)
  const [sliderPosition, setSliderPosition] = useState(50)
  const isDragging = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const newPosition = (x / rect.width) * 100
      setSliderPosition(newPosition)
    }

    const handleTouchMove = (e) => {
      if (!isDragging.current || !containerRef.current || !e.touches[0]) return

      // Prevent default to stop scrolling while dragging
      e.preventDefault()

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width))
      const newPosition = (x / rect.width) * 100
      setSliderPosition(newPosition)
    }

    const handleEnd = () => {
      isDragging.current = false
      document.body.style.cursor = "default"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("mouseup", handleEnd)
    document.addEventListener("touchend", handleEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchend", handleEnd)
    }
  }, [])

  const handleMouseDown = (e) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = "ew-resize"
  }

  const handleTouchStart = (e) => {
    isDragging.current = true
    // Don't call preventDefault here as it can interfere with the initial touch
  }

  useEffect(() => {
    // Add a class to the body to prevent text selection during dragging
    const preventSelection = (e) => {
      if (isDragging.current) {
        e.preventDefault()
      }
    }

    document.addEventListener("selectstart", preventSelection)

    return () => {
      document.removeEventListener("selectstart", preventSelection)
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div
        className="relative rounded-xl shadow-md h-[350px] md:h-[500px] overflow-hidden select-none"
        ref={containerRef}
        onMouseDown={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Left image container */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={leftImage?.url || "/placeholder.svg"}
            alt="Left comparison image"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        {/* Right image container with clip path */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          <img
            src={rightImage?.url || "/placeholder.svg"}
            alt="Right comparison image"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-indigo-600 cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-indigo-500">
            <div className="flex">
              <ArrowLeft className="h-4 w-4 text-indigo-600" />
              <ArrowRight className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Selection buttons */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          <button
            onClick={onSelectLeft}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 text-lg font-medium flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Select Left
          </button>
          <button
            onClick={onSelectRight}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 text-lg font-medium flex items-center justify-center"
          >
            Select Right
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* Instruction label */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 text-sm font-medium rounded-full shadow-md">
          Drag slider to compare
        </div>
      </div>

      {/* Add keyboard shortcuts section */}
      <div className="bg-gray-50 rounded-xl p-4 text-center shadow-sm">
        <p className="text-lg font-medium text-gray-700 mb-2">Keyboard Shortcuts</p>
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center">
            <div className="bg-white px-3 py-1 font-mono rounded border border-gray-200 shadow-sm">
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </div>
            <span className="ml-2 text-gray-600">Left Image</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600">Right Image</span>
            <div className="ml-2 bg-white px-3 py-1 font-mono rounded border border-gray-200 shadow-sm">
              <ArrowRight className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

