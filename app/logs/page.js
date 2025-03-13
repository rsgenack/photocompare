"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Download } from "lucide-react"

export default function LogsPage() {
  const [logs, setLogs] = useState("Loading logs...")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/logs")
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`)
      }
      const text = await response.text()
      setLogs(text)
      setError(null)
    } catch (err) {
      console.error("Error fetching logs:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `deployment-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={downloadLogs} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6">Deployment Logs</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-black text-green-400 p-4 rounded-lg overflow-auto h-[70vh] font-mono text-sm">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap">{logs}</pre>
          )}
        </div>
      </div>
    </div>
  )
}

