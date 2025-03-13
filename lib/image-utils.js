// Utility functions for image processing

// Get appropriate compression settings based on image dimensions
export const getCompressionSettings = (width, height) => {
  // For very large images (e.g., high-res photos)
  if (width > 3000 || height > 3000) {
    return {
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.8, // 80% quality - good balance for photos
    }
  }

  // For large images
  if (width > 2000 || height > 2000) {
    return {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.85, // 85% quality - very good quality
    }
  }

  // For medium-sized images
  if (width > 1200 || height > 1200) {
    return {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.9, // 90% quality - excellent quality
    }
  }

  // For smaller images, don't compress much
  return {
    maxWidth: width, // Keep original width
    maxHeight: height, // Keep original height
    quality: 0.95, // 95% quality - near original
  }
}

// Smart image compression that adapts to the image size
export const compressImage = (file) => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return Promise.resolve({ file, compressionInfo: { originalSize: 0, newSize: 0, dimensions: "0x0" } })
  }

  return new Promise((resolve, reject) => {
    const originalSize = file.size
    const reader = new FileReader()

    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result

      img.onload = () => {
        // Get appropriate compression settings
        const { maxWidth, maxHeight, quality } = getCompressionSettings(img.width, img.height)

        // Only compress if the image is larger than the max dimensions
        if (img.width <= maxWidth && img.height <= maxHeight && quality >= 0.95) {
          resolve({
            file,
            compressionInfo: {
              originalSize,
              newSize: originalSize,
              dimensions: `${img.width}x${img.height} (unchanged)`,
            },
          })
          return
        }

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width))
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height))
            height = maxHeight
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Use better quality settings for the resize
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)

        // Convert back to file
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob"))
              return
            }

            const newFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })

            resolve({
              file: newFile,
              compressionInfo: {
                originalSize,
                newSize: newFile.size,
                dimensions: `${width}x${height}`,
              },
            })
          },
          "image/jpeg",
          quality,
        ) // Use adaptive quality
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for compression"))
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }
  })
}

// Create a thumbnail for list views
export const createThumbnail = (base64, maxWidth = 100, maxHeight = 100) => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return Promise.resolve("")
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width))
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height))
          height = maxHeight
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Get thumbnail as base64
      resolve(canvas.toDataURL("image/jpeg", 0.7))
    }

    img.onerror = () => {
      reject(new Error("Failed to load image for thumbnail creation"))
    }

    img.src = base64
  })
}

// Helper function to convert File to base64
export const fileToBase64 = (file) => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return Promise.resolve("")
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// Format bytes to human-readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

