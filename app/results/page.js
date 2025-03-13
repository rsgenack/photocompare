"use client"

import { useEffect, useState } from "react"
import { useImageStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react"
import Link from "next/link"
import HydrationGuard from "@/components/hydration-guard"

function ResultsPageContent() {
  console.log("Rendering ResultsPageContent")
  const router = useRouter()
  const { images, getRankings, resetComparisons, comparisons } = useImageStore()
  const [rankedImages, setRankedImages] = useState([])

  useEffect(() => {
    console.log("ResultsPage useEffect, images:", images.length)
    if (images.length === 0) {
      console.log("No images, redirecting to home")
      router.push("/")
      return
    }

    try {
      console.log("Getting rankings")
      const rankings = getRankings()
      console.log("Rankings:", rankings)

      const ranked = rankings.map((ranking, index) => {
        const image = images.find((img) => img.id === ranking.id)
        if (!image) {
          console.error(`Image with id ${ranking.id} not found`)
          throw new Error(`Image with id ${ranking.id} not found`)
        }

        return {
          ...image,
          score: ranking.score,
          rank: index + 1,
          wins: ranking.wins,
          comparisons: ranking.comparisons,
        }
      })

      console.log("Setting ranked images:", ranked.length)
      setRankedImages(ranked)
    } catch (err) {
      console.error("Error processing rankings:", err)
    }
  }, [images, getRankings, router, comparisons.length])

  const handleRestart = () => {
    resetComparisons()
    router.push("/compare")
  }

  if (rankedImages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <Button onClick={handleRestart}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Restart Comparisons
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Your Ranked Results</h1>
        <p className="text-center text-muted-foreground mb-8">Based on {comparisons.length} pairwise comparisons</p>

        {rankedImages.length > 0 && (
          <div className="space-y-8">
            {/* Winner highlight */}
            <div className="bg-card rounded-lg p-6 border shadow-md">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="w-full md:w-48 h-48 relative rounded-lg overflow-hidden">
                    <Image
                      src={rankedImages[0].url || "/placeholder.svg"}
                      alt={rankedImages[0].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">Top Ranked Image</h2>
                  <p className="text-lg text-muted-foreground mb-2">{rankedImages[0].name}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Score:</span> {rankedImages[0].score.toFixed(0)}
                    </div>
                    <div>
                      <span className="font-medium">Win rate:</span>{" "}
                      {rankedImages[0].comparisons
                        ? `${Math.round((rankedImages[0].wins / rankedImages[0].comparisons) * 100)}%`
                        : "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Wins:</span> {rankedImages[0].wins}
                    </div>
                    <div>
                      <span className="font-medium">Comparisons:</span> {rankedImages[0].comparisons}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full rankings */}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Complete Rankings</h2>
              </div>
              <div className="divide-y">
                {rankedImages.map((image) => (
                  <div key={image.id} className="p-4 flex items-center gap-4">
                    <div className="font-bold text-lg w-8 text-center">{image.rank}</div>
                    <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                      <Image src={image.url || "/placeholder.svg"} alt={image.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{image.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {image.score.toFixed(0)} | Wins: {image.wins}/{image.comparisons}(
                        {image.comparisons ? `${Math.round((image.wins / image.comparisons) * 100)}%` : "0%"})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Wrap the page content with the hydration guard
export default function ResultsPage() {
  return (
    <HydrationGuard>
      <ResultsPageContent />
    </HydrationGuard>
  )
}

