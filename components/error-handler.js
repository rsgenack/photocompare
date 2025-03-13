"use client"

import { useEffect } from "react"

export default function ErrorHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to send logs to the server
    const sendLogToServer = async (message, level = "error") => {
      try {
        await fetch("/api/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, level }),
        })
      } catch (err) {
        console.error("Failed to send log to server:", err)
      }
    }

    // Set up error handlers
    const errorHandler = (event) => {
      const errorMessage = event.error
        ? `${event.error.name}: ${event.error.message}\n${event.error.stack}`
        : event.message

      console.error("Global error caught:", errorMessage)
      sendLogToServer(`Client error: ${errorMessage}`)
    }

    const rejectionHandler = (event) => {
      const errorMessage =
        event.reason instanceof Error
          ? `${event.reason.name}: ${event.reason.message}\n${event.reason.stack}`
          : String(event.reason)

      console.error("Unhandled promise rejection:", errorMessage)
      sendLogToServer(`Unhandled promise: ${errorMessage}`)
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  return null
}

