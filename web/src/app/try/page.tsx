import type { Metadata } from "next";
import MarketingShell from "@/components/landing/MarketingShell";
import { breadcrumbJsonLd } from "@/lib/seo";
import TryClient from "./TryClient";

export const metadata: Metadata = {
  title: "Try free — AI Instagram carousel generator, no sign-up",
  description:
    "Generate a real Instagram carousel free, with no account and no card. Type a topic and watch Prompt2Post plan, write, and design it in about a minute.",
  alternates: { canonical: "/try" },
  openGraph: {
    title: "Try Prompt2Post free — no sign-up needed",
    description:
      "Type a topic and watch AI plan, write, and design a real Instagram carousel in about a minute. No account, no card.",
    url: "/try",
    type: "website",
  },
};

export default function TryPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Try free", path: "/try" },
            ])
          ),
        }}
      />
      <TryClient />
    </MarketingShell>
  );
}
