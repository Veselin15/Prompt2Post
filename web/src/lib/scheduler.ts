import {
  getDueScheduledPosts,
  claimScheduledPost,
  markScheduledPostPublished,
  markScheduledPostFailed,
  getUserById,
} from "@/lib/db";
import { postToInstagram, isInstagramConfigured } from "@/lib/instagram";
import { PLAN_LIMITS } from "@/types";

export interface PublishRunResult {
  checked: number;
  published: number;
  failed: number;
}

/**
 * Publish every queued schedule whose time has come.
 *
 * Safe to call from anywhere, any number of times: each entry is claimed with an
 * atomic status transition (queued → publishing), so concurrent runners never
 * double-publish. Designed to be triggered by:
 *   • a cron hit on /api/instagram/schedule/run (production), and
 *   • opportunistically when a user loads their dashboard (local dev fallback).
 *
 * @param userId — when given, only that user's due posts are processed.
 */
export async function publishDueScheduledPosts(userId?: string): Promise<PublishRunResult> {
  const result: PublishRunResult = { checked: 0, published: 0, failed: 0 };
  if (!isInstagramConfigured()) return result;

  const due = await getDueScheduledPosts(userId);
  result.checked = due.length;

  for (const entry of due) {
    const claimed = await claimScheduledPost(entry.id);
    if (!claimed) continue; // another runner got it first

    try {
      const owner = await getUserById(claimed.user_id);
      if (!owner?.instagram_user_id || !owner.instagram_access_token) {
        throw new Error("Instagram account is no longer connected");
      }
      if (!PLAN_LIMITS[owner.plan].instagram_scheduling) {
        throw new Error("Plan no longer includes scheduling");
      }

      const { mediaId } = await postToInstagram(
        owner.instagram_user_id,
        owner.instagram_access_token,
        claimed.image_urls,
        claimed.caption
      );
      await markScheduledPostPublished(claimed.id, mediaId);
      result.published++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publishing failed";
      await markScheduledPostFailed(claimed.id, message).catch(() => {});
      result.failed++;
    }
  }

  return result;
}
