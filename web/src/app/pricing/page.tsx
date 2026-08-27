import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import MarketingShell, { MarketingCta } from "@/components/landing/MarketingShell";
import Pricing from "@/components/landing/Pricing";
import { SITE_URL, SITE_NAME, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing — free plan, Pro from €9/month",
  description:
    "Prompt2Post pricing: create 3 Instagram carousels free every month, or go Pro from €9/month for 100 posts, all formats, and ZIP & PDF export. No card required to start.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Prompt2Post Pricing — start free, upgrade when you grow",
    description:
      "3 free posts every month. Pro from €9/month for 100 posts, all formats, and ZIP & PDF export.",
    url: "/pricing",
    type: "website",
  },
};

const PRICING_FAQ = [
  {
    question: "Is there really a free plan?",
    answer:
      "Yes — 3 posts every month, free forever, with the full AI engine (Idea Studio, AI rewrites, HD images, captions and hashtags). No credit card required.",
  },
  {
    question: "What counts as a post?",
    answer:
      "One generated carousel counts as one post. Editing slides afterwards — rewriting copy or regenerating a single image in Slide Studio — doesn't cost extra credits.",
  },
  {
    question: "Can I switch or cancel anytime?",
    answer:
      "Yes. Plans are month-to-month (or annual with 2 months free), managed through Stripe. Upgrade, downgrade, or cancel from your dashboard at any time.",
  },
  {
    question: "What does annual billing save?",
    answer:
      "Annual plans cost 10× the monthly price for 12 months of service — effectively 2 months free.",
  },
  {
    question: "Do unused posts roll over?",
    answer:
      "Post credits reset at the start of each billing cycle and don't roll over — the Creator plan removes the limit entirely.",
  },
];

/** Product markup with per-plan offers — eligible for price rich results. */
function pricingJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: SITE_NAME,
    description:
      "AI Instagram carousel generator — plans, writes, designs, and captions your posts.",
    brand: { "@type": "Brand", name: SITE_NAME },
    url: `${SITE_URL}/pricing`,
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR", description: "3 posts per month, up to 3 slides, captions & hashtags included." },
      { "@type": "Offer", name: "Pro", price: "9", priceCurrency: "EUR", description: "100 posts per month, up to 10 slides, all formats, ZIP & PDF export." },
      { "@type": "Offer", name: "Creator", price: "29", priceCurrency: "EUR", description: "Unlimited posts, priority generation, repurposing to X & LinkedIn." },
    ],
  };
}

export default function PricingPage() {
  const structuredData = [
    pricingJsonLd(),
    faqJsonLd(PRICING_FAQ),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Pricing", path: "/pricing" },
    ]),
  ];

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="max-w-4xl mx-auto px-6 text-center mb-4">
        <h1 className="text-display font-display mb-6">
          Pricing that scales
          <br />
          <span className="gradient-text-animated">with your content</span>
        </h1>
        <p className="text-white/55 text-lg max-w-2xl mx-auto">
          Every plan includes the full AI engine — planning, copy, images, captions, and hashtags.
          Start free, upgrade when your posting schedule outgrows the limits.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-10">
        <Pricing showHeading={false} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20">
        <h2 className="text-2xl sm:text-3xl text-center mb-8">Pricing questions</h2>
        <div className="space-y-3">
          {PRICING_FAQ.map((item) => (
            <details
              key={item.question}
              className="panel rounded-2xl px-5 py-4 group [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-white/90">
                {item.question}
                <ArrowRight className="w-4 h-4 text-white/40 transition-transform group-open:rotate-90" />
              </summary>
              <p className="text-white/55 text-sm leading-relaxed mt-3">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <MarketingCta
        title="Start with 3 free posts"
        subtitle="No card, no trial timer — the free plan renews every month. Upgrade only when you need more."
      />
    </MarketingShell>
  );
}
