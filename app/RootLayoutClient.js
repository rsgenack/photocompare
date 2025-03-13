"use client"

import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import StorageInitializer from "@/components/storage-initializer"

const inter = Inter({ subsets: ["latin"] })

export function RootLayoutClient({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <StorageInitializer />
          {children}
          <ErrorHandler />
        </ThemeProvider>
      </body>
    </html>
  )
}

// Create a separate client component for error handling
function ErrorHandler() {
  if (typeof window !== "undefined") {
    // Set up error handlers
    window.addEventListener("error", (event) => {
      console.error("Global error caught:", event.error || event.message)
    })

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason)
    })
  }

  return null
}

