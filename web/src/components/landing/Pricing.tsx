"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

type Plan = {
  name: string;
  monthly: number;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    features: [
      "10 posts / month",
      "Up to 3 slides",
      "Idea Studio & AI rewrites",
      "Square & Portrait formats",
      "HD image generation",
      "Captions & hashtags",
    ],
    cta: "Get started free",
  },
  {
    name: "Pro",
    monthly: 9,
    features: [
      "100 posts / month",
      "Up to 10 slides",
      "Post directly to Instagram",
      "All 4 formats (Story, Wide…)",
      "Custom accent & @handle watermark",
      "ZIP & PDF download",
    ],
    cta: "Start Pro",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Creator",
    monthly: 29,
    features: [
      "Unlimited posts",
      "Schedule & auto-publish",
      "Content calendar",
      "Priority parallel generation",
      "Repurpose to X & LinkedIn",
      "All Pro features",
    ],
    cta: "Go Creator",
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">Simple pricing</h2>
      <p className="text-white/50 text-center mb-7">Start free. Upgrade when you grow.</p>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={`text-sm ${!annual ? "text-white" : "text-white/45"}`}>Monthly</span>
        <button
          onClick={() => setAnnual((v) => !v)}
          className="relative w-14 h-7 rounded-full bg-white/10 border border-white/15 transition-colors"
          aria-label="Toggle annual billing"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-brand-400 transition-transform ${
              annual ? "translate-x-7" : ""
            }`}
          />
        </button>
        <span className={`text-sm ${annual ? "text-white" : "text-white/45"}`}>
          Annual
          <span className="ml-1.5 text-[11px] text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded-full">
            2 months free
          </span>
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const price = annual ? Math.round(plan.monthly * 10) : plan.monthly;
          const period = plan.monthly === 0 ? "" : annual ? "/year" : "/month";
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col gap-5 hover-lift ${
                plan.highlight
                  ? "bg-brand-600/20 border border-brand-500/50 shadow-lg shadow-brand-900/30"
                  : "panel"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-brand-500 text-white px-3 py-1 rounded-full font-medium shadow-lg shadow-brand-600/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {plan.badge}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-black">€{price}</span>
                  <span className="text-white/50 text-sm">{period}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/75">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={`btn-shine text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-brand-500 hover:bg-brand-400 text-white"
                    : "bg-white/[0.06] hover:bg-white/10 text-white/80"
                }`}
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
