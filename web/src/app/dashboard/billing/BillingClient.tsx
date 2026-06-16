"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Zap, Crown, Sparkles, ExternalLink, Lock, Instagram, Loader2 } from "lucide-react";
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";
import { clsx } from "clsx";

interface PlanDef {
  key: Plan;
  name: string;
  price: string;
  period: string;
  icon: React.ReactNode;
  tagline: string;
  features: string[];
  locked: string[];
  cta: string | null;
  color: string;
  highlight: boolean;
  badge?: string;
}

const PLANS: PlanDef[] = [
  {
    key: "free",
    name: "Free",
    price: "€0",
    period: "/month",
    icon: <Sparkles className="w-5 h-5 text-white/40" />,
    tagline: "Everything you need to get started.",
    features: [
      `${PLAN_LIMITS.free.posts_per_month} posts / month`,
      `Up to ${PLAN_LIMITS.free.max_slides} slides per post`,
      "Square & Portrait formats",
      "Classic text layout",
      "Modern font (Poppins)",
      "Minimal & Balanced text modes",
      "HD image generation",
      "Social captions & hashtags",
      "7-day post history",
    ],
    locked: [
      "Story & Wide formats",
      "Banner, Quote & Minimal layouts",
      "Editorial font (DM Serif Display)",
      "Detailed text mode",
      "Custom accent color",
      "@handle watermark",
      "ZIP download",
    ],
    cta: null,
    color: "border-white/10",
    highlight: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: "€9",
    period: "/month",
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    tagline: "All features unlocked. Serious creators.",
    features: [
      `${PLAN_LIMITS.pro.posts_per_month} posts / month`,
      `Up to ${PLAN_LIMITS.pro.max_slides} slides per post`,
      "All 4 formats — Square, Portrait, Story, Wide",
      "All 4 text layouts",
      "Both fonts incl. Editorial DM Serif",
      "All text modes incl. Detailed",
      "Custom accent color picker",
      "@handle watermark on every image",
      "ZIP download of all slides",
      "30-day post history",
      "Direct Instagram posting",
    ],
    locked: [
      "Priority generation queue",
      "Instagram post scheduling",
    ],
    cta: "Upgrade to Pro",
    color: "border-brand-500/40",
    highlight: true,
    badge: "Most popular",
  },
  {
    key: "creator",
    name: "Creator",
    price: "€29",
    period: "/month",
    icon: <Crown className="w-5 h-5 text-yellow-300" />,
    tagline: "Unlimited power for professional creators.",
    features: [
      "Unlimited posts",
      `Up to ${PLAN_LIMITS.creator.max_slides} slides per post`,
      "All formats, layouts & fonts",
      "All text modes & customisation",
      "Custom accent color picker",
      "@handle watermark",
      "ZIP download",
      "Priority generation queue",
      "Unlimited post history",
      "Direct Instagram posting",
      "Instagram scheduling (coming soon)",
      "API access (coming soon)",
    ],
    locked: [],
    cta: "Go Creator",
    color: "border-purple-500/30",
    highlight: false,
  },
];

function SearchParamToasts() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("success")) {
      fetch("/api/billing/sync", { method: "POST" })
        .then(async (res) => {
          const data = (await res.json()) as {
            plan?: string;
            synced?: boolean;
            error?: string;
            priceId?: string;
          };
          if (data.synced && data.plan && data.plan !== "free") {
            toast.success("Subscription activated! Your plan has been upgraded.");
          } else if (data.error?.includes("Unknown Stripe price") || data.priceId) {
            toast.error(
              "Payment received, but the price ID is not configured on the server. Check STRIPE_PRO_PRICE_ID in .env.local."
            );
          } else {
            toast.success("Subscription activated! Your plan has been upgraded.");
          }
          // Remove ?success=1 from URL so sync doesn't re-run on back/refresh.
          router.replace("/dashboard/billing");
          router.refresh();
        })
        .catch(() => {
          toast.success("Payment received! Refreshing your plan…");
          router.replace("/dashboard/billing");
          router.refresh();
        });
    }
    if (searchParams.get("canceled")) {
      toast.info("Checkout canceled.");
      router.replace("/dashboard/billing");
    }
    const ig = searchParams.get("instagram");
    if (ig === "connected") {
      toast.success("Instagram account connected successfully!");
    } else if (ig === "denied") {
      toast.info("Instagram connection cancelled.");
    } else if (ig === "error") {
      const msg = searchParams.get("msg") ?? "Instagram connection failed.";
      toast.error(decodeURIComponent(msg));
    }
  }, [searchParams, router]);
  return null;
}

