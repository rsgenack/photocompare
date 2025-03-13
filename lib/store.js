import { create } from "zustand"
import { persist } from "zustand/middleware"
import { fileToBase64, createThumbnail } from "@/lib/image-utils"
import { saveData, loadData, removeData, STORAGE_KEYS } from "./storage-service"

// Create a store factory function to avoid initializing Zustand with browser APIs during SSR
const createImageStore = () => {
  return create(
    persist(
      (set, get) => ({
        images: [],
        comparisons: [],
        currentPair: null,
        isHydrated: false, // Track hydration state
        storageError: null, // Track storage errors

        // Set hydration state
        setHydrated: (state) => set({ isHydrated: state }),

        // Set storage error
        setStorageError: (error) => set({ storageError: error }),

        addImages: async (newImages) => {
          try {
            // Process images in batches to avoid memory issues
            const processedImages = []

            for (const img of newImages) {
              try {
                if (img.file) {
                  // Convert to base64 for persistence
                  const base64 = await fileToBase64(img.file)

                  // Create thumbnail for list views
                  const thumbnail = await createThumbnail(base64)

                  processedImages.push({
                    ...img,
                    base64,
                    thumbnail,
                  })
                } else {
                  processedImages.push(img)
                }
              } catch (err) {
                console.error("Error processing image:", err)
              }
            }

            set((state) => ({
              images: [...state.images, ...processedImages],
            }))

            // Manually save to storage to ensure it works
            const allImages = [...get().images, ...processedImages]
            await saveData(STORAGE_KEYS.IMAGES, allImages)

            return true
          } catch (error) {
            console.error("Error adding images:", error)
            set({ storageError: error.message })
            return false
          }
        },

        removeImage: (id) => {
          set((state) => {
            const newImages = state.images.filter((img) => img.id !== id)
            const newComparisons = state.comparisons.filter((comp) => comp.winner !== id && comp.loser !== id)

            // Save changes to storage
            saveData(STORAGE_KEYS.IMAGES, newImages)
            saveData(STORAGE_KEYS.COMPARISONS, newComparisons)

            return {
              images: newImages,
              comparisons: newComparisons,
            }
          })
        },

        excludeImage: (id) => {
          set((state) => {
            const newImages = state.images.map((img) => (img.id === id ? { ...img, excluded: true } : img))

            // Save changes to storage
            saveData(STORAGE_KEYS.IMAGES, newImages)

            return {
              images: newImages,
            }
          })
        },

        recordComparison: (winnerId, loserId) => {
          set((state) => {
            const newComparison = {
              winner: winnerId,
              loser: loserId,
              timestamp: Date.now(),
            }
            const newComparisons = [...state.comparisons, newComparison]

            // Save changes to storage
            saveData(STORAGE_KEYS.COMPARISONS, newComparisons)

            return {
              comparisons: newComparisons,
              currentPair: null,
            }
          })
        },

        getNextPair: () => {
          const state = get()

          // Safety check - don't proceed if not hydrated
          if (!state.isHydrated) {
            console.warn("Store not hydrated yet, cannot get next pair")
            return null
          }

          const activeImages = state.images.filter((img) => !img.excluded)

          if (activeImages.length < 2) return null

          // Create all possible pairs
          const allPairs = []
          for (let i = 0; i < activeImages.length; i++) {
            for (let j = i + 1; j < activeImages.length; j++) {
              allPairs.push([activeImages[i].id, activeImages[j].id])
            }
          }

          // Count comparisons for each pair
          const pairCounts = new Map()
          allPairs.forEach(([a, b]) => {
            const pairKey = [a, b].sort().join("-")
            pairCounts.set(pairKey, 0)
          })

          state.comparisons.forEach((comp) => {
            const pairKey = [comp.winner, comp.loser].sort().join("-")
            if (pairCounts.has(pairKey)) {
              pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1)
            }
          })

          // Find pairs with minimum comparisons
          let minCount = Number.POSITIVE_INFINITY
          let candidatePairs = []

          pairCounts.forEach((count, pairKey) => {
            if (count < minCount) {
              minCount = count
              candidatePairs = []
            }
            if (count === minCount) {
              const [a, b] = pairKey.split("-")
              candidatePairs.push([a, b])
            }
          })

          if (candidatePairs.length === 0) return null

          // Randomly select one of the candidate pairs
          const randomPair = candidatePairs[Math.floor(Math.random() * candidatePairs.length)]
          set({ currentPair: randomPair })
          return randomPair
        },

        getRankings: () => {
          const state = get()

          // Safety check - don't proceed if not hydrated
          if (!state.isHydrated) {
            console.warn("Store not hydrated yet, cannot get rankings")
            return []
          }

          const activeImages = state.images.filter((img) => !img.excluded)

          // Initialize scores (using a simple ELO-like system)
          const scores = new Map()
          const wins = new Map()
          const totalComparisons = new Map()

          activeImages.forEach((img) => {
            scores.set(img.id, 1000) // Starting ELO score
            wins.set(img.id, 0)
            totalComparisons.set(img.id, 0)
          })

          // Calculate scores based on comparisons
          state.comparisons.forEach((comp) => {
            // Skip comparisons involving excluded images
            if (!scores.has(comp.winner) || !scores.has(comp.loser)) return

            // Update win count
            wins.set(comp.winner, (wins.get(comp.winner) || 0) + 1)

            // Update total comparisons
            totalComparisons.set(comp.winner, (totalComparisons.get(comp.winner) || 0) + 1)
            totalComparisons.set(comp.loser, (totalComparisons.get(comp.loser) || 0) + 1)

            // Update ELO scores
            const K = 32 // K-factor determines how much scores change
            const winnerScore = scores.get(comp.winner) || 1000
            const loserScore = scores.get(comp.loser) || 1000

            // Calculate expected scores
            const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400))
            const expectedLoser = 1 - expectedWinner

            // Update scores
            scores.set(comp.winner, winnerScore + K * (1 - expectedWinner))
            scores.set(comp.loser, loserScore + K * (0 - expectedLoser))
          })

          // Convert to array and sort by score
          return activeImages
            .map((img) => ({
              id: img.id,
              score: scores.get(img.id) || 1000,
              wins: wins.get(img.id) || 0,
              comparisons: totalComparisons.get(img.id) || 0,
            }))
            .sort((a, b) => b.score - a.score)
        },

        resetComparisons: () => {
          set({ comparisons: [], currentPair: null })
          saveData(STORAGE_KEYS.COMPARISONS, [])
        },

        clearAll: () => {
          set({ images: [], comparisons: [], currentPair: null })
          saveData(STORAGE_KEYS.IMAGES, [])
          saveData(STORAGE_KEYS.COMPARISONS, [])
        },

        // Method to manually load data from storage
        loadFromStorage: async () => {
          try {
            const images = (await loadData(STORAGE_KEYS.IMAGES)) || []
            const comparisons = (await loadData(STORAGE_KEYS.COMPARISONS)) || []

            set({
              images,
              comparisons,
              isHydrated: true,
              storageError: null,
            })

            return true
          } catch (error) {
            console.error("Error loading from storage:", error)
            set({
              storageError: error.message,
              isHydrated: true, // Still mark as hydrated so the app can function
            })
            return false
          }
        },
      }),
      {
        name: STORAGE_KEYS.SETTINGS,
        storage: {
          getItem: async (name) => {
            try {
              const data = await loadData(name)
              return data !== null ? JSON.stringify(data) : null
            } catch (error) {
              console.error("Error in getItem:", error)
              return null
            }
          },
          setItem: async (name, value) => {
            try {
              const parsed = JSON.parse(value)
              return await saveData(name, parsed)
            } catch (error) {
              console.error("Error in setItem:", error)
            }
          },
          removeItem: async (name) => {
            try {
              return await removeData(name)
            } catch (error) {
              console.error("Error in removeItem:", error)
            }
          },
        },
        // Only store what's needed
        partialize: (state) => ({
          images: state.images.map((img) => ({
            id: img.id,
            name: img.name,
            url: img.base64 || img.url,
            base64: img.base64,
            thumbnail: img.thumbnail,
            excluded: img.excluded,
          })),
          comparisons: state.comparisons,
        }),
        // Handle hydration completion
        onRehydrateStorage: () => (state) => {
          console.log("Storage rehydration started")
          return (err, data) => {
            if (err) {
              console.error("Error rehydrating store:", err)
              if (state) {
                state.setStorageError(err.message)
                state.setHydrated(true) // Still mark as hydrated so the app can function
              }
            } else {
              console.log("Storage rehydration completed", {
                imagesCount: data?.images?.length || 0,
                comparisonsCount: data?.comparisons?.length || 0,
              })
              if (state) {
                state.setHydrated(true)
              }
            }
          }
        },
      },
    ),
  )
}

// Create a lazy-initialized store to avoid SSR issues
let store = null

export const useImageStore = () => {
  // On the server, return a dummy store with empty values
  if (typeof window === "undefined") {
    return {
      images: [],
      comparisons: [],
      currentPair: null,
      isHydrated: false,
      storageError: null,
      addImages: async () => false,
      removeImage: () => {},
      excludeImage: () => {},
      recordComparison: () => {},
      getNextPair: () => null,
      getRankings: () => [],
      resetComparisons: () => {},
      clearAll: () => {},
      loadFromStorage: async () => false,
    }
  }

  // Initialize the store on first client-side use
  if (!store) {
    store = createImageStore()
  }

  return store()
}

// Create a hook to wait for hydration
export const useHydration = () => {
  const isHydrated = useImageStore((state) => state.isHydrated)
  const storageError = useImageStore((state) => state.storageError)
  return { isHydrated, storageError }
}

