import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { NICHES } from "@/lib/marketing/niches";
import { ARTICLES } from "@/lib/marketing/articles";
import { TOOLS } from "@/lib/marketing/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/try`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/sign-up`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const niches: MetadataRoute.Sitemap = NICHES.map((n) => ({
    url: `${SITE_URL}/for/${n.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Keyword landing pages — the entry points for "instagram carousel ai
  // generator/maker/creator" searches, so they rank just under the homepage.
  const tools: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${SITE_URL}/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const articles: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: new Date(`${a.datePublished}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...core, ...tools, ...niches, ...articles];
}
