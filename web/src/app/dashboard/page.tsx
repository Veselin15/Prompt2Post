import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPostsByUser, getUserPostStats, countQueuedScheduled, getDailyPostCounts } from "@/lib/db";
import { ensureDbUser } from "@/lib/ensure-user";
import { publishDueScheduledPosts } from "@/lib/scheduler";
import { PLAN_LIMITS, POST_FORMATS, resolveFormat } from "@/types";
import CountUp from "@/components/dashboard/CountUp";
import {
  PlusCircle,
  ArrowRight,
  LayoutGrid,
  Zap,
  CreditCard,
  Lightbulb,
  CalendarClock,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  Rocket,
  Activity,
} from "lucide-react";

export default async function DashboardOverview() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    ensureDbUser(userId),
  ]);

  if (!dbUser) redirect("/sign-in");

  const limits = PLAN_LIMITS[dbUser.plan];

  // Opportunistic publish of any due scheduled posts (local-dev cron fallback).
  if (limits.instagram_scheduling) {
    await publishDueScheduledPosts(userId).catch(() => {});
  }

  const [recentPosts, stats, queuedCount, activity] = await Promise.all([
    getPostsByUser(userId, 4),
    getUserPostStats(userId),
    countQueuedScheduled(userId),
    getDailyPostCounts(userId, 14),
  ]);

  const maxDaily = Math.max(1, ...activity.map((d) => d.count));
  const activityTotal = activity.reduce((sum, d) => sum + d.count, 0);

  const postsLeft = limits.posts_per_month === Infinity
    ? Infinity
    : Math.max(0, limits.posts_per_month - dbUser.posts_this_month);
  const usagePct = limits.posts_per_month === Infinity
    ? 0
    : Math.min(100, (dbUser.posts_this_month / limits.posts_per_month) * 100);

  const name = clerkUser?.firstName ?? "there";

  const statCards: { icon: React.ReactNode; label: string; value: number | "∞" }[] = [
    {
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      label: "Posts left this month",
      value: postsLeft === Infinity ? "∞" : postsLeft,
    },
    {
      icon: <Layers className="w-4 h-4 text-brand-400" />,
      label: "Posts created",
      value: stats.total_posts,
    },
    {
      icon: <ImageIcon className="w-4 h-4 text-purple-400" />,
      label: "Slides generated",
      value: stats.total_slides,
    },
    {
      icon: <CalendarClock className="w-4 h-4 text-green-400" />,
      label: "Scheduled",
      value: queuedCount,
    },
  ];

  // ── Onboarding checklist — built from real account state ──
  const checklist = [
    {
      label: "Generate your first post",
      desc: "Type a topic, get a finished carousel",
      done: stats.total_posts > 0,
      href: "/dashboard/create",
    },
    {
      label: "Save your Brand Kit",
      desc: "Make every post start in your style",
      done: !!dbUser.brand_kit,
      href: "/dashboard/brand-kit",
    },
    ...(limits.instagram_posting
      ? [{
          label: "Connect Instagram",
          desc: "Publish carousels without leaving the app",
          done: !!dbUser.instagram_user_id,
          href: "/dashboard/scheduled",
        }]
      : []),
    ...(limits.instagram_scheduling
      ? [{
          label: "Schedule a post",
          desc: "Queue it — it publishes itself",
          done: queuedCount > 0,
          href: "/dashboard/create",
        }]
      : []),
  ];
  const checklistDone = checklist.filter((c) => c.done).length;
  const showChecklist = checklistDone < checklist.length;

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hey, {name} 👋</h1>
        <p className="text-white/50 text-sm mt-1">
          Ready to create? You have{" "}
          <span className="text-white font-medium">
            {postsLeft === Infinity ? "unlimited" : postsLeft}
          </span>{" "}
          posts left this month.
        </p>
      </div>

      {/* Onboarding checklist */}
      {showChecklist && (
        <div className="glass rounded-2xl p-5 mb-8 border border-brand-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-brand-400" />
              <span className="font-semibold text-sm">Get set up</span>
            </div>
            <span className="text-xs text-white/40">
              {checklistDone} / {checklist.length} done
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${(checklistDone / checklist.length) * 100}%` }}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {checklist.map((item) =>
              item.done ? (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/[0.03] opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium line-through text-white/50">{item.label}</p>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors group"
                >
                  <Circle className="w-4 h-4 text-white/20 group-hover:text-brand-400 shrink-0 transition-colors" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/80">{item.label}</p>
                    <p className="text-[10px] text-white/35 truncate">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/50 ml-auto shrink-0 transition-colors" />
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="glass hover-lift rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">{s.icon}</div>
            <div className="text-2xl font-black leading-none">
              {s.value === "∞" ? "∞" : <CountUp value={s.value} />}
            </div>
            <div className="text-white/40 text-[11px] mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity — posts per day, trailing 2 weeks */}
      {activityTotal > 0 && (
        <div className="glass rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              <span className="font-medium text-sm">Activity</span>
            </div>
            <span className="text-xs text-white/40">
              {activityTotal} post{activityTotal !== 1 ? "s" : ""} in the last 14 days
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {activity.map((d) => {
              const date = new Date(`${d.day}T00:00:00`);
              const label = `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${d.count} post${d.count !== 1 ? "s" : ""}`;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group" title={label}>
                  <div className="w-full h-16 flex items-end">
                    <div
                      className={
                        d.count > 0
                          ? "w-full rounded-t-md bg-gradient-to-t from-brand-600 to-purple-500 group-hover:from-brand-500 group-hover:to-purple-400 transition-colors"
                          : "w-full rounded-t-md bg-white/[0.06]"
                      }
                      style={{ height: d.count > 0 ? `${Math.max(12, (d.count / maxDaily) * 100)}%` : "4px" }}
                    />
                  </div>
                  <span className="text-[9px] text-white/25">
                    {date.toLocaleDateString("en-US", { weekday: "narrow" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/create"
          className="flex items-center gap-3 glass hover-lift hover:bg-white/8 rounded-2xl p-5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="font-semibold text-sm">New post</div>
            <div className="text-white/40 text-xs">Generate from a topic</div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto transition-colors" />
        </Link>

        <Link
          href="/dashboard/ideas"
          className="flex items-center gap-3 glass hover-lift hover:bg-white/8 rounded-2xl p-5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-400/15 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="font-semibold text-sm">Idea Studio</div>
            <div className="text-white/40 text-xs">AI brainstorms your next 6 posts</div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto transition-colors" />
        </Link>

        <Link
          href="/dashboard/history"
          className="flex items-center gap-3 glass hover-lift hover:bg-white/8 rounded-2xl p-5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="font-semibold text-sm">History</div>
            <div className="text-white/40 text-xs">{stats.total_posts} post{stats.total_posts !== 1 ? "s" : ""} total</div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto transition-colors" />
        </Link>

        <Link
          href="/dashboard/billing"
          className="flex items-center gap-3 glass hover-lift hover:bg-white/8 rounded-2xl p-5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="font-semibold text-sm">Plan: {limits.label}</div>
            <div className="text-white/40 text-xs">
              {limits.posts_per_month === Infinity ? "Unlimited" : `${limits.posts_per_month} posts/mo`}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto transition-colors" />
        </Link>
      </div>

      {/* Usage bar */}
      {limits.posts_per_month !== Infinity && (
        <div className="glass rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-sm">Monthly usage</span>
            </div>
            <span className="text-white/50 text-sm">
              {dbUser.posts_this_month} / {limits.posts_per_month}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usagePct > 80 ? "bg-red-500" : "bg-brand-500"}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          {usagePct > 80 && (
            <p className="text-yellow-400 text-xs mt-2">
              Running low.{" "}
              <Link href="/dashboard/billing" className="underline">
                Upgrade to get more.
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Recent posts */}
      {recentPosts.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent posts</h2>
            <Link href="/dashboard/history" className="text-brand-400 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recentPosts.map((post) => {
              const fmt = POST_FORMATS[resolveFormat(post.structure?.format)];
              return (
                <Link
                  key={post.id}
                  href={`/dashboard/history/${post.id}`}
                  className="glass rounded-xl p-4 hover:bg-white/8 transition-colors block"
                >
                  <div className="flex items-start gap-3">
                    {post.slides[0]?.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.slides[0].image_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{post.topic}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {post.num_slides} slides · {fmt.label} ·{" "}
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-semibold text-white/80 mb-1">No posts yet</p>
          <p className="text-white/40 text-sm mb-4">
            Start with the Idea Studio if you need inspiration, or jump straight in.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create your first post
          </Link>
        </div>
      )}
    </div>
  );
}
