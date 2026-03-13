import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "react-markdown",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig;
