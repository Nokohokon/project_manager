import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Electron packaging
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Workaround für Vercel Lambda-Probleme
    // missingSuspenseWithCSRBailout: false, // Removed: not a valid property
  },
  // Alternative Workarounds
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Stelle sicher, dass alle Seiten als Funktionen behandelt werden
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      };
    }
    return config;
  },

};

export default nextConfig;