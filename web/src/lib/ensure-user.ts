import { currentUser } from "@clerk/nextjs/server";
import { getUserById, upsertUser } from "@/lib/db";
import type { User } from "@/types";

/**
 * Ensures the signed-in Clerk user exists in Supabase.
 * Use this for local dev when Clerk webhooks cannot reach localhost.
 * In production, webhooks still sync users; this is a safe idempotent fallback.
 */
export async function ensureDbUser(userId: string): Promise<User | null> {
  const existing = await getUserById(userId);
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  return upsertUser({ id: userId, email });
}
