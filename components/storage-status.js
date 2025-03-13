"use client"

import { useEffect, useState } from "react"
import { useImageStore } from "@/lib/store"
import { formatBytes } from "@/lib/image-utils"

export default function StorageStatus() {
  const { images } = useImageStore()
  const [storageUsed, setStorageUsed] = useState("Calculating...")
  const [storageLimit, setStorageLimit] = useState("Unknown")
  const [usagePercentage, setUsagePercentage] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Calculate approximate storage usage
    const calculateStorage = () => {
      let totalBytes = 0

      // Estimate size of images (base64 strings)
      images.forEach((img) => {
        if (img.base64) {
          // base64 size is roughly 4/3 of the original binary data
          totalBytes += img.base64.length * 0.75
        }
      })

      setStorageUsed(formatBytes(totalBytes))

      // Estimate percentage of storage used
      let estimatedLimit = 0
      if (window.indexedDB) {
        estimatedLimit = 50 * 1024 * 1024 // 50MB for IndexedDB
      } else {
        estimatedLimit = 5 * 1024 * 1024 // 5MB for localStorage
      }

      setUsagePercentage(Math.min(100, Math.round((totalBytes / estimatedLimit) * 100)))
    }

    // Estimate storage limit based on browser
    const estimateStorageLimit = () => {
      // Check if using IndexedDB
      if (window.indexedDB) {
        // Most browsers with IndexedDB have much higher limits (50MB-unlimited)
        setStorageLimit("~50 MB or more")
      } else {
        // LocalStorage is typically limited to 5-10MB
        setStorageLimit("~5 MB")
      }
    }

    calculateStorage()
    estimateStorageLimit()
  }, [images])

  return (
    <div className="text-xs text-muted-foreground text-center mt-2">
      <div>
        Storage used: {storageUsed} (estimated limit: {storageLimit})
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
        <div
          className={`h-1.5 rounded-full ${
            usagePercentage > 80 ? "bg-red-500" : usagePercentage > 60 ? "bg-amber-500" : "bg-green-500"
          }`}
          style={{ width: `${usagePercentage}%` }}
        ></div>
      </div>
    </div>
  )
}

