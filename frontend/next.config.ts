import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript errors from @anon-aadhaar/core (React 18/TS4 compatibility issue)
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(process.cwd(), ".."),
  // Explicitly configure Turbopack to keep Next.js 16 from rejecting custom webpack config.
  turbopack: {},
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
  async rewrites() {
    return [
      {
        source: '/artifacts/:path*',
        destination: 'https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/v2.0.0/:path*',
      },
    ];
  },
};

export default nextConfig;
