import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureDbUser } from "@/lib/ensure-user";
import { getPostsByUser } from "@/lib/db";
import { PLAN_LIMITS, resolveFormat } from "@/types";
import type { Plan } from "@/types";
import { Layers, PlusCircle, Lock } from "lucide-react";
import HistoryClient, { type HistoryItem } from "./HistoryClient";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) redirect("/sign-in");

  const planKey = (
    ["free", "pro", "creator"].includes(dbUser.plan) ? dbUser.plan : "free"
  ) as Plan;
  const limits = PLAN_LIMITS[planKey];

  // Compute the cut-off date for history_days (-1 = unlimited)
  let since: Date | undefined;
  if (limits.history_days !== -1) {
    since = new Date();
    since.setDate(since.getDate() - limits.history_days);
  }

  const posts = await getPostsByUser(userId, 50, 0, since);

  // Slim payload for the client-side search/filter grid.
  const items: HistoryItem[] = posts.map((post) => ({
    id: post.id,
    topic: post.topic,
    tone: post.tone ?? "",
    numSlides: post.num_slides,
    createdAt: new Date(post.created_at).toISOString(),
    format: resolveFormat(post.structure?.format),
    thumb: post.slides[0]?.image_url ?? null,
    hasZip: !!post.zip_url,
  }));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">History</h1>
          <p className="text-white/50 text-sm mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} shown
            {limits.history_days !== -1
              ? ` · last ${limits.history_days} days`
              : ""}
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New post
        </Link>
      </div>

      {/* History retention banner for non-Creator plans */}
      {limits.history_days !== -1 && (
        <div className="mb-5 flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/[0.06] text-sm">
          <Lock className="w-4 h-4 text-white/30 shrink-0" />
          <p className="text-white/50">
            <span className="text-white/70 font-medium">{PLAN_LIMITS[planKey].label} plan</span>
            {" "}— showing posts from the last {limits.history_days} days.{" "}
            {planKey === "free" ? (
              <>
                Pro keeps 30 days.{" "}
                <Link href="/dashboard/billing" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Upgrade for full history →
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/billing" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Upgrade to Creator for unlimited history →
                </Link>
              </>
            )}
          </p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <Layers className="w-7 h-7 text-white/20" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white/80">No posts yet</p>
            <p className="text-white/40 text-sm mt-1">
              {since
                ? `No posts in the last ${limits.history_days} days.`
                : "Create your first AI post to see it here."}
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
      ) : (
        <HistoryClient posts={items} />
      )}
    </div>
  );
}
