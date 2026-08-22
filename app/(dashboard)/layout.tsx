import { Sidebar } from "@/components/feed/Sidebar";
import { SidebarDrawer } from "@/components/feed/SidebarDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <SidebarDrawer />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
