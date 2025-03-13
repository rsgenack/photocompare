import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import StorageManager from "@/components/storage-manager"
import { logDeploymentStart, logToFile } from "@/lib/logger"

// Log application start (only runs on server)
if (typeof window === "undefined") {
  try {
    logDeploymentStart(`Next.js version: ${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local"}`)
    logToFile("Application initialized")
  } catch (error) {
    console.error("Error logging deployment start:", error)
  }
}

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "PhotoCompare - Image Ranking App",
  description: "Compare and rank your photos using pairwise comparisons",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <StorageManager />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'