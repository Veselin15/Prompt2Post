"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Lightbulb,
  LayoutDashboard,
  Clock,
  CalendarClock,
  CreditCard,
  Search,
  CornerDownLeft,
  Home,
} from "lucide-react";
import { clsx } from "clsx";

interface Command {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: React.ReactNode;
  keywords: string;
}

const COMMANDS: Command[] = [
  {
    id: "create",
    label: "Create a new post",
    hint: "Generate a carousel from a topic",
    href: "/dashboard/create",
    icon: <PlusCircle className="w-4 h-4 text-brand-400" />,
    keywords: "new post generate carousel make",
  },
  {
    id: "ideas",
    label: "Idea Studio",
    hint: "AI brainstorms six post ideas",
    href: "/dashboard/ideas",
    icon: <Lightbulb className="w-4 h-4 text-yellow-300" />,
    keywords: "ideas brainstorm inspiration niche",
  },
  {
    id: "overview",
    label: "Dashboard overview",
    hint: "Stats and quick actions",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4 text-white/60" />,
    keywords: "overview home stats dashboard",
  },
  {
    id: "history",
    label: "Post history",
    hint: "All your generated posts",
    href: "/dashboard/history",
    icon: <Clock className="w-4 h-4 text-purple-400" />,
    keywords: "history posts past previous archive",
  },
  {
    id: "scheduled",
    label: "Scheduled posts",
    hint: "Your publishing queue & calendar",
    href: "/dashboard/scheduled",
    icon: <CalendarClock className="w-4 h-4 text-green-400" />,
    keywords: "scheduled queue calendar publish",
  },
  {
    id: "billing",
    label: "Billing & plan",
    hint: "Manage your subscription",
    href: "/dashboard/billing",
    icon: <CreditCard className="w-4 h-4 text-white/60" />,
    keywords: "billing plan upgrade subscription payment",
  },
  {
    id: "landing",
    label: "Landing page",
    hint: "Back to the marketing site",
    href: "/",
    icon: <Home className="w-4 h-4 text-white/40" />,
    keywords: "landing home marketing site",
  },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q)
    );
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const run = useCallback(
    (cmd: Command) => {
      close();
      router.push(cmd.href);
    },
    [close, router]
  );

  // Global hotkey: Ctrl+K / Cmd+K toggles, Escape closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the active row in range when the result set shrinks.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh] px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={close}
      />
      <div className="relative w-full max-w-lg glass rounded-2xl border border-white/15 shadow-2xl shadow-black/60 overflow-hidden animate-pop">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-4 h-4 text-white/30 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                run(results[active]);
              }
            }}
            placeholder="Where to? Type to search…"
            className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/25 focus:outline-none"
          />
          <kbd className="text-[10px] text-white/30 bg-white/[0.06] border border-white/10 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No matches</p>
          ) : (
            results.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => run(cmd)}
                onMouseEnter={() => setActive(i)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                  i === active ? "bg-brand-600/20 border border-brand-500/25" : "border border-transparent"
                )}
              >
                <span className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                  {cmd.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-white/85">{cmd.label}</span>
                  <span className="block text-[11px] text-white/35 truncate">{cmd.hint}</span>
                </span>
                {i === active && <CornerDownLeft className="w-3.5 h-3.5 text-white/25 shrink-0" />}
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/[0.08] flex items-center gap-3 text-[10px] text-white/25">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">Ctrl+K anywhere</span>
        </div>
      </div>
    </div>
  );
}
