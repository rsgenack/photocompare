/**
 * A dedicated service for handling storage operations
 * This centralizes all storage logic in one place
 */

// Storage keys
const STORAGE_KEYS = {
  IMAGES: "photo-compare-images",
  COMPARISONS: "photo-compare-comparisons",
  SETTINGS: "photo-compare-settings",
}

// Add this at the top of the file to ensure it's properly handled during SSR
const isBrowser = typeof window !== "undefined"

/**
 * Save data to the best available storage
 */
export async function saveData(key, data) {
  if (!isBrowser) return false

  const serialized = JSON.stringify(data)

  try {
    // Try localStorage first (most widely supported)
    localStorage.setItem(key, serialized)
    console.log(`Data saved to localStorage: ${key}`)
    return true
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${error.message}`)

    // Fall back to sessionStorage if localStorage fails
    try {
      sessionStorage.setItem(key, serialized)
      console.log(`Data saved to sessionStorage: ${key}`)
      return true
    } catch (sessionError) {
      console.error(`Failed to save to sessionStorage: ${sessionError.message}`)
      return false
    }
  }
}

/**
 * Load data from the best available storage
 */
export async function loadData(key) {
  if (!isBrowser) return null

  try {
    // Try localStorage first
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data)
    }

    // Try sessionStorage if localStorage doesn't have the data
    const sessionData = sessionStorage.getItem(key)
    if (sessionData) {
      return JSON.parse(sessionData)
    }

    return null
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error)
    return null
  }
}

/**
 * Remove data from all storage mechanisms
 */
export async function removeData(key) {
  if (!isBrowser) return

  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.warn(`Failed to remove from localStorage: ${e.message}`)
  }

  try {
    sessionStorage.removeItem(key)
  } catch (e) {
    console.warn(`Failed to remove from sessionStorage: ${e.message}`)
  }
}

/**
 * Clear all app data from storage
 */
export async function clearAllData() {
  if (!isBrowser) return

  Object.values(STORAGE_KEYS).forEach((key) => {
    removeData(key)
  })
}

/**
 * Check if storage is available and working
 */
export function checkStorageAvailability() {
  if (!isBrowser) return { localStorage: false, sessionStorage: false }

  const result = {
    localStorage: false,
    sessionStorage: false,
  }

  // Test localStorage
  try {
    localStorage.setItem("test", "test")
    localStorage.removeItem("test")
    result.localStorage = true
  } catch (e) {
    console.warn("localStorage not available:", e)
  }

  // Test sessionStorage
  try {
    sessionStorage.setItem("test", "test")
    sessionStorage.removeItem("test")
    result.sessionStorage = true
  } catch (e) {
    console.warn("sessionStorage not available:", e)
  }

  return result
}

// Export storage keys for use in other modules
export { STORAGE_KEYS }

