"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import JuxtaposeComponent from "./juxtapose-component.js"

export default function ComparisonView({ firstImage, secondImage, isJuxtapose, onSelect, onExclude }) {
  console.log("Rendering ComparisonView", {
    firstImageId: firstImage?.id,
    secondImageId: secondImage?.id,
    isJuxtapose,
  })

  // Add safety check for missing images
  if (!firstImage || !secondImage) {
    console.error("ComparisonView: Missing images", { firstImage, secondImage })
    return (
      <div className="p-8 text-center bg-muted rounded-lg">
        <p className="text-lg font-medium">Images not available for comparison</p>
        <p className="text-sm text-muted-foreground mt-2">Please return to the home page and upload images again</p>
      </div>
    )
  }

  if (isJuxtapose) {
    console.log("Rendering juxtapose view")
    return (
      <div className="relative">
        <JuxtaposeComponent firstImage={firstImage} secondImage={secondImage} />

        <div className="absolute top-2 left-0 right-0 flex justify-center space-x-4">
          <Button onClick={() => onSelect(firstImage.id)} variant="default" className="bg-primary/80 hover:bg-primary">
            Select Left
          </Button>
          <Button onClick={() => onSelect(secondImage.id)} variant="default" className="bg-primary/80 hover:bg-primary">
            Select Right
          </Button>
        </div>

        <div className="absolute top-2 left-2">
          <Button
            onClick={() => onExclude(firstImage.id)}
            variant="destructive"
            size="icon"
            className="rounded-full w-8 h-8 bg-destructive/80 hover:bg-destructive"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Exclude left image</span>
          </Button>
        </div>

        <div className="absolute top-2 right-2">
          <Button
            onClick={() => onExclude(secondImage.id)}
            variant="destructive"
            size="icon"
            className="rounded-full w-8 h-8 bg-destructive/80 hover:bg-destructive"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Exclude right image</span>
          </Button>
        </div>
      </div>
    )
  }

  console.log("Rendering side-by-side view")
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        className="relative group cursor-pointer border-2 border-transparent hover:border-primary rounded-lg overflow-hidden"
        onClick={() => onSelect(firstImage.id)}
      >
        <div className="aspect-square md:aspect-auto md:h-[400px] relative">
          <Image src={firstImage.url || "/placeholder.svg"} alt={firstImage.name} fill className="object-contain" />
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onExclude(firstImage.id)
          }}
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Exclude this image</span>
        </Button>
      </div>

      <div
        className="relative group cursor-pointer border-2 border-transparent hover:border-primary rounded-lg overflow-hidden"
        onClick={() => onSelect(secondImage.id)}
      >
        <div className="aspect-square md:aspect-auto md:h-[400px] relative">
          <Image src={secondImage.url || "/placeholder.svg"} alt={secondImage.name} fill className="object-contain" />
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onExclude(secondImage.id)
          }}
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Exclude this image</span>
        </Button>
      </div>
    </div>
  )
}

