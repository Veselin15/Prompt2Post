"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, Zap, Crown, Sparkles, ExternalLink } from "lucide-react";
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";
import { clsx } from "clsx";

const PLANS = [
  {
    key: "free" as Plan,
    name: "Free",
    price: "$0",
    period: "/month",
    icon: <Sparkles className="w-5 h-5 text-white/40" />,
    features: ["10 posts / month", "Up to 3 slides", "HD image generation", "Social captions & hashtags"],
    cta: null,
    color: "border-white/10",
    highlight: false,
  },
  {
    key: "pro" as Plan,
    name: "Pro",
    price: "$9",
    period: "/month",
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    features: ["100 posts / month", "Up to 10 slides", "ZIP download", "All styles & tones"],
    cta: "Upgrade to Pro",
    color: "border-brand-500/40",
    highlight: true,
    badge: "Most popular",
  },
  {
    key: "creator" as Plan,
    name: "Creator",
    price: "$29",
    period: "/month",
    icon: <Crown className="w-5 h-5 text-yellow-300" />,
    features: ["Unlimited posts", "Up to 10 slides", "ZIP download", "Priority generation", "API access (soon)"],
    cta: "Go Creator",
    color: "border-purple-500/30",
    highlight: false,
  },
];

function SearchParamToasts() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Subscription activated! Your plan has been upgraded.");
    }
    if (searchParams.get("canceled")) {
      toast.info("Checkout canceled.");
    }
  }, [searchParams]);
  return null;
}

export default function BillingClient({ currentPlan }: { currentPlan: Plan }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planKey: Plan) {
    setLoading(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open checkout");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open portal");
      setLoading(null);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Suspense fallback={null}>
        <SearchParamToasts />
      </Suspense>

      <div className="mb-8">
        <h1 className="text-xl font-bold">Billing &amp; Plans</h1>
        <p className="text-white/50 text-sm mt-1">
          Manage your subscription and upgrade your plan.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.key;

          return (
            <div
              key={plan.key}
              className={clsx(
                "relative rounded-2xl p-6 flex flex-col gap-5 border transition-all",
                plan.highlight ? "bg-brand-600/10" : "glass",
                plan.color,
                isActive && "ring-1 ring-brand-400/50"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-brand-500 text-white px-3 py-1 rounded-full font-medium">
                  {plan.badge}
                </div>
              )}
              {isActive && !plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-green-600 text-white px-3 py-1 rounded-full font-medium">
                  Current plan
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  {plan.icon}
                  <span className="font-bold">{plan.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.cta && !isActive ? (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loading === plan.key}
                  className={clsx(
                    "py-2.5 rounded-xl font-semibold text-sm transition-colors",
                    plan.highlight
                      ? "bg-brand-500 hover:bg-brand-400 text-white"
                      : "glass hover:bg-white/10 text-white/80",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loading === plan.key ? "Loading…" : plan.cta}
                </button>
              ) : isActive && plan.key !== "free" ? (
                <button
                  onClick={handlePortal}
                  disabled={loading === "portal"}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium text-sm glass hover:bg-white/10 text-white/60 transition-colors disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {loading === "portal" ? "Loading…" : "Manage subscription"}
                </button>
              ) : (
                <div className="py-2.5 rounded-xl text-sm text-center text-white/30">
                  {isActive ? "Active" : "Available"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentPlan !== "free" && (
        <div className="glass rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-medium">Billing history &amp; invoices</p>
            <p className="text-white/50 text-sm">View invoices, update payment method, or cancel.</p>
          </div>
          <button
            onClick={handlePortal}
            disabled={loading === "portal"}
            className="flex items-center gap-2 text-sm glass hover:bg-white/10 px-4 py-2 rounded-xl text-white/70 transition-colors disabled:opacity-50"
          >
            <ExternalLink className="w-4 h-4" />
            {loading === "portal" ? "Loading…" : "Customer portal"}
          </button>
        </div>
      )}
    </div>
  );
}
