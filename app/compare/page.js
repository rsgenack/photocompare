"use client"

import { useEffect, useState } from "react"
import { useImageStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ComparisonView from "@/components/comparison-view"
import { ArrowLeft, ListOrdered, RefreshCw, Bug } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import HydrationGuard from "@/components/hydration-guard"

// Add debug logging at the top level
console.log("Compare page module loading...")

function ComparePageContent() {
  console.log("Rendering ComparePageContent component")
  const router = useRouter()
  const { toast } = useToast()
  const { images, getNextPair, recordComparison, excludeImage, clearAll } = useImageStore()
  const [isJuxtapose, setIsJuxtapose] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pair, setPair] = useState(null)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState(null)

  // Log images for debugging
  useEffect(() => {
    console.log(
      "Images in store:",
      images.length,
      images.map((img) => img.id),
    )
  }, [images])

  useEffect(() => {
    console.log("ComparePageContent useEffect running, images:", images.length)
    // Check if we have enough images
    if (images.length < 2) {
      console.log("Not enough images, redirecting to home")
      router.push("/")
      return
    }

    const loadPair = () => {
      try {
        console.log("Getting next pair")
        // Get next pair
        const nextPair = getNextPair()
        console.log("Next pair:", nextPair)

        if (!nextPair) {
          console.log("No more pairs, redirecting to results")
          router.push("/results")
          return
        }

        // Verify that both images exist
        const [firstId, secondId] = nextPair
        const firstImage = images.find((img) => img.id === firstId)
        const secondImage = images.find((img) => img.id === secondId)
        console.log("Found images:", !!firstImage, !!secondImage)

        // Collect debug info
        const imageInfo = {
          totalImages: images.length,
          imageIds: images.map((img) => img.id),
          firstImageFound: !!firstImage,
          secondImageFound: !!secondImage,
          firstImageId: firstId,
          secondImageId: secondId,
          storageType: typeof localStorage !== "undefined" ? "localStorage available" : "localStorage unavailable",
          indexedDBAvailable: typeof indexedDB !== "undefined",
        }
        setDebugInfo(imageInfo)

        if (!firstImage || !secondImage) {
          if (retryCount < 5) {
            // Increased retry count
            // Try again after a short delay
            console.log("Images not found, retrying", retryCount + 1)
            setRetryCount((prev) => prev + 1)
            setTimeout(loadPair, 500)
            return
          }

          console.error("Could not find images after retries", imageInfo)
          setError(
            "Could not find the required images for comparison. This may be due to storage limitations in your current environment.",
          )
          setLoading(false)
          return
        }

        console.log("Setting pair and loading=false")
        setPair(nextPair)
        setLoading(false)
      } catch (err) {
        console.error("Error getting next pair:", err)
        setError("An error occurred while preparing the comparison")
        setLoading(false)
      }
    }

    // Add a small delay to ensure store is ready
    console.log("Setting timeout to load pair")
    setTimeout(loadPair, 500) // Increased delay
  }, [images, getNextPair, router, retryCount])

  const handleSelect = (selectedId) => {
    if (!pair) return

    const [firstId, secondId] = pair
    const winnerId = selectedId
    const loserId = selectedId === firstId ? secondId : firstId

    recordComparison(winnerId, loserId)

    // Get next pair
    setLoading(true)
    setTimeout(() => {
      const nextPair = getNextPair()
      setPair(nextPair)
      setLoading(false)

      // If no more pairs, go to results
      if (!nextPair) {
        router.push("/results")
      }
    }, 100)
  }

  const handleExclude = (id) => {
    excludeImage(id)

    // Get next pair
    setLoading(true)
    setTimeout(() => {
      const nextPair = getNextPair()
      setPair(nextPair)
      setLoading(false)

      // If no more pairs, go to results
      if (!nextPair) {
        router.push("/results")
      }
    }, 100)
  }

  const handleReset = () => {
    clearAll()
    toast({
      title: "Storage cleared",
      description: "All images and comparisons have been reset",
    })
    router.push("/")
  }

  // Function to show debug info
  const toggleDebugInfo = () => {
    if (debugInfo) {
      toast({
        title: "Debug Info",
        description: (
          <pre className="text-xs mt-2 max-h-[200px] overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        ),
        duration: 10000,
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading comparison...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <div className="flex flex-col gap-4 items-center">
            <Link href="/">
              <Button size="lg" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All Data
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleDebugInfo} className="mt-2">
              <Bug className="mr-2 h-4 w-4" />
              Show Debug Info
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              If you're in a test environment, try deploying the app for full functionality.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!pair) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">All Comparisons Complete!</h1>
          <p className="mb-6">You've completed all possible comparisons.</p>
          <Link href="/results">
            <Button size="lg" className="mb-4">
              <ListOrdered className="mr-2 h-4 w-4" />
              View Results
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const [firstId, secondId] = pair
  const firstImage = images.find((img) => img.id === firstId)
  const secondImage = images.find((img) => img.id === secondId)

  if (!firstImage || !secondImage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Image Error</h1>
          <p className="mb-6">We couldn't find the images for comparison. Please try uploading your images again.</p>
          <div className="flex flex-col gap-4 items-center">
            <Link href="/">
              <Button size="lg" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All Data
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleDebugInfo} className="mt-2">
              <Bug className="mr-2 h-4 w-4" />
              Show Debug Info
            </Button>
          </div>
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
              Back
            </Button>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">View mode:</span>
            <Button variant={isJuxtapose ? "outline" : "default"} size="sm" onClick={() => setIsJuxtapose(false)}>
              Side by Side
            </Button>
            <Button variant={isJuxtapose ? "default" : "outline"} size="sm" onClick={() => setIsJuxtapose(true)}>
              Slider
            </Button>
          </div>

          <Link href="/results">
            <Button variant="outline">
              <ListOrdered className="mr-2 h-4 w-4" />
              Results
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">Which image do you prefer?</h1>

        <ComparisonView
          firstImage={firstImage}
          secondImage={secondImage}
          isJuxtapose={isJuxtapose}
          onSelect={handleSelect}
          onExclude={handleExclude}
        />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Click on an image to select it, or click the X to exclude it from rankings
        </div>
      </div>
    </div>
  )
}

// Wrap the page content with the hydration guard
export default function ComparePage() {
  return (
    <HydrationGuard>
      <ComparePageContent />
    </HydrationGuard>
  )
}

