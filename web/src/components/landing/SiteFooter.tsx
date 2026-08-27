import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { Mail } from "lucide-react";
import { TOOLS } from "@/lib/marketing/tools";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const PRODUCT_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/try", label: "Try free" },
  { href: "/blog", label: "Blog" },
  { href: "/sign-up", label: "Start free" },
];

/* Keyword landing pages. Linking them from every page in the site is what
   tells Google they matter — a page reachable only from the sitemap tends to
   be treated as an afterthought. */
const TOOL_LINKS = TOOLS.map((t) => ({ href: `/${t.slug}`, label: t.h1 }));

const USE_CASE_LINKS = [
  { href: "/for/fitness-coaches", label: "Fitness coaches" },
  { href: "/for/real-estate-agents", label: "Real estate agents" },
  { href: "/for/travel-creators", label: "Travel creators" },
  { href: "/for/food-bloggers", label: "Food bloggers" },
  { href: "/for/finance-creators", label: "Finance creators" },
  { href: "/for/coaches-consultants", label: "Coaches & consultants" },
];

const MORE_USE_CASE_LINKS = [
  { href: "/for/ecommerce-brands", label: "E-commerce brands" },
  { href: "/for/photographers", label: "Photographers" },
  { href: "/for/marketing-agencies", label: "Marketing agencies" },
  { href: "/for/beauty-creators", label: "Beauty & skincare" },
];

const RESOURCE_LINKS = [
  { href: "/blog/instagram-carousel-size-guide", label: "Carousel size guide" },
  { href: "/blog/how-to-make-instagram-carousel", label: "How to make a carousel" },
  { href: "/blog/instagram-carousel-ideas", label: "45 carousel ideas" },
  { href: "/blog/instagram-hashtags-2026", label: "Hashtags in 2026" },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 gap-8 text-sm md:grid-cols-6">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <BrandLogo iconSize={38} textClassName="text-lg" />
          <p className="text-white/40 text-xs leading-relaxed">
            The AI content studio for Instagram creators. One topic in, a whole carousel out.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/prompt2post.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Prompt2Post on Instagram"
              className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61590463905836"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Prompt2Post on Facebook"
              className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        <nav aria-label="AI tools">
          <h3 className="font-semibold text-white/80 mb-3">AI tools</h3>
          <ul className="space-y-2 text-white/50">
            {TOOL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Product">
          <h3 className="font-semibold text-white/80 mb-3">Product</h3>
          <ul className="space-y-2 text-white/50">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Use cases">
          <h3 className="font-semibold text-white/80 mb-3">Made for</h3>
          <ul className="space-y-2 text-white/50">
            {USE_CASE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="More use cases">
          <h3 className="font-semibold text-white/80 mb-3">Also for</h3>
          <ul className="space-y-2 text-white/50">
            {MORE_USE_CASE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Resources">
          <h3 className="font-semibold text-white/80 mb-3">Guides</h3>
          <ul className="space-y-2 text-white/50">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/[0.06] py-5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs">
          <span>© 2026 Prompt2Post. The AI content studio for Instagram creators.</span>
          <span className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <a
              href="mailto:support@prompt2post.app"
              className="inline-flex items-center gap-1.5 hover:text-white/70 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> support@prompt2post.app
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
