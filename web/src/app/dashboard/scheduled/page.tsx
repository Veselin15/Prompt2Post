import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureDbUser } from "@/lib/ensure-user";
import { getScheduledPostsByUser } from "@/lib/db";
import { publishDueScheduledPosts } from "@/lib/scheduler";
import { PLAN_LIMITS } from "@/types";
import { CalendarClock, Zap } from "lucide-react";
import ScheduledClient from "./ScheduledClient";

export default async function ScheduledPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) redirect("/sign-in");

  const limits = PLAN_LIMITS[dbUser.plan];

  // Opportunistic publish: any of this user's posts that came due while no cron
  // was running get published right now, so the list below is always truthful.
  if (limits.instagram_scheduling) {
    await publishDueScheduledPosts(userId).catch(() => {});
  }

  const scheduled = limits.instagram_scheduling
    ? await getScheduledPostsByUser(userId)
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600/15 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-brand-400" />
          </div>
          <h1 className="text-xl font-bold">Scheduled posts</h1>
        </div>
        <p className="text-white/50 text-sm mt-2">
          Queue posts for Instagram and they publish automatically at the chosen time.
        </p>
      </div>

      {!limits.instagram_scheduling ? (
        <div className="glass rounded-2xl p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-yellow-300" />
          </div>
          <h2 className="font-semibold mb-2">Scheduling is a Creator feature</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-5">
            Generate a post, pick a date and time, and Prompt2Post publishes it to your Instagram
            automatically — even while you sleep. Available on the Creator plan.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Upgrade to Creator
          </Link>
        </div>
      ) : (
        <ScheduledClient
          initial={scheduled}
          instagramConnected={!!dbUser.instagram_user_id}
        />
      )}
    </div>
  );
}
