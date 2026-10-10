import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake large icon/animation libraries instead of bundling the whole package
    optimizePackageImports: ["lucide-react", "react-github-calendar", "@base-ui/react"],
  },
  // Keep native/heavy server-only deps out of the server bundle
  serverExternalPackages: ["mongoose", "sanitize-html"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
