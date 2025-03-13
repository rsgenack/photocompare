const { execSync } = require("child_process")

console.log("Starting PhotoCompare build process...")

try {
  console.log("Installing dependencies...")
  execSync("npm install --legacy-peer-deps", { stdio: "inherit" })

  console.log("Building the application...")
  execSync("npm run build", { stdio: "inherit" })

  console.log("Build completed successfully!")
} catch (error) {
  console.error("Build failed:", error.message)
  process.exit(1)
}

