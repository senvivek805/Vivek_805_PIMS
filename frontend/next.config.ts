import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 👇 Windows pe PostCSS worker OOM ko rokne ke liye
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    webpackMemoryOptimizations: true,
  },
  reactStrictMode: true,
};

export default nextConfig;