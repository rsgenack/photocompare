"use client"

import { useEffect, useRef, useState } from "react"

export default function JuxtaposeComponent({ firstImage, secondImage }) {
  const containerRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    console.log("JuxtaposeComponent useEffect triggered", {
      firstImageId: firstImage?.id,
      secondImageId: secondImage?.id,
    })

    // Safety check for images
    if (!firstImage || !secondImage) {
      console.error("Missing images in JuxtaposeComponent")
      setError("Missing image data")
      return
    }

    // Simple solution that doesn't rely on external library
    try {
      if (!containerRef.current) return

      // Clear container
      containerRef.current.innerHTML = ""

      // Create simple comparison UI
      const container = document.createElement("div")
      container.style.position = "relative"
      container.style.width = "100%"
      container.style.height = "400px"
      container.style.overflow = "hidden"

      // Create first image
      const img1 = document.createElement("img")
      img1.src = firstImage.base64 || firstImage.url
      img1.alt = firstImage.name
      img1.style.position = "absolute"
      img1.style.width = "100%"
      img1.style.height = "100%"
      img1.style.objectFit = "contain"
      img1.style.zIndex = "1"

      // Create second image
      const img2 = document.createElement("img")
      img2.src = secondImage.base64 || secondImage.url
      img2.alt = secondImage.name
      img2.style.position = "absolute"
      img2.style.width = "100%"
      img2.style.height = "100%"
      img2.style.objectFit = "contain"
      img2.style.zIndex = "2"
      img2.style.clipPath = "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)"

      // Create slider
      const slider = document.createElement("div")
      slider.style.position = "absolute"
      slider.style.top = "0"
      slider.style.bottom = "0"
      slider.style.width = "4px"
      slider.style.backgroundColor = "white"
      slider.style.left = "50%"
      slider.style.transform = "translateX(-50%)"
      slider.style.zIndex = "3"
      slider.style.cursor = "ew-resize"

      // Create slider handle
      const handle = document.createElement("div")
      handle.style.position = "absolute"
      handle.style.top = "50%"
      handle.style.left = "50%"
      handle.style.transform = "translate(-50%, -50%)"
      handle.style.width = "20px"
      handle.style.height = "20px"
      handle.style.borderRadius = "50%"
      handle.style.backgroundColor = "white"
      handle.style.zIndex = "4"

      // Add event listener for slider
      let isDragging = false

      const updateSliderPosition = (clientX) => {
        const rect = container.getBoundingClientRect()
        const x = clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

        slider.style.left = `${percentage}%`
        img2.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`
      }

      slider.addEventListener("mousedown", () => {
        isDragging = true
      })

      document.addEventListener("mousemove", (e) => {
        if (isDragging) {
          updateSliderPosition(e.clientX)
        }
      })

      document.addEventListener("mouseup", () => {
        isDragging = false
      })

      // Add touch support
      slider.addEventListener("touchstart", () => {
        isDragging = true
      })

      document.addEventListener("touchmove", (e) => {
        if (isDragging && e.touches[0]) {
          updateSliderPosition(e.touches[0].clientX)
        }
      })

      document.addEventListener("touchend", () => {
        isDragging = false
      })

      // Build the UI
      slider.appendChild(handle)
      container.appendChild(img1)
      container.appendChild(img2)
      container.appendChild(slider)
      containerRef.current.appendChild(container)

      setIsLoaded(true)
    } catch (err) {
      console.error("Error creating comparison slider:", err)
      setError("Error creating comparison view")
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [firstImage, secondImage])

  if (error) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-red-500 font-medium mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Please try the side-by-side comparison instead</p>
        </div>
      </div>
    )
  }

  return (
    <div className="juxtapose-container rounded-lg overflow-hidden h-[400px]" ref={containerRef}>
      <div className="aspect-video h-full bg-muted flex items-center justify-center">
        <div className="animate-pulse">Loading comparison...</div>
      </div>
    </div>
  )
}

