import type { User } from "@supabase/supabase-js";
import { SidebarContent } from "./SidebarContent";

export function Sidebar({ user }: { user: User }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] flex-none flex-col border-r border-border-soft bg-sidebar px-4 py-6 lg:flex">
      <SidebarContent user={user} />
    </aside>
  );
}