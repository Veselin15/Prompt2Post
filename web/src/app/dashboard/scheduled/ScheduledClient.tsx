"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Instagram,
  Loader2,
  PlusCircle,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import type { ScheduledPost, ScheduledStatus } from "@/types";

interface Props {
  initial: ScheduledPost[];
  instagramConnected: boolean;
}

const STATUS_STYLE: Record<ScheduledStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  queued: {
    label: "Queued",
    cls: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    icon: <Clock className="w-3 h-3" />,
  },
  publishing: {
    label: "Publishing",
    cls: "bg-blue-400/10 text-blue-300 border-blue-400/20",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  published: {
    label: "Published",
    cls: "bg-green-400/10 text-green-300 border-green-400/20",
    icon: <Check className="w-3 h-3" />,
  },
  failed: {
    label: "Failed",
    cls: "bg-red-400/10 text-red-300 border-red-400/20",
    icon: <XCircle className="w-3 h-3" />,
  },
  canceled: {
    label: "Canceled",
    cls: "bg-white/5 text-white/40 border-white/10",
    icon: <X className="w-3 h-3" />,
  },
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Local-time yyyy-mm-dd key for grouping entries by calendar day. */
function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const DOT_COLOR: Record<ScheduledStatus, string> = {
  queued: "bg-amber-400",
  publishing: "bg-blue-400",
  published: "bg-green-400",
  failed: "bg-red-400",
  canceled: "bg-white/25",
};

// ── Month calendar ───────────────────────────────────────────────────────────

interface CalendarProps {
  items: ScheduledPost[];
  selectedDay: string | null;
  onSelectDay: (key: string | null) => void;
}

function ScheduleCalendar({ items, selectedDay, onSelectDay }: CalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const view = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthLabel = view.toLocaleString(undefined, { month: "long", year: "numeric" });

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>();
    for (const item of items) {
      const key = dayKey(new Date(item.scheduled_for));
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return map;
  }, [items]);

  // Build the grid: weeks start on Monday.
  const firstWeekday = (view.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)),
  ];
  const todayKey = dayKey(today);

  return (
    <div className="glass rounded-2xl p-4 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">{monthLabel}</p>
        <div className="flex items-center gap-1">
          {monthOffset !== 0 && (
            <button
              onClick={() => setMonthOffset(0)}
              className="text-[11px] text-white/40 hover:text-white/70 px-2 py-1 rounded-lg transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={() => setMonthOffset((m) => m - 1)}
            aria-label="Previous month"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMonthOffset((m) => m + 1)}
            aria-label="Next month"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/50 hover:text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="text-center text-[10px] text-white/25 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} />;
          const key = dayKey(date);
          const dayItems = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;
          return (
            <button
              key={key}
              onClick={() => dayItems.length > 0 && onSelectDay(isSelected ? null : key)}
              disabled={dayItems.length === 0}
              className={clsx(
                "aspect-square rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors border",
                isSelected
                  ? "bg-brand-600/25 border-brand-500/40 text-brand-200"
                  : dayItems.length > 0
                  ? "bg-white/[0.05] border-white/10 text-white/80 hover:bg-white/10 cursor-pointer"
                  : "border-transparent text-white/25",
                isToday && !isSelected && "border-brand-500/40"
              )}
            >
              <span className={clsx(isToday && "font-bold text-brand-300")}>{date.getDate()}</span>
              {dayItems.length > 0 && (
                <span className="flex gap-0.5">
                  {dayItems.slice(0, 3).map((it) => (
                    <span key={it.id} className={clsx("w-1 h-1 rounded-full", DOT_COLOR[it.status])} />
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[8px] text-white/40 leading-none">+</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/[0.06]">
        {(Object.keys(DOT_COLOR) as ScheduledStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-[10px] text-white/35 capitalize">
            <span className={clsx("w-1.5 h-1.5 rounded-full", DOT_COLOR[s])} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ScheduledClient({ initial, instagramConnected }: Props) {
  const [items, setItems] = useState<ScheduledPost[]>(initial);
  const [cancelingId, setCancelingId] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const visibleItems = selectedDay
    ? items.filter((s) => dayKey(new Date(s.scheduled_for)) === selectedDay)
    : items;

  async function cancel(id: string) {
    setCancelingId(id);
    try {
      const res = await fetch(`/api/instagram/schedule/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not cancel");
      }
      setItems((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "canceled" as const } : s))
      );
      toast.success("Schedule canceled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel");
    } finally {
      setCancelingId("");
    }
  }

  if (!instagramConnected) {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-[#E4405F]/10 flex items-center justify-center mx-auto mb-4">
          <Instagram className="w-5 h-5 text-[#E4405F]" />
        </div>
        <h2 className="font-semibold mb-2">Connect Instagram first</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-5">
          Link your Instagram Business or Creator account, then schedule any generated post from
          the Create page or post history.
        </p>
        <a
          href={`/api/instagram/connect?return_to=${encodeURIComponent("/dashboard/scheduled")}`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E4405F] to-[#f77737] hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
        >
          <Instagram className="w-4 h-4" />
          Connect Instagram
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
          <CalendarClock className="w-6 h-6 text-white/20" />
        </div>
        <div>
          <p className="font-semibold text-white/80">Nothing scheduled yet</p>
          <p className="text-white/40 text-sm mt-1 max-w-sm">
            Generate a post, open &ldquo;Post to Instagram&rdquo;, and pick a date — it will appear
            here and publish automatically.
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Create a post
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ScheduleCalendar items={items} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

      {selectedDay && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-white/40">
            Showing {visibleItems.length} post{visibleItems.length !== 1 ? "s" : ""} on{" "}
            <span className="text-white/70">
              {new Date(`${selectedDay}T00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
          <button
            onClick={() => setSelectedDay(null)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-3 h-3" />
            Show all
          </button>
        </div>
      )}

      <div className="space-y-3">
      {visibleItems.map((item) => {
        const status = STATUS_STYLE[item.status];
        return (
          <div
            key={item.id}
            className="glass rounded-2xl p-4 flex items-center gap-4"
          >
            {/* Thumbnail */}
            <Link
              href={`/dashboard/history/${item.post_id}`}
              className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 shrink-0 block"
            >
              {item.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumb} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white/15" />
                </div>
              )}
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/dashboard/history/${item.post_id}`}
                className="font-medium text-sm truncate block hover:text-brand-300 transition-colors"
              >
                {item.topic ?? "Post"}
              </Link>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {formatWhen(item.scheduled_for)}
                </span>
                <span>{item.image_urls.length} slide{item.image_urls.length > 1 ? "s" : ""}</span>
                {item.status === "published" && item.published_at && (
                  <span className="text-green-400/70">
                    live since {formatWhen(item.published_at)}
                  </span>
                )}
              </div>
              {item.status === "failed" && item.error && (
                <p className="text-[11px] text-red-400/80 mt-1 truncate" title={item.error}>
                  {item.error}
                </p>
              )}
            </div>

            {/* Status + actions */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={clsx(
                  "flex items-center gap-1.5 text-[11px] font-medium border px-2.5 py-1 rounded-full",
                  status.cls
                )}
              >
                {status.icon}
                {status.label}
              </span>
              {item.status === "queued" && (
                <button
                  onClick={() => cancel(item.id)}
                  disabled={cancelingId === item.id}
                  title="Cancel this schedule"
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-red-300 border border-white/10 hover:border-red-500/30 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelingId === item.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-[11px] text-white/25 text-center pt-2">
        Due posts publish automatically — via cron in production, or whenever you open the
        dashboard during local development.
      </p>
      </div>
    </div>
  );
}
