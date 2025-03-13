"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useImageStore } from "@/lib/store"

export default function StorageInitializer() {
  const { toast } = useToast()
  const setHydrated = useImageStore((state) => state.setHydrated)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if IndexedDB is available
    if (!window.indexedDB) {
      toast({
        title: "Storage Warning",
        description: "Your browser doesn't support enhanced storage. Image storage may be limited.",
        variant: "destructive",
        duration: 5000,
      })
    }

    // Test IndexedDB access
    try {
      const testDb = window.indexedDB.open("test-db", 1)

      testDb.onerror = () => {
        toast({
          title: "Storage Warning",
          description: "Enhanced storage access is blocked. Image storage may be limited.",
          variant: "destructive",
          duration: 5000,
        })
      }

      testDb.onsuccess = () => {
        testDb.result.close()
        window.indexedDB.deleteDatabase("test-db")

        // Mark store as hydrated after successful storage test
        setTimeout(() => {
          setHydrated(true)
          console.log("Storage initialized and hydrated")
        }, 500)
      }
    } catch (e) {
      toast({
        title: "Storage Warning",
        description: "Error accessing storage. Image storage may be limited.",
        variant: "destructive",
        duration: 5000,
      })

      // Still mark as hydrated even if there's an error
      setTimeout(() => {
        setHydrated(true)
        console.log("Storage marked as hydrated despite errors")
      }, 500)
    }
  }, [toast, setHydrated])

  return null
}

