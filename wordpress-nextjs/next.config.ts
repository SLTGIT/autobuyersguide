import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/contact-2",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/privacy-and-cookies-policy",
        destination: "/privacy-policy",
        permanent: true,
      },
    ];
  },
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
