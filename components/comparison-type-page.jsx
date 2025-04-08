"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { scrollToTop } from "@/utils/scroll-utils"
import { ArrowRight } from "lucide-react"

export default function ComparisonTypePage({ comparisonType, setComparisonType, onNext }) {
  const handleNext = () => {
    if (!comparisonType) {
      alert("Please select a comparison type to continue")
      return
    }
    scrollToTop()
    onNext()
  }

  return (
    <div className="editorial-container py-12 animate-fadeIn">
      <div className="mb-12">
        <h1 className="editorial-heading mb-8 text-center">CHOOSE COMPARISON TYPE</h1>

        <div className="border-t-2 border-b-2 border-black py-4 mb-12">
          <h2 className="editorial-subheading text-center">WHAT ARE YOU COMPARING?</h2>
        </div>
      </div>

      <div className="border-2 border-black p-8 mb-12">
        <RadioGroup
          value={comparisonType}
          onValueChange={setComparisonType}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 border-black ${
              comparisonType === "versions" ? "bg-tropical_indigo text-white shadow-lg" : "bg-white hover:shadow-md"
            }`}
            onClick={() => setComparisonType("versions")}
          >
            <div className="p-6">
              <div className="flex items-start mb-4">
                <RadioGroupItem value="versions" id="versions" className="mt-1" />
                <Label
                  htmlFor="versions"
                  className={`ml-2 text-xl font-bold font-display ${comparisonType === "versions" ? "text-white" : ""}`}
                >
                  DIFFERENT VERSIONS OF THE SAME PHOTO
                </Label>
              </div>
              <p className={`ml-6 font-sans ${comparisonType === "versions" ? "text-white" : "text-gray-800"}`}>
                Compare different edits, crops, or treatments of the same base image.
              </p>
            </div>
          </div>

          <div
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 border-black ${
              comparisonType === "different" ? "bg-cardinal text-white shadow-lg" : "bg-white hover:shadow-md"
            }`}
            onClick={() => setComparisonType("different")}
          >
            <div className="p-6">
              <div className="flex items-start mb-4">
                <RadioGroupItem value="different" id="different" className="mt-1" />
                <Label
                  htmlFor="different"
                  className={`ml-2 text-xl font-bold font-display ${comparisonType === "different" ? "text-white" : ""}`}
                >
                  DIFFERENT PHOTOS
                </Label>
              </div>
              <p className={`ml-6 font-sans ${comparisonType === "different" ? "text-white" : "text-gray-800"}`}>
                Compare completely different photos to find your favorites.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleNext}
          className={`px-12 py-4 text-xl font-bold text-black rounded-full flex items-center bg-yellow_green shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${!comparisonType ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          NEXT: UPLOAD PHOTOS
          <ArrowRight className="ml-2 h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
