import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { mapChildToKid } from "@/lib/_data/mappers";
import { KidsPageClient } from "@/components/kids/KidsPageClient";

export default async function KidsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: children }, { data: rooms }] = await Promise.all([
    supabase
      .from("children")
      .select("*, rooms(name)")
      .eq("status", "active")
      .order("full_name"),
    supabase.from("rooms").select("id, name").order("name"),
  ]);

  const kids = (children ?? []).map((child) =>
    mapChildToKid(child, child.rooms?.name ?? "Sin sala")
  );

  return (
    <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-[34px]">
      <KidsPageClient initialKids={kids} rooms={rooms ?? []} />
    </div>
  );
}
