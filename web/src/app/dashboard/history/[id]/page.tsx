import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getPostById } from "@/lib/db";
import { ensureDbUser } from "@/lib/ensure-user";
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";
import PostDetailClient from "./PostDetailClient";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [dbUser, { id }] = await Promise.all([
    ensureDbUser(userId),
    params,
  ]);
  if (!dbUser) redirect("/sign-in");

  const post = await getPostById(id);
  if (!post || post.user_id !== userId) notFound();

  const planKey = (["free", "pro", "creator"].includes(dbUser.plan) ? dbUser.plan : "free") as Plan;
  const limits  = PLAN_LIMITS[planKey];

  return (
    <PostDetailClient
      post={post}
      canPostToInstagram={limits.instagram_posting}
      instagramConnected={!!dbUser.instagram_user_id}
      instagramUsername={dbUser.instagram_username}
      canScheduleInstagram={limits.instagram_scheduling}
    />
  );
}
