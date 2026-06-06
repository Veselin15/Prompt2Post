import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPostsByUser } from "@/lib/db";
import { ensureDbUser } from "@/lib/ensure-user";
import { PLAN_LIMITS } from "@/types";
import { PlusCircle, ArrowRight, LayoutGrid, Zap, CreditCard } from "lucide-react";

export default async function DashboardOverview() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    ensureDbUser(userId),
  ]);

  if (!dbUser) redirect("/sign-in");

  const recentPosts = await getPostsByUser(userId, 4);
  const limits = PLAN_LIMITS[dbUser.plan];
  const postsLeft = limits.posts_per_month === Infinity
    ? Infinity
    : Math.max(0, limits.posts_per_month - dbUser.posts_this_month);
  const usagePct = limits.posts_per_month === Infinity
    ? 0
    : Math.min(100, (dbUser.posts_this_month / limits.posts_per_month) * 100);

  const name = clerkUser?.firstName ?? "there";

  return (
    <div className="p-8 max-w-4xl mx-auto">
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

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/create"
          className="flex items-center gap-3 glass hover:bg-white/8 rounded-2xl p-5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="font-semibold text-sm">New post</div>
            <div className="text-white/40 text-xs">Generate from topic</div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto transition-colors" />
        </Link>

        <Link
          href="/dashboard/history"
          className="flex items-center gap-3 glass hover:bg-white/8 rounded-2xl p-5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="font-semibold text-sm">History</div>
            <div className="text-white/40 text-xs">{recentPosts.length} recent posts</div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto transition-colors" />
        </Link>

        <Link
          href="/dashboard/billing"
          className="flex items-center gap-3 glass hover:bg-white/8 rounded-2xl p-5 transition-colors group"
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
      {recentPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent posts</h2>
            <Link href="/dashboard/history" className="text-brand-400 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="glass rounded-xl p-4 hover:bg-white/8 transition-colors">
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
                      {post.num_slides} slides · {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
