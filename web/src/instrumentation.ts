/**
 * Next.js server-startup hook. Runs once when the Node server boots.
 *
 * On a long-running self-hosted deploy there is no external cron (Vercel Cron
 * doesn't exist on a homeserver), so when ENABLE_INTERNAL_CRON=true we poll for
 * due scheduled posts in-process. The publish path is idempotent — each entry
 * is claimed with an atomic status transition — so an overlapping tick or a
 * second replica can never double-publish.
 */
export async function register() {
  // Only the Node.js runtime can touch Postgres / the publish path.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.ENABLE_INTERNAL_CRON !== "true") return;

  const intervalMs = Number(process.env.INTERNAL_CRON_INTERVAL_MS) || 60_000;

  // Avoid importing the scheduler (and its pg pool) on edge/build.
  const { publishDueScheduledPosts } = await import("@/lib/scheduler");

  let running = false;
  const tick = async () => {
    if (running) return; // never overlap a slow run with the next tick
    running = true;
    try {
      await publishDueScheduledPosts();
    } catch (err) {
      console.error("[internal-cron] publish run failed:", err);
    } finally {
      running = false;
    }
  };

  // Kick off shortly after boot, then on a fixed interval.
  setTimeout(tick, 15_000);
  setInterval(tick, intervalMs);
  console.log(`[internal-cron] enabled — polling every ${intervalMs}ms`);
}
