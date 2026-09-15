/**
 * Compresses an image file to a target size while preserving resolution
 * @param {File} file - The original image file
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @param {number} maxQuality - Maximum quality (1.0 = 100%)
 * @param {number} minQuality - Minimum quality (0.5 = 50%)
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(file, maxSizeInMB = 10, maxQuality = 0.9, minQuality = 0.5) {
  // If file is already smaller than max size, return it as is
  if (file.size <= maxSizeInMB * 1024 * 1024) {
    return file
  }

  // Create an image element
  const img = new Image()
  img.src = URL.createObjectURL(file)

  // Wait for the image to load
  await new Promise((resolve) => {
    img.onload = resolve
  })

  // Create a canvas element
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  // Preserve original dimensions
  canvas.width = img.width
  canvas.height = img.height

  // Draw the image on the canvas
  ctx.drawImage(img, 0, 0, img.width, img.height)

  // Release the object URL
  URL.revokeObjectURL(img.src)

  // Binary search for the optimal quality
  let quality = maxQuality
  let min = minQuality
  let max = maxQuality
  let blob
  let iterations = 0
  const maxIterations = 10 // Prevent infinite loops

  do {
    // Get the image as a blob with the current quality
    blob = await new Promise((resolve) => {
      // Use the appropriate format based on the original file
      const format = file.type.includes("png") ? "image/png" : "image/jpeg"
      canvas.toBlob(resolve, format, quality)
    })

    // Adjust quality based on result
    if (blob.size > maxSizeInMB * 1024 * 1024) {
      max = quality
      quality = (min + quality) / 2
    } else {
      min = quality
      quality = (quality + max) / 2
    }

    iterations++
  } while (Math.abs(blob.size - maxSizeInMB * 1024 * 1024) > 100 * 1024 && iterations < maxIterations)

  // Create a new file from the blob
  const compressedFile = new File([blob], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  })

  return compressedFile
}

/**
 * Compresses multiple image files in parallel
 * @param {File[]} files - Array of image files
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Promise<File[]>} - Array of compressed image files
 */
export async function compressImages(files, maxSizeInMB = 10) {
  const compressionPromises = Array.from(files).map((file) => compressImage(file, maxSizeInMB))

  return Promise.all(compressionPromises)
}
