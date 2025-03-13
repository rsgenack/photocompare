// This script can be run locally to list recent Vercel deployments
// Usage: node scripts/list-deployments.js [limit]

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Get limit from command line args or default to 10
const limit = process.argv[2] || 10

// Log file path with timestamp
const timestamp = new Date().toISOString().replace(/:/g, "-")
const logFile = path.join(logsDir, `vercel-deployments-${timestamp}.log`)

console.log(`Listing ${limit} recent Vercel deployments`)
console.log(`Results will be saved to: ${logFile}`)

try {
  // Use Vercel CLI to list deployments
  const deployments = execSync(`npx vercel list --limit ${limit}`, {
    encoding: "utf8",
    timeout: 30000, // 30 second timeout
  })

  // Write to file
  fs.writeFileSync(logFile, deployments)
  console.log("Deployments listed successfully!")
  console.log(deployments) // Also show in console
} catch (error) {
  console.error("Error listing deployments:", error.message)

  // Write error to file
  fs.writeFileSync(
    logFile,
    `Error listing deployments: ${error.message}\n\n${error.stdout || ""}\n\n${error.stderr || ""}`,
  )
}

