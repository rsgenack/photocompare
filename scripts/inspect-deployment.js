// This script can be run locally to inspect a Vercel deployment
// Usage: node scripts/inspect-deployment.js [deploymentId]

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
const logFile = path.join(logsDir, `vercel-inspect-${deploymentId}-${timestamp}.log`)

console.log(`Inspecting Vercel deployment: ${deploymentId}`)
console.log(`Results will be saved to: ${logFile}`)

try {
  // Use Vercel CLI to inspect the deployment
  const inspectOutput = execSync(`npx vercel inspect ${deploymentId}`, {
    encoding: "utf8",
    timeout: 30000, // 30 second timeout
  })

  // Get build logs as well
  const buildLogs = execSync(`npx vercel inspect ${deploymentId} --logs`, {
    encoding: "utf8",
    timeout: 30000, // 30 second timeout
  })

  // Write combined output to file
  const combinedOutput = `
=== DEPLOYMENT INSPECTION ===
${inspectOutput}

=== BUILD LOGS ===
${buildLogs}
`

  fs.writeFileSync(logFile, combinedOutput)
  console.log("Inspection completed successfully!")
} catch (error) {
  console.error("Error inspecting deployment:", error.message)

  // Write error to file
  fs.writeFileSync(
    logFile,
    `Error inspecting deployment: ${error.message}\n\n${error.stdout || ""}\n\n${error.stderr || ""}`,
  )
}

