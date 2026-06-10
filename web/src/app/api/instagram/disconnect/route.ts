import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clearInstagramAccount } from "@/lib/db";

/**
 * DELETE /api/instagram/disconnect
 * Removes the stored Instagram credentials from the user's account.
 */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearInstagramAccount(userId);
  return NextResponse.json({ ok: true });
}
