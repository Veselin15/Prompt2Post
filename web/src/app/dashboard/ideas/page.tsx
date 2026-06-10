import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureDbUser } from "@/lib/ensure-user";
import IdeasClient from "./IdeasClient";

export default async function IdeasPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) redirect("/sign-in");

  return <IdeasClient />;
}
