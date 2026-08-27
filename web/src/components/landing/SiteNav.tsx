"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export type NavLink = { href: string; label: string };

/**
 * The one navigation bar for every public page. It floats as a rounded pill
 * over the hero and only grows a solid backdrop once the page has scrolled,
 * so the top of the page reads as a single uninterrupted composition.
 *
 * `auth` is a slot rather than a hard-coded pair of buttons: the homepage
 * passes Clerk's <SignedIn>/<SignedOut> buttons, while the static marketing
 * pages pass plain links so they never pull Clerk into their bundle.
 */
export default function SiteNav({
  links,
  auth,
}: {
  links: NavLink[];
  auth: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the open mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 pt-3 sm:pt-4">
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-3 sm:px-4 py-2.5 transition-all duration-300 ${
            scrolled
              ? "glass shadow-[0_10px_40px_-24px_rgba(0,0,0,0.9)]"
              : "border border-transparent bg-transparent"
          }`}
        >
          <BrandLogo iconSize={36} textClassName="text-[17px]" />

          <div className="hidden md:flex items-center gap-1 text-sm">
            {links.map((l) =>
              l.href.startsWith("#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-1.5 text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-1.5 text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {l.label}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-2 min-h-[36px]">
            <div className="hidden sm:flex items-center gap-2">{auth}</div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="glass absolute inset-x-3 top-20 rounded-2xl p-3 animate-pop">
            <div className="flex flex-col">
              {links.map((l) =>
                l.href.startsWith("#") ? (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-[15px] text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-[15px] text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {l.label}
                  </Link>
                )
              )}
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3 sm:hidden">
              {auth}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
