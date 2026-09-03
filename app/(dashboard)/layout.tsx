import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/feed/Sidebar";
import { SidebarDrawer } from "@/components/feed/SidebarDrawer";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <SidebarDrawer user={user} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
