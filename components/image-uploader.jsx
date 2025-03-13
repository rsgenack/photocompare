"use client"

import { useState, useCallback } from "react"
import { Upload, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ImageUploader({ onImagesUploaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return

      try {
        const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))

        if (imageFiles.length === 0) {
          setError("Please select image files only")
          return
        }

        if (imageFiles.some((file) => file.size > 10 * 1024 * 1024)) {
          setError("One or more files exceed the 10MB limit")
          return
        }

        setError(null)

        const newImages = imageFiles.map((file) => ({
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          name: file.name,
          url: URL.createObjectURL(file),
          file,
        }))

        onImagesUploaded(newImages)
      } catch (err) {
        console.error("Error processing files:", err)
        setError("Error processing files. Please try again.")
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
        "flex flex-col items-center justify-center h-[250px] rounded-xl transition-colors border-2 border-dashed",
        isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 bg-indigo-100 p-4 rounded-full">
          <ImageIcon className="h-12 w-12 text-indigo-600" />
        </div>
        <h3 className="mb-1 text-xl font-semibold text-gray-800">Drag & Drop Images</h3>
        <p className="mb-6 text-sm text-gray-600">SVG, PNG, JPG or GIF (max. 10MB)</p>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="modern-button flex items-center">
            <Upload className="h-4 w-4 mr-2 inline-block" />
            Upload Images
          </div>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  )
}

