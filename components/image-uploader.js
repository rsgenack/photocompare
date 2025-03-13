"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, X, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { useImageStore } from "@/lib/store"
import StorageStatus from "./storage-status"
import { compressImage, formatBytes } from "@/lib/image-utils"

export default function ImageUploader() {
  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { images, addImages, removeImage } = useImageStore()
  const [compressionStats, setCompressionStats] = useState(null)
  const [storageWarning, setStorageWarning] = useState(null)

  // Check storage availability on mount
  useEffect(() => {
    const checkStorage = () => {
      try {
        // Test localStorage
        let localStorageAvailable = false
        try {
          localStorage.setItem("test", "test")
          localStorage.removeItem("test")
          localStorageAvailable = true
        } catch (e) {
          console.warn("localStorage test failed:", e)
        }

        // Test IndexedDB
        let indexedDBAvailable = false
        if (typeof indexedDB !== "undefined") {
          try {
            const request = indexedDB.open("test-db", 1)
            request.onsuccess = () => {
              request.result.close()
              indexedDB.deleteDatabase("test-db")
            }
            indexedDBAvailable = true
          } catch (e) {
            console.warn("IndexedDB test failed:", e)
          }
        }

        // Set warning if needed
        if (!localStorageAvailable && !indexedDBAvailable) {
          setStorageWarning("No persistent storage available. Your images will be lost when you close the browser.")
        } else if (!indexedDBAvailable) {
          setStorageWarning("Limited storage available. You may not be able to store many images.")
        }

        console.log("Storage check:", { localStorage: localStorageAvailable, indexedDB: indexedDBAvailable })
      } catch (error) {
        console.error("Error checking storage:", error)
      }
    }

    checkStorage()
  }, [])

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files))
    }
  }

  const processFiles = async (files) => {
    setIsProcessing(true)
    setCompressionStats(null)

    try {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))

      if (imageFiles.length === 0) {
        toast({
          title: "No valid images",
          description: "Please upload image files (JPG, PNG, etc.)",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Process images in batches to avoid memory issues with large files
      const newImages = []
      let totalOriginalSize = 0
      let totalCompressedSize = 0

      for (const file of imageFiles) {
        try {
          // Create a unique ID for each image
          const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

          // Compress the image with smart settings
          const { file: compressedFile, compressionInfo } = await compressImage(file)

          // Track compression stats
          totalOriginalSize += compressionInfo.originalSize
          totalCompressedSize += compressionInfo.newSize

          // Create object URL for immediate display
          const url = URL.createObjectURL(compressedFile)

          newImages.push({
            id,
            file: compressedFile,
            url, // For immediate display
            name: file.name,
          })
        } catch (err) {
          console.error("Error processing image:", file.name, err)
        }
      }

      // Set compression stats for user feedback
      if (newImages.length > 0) {
        setCompressionStats({
          originalSize: totalOriginalSize,
          compressedSize: totalCompressedSize,
          count: newImages.length,
        })
      }

      if (newImages.length > 0) {
        try {
          await addImages(newImages)
          toast({
            title: "Images added",
            description: `Added ${newImages.length} images for comparison`,
          })

          // Verify images were stored correctly
          setTimeout(() => {
            console.log("Verifying stored images:", images.length)
            const storedIds = images.map((img) => img.id)
            const newIds = newImages.map((img) => img.id)
            const allStored = newIds.every((id) => storedIds.includes(id))

            if (!allStored) {
              console.warn("Not all images were stored correctly", {
                storedIds,
                newIds,
                missing: newIds.filter((id) => !storedIds.includes(id)),
              })

              toast({
                title: "Storage Warning",
                description:
                  "Some images may not have been stored correctly. Consider using a different browser or clearing your browser data.",
                variant: "warning",
                duration: 8000,
              })
            }
          }, 1000)
        } catch (error) {
          console.error("Storage error:", error)
          toast({
            title: "Storage limit reached",
            description:
              "Some images couldn't be stored due to browser storage limitations. Try using fewer or smaller images.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error processing files:", error)
      toast({
        title: "Error adding images",
        description: "There was a problem processing your images",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files))
    }
  }

  // Clear compression stats after a delay
  useEffect(() => {
    if (compressionStats) {
      const timer = setTimeout(() => {
        setCompressionStats(null)
      }, 10000) // Hide after 10 seconds

      return () => clearTimeout(timer)
    }
  }, [compressionStats])

  return (
    <div className="space-y-6">
      {storageWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Storage Warning</p>
            <p className="text-sm">{storageWarning}</p>
          </div>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">Drag and drop your images here</p>
            <p className="text-sm text-muted-foreground">or click to browse files</p>
          </div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Select Images"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
            disabled={isProcessing}
          />
          <StorageStatus />

          {/* Compression info */}
          {compressionStats && (
            <div className="mt-2 p-3 bg-muted rounded-md text-sm flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-medium">Image optimization applied</p>
                <p>Original: {formatBytes(compressionStats.originalSize)}</p>
                <p>Optimized: {formatBytes(compressionStats.compressedSize)}</p>
                <p className="text-green-600 font-medium">
                  Saved: {formatBytes(compressionStats.originalSize - compressionStats.compressedSize)}(
                  {Math.round((1 - compressionStats.compressedSize / compressionStats.originalSize) * 100)}%)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Processing images...</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Uploaded Images ({images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden bg-muted">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.name}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                <p className="text-xs truncate mt-1">{image.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

