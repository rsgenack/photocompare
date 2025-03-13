import fs from "fs"
import path from "path"

// Define the log file path
const LOG_DIR = path.join(process.cwd(), "logs")
const LOG_FILE = path.join(LOG_DIR, "deployment-logs.txt")

// Ensure the logs directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
} catch (error) {
  console.error("Error creating logs directory:", error)
}

/**
 * Writes a log message to the log file with a timestamp
 * @param {string} message - The message to log
 * @param {string} level - The log level (info, warn, error)
 */
export function logToFile(message, level = "info") {
  try {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`

    // Append to the log file
    fs.appendFileSync(LOG_FILE, logEntry)
  } catch (error) {
    console.error("Error writing to log file:", error)
  }
}

/**
 * Logs the start of a deployment with a clear separator
 * @param {string} deploymentInfo - Additional info about the deployment
 */
export function logDeploymentStart(deploymentInfo = "") {
  const separator = "=".repeat(80)
  const timestamp = new Date().toISOString()
  const message = `\n${separator}\nDEPLOYMENT STARTED: ${timestamp}\n${deploymentInfo ? `INFO: ${deploymentInfo}\n` : ""}`

  try {
    fs.appendFileSync(LOG_FILE, message)
  } catch (error) {
    console.error("Error writing deployment start to log file:", error)
  }
}

/**
 * Retrieves the logs as a string
 * @param {number} maxLines - Maximum number of lines to retrieve (0 for all)
 * @returns {string} The log content
 */
export function getLogs(maxLines = 1000) {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return "No logs available yet."
    }

    const content = fs.readFileSync(LOG_FILE, "utf8")

    if (maxLines <= 0) {
      return content
    }

    // Return only the last N lines
    const lines = content.split("\n")
    return lines.slice(-maxLines).join("\n")
  } catch (error) {
    console.error("Error reading log file:", error)
    return `Error reading logs: ${error.message}`
  }
}

