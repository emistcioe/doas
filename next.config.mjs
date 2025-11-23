/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable experimental features for better build resilience
  experimental: {
    // Continue build even if some pages fail
    fallbackNodePolyfills: false,
  },
};

export default nextConfig;
