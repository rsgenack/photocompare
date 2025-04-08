"use client"

import { useEffect } from "react"

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold">Something went wrong!</h2>
      <p className="mt-4">Error details: {error.message}</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
