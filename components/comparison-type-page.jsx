"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function ComparisonTypePage({ comparisonType, setComparisonType, onNext }) {
  const handleNext = () => {
    if (!comparisonType) {
      alert("Please select a comparison type to continue")
      return
    }
    onNext()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="modern-card p-8 mb-12">
        <h1 className="text-3xl mb-8 text-center font-bold text-gray-800">Step 1: Choose Comparison Type</h1>

        <div className="bg-gray-50 rounded-xl p-8 mb-12 shadow-sm">
          <h2 className="text-2xl mb-6 text-center font-semibold text-gray-700">What are you comparing?</h2>

          <RadioGroup
            value={comparisonType}
            onValueChange={setComparisonType}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div
              className={`rounded-xl p-6 cursor-pointer transition-all shadow-sm ${
                comparisonType === "versions"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "bg-white hover:shadow-md border border-gray-200"
              }`}
              onClick={() => setComparisonType("versions")}
            >
              <div className="flex items-start mb-4">
                <RadioGroupItem value="versions" id="versions" className="mt-1" />
                <Label
                  htmlFor="versions"
                  className={`ml-2 text-xl font-semibold ${comparisonType === "versions" ? "text-white" : "text-gray-800"}`}
                >
                  Different Versions of the Same Photo
                </Label>
              </div>
              <p className={`ml-6 ${comparisonType === "versions" ? "text-white" : "text-gray-600"}`}>
                Compare different edits, crops, or treatments of the same base image.
              </p>
            </div>

            <div
              className={`rounded-xl p-6 cursor-pointer transition-all shadow-sm ${
                comparisonType === "different"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "bg-white hover:shadow-md border border-gray-200"
              }`}
              onClick={() => setComparisonType("different")}
            >
              <div className="flex items-start mb-4">
                <RadioGroupItem value="different" id="different" className="mt-1" />
                <Label
                  htmlFor="different"
                  className={`ml-2 text-xl font-semibold ${comparisonType === "different" ? "text-white" : "text-gray-800"}`}
                >
                  Different Photos
                </Label>
              </div>
              <p className={`ml-6 ${comparisonType === "different" ? "text-white" : "text-gray-600"}`}>
                Compare completely different photos to find your favorites.
              </p>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleNext}
            className={`modern-button text-xl px-12 py-4 ${!comparisonType ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Next: Upload Photos
          </button>
        </div>
      </div>
    </div>
  )
}

