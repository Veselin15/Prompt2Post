"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import BrandLogo from "@/components/BrandLogo";
import {
  PlusCircle,
  Clock,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  CalendarClock,
  Menu,
  X,
  Search,
} from "lucide-react";
import { clsx } from "clsx";

/** Opens the global command palette by replaying its Ctrl+K hotkey. */
function openPalette() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
}

const NAV = [
  { href: "/dashboard/create", label: "Create", icon: PlusCircle },
  { href: "/dashboard/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/scheduled", label: "Scheduled", icon: CalendarClock },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-3 space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              active
                ? "bg-brand-600/25 text-brand-300 border border-brand-500/30"
                : "text-white/60 hover:text-white hover:bg-white/6"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 glass border-t-0 border-x-0">
        <BrandLogo />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-14 left-0 bottom-0 w-64 bg-[#0e0e16] border-r border-white/10 flex flex-col animate-fade-in">
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="p-4 border-t border-white/10 flex items-center gap-3">
              <UserButton appearance={{ variables: { colorPrimary: "#6750f8" } }} />
              <span className="text-xs text-white/40">Account</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col h-full w-60 glass border-r border-white/10 shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <BrandLogo />
        </div>
        <div className="px-3 pt-3">
          <button
            onClick={openPalette}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/35 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:text-white/60 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left text-xs">Quick jump…</span>
            <kbd className="text-[10px] bg-white/[0.06] border border-white/10 rounded px-1.5 py-0.5">
              Ctrl K
            </kbd>
          </button>
        </div>
        <NavLinks pathname={pathname} />
        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <UserButton appearance={{ variables: { colorPrimary: "#6750f8" } }} />
          <span className="text-xs text-white/40">Account</span>
        </div>
      </aside>
    </>
  );
}
