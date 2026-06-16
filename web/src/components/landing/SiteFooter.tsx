import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <BrandLogo iconSize={38} textClassName="text-lg" />
        <nav className="flex items-center gap-6 text-white/55">
          <a href="/#features" className="hover:text-white transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <a href="mailto:support@prompt2post.app" className="hover:text-white transition-colors">Support</a>
        </nav>
      </div>
      <div className="border-t border-white/[0.06] py-5 text-center text-white/40 text-xs">
        © 2026 Prompt2Post. The AI content studio for Instagram creators.
      </div>
    </footer>
  );
}
