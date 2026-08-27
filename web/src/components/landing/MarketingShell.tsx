import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";

const LINKS = [
  { href: "/ai-instagram-carousel-generator", label: "Carousel generator" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

/**
 * Shared frame for public marketing subpages (/features, /pricing, /blog,
 * /for/*, and the keyword landing pages). Unlike the homepage nav it skips
 * Clerk entirely, so these pages stay fully static — important for crawl
 * speed and Core Web Vitals.
 */
export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <div className="ambient" aria-hidden />
      <div className="grid-fade" aria-hidden />
      <div className="grain" aria-hidden />

      <SiteNav
        links={LINKS}
        auth={
          <>
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-1.5 text-sm text-white/65 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link href="/sign-up" className="btn-primary px-4 py-2 text-sm">
              Start free
            </Link>
          </>
        }
      />

      <main className="relative z-10 pb-24 pt-32">{children}</main>

      <SiteFooter />
    </div>
  );
}

/** Reusable end-of-page conversion block for marketing subpages. */
export function MarketingCta({
  title = "Try it on your next post — free",
  subtitle = "Type one topic, get a finished carousel: copy, images, caption, hashtags. 3 free posts every month.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="mx-auto mt-24 max-w-4xl px-6">
      <div className="panel-strong relative overflow-hidden rounded-3xl p-10 text-center sm:p-14">
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#F07030]/15 blur-3xl" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            No card required
          </div>
          <h2 className="text-section mb-4">{title}</h2>
          <p className="mx-auto mb-8 max-w-lg leading-relaxed text-white/55">
            {subtitle}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/try" className="btn-primary px-7 py-3.5 text-base">
              Generate one free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sign-up" className="btn-secondary px-7 py-3.5 text-base">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
