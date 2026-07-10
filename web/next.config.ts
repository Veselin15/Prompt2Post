import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the production Docker image stays
  // small and doesn't need the full node_modules tree at runtime.
  output: "standalone",
  serverExternalPackages: ["sharp"],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gen.pollinations.ai" },
      { protocol: "http", hostname: "localhost", port: "3000" },
    ],
  },
  async redirects() {
    return [
      // Canonical host: collapse www onto the apex domain so search engines
      // see one version of every page instead of indexable duplicates.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.prompt2post.app" }],
        destination: "https://prompt2post.app/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
