import Sidebar from "@/components/dashboard/Sidebar";
import CommandPaletteLazy from "@/components/dashboard/CommandPaletteLazy";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      <Sidebar />
      <CommandPaletteLazy />
      {/* pt-14 clears the fixed mobile top bar; desktop has the sidebar instead */}
      <main className="relative flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
