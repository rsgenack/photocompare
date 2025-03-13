"use client"

import { useEffect, useState } from "react"
import { useHydration } from "@/lib/store"

export default function HydrationGuard({ children, fallback }) {
  const { isHydrated, storageError } = useHydration()
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    // Set a maximum timeout to prevent infinite waiting
    const timeout = setTimeout(() => {
      console.warn("Hydration timeout reached, proceeding anyway")
      setTimeoutReached(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [])

  // Proceed if either the store is hydrated or we've reached the timeout
  if (!isHydrated && !timeoutReached) {
    return (
      fallback || (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading data...</p>
          </div>
        </div>
      )
    )
  }

  return children
}

