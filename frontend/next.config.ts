import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack cache issues
  experimental: {
    // Force fresh build
  },
  // Faster refresh
  reactStrictMode: true,
};

export default nextConfig;