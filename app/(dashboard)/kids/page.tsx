import { kids } from "@/lib/_data/mock-data";
import { KidsHeader } from "@/components/kids/KidsHeader";
import { KidSearch } from "@/components/kids/KidSearch";

export default function KidsPage() {
  return (
    <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-[34px]">
      <KidsHeader />
      <KidSearch kids={kids} />
    </div>
  );
}
