"use client"

export default function IntroPage({ onGetStarted }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="modern-card p-8 mb-12">
        <h1 className="text-5xl mb-8 text-center font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          PhotoCompare
        </h1>

        <div className="border-t border-b border-gray-200 py-6 my-8">
          <p className="text-xl font-medium text-center text-gray-700">Compare and rank your photos</p>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-12">
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl mb-4 font-semibold text-gray-800">How it works:</h2>
            <ol className="list-decimal list-inside space-y-4 text-lg text-gray-700">
              <li>Choose comparison type</li>
              <li>Upload your photos</li>
              <li>Compare pairs of photos</li>
              <li>Get ranked results</li>
              <li>Download as CSV or JSON</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={onGetStarted} className="modern-button text-xl px-12 py-4">
            Start Now
          </button>
        </div>
      </div>
    </div>
  )
}

