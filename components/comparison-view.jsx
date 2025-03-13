"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"

export default function ComparisonView({ leftImage, rightImage, zoom, onSelectLeft, onSelectRight }) {
  // Ensure we have valid image objects
  const leftSrc = leftImage?.url || "/placeholder.svg?height=500&width=500"
  const rightSrc = rightImage?.url || "/placeholder.svg?height=500&width=500"

  return (
    <div className="p-6 space-y-6">
      {/* Images side by side */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="rounded-xl overflow-hidden h-[350px] md:h-[500px] select-none relative shadow-md">
            <img
              src={leftSrc || "/placeholder.svg"}
              alt="Left comparison image"
              className="object-contain w-full h-full transform transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
              draggable="false"
            />
            <button
              onClick={onSelectLeft}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 text-lg font-medium flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Select This
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-xl overflow-hidden h-[350px] md:h-[500px] select-none relative shadow-md">
            <img
              src={rightSrc || "/placeholder.svg"}
              alt="Right comparison image"
              className="object-contain w-full h-full transform transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
              draggable="false"
            />
            <button
              onClick={onSelectRight}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 text-lg font-medium flex items-center justify-center"
            >
              Select This
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

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

