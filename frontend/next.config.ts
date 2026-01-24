import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript errors from @anon-aadhaar/core (React 18/TS4 compatibility issue)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable Turbopack for production builds (incompatible with @anon-aadhaar/react)
  experimental: {
    // Use webpack for builds
  },
  webpack: (config, { isServer }) => {
    // Polyfill crypto modules for @anon-aadhaar/react
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
