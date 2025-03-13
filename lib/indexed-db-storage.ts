import type { StateStorage } from "zustand/middleware"

// Custom storage adapter for Zustand to use IndexedDB
export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (typeof window === "undefined") return null

      // Simple localStorage fallback
      return localStorage.getItem(name)
    } catch (error) {
      console.error(`Error getting item ${name} from storage:`, error)
      return null
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (typeof window === "undefined") return

      // Simple localStorage fallback
      localStorage.setItem(name, value)
    } catch (error) {
      console.error(`Error setting item ${name} in storage:`, error)
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (typeof window === "undefined") return

      // Simple localStorage fallback
      localStorage.removeItem(name)
    } catch (error) {
      console.error(`Error removing item ${name} from storage:`, error)
    }
  },
}

