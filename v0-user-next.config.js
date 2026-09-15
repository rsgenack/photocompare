/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  // Explicitly set the page extensions to include .js and .jsx files
  pageExtensions: ["js", "jsx"],
  // Ensure we properly resolve .js and .jsx files
  webpack: (config) => {
    // Ensure .js and .jsx files are properly resolved
    config.resolve.extensions = [".js", ".jsx", ".json", ...config.resolve.extensions]

    // Add a rule to handle .js files as JSX
    config.module.rules.push({
      test: /\.js$/,
      use: ["babel-loader"],
      include: [/components/, /app/],
      exclude: /node_modules/,
    })

    return config
  },
}

module.exports = nextConfig
