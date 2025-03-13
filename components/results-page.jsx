"use client"

import { Trophy, FileJson, FileSpreadsheet } from "lucide-react"

export default function ResultsPage({ uploadedImages, resetComparison, downloadResults }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="modern-card p-8 mb-12">
        <h1 className="text-3xl mb-8 text-center font-bold text-gray-800">Final Rankings</h1>

        <div className="space-y-6 mb-12">
          {uploadedImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-xl p-4 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="font-bold text-3xl w-16 text-center">
                {image.rank === 1 ? (
                  <div className="text-yellow-500">
                    <Trophy className="h-10 w-10 mx-auto" />
                  </div>
                ) : (
                  <span className="text-gray-700">#{image.rank}</span>
                )}
              </div>
              <div className="w-full md:w-1/2 h-[250px] rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt="Ranked image"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0 text-center md:text-left">
                <p className="text-xl font-semibold text-gray-800">Rank #{image.rank}</p>
                <p className="mt-2 text-indigo-600 font-medium">
                  Won {image.score} comparison{(image.score || 0) !== 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-gray-600 truncate">{image.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-2xl mb-4 font-semibold text-gray-800 text-center">Download Results</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => downloadResults("csv")}
              className="modern-button-secondary flex-1 flex items-center justify-center py-4"
            >
              <FileSpreadsheet className="h-6 w-6 mr-2 text-indigo-600" />
              Download CSV
            </button>

            <button
              onClick={() => downloadResults("json")}
              className="modern-button flex-1 flex items-center justify-center py-4"
            >
              <FileJson className="h-6 w-6 mr-2" />
              Download JSON
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={resetComparison} className="modern-button text-xl px-12 py-4">
            Start New Comparison
          </button>
        </div>
      </div>
    </div>
  )
}

