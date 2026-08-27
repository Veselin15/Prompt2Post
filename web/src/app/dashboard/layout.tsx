import Sidebar from "@/components/dashboard/Sidebar";
import CommandPaletteLazy from "@/components/dashboard/CommandPaletteLazy";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#08080d]">
      <Sidebar />
      <CommandPaletteLazy />
      {/* pt-14 clears the fixed mobile top bar; desktop has the sidebar instead */}
      <main className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