export default function BillingClient({
  currentPlan,
  stripeEnabled = false,
  hasStripeCustomer = false,
  instagramConnected = false,
  instagramUsername = null,
  instagramConfigured = false,
}: {
  currentPlan: Plan;
  stripeEnabled?: boolean;
  hasStripeCustomer?: boolean;
  instagramConnected?: boolean;
  instagramUsername?: string | null;
  instagramConfigured?: boolean;
}) {
  const [loading, setLoading]             = useState<string | null>(null);
  const [igLoading, setIgLoading]         = useState(false);
  const [igConnected, setIgConnected]     = useState(instagramConnected);
  const [igUsername, setIgUsername]       = useState(instagramUsername);
  const router = useRouter();

  // Recover plan when checkout succeeded but webhook/sync lagged.
  useEffect(() => {
    if (!stripeEnabled || !hasStripeCustomer || currentPlan !== "free") return;
    fetch("/api/billing/sync", { method: "POST" })
      .then(async (res) => {
        const data = (await res.json()) as { plan?: string; synced?: boolean };
        if (data.synced && data.plan && data.plan !== "free") router.refresh();
      })
      .catch(() => {});
  }, [stripeEnabled, hasStripeCustomer, currentPlan, router]);

  async function handleUpgrade(planKey: Plan) {
    setLoading(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (res.status === 409) {
        toast.info("You're already on this plan.");
        setLoading(null);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed");
      // Already has active sub — send to portal to change plan instead.
      if (data.redirect_to_portal) {
        const portalRes = await fetch("/api/billing/portal", { method: "POST" });
        const portalData = await portalRes.json();
        if (!portalRes.ok) throw new Error(portalData.error ?? "Failed to open portal");
        window.location.href = portalData.url;
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open checkout");
      setLoading(null);
    }
  }

  async function handleInstagramDisconnect() {
    setIgLoading(true);
    try {
      const res = await fetch("/api/instagram/disconnect", { method: "DELETE" });
      if (!res.ok) throw new Error("Disconnect failed");
      setIgConnected(false);
      setIgUsername(null);
      toast.success("Instagram account disconnected.");
    } catch {
      toast.error("Failed to disconnect. Please try again.");
    } finally {
      setIgLoading(false);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <Suspense fallback={null}>
        <SearchParamToasts />
      </Suspense>

      <div className="mb-8">
        <h1 className="text-xl font-bold">Billing &amp; Plans</h1>
        <p className="text-white/50 text-sm mt-1">
          {stripeEnabled
            ? "Manage your subscription and upgrade your plan."
            : "You're on the Free plan. Paid upgrades will be available once billing is enabled."}
        </p>
      </div>

      {!stripeEnabled && (
        <div className="mb-6 glass rounded-xl px-4 py-3 text-sm text-white/60 border border-white/10">
          Billing is not configured yet — all features run on the Free plan for now.
        </div>
      )}

      {/* ── Plan cards ── */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.key;

          return (
            <div
              key={plan.key}
              className={clsx(
                "relative rounded-2xl p-6 flex flex-col gap-4 border transition-all",
                plan.highlight ? "bg-brand-600/10" : "glass",
                plan.color,
                isActive && "ring-1 ring-brand-400/50"
              )}
            >
              {plan.badge && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-brand-500 text-white px-3 py-1 rounded-full font-medium whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-green-600 text-white px-3 py-1 rounded-full font-medium whitespace-nowrap">
                  Current plan
                </div>
              )}

              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {plan.icon}
                  <span className="font-bold">{plan.name}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
                <p className="text-white/40 text-xs">{plan.tagline}</p>
              </div>

              {/* Included features */}
              <ul className="space-y-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Locked / not-included */}
              {plan.locked.length > 0 && (
                <ul className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  {plan.locked.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/30">
                      <Lock className="w-3 h-3 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              {plan.cta && !isActive ? (
                <button
                  onClick={() =>
                    stripeEnabled
                      ? handleUpgrade(plan.key)
                      : toast.info("Billing coming soon")
                  }
                  disabled={loading === plan.key || !stripeEnabled}
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

      {/* ── Feature comparison table ── */}
      <div className="glass rounded-2xl p-5 mb-6 border border-white/[0.06]">
        <h2 className="font-semibold text-sm mb-4">Feature comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs border-b border-white/[0.06]">
                <th className="text-left pb-3 font-medium">Feature</th>
                <th className="text-center pb-3 font-medium w-20">Free</th>
                <th className="text-center pb-3 font-medium w-20 text-brand-300">Pro</th>
                <th className="text-center pb-3 font-medium w-24 text-yellow-300">Creator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {(
                [
                  { label: "Posts / month",       free: "10",       pro: "100",     creator: "Unlimited" },
                  { label: "Max slides",           free: "3",        pro: "10",      creator: "10"        },
                  { label: "Formats",              free: "2",        pro: "All 4",   creator: "All 4"     },
                  { label: "Templates",            free: "Classic",  pro: "All 4",   creator: "All 4"     },
                  { label: "Fonts",                free: "Modern",   pro: "Both",    creator: "Both"      },
                  { label: "Text modes",           free: "2 of 3",   pro: "All 3",   creator: "All 3"     },
                  { label: "Custom accent",        free: false,      pro: true,      creator: true        },
                  { label: "Watermark",            free: false,      pro: true,      creator: true        },
                  { label: "ZIP download",         free: false,      pro: true,      creator: true        },
                  { label: "Priority queue",       free: false,      pro: false,     creator: true        },
                  { label: "Post history",         free: "7 days",   pro: "30 days", creator: "Unlimited" },
                  { label: "Instagram posting",    free: false,      pro: true,      creator: true        },
                  { label: "Instagram scheduling", free: false,      pro: false,     creator: "Soon"      },
                  { label: "API access",           free: false,      pro: false,     creator: "Soon"      },
                ] as const
              ).map((row) => (
                <tr key={row.label}>
                  <td className="py-2.5 text-white/60">{row.label}</td>
                  {([row.free, row.pro, row.creator] as (boolean | string)[]).map((val, i) => (
                    <td key={i} className="py-2.5 text-center">
                      {val === true ? (
                        <Check className="w-3.5 h-3.5 text-green-400 mx-auto" />
                      ) : val === false ? (
                        <X className="w-3.5 h-3.5 text-white/15 mx-auto" />
                      ) : (
                        <span
                          className={clsx(
                            "text-xs",
                            i === 0
                              ? "text-white/50"
                              : i === 1
                              ? "text-brand-300"
                              : "text-yellow-200"
                          )}
                        >
                          {val}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Connected Accounts ── */}
      <div className="glass rounded-2xl p-5 mb-6 border border-white/[0.06]">
        <h2 className="font-semibold text-sm mb-4">Connected Accounts</h2>

        <div className="flex items-center justify-between gap-4">
          {/* Left: branding + status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#E4405F]/20 to-[#f77737]/20 border border-[#E4405F]/20 shrink-0">
              <Instagram className="w-5 h-5 text-[#E4405F]" />
            </div>
            <div>
              <p className="text-sm font-medium">Instagram</p>
              {igConnected && igUsername ? (
                <p className="text-xs text-white/40 mt-0.5">
                  Connected as <span className="text-white/60">@{igUsername}</span>
                </p>
              ) : (
                <p className="text-xs text-white/30 mt-0.5">
                  {!PLAN_LIMITS[currentPlan].instagram_posting
                    ? "Requires Pro or Creator plan"
                    : "Not connected"}
                </p>
              )}
            </div>
          </div>

          {/* Right: action */}
          {igConnected ? (
            <button
              onClick={handleInstagramDisconnect}
              disabled={igLoading}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-red-400 border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            >
              {igLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {igLoading ? "Disconnecting…" : "Disconnect"}
            </button>
          ) : PLAN_LIMITS[currentPlan].instagram_posting ? (
            !instagramConfigured ? (
              <span className="text-xs text-white/25 italic">
                Not configured by admin
              </span>
            ) : (
              <a
                href="/api/instagram/connect?return_to=/dashboard/billing"
                className="flex items-center gap-1.5 text-xs font-medium bg-[#E4405F]/15 hover:bg-[#E4405F]/25 border border-[#E4405F]/30 text-[#E4405F] px-3 py-1.5 rounded-lg transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                Connect
              </a>
            )
          ) : (
            <a
              href="/dashboard/billing"
              className="flex items-center gap-1 text-xs text-white/25 hover:text-white/40 transition-colors"
            >
              <Lock className="w-3 h-3" />
              Upgrade to unlock
            </a>
          )}
        </div>

        {/* Explainer */}
        <p className="text-[11px] text-white/25 mt-4 leading-relaxed">
          Instagram posting requires a <strong className="text-white/40">Business or Creator</strong> account
          linked to a Facebook Page. After connecting, use the{" "}
          <span className="text-white/40">Post to Instagram</span> button in the Create page to publish directly.
          {PLAN_LIMITS[currentPlan].instagram_scheduling && (
            <> <span className="text-yellow-400/60">Post scheduling</span> is coming soon for Creator plans.</>
          )}
        </p>
      </div>

      {/* ── Billing portal ── */}
      {currentPlan !== "free" && (
        <div className="glass rounded-2xl p-5 flex items-center justify-between border border-white/[0.06]">
          <div>
            <p className="font-medium">Billing history &amp; invoices</p>
            <p className="text-white/50 text-sm">
              View invoices, update payment method, or cancel.
            </p>
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
