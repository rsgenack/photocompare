"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useImageStore, useHydration } from "@/lib/store"
import { checkStorageAvailability } from "@/lib/storage-service"

export default function StorageManager() {
  const { toast } = useToast()
  const { isHydrated, storageError } = useHydration()
  const loadFromStorage = useImageStore((state) => state.loadFromStorage)
  const [storageStatus, setStorageStatus] = useState(null)
  const [recoveryAttempted, setRecoveryAttempted] = useState(false)

  // Check storage availability and initialize on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkStorage = async () => {
      const availability = checkStorageAvailability()
      setStorageStatus(availability)

      if (!availability.localStorage && !availability.sessionStorage) {
        toast({
          title: "Storage Warning",
          description: "Your browser doesn't support storage. Your data won't be saved between sessions.",
          variant: "destructive",
          duration: 8000,
        })
      }
    }

    checkStorage()
  }, [toast])

  // Handle storage errors and recovery
  useEffect(() => {
    if (storageError && !recoveryAttempted) {
      toast({
        title: "Storage Error",
        description: "There was a problem loading your data. Attempting to recover...",
        variant: "destructive",
        duration: 5000,
      })

      // Try to manually load data as a recovery mechanism
      const recoverData = async () => {
        setRecoveryAttempted(true)
        const success = await loadFromStorage()

        if (success) {
          toast({
            title: "Recovery Successful",
            description: "Your data has been recovered successfully.",
            duration: 5000,
          })
        } else {
          toast({
            title: "Recovery Failed",
            description: "We couldn't recover your data. You may need to start fresh.",
            variant: "destructive",
            duration: 8000,
          })
        }
      }

      recoverData()
    }
  }, [storageError, recoveryAttempted, toast, loadFromStorage])

  return null
}

