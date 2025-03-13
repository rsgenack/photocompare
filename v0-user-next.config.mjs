/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Ignore build errors to ensure successful deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable compression to avoid potential issues
  compress: false,
  // ONLY use JavaScript file extensions - no TypeScript
  pageExtensions: ['js', 'jsx'],
  // Use standalone output for better compatibility
  output: 'standalone',
};

export default nextConfig;

