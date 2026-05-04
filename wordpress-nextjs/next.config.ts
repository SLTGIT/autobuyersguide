import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // When the platform serves this path through Next, tell crawlers not to index listings.
        source: "/__static/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
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
