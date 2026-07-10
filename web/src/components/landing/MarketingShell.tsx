import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import SiteFooter from "@/components/landing/SiteFooter";

/**
 * Shared frame for public marketing subpages (/features, /pricing, /blog,
 * /for/*). Unlike the homepage nav it skips Clerk entirely, so these pages
 * stay fully static — important for crawl speed and Core Web Vitals.
 */
export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <div className="ambient" aria-hidden />
      <div className="grid-fade" aria-hidden />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-t-0 border-l-0 border-r-0">
        <BrandLogo iconSize={42} textClassName="text-xl" />
        <div className="hidden md:flex items-center gap-7 text-sm text-white/55">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="btn-shine text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Start free
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-28 pb-20">{children}</main>

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
    <section className="max-w-4xl mx-auto px-6 mt-20">
      <div className="relative panel-strong rounded-3xl p-10 sm:p-12 text-center overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl font-black mb-3">{title}</h2>
          <p className="text-white/55 mb-7 max-w-lg mx-auto">{subtitle}</p>
          <Link
            href="/sign-up"
            className="btn-shine inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-brand-700/25"
          >
            Start creating free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
