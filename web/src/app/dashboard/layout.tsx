import { auth } from "@clerk/nextjs/server";
import Sidebar from "@/components/dashboard/Sidebar";
import { ensureDbUser } from "@/lib/ensure-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) {
    try {
      await ensureDbUser(userId);
    } catch (err) {
      console.error("Failed to sync user to database:", err);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
