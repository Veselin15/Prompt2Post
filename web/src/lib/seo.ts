/**
 * Single source of truth for SEO: the public site URL plus the JSON-LD
 * structured-data blocks that help Google show rich results.
 *
 * `||` (not `??`) so an empty-string env var falls through — otherwise
 * `new URL("")` in metadataBase would throw during the build.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://prompt2post.app"
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Prompt2Post";

export const SITE_DESCRIPTION =
  "Type one topic and Prompt2Post plans, writes, designs, and schedules a scroll-stopping Instagram carousel — with on-brand copy, AI images, captions, and hashtags.";

/** Questions surfaced in the homepage FAQ, reused for FAQPage structured data. */
export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is Prompt2Post?",
    answer:
      "Prompt2Post is an AI content studio for Instagram creators. You type one topic and it plans the structure, writes the copy for every slide, generates the images, and adds captions and hashtags — turning a single idea into a finished, on-brand carousel.",
  },
  {
    question: "Is Prompt2Post free to use?",
    answer:
      "Yes. The free plan lets you create up to 3 posts every month at no cost. Paid plans add more monthly posts and unlock higher limits when you're ready to scale your content.",
  },
  {
    question: "Can it match my brand colors, fonts, and tone?",
    answer:
      "Yes. Save your tone, colors, fonts, and language as a Brand Kit and every new post starts on-brand automatically, including captions and hashtags written in your voice.",
  },
  {
    question: "Can I edit the AI-generated slides?",
    answer:
      "Absolutely. With Slide Studio you can rewrite any slide with AI, edit the copy yourself, or regenerate a single image — without spending another post credit.",
  },
  {
    question: "What languages does Prompt2Post support?",
    answer:
      "Prompt2Post writes posts in 13 languages, so you can create carousels for audiences around the world from the same workflow.",
  },
  {
    question: "Can I publish directly to Instagram?",
    answer:
      "You can export your carousel as a ZIP or PDF with captions today. Direct Instagram publishing and scheduling are coming soon.",
  },
];

/** Organization markup — used for knowledge-panel / logo eligibility. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: SITE_DESCRIPTION,
  };
}

/** WebSite markup — establishes the site identity for search engines. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

/** SoftwareApplication markup — describes the product and its free offer. */
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan — create up to 3 posts every month.",
    },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[] = FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** BreadcrumbList markup — pass paths relative to the site root, e.g. "/blog". */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Article markup for blog posts — eligible for article rich results. */
export function articleJsonLd(article: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}${article.path}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    image: `${SITE_URL}/opengraph-image`,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${article.path}` },
  };
}
