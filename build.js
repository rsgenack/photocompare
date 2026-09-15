// This file contains build configuration for the VOTOGRAPHER application

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Check if package.json exists
const packageJsonPath = path.join(__dirname, "package.json")
if (!fs.existsSync(packageJsonPath)) {
  console.error("package.json not found")
  process.exit(1)
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

// SWC dependencies to ensure are installed
const swcDependencies = [
  "@next/swc-darwin-arm64",
  "@next/swc-darwin-x64",
  "@next/swc-linux-arm64-gnu",
  "@next/swc-linux-arm64-musl",
  "@next/swc-linux-x64-gnu",
  "@next/swc-linux-x64-musl",
  "@next/swc-win32-arm64-msvc",
  "@next/swc-win32-ia32-msvc",
  "@next/swc-win32-x64-msvc",
]

// Check if we need to install SWC dependencies
console.log("Checking for SWC dependencies...")
let needsInstall = false

// Only install the platform-specific SWC dependency based on the current OS and architecture
let platformSpecificDep = ""
const platform = process.platform
const arch = process.arch

if (platform === "darwin") {
  // macOS
  platformSpecificDep = arch === "arm64" ? "@next/swc-darwin-arm64" : "@next/swc-darwin-x64"
} else if (platform === "linux") {
  // Linux
  if (arch === "arm64") {
    // Try to detect if we're using GNU or musl
    try {
      const libc = execSync("ldd --version 2>&1 || true").toString()
      platformSpecificDep = libc.includes("musl") ? "@next/swc-linux-arm64-musl" : "@next/swc-linux-arm64-gnu"
    } catch (e) {
      // Default to GNU if detection fails
      platformSpecificDep = "@next/swc-linux-arm64-gnu"
    }
  } else {
    // x64 architecture
    try {
      const libc = execSync("ldd --version 2>&1 || true").toString()
      platformSpecificDep = libc.includes("musl") ? "@next/swc-linux-x64-musl" : "@next/swc-linux-x64-gnu"
    } catch (e) {
      // Default to GNU if detection fails
      platformSpecificDep = "@next/swc-linux-x64-gnu"
    }
  }
} else if (platform === "win32") {
  // Windows
  if (arch === "arm64") {
    platformSpecificDep = "@next/swc-win32-arm64-msvc"
  } else if (arch === "ia32") {
    platformSpecificDep = "@next/swc-win32-ia32-msvc"
  } else {
    platformSpecificDep = "@next/swc-win32-x64-msvc"
  }
}

if (platformSpecificDep) {
  console.log(`Detected platform-specific SWC dependency: ${platformSpecificDep}`)

  // Check if the dependency is already in package.json
  if (!packageJson.dependencies[platformSpecificDep] && !packageJson.optionalDependencies[platformSpecificDep]) {
    needsInstall = true
  }
}

// Install the dependencies if needed
if (needsInstall) {
  console.log("Installing missing SWC dependencies...")
  try {
    execSync(`npm install ${platformSpecificDep} --no-save`, { stdio: "inherit" })
    console.log("SWC dependencies installed successfully.")
  } catch (error) {
    console.error("Failed to install SWC dependencies:", error)
    process.exit(1)
  }
}

// Continue with the build process
console.log("Building the application...")
try {
  execSync("next build", { stdio: "inherit" })
  console.log("Build completed successfully.")
} catch (error) {
  console.error("Build failed:", error)
  process.exit(1)
}
