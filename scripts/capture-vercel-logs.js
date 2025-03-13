// This script can be run locally to capture Vercel deployment logs
// Usage: node scripts/capture-vercel-logs.js [deploymentId]

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Get deployment ID from command line args or use latest
const deploymentId = process.argv[2] || "latest"

// Log file path with timestamp
const timestamp = new Date().toISOString().replace(/:/g, "-")
const logFile = path.join(logsDir, `vercel-deployment-${deploymentId}-${timestamp}.log`)

console.log(`Capturing Vercel logs for deployment: ${deploymentId}`)
console.log(`Logs will be saved to: ${logFile}`)

try {
  // Use Vercel CLI to get deployment logs
  const logs = execSync(`npx vercel logs ${deploymentId} --follow`, {
    encoding: "utf8",
    timeout: 60000, // 1 minute timeout
  })

  // Write logs to file
  fs.writeFileSync(logFile, logs)
  console.log("Logs captured successfully!")
} catch (error) {
  console.error("Error capturing logs:", error.message)

  // Write error to file
  fs.writeFileSync(logFile, `Error capturing logs: ${error.message}\n\n${error.stdout || ""}\n\n${error.stderr || ""}`)
}

