import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getPostsByUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));
  const offset = Number(searchParams.get("offset") ?? 0);

  const posts = await getPostsByUser(userId, limit, offset);
  return NextResponse.json({ posts });
}
