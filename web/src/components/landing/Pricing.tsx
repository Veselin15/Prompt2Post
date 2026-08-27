"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

type Plan = {
  name: string;
  /** One line on who the plan is actually for. */
  blurb: string;
  monthly: number;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    blurb: "See if AI carousels are good enough for your feed.",
    monthly: 0,
    features: [
      "3 posts / month",
      "Up to 3 slides",
      "Idea Studio & AI rewrites",
      "Square & Portrait formats",
      "HD image generation",
      "Captions & hashtags",
      "Ends with a Prompt2Post slide",
    ],
    cta: "Get started free",
  },
  {
    name: "Pro",
    blurb: "For creators posting several carousels a week.",
    monthly: 9,
    features: [
      "100 posts / month",
      "Up to 10 slides",
      "Instagram publishing (coming soon)",
      "All 4 formats (Story, Wide…)",
      "Custom accent & @handle watermark",
      "No Prompt2Post branding",
      "ZIP & PDF download",
    ],
    cta: "Start Pro",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Creator",
    blurb: "For agencies and anyone batching a month at a time.",
    monthly: 29,
    features: [
      "Unlimited posts",
      "Schedule & auto-publish (coming soon)",
      "Content calendar (coming soon)",
      "Priority parallel generation",
      "Repurpose to X & LinkedIn",
      "All Pro features",
    ],
    cta: "Go Creator",
  },
];

/** `showHeading={false}` on /pricing, where the page already has its own H1. */
export default function Pricing({ showHeading = true }: { showHeading?: boolean }) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <div className={`mb-10 text-center ${showHeading ? "" : "hidden"}`}>
        <p className="eyebrow mb-3">Pricing</p>
        <h2 className="text-section mb-4">Start free. Upgrade when you grow.</h2>
        <p className="text-white/50">
          Editing, rewriting and regenerating images never costs a post credit.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mb-12 flex items-center justify-center gap-3">
        <span className={`text-sm ${!annual ? "text-white" : "text-white/45"}`}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual((v) => !v)}
          role="switch"
          aria-checked={annual}
          className="relative h-7 w-14 rounded-full border border-white/15 bg-white/10 transition-colors"
          aria-label="Toggle annual billing"
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-brand-400 shadow-lg shadow-brand-900/50 transition-transform duration-200 ${
              annual ? "translate-x-7" : ""
            }`}
          />
        </button>
        <span className={`text-sm ${annual ? "text-white" : "text-white/45"}`}>
          Annual
          <span className="ml-1.5 rounded-full border border-green-400/20 bg-green-400/10 px-1.5 py-0.5 text-[11px] text-green-400">
            2 months free
          </span>
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const price = annual ? Math.round(plan.monthly * 10) : plan.monthly;
          const period = plan.monthly === 0 ? "forever" : annual ? "/year" : "/month";
          return (
            <div
              key={plan.name}
              className={`relative flex flex-col gap-5 rounded-2xl p-6 transition-all duration-300 ${
                plan.highlight
                  ? "border border-brand-500/45 bg-gradient-to-b from-brand-600/25 to-brand-900/10 shadow-[0_24px_60px_-30px_rgba(139,62,222,0.9)] sm:-mt-3 sm:pt-9"
                  : "panel hover-lift"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white shadow-lg shadow-brand-600/40">
                  <Sparkles className="h-3 w-3" /> {plan.badge}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/45">
                  {plan.blurb}
                </p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-black">€{price}</span>
                  <span className="text-sm text-white/50">{period}</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={
                  plan.highlight
                    ? "btn-primary w-full py-3 text-sm"
                    : "btn-secondary w-full py-3 text-sm"
                }
              >
                {plan.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
