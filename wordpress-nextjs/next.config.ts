import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/vehicles", destination: "/search", permanent: true },
      { source: "/vehicles/:slug", destination: "/cars/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Empty turbopack config to silence the warning
  // Turbopack is enabled by default in Next.js 16
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  allowedDevOrigins: ['127.0.0.1'],
  turbopack: {},
};

export default nextConfig;
