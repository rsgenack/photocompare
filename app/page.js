"use client"

import { Suspense, useState } from "react"
import ImageUploader from "@/components/image-uploader"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useImageStore } from "@/lib/store"
import { RefreshCw, FileText, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  console.log("Rendering Home page")
  const { images, clearAll } = useImageStore()
  const { toast } = useToast()
  const hasImages = images.length >= 2
  const [testingStorage, setTestingStorage] = useState(false)

  console.log(`Home page has ${images.length} images`)

  const handleReset = () => {
    clearAll()
    toast({
      title: "Storage cleared",
      description: "All images and comparisons have been reset",
    })
  }

  const testStorage = async () => {
    setTestingStorage(true)

    try {
      // Test localStorage
      let localStorageAvailable = false
      try {
        localStorage.setItem("test-storage", "test")
        const testValue = localStorage.getItem("test-storage")
        if (testValue === "test") {
          localStorageAvailable = true
        }
        localStorage.removeItem("test-storage")
      } catch (e) {
        console.error("localStorage test failed:", e)
      }

      // Test IndexedDB
      let indexedDBAvailable = false
      if (typeof indexedDB !== "undefined") {
        try {
          const request = indexedDB.open("test-storage-db", 1)
          await new Promise((resolve, reject) => {
            request.onerror = reject
            request.onsuccess = () => {
              request.result.close()
              indexedDB.deleteDatabase("test-storage-db")
              resolve()
            }
          })
          indexedDBAvailable = true
        } catch (e) {
          console.error("IndexedDB test failed:", e)
        }
      }

      // Test Zustand store
      let zustandStoreWorking = false
      try {
        const testId = `test-${Date.now()}`
        const testImage = {
          id: testId,
          name: "Test Image",
          url: "/placeholder.svg",
        }

        await useImageStore.getState().addImages([testImage])
        const storeState = useImageStore.getState()
        zustandStoreWorking = storeState.images.some((img) => img.id === testId)

        // Clean up test image
        if (zustandStoreWorking) {
          useImageStore.getState().removeImage(testId)
        }
      } catch (e) {
        console.error("Zustand store test failed:", e)
      }

      // Show results
      toast({
        title: "Storage Test Results",
        description: (
          <div className="space-y-1 mt-2">
            <p>
              <span className={localStorageAvailable ? "text-green-500" : "text-red-500"}>
                ● localStorage: {localStorageAvailable ? "Available" : "Unavailable"}
              </span>
            </p>
            <p>
              <span className={indexedDBAvailable ? "text-green-500" : "text-red-500"}>
                ● IndexedDB: {indexedDBAvailable ? "Available" : "Unavailable"}
              </span>
            </p>
            <p>
              <span className={zustandStoreWorking ? "text-green-500" : "text-red-500"}>
                ● Zustand Store: {zustandStoreWorking ? "Working" : "Not Working"}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {!localStorageAvailable && !indexedDBAvailable
                ? "No persistent storage available. App functionality will be limited."
                : "Storage is available. The app should work correctly."}
            </p>
          </div>
        ),
        duration: 8000,
      })
    } catch (error) {
      console.error("Storage test error:", error)
      toast({
        title: "Storage Test Failed",
        description: "An error occurred while testing storage capabilities.",
        variant: "destructive",
      })
    } finally {
      setTestingStorage(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">Photo Comparison Ranking</h1>
        <p className="text-center mb-8 text-muted-foreground">
          Upload your photos, compare them pairwise, and discover your ranked preferences
        </p>

        <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Upload multiple photos you want to rank</li>
            <li>Compare photos two at a time - choose which one you prefer</li>
            <li>Use the slider view or side-by-side comparison</li>
            <li>Click the X to exclude photos you don't want to rank</li>
            <li>See your final ranked results based on your comparisons</li>
          </ol>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading uploader...</div>}>
          <ImageUploader />
        </Suspense>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          {hasImages ? (
            <>
              <Link href="/compare">
                <Button size="lg" className="px-8 w-full" onClick={() => console.log("Start Comparing clicked")}>
                  Start Comparing
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 w-full" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset All
              </Button>
            </>
          ) : (
            <Button size="lg" className="px-8" disabled>
              Upload at least 2 images to start
            </Button>
          )}
        </div>

        {/* Add a link to the logs page and storage test button */}
        <div className="mt-8 text-center flex flex-col gap-2 items-center">
          <Button variant="ghost" size="sm" onClick={testStorage} disabled={testingStorage}>
            <Database className="mr-2 h-4 w-4" />
            {testingStorage ? "Testing Storage..." : "Test Browser Storage"}
          </Button>

          <Link href="/logs">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <FileText className="mr-2 h-4 w-4" />
              View Deployment Logs
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

