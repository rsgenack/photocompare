import { get, set, del, createStore } from "idb-keyval"

// Create a hybrid storage adapter that primarily uses localStorage but falls back to memory if needed
export const createHybridStorage = () => {
  // Use memory storage as last resort
  const memoryStorage = new Map()

  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  // If we're on the server during build/SSR, return a simple in-memory adapter
  if (!isBrowser) {
    console.log("Server environment detected, using dummy storage adapter")
    return {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    }
  }

  console.log("Browser environment detected, initializing storage adapter")

  // Test localStorage availability
  let localStorageAvailable = false
  try {
    localStorage.setItem("test", "test")
    localStorage.removeItem("test")
    localStorageAvailable = true
    console.log("localStorage is available")
  } catch (e) {
    console.warn("localStorage is not available:", e)
  }

  // Test IndexedDB availability
  let indexedDBAvailable = false
  let imageStore = null

  if (typeof indexedDB !== "undefined") {
    try {
      imageStore = createStore("photo-compare-db", "image-store")
      indexedDBAvailable = true
      console.log("IndexedDB is available")
    } catch (e) {
      console.warn("Failed to create IndexedDB store:", e)
    }
  } else {
    console.warn("IndexedDB is not available in this environment")
  }

  // Log storage availability
  console.log("Storage availability:", {
    localStorage: localStorageAvailable,
    indexedDB: indexedDBAvailable,
    memoryFallback: true,
  })

  return {
    getItem: async (name) => {
      try {
        console.log(`Getting item: ${name}`)

        // First try localStorage (simpler and more reliable)
        if (localStorageAvailable) {
          try {
            const item = localStorage.getItem(name)
            if (item !== null) {
              console.log(`Retrieved ${name} from localStorage`)
              return item
            }
          } catch (e) {
            console.warn("localStorage get failed, trying IndexedDB:", e)
          }
        }

        // Then try IndexedDB
        if (indexedDBAvailable && imageStore) {
          try {
            const value = await get(name, imageStore)
            if (value) {
              console.log(`Retrieved ${name} from IndexedDB`)
              return value
            }
          } catch (e) {
            console.warn("IndexedDB get failed, using memory fallback:", e)
          }
        }

        // Fall back to memory storage
        const memoryValue = memoryStorage.get(name)
        console.log(`Retrieved ${name} from memory:`, memoryValue ? "found" : "not found")
        return memoryValue || null
      } catch (error) {
        console.error("Storage error (get):", error)
        return null
      }
    },

    setItem: async (name, value) => {
      try {
        console.log(`Setting item: ${name}`)

        // Always store in memory as ultimate fallback
        memoryStorage.set(name, value)

        // Try localStorage first (most compatible)
        if (localStorageAvailable) {
          try {
            localStorage.setItem(name, value)
            console.log(`Saved ${name} to localStorage`)
            return
          } catch (e) {
            console.warn("localStorage set failed, trying IndexedDB:", e)
          }
        }

        // Then try IndexedDB
        if (indexedDBAvailable && imageStore) {
          try {
            await set(name, value, imageStore)
            console.log(`Saved ${name} to IndexedDB`)
            return
          } catch (e) {
            console.warn("IndexedDB set failed, using memory fallback only:", e)
          }
        }

        console.log(`Saved ${name} to memory fallback only`)
      } catch (error) {
        console.error("Storage error (set):", error)
      }
    },

    removeItem: async (name) => {
      try {
        console.log(`Removing item: ${name}`)

        // Remove from all storage options
        if (localStorageAvailable) {
          try {
            localStorage.removeItem(name)
            console.log(`Removed ${name} from localStorage`)
          } catch (e) {
            console.warn("localStorage remove failed:", e)
          }
        }

        if (indexedDBAvailable && imageStore) {
          try {
            await del(name, imageStore)
            console.log(`Removed ${name} from IndexedDB`)
          } catch (e) {
            console.warn("IndexedDB remove failed:", e)
          }
        }

        memoryStorage.delete(name)
        console.log(`Removed ${name} from memory fallback`)
      } catch (error) {
        console.error("Storage error (remove):", error)
      }
    },
  }
}

