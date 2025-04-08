"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, ImageIcon, Loader2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { compressImages } from "@/utils/image-compression"

export default function ImageUploader({ onImagesUploaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = useCallback(
    async (files) => {
      if (!files || files.length === 0) return

      try {
        const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))

        if (imageFiles.length === 0) {
          setError("Please select image files only")
          return
        }

        // Check if any files exceed the size limit
        const oversizedFiles = imageFiles.filter((file) => file.size > 10 * 1024 * 1024)

        if (oversizedFiles.length > 0) {
          setIsCompressing(true)
          setCompressionProgress(0)

          // Show compression message
          console.log(`Compressing ${oversizedFiles.length} oversized images...`)

          // Compress all images (this will only actually compress the oversized ones)
          const compressedFiles = await compressImages(imageFiles)

          setIsCompressing(false)
          setCompressionProgress(100)

          // Create image objects from the compressed files
          const newImages = compressedFiles.map((file) => ({
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            name: file.name,
            url: URL.createObjectURL(file),
            file,
            compressed: file.size < imageFiles.find((f) => f.name === file.name).size,
          }))

          onImagesUploaded(newImages)
          setError(null)
        } else {
          // No compression needed
          const newImages = imageFiles.map((file) => ({
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            name: file.name,
            url: URL.createObjectURL(file),
            file,
            compressed: false,
          }))

          onImagesUploaded(newImages)
          setError(null)
        }
      } catch (err) {
        console.error("Error processing files:", err)
        setError("Error processing files. Please try again.")
        setIsCompressing(false)
      }
    },
    [onImagesUploaded],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles],
  )

  const handleFileChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
        // Reset the input value so the same file can be uploaded again if needed
        e.target.value = ""
      }
    },
    [processFiles],
  )

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-[375px] transition-colors border-2 border-dashed p-8",
        isDragging ? "bg-gray-100" : "hover:border-black",
      )}
      style={{
        borderColor: isDragging ? "black" : "#333",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        {isCompressing ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-tropical_indigo" />
            <h3 className="text-xl font-bold text-black font-display">COMPRESSING IMAGES</h3>
            <p className="text-sm text-gray-800 font-sans">Optimizing large images for upload...</p>
            <div className="w-64 h-2 bg-gray-200 overflow-hidden border border-black">
              <div
                className="h-full transition-all duration-300 bg-yellow_green"
                style={{
                  width: `${compressionProgress}%`,
                }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 rounded-full bg-cardinal">
              <ImageIcon className="h-12 w-12 text-white" />
            </div>
            <h3 className="mb-1 text-xl font-bold text-black font-display">DRAG & DROP IMAGES</h3>
            <p className="mb-2 text-sm text-gray-800 font-sans">SVG, PNG, JPG or GIF</p>
            <p className="mb-6 text-xs font-sans text-yellow_green font-bold">
              LARGE IMAGES WILL BE AUTOMATICALLY COMPRESSED
            </p>
            {error && <p className="mb-4 text-sm font-sans text-cardinal font-bold">{error}</p>}
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="px-6 py-3 text-black font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex items-center font-sans bg-yellow_green">
                <Upload className="h-4 w-4 mr-2 inline-block" />
                UPLOAD IMAGES
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
          </>
        )}
      </div>
    </div>
  )
}
