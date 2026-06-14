import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app surface and API routes have nothing to index.
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
