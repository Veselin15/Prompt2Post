import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getUserById, upsertUser } from "@/lib/db";
import { rethrowDbError } from "@/lib/db-errors";
import type { User } from "@/types";

/**
 * Ensures the signed-in Clerk user exists in PostgreSQL.
 * Use this for local dev when Clerk webhooks cannot reach localhost.
 * In production, webhooks still sync users; this is a safe idempotent fallback.
 * Cached per request so layout + page don't hit the DB twice.
 */
export const ensureDbUser = cache(async (userId: string): Promise<User | null> => {
  try {
    const existing = await getUserById(userId);
    if (existing) return existing;

    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.id !== userId) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    return upsertUser({ id: userId, email });
  } catch (err) {
    rethrowDbError(err);
  }
});
