"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Image } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void
}

export default function ImageDropzone({ onImageUpload }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith("image/")) {
          onImageUpload(file)
        }
      }
    },
    [onImageUpload],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onImageUpload(e.target.files[0])
      }
    },
    [onImageUpload],
  )

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-[400px] rounded-md border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <Image className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mb-1 font-semibold">Drag & drop image</h3>
        <p className="mb-4 text-sm text-muted-foreground">SVG, PNG, JPG or GIF (max. 10MB)</p>
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </div>
          <input id="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  )
}
