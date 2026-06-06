"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Sparkles, PlusCircle, Clock, CreditCard, LayoutDashboard } from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { href: "/dashboard/create", label: "Create", icon: PlusCircle },
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-60 glass border-r border-white/10 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <Sparkles className="w-5 h-5 text-brand-400" />
        <span className="font-bold text-base gradient-text">Prompt2Post</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
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

      {/* User */}
      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <UserButton
          appearance={{
            variables: { colorPrimary: "#6750f8" },
          }}
        />
        <span className="text-xs text-white/40">Account</span>
      </div>
    </aside>
  );
}
