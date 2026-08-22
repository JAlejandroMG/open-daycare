import type { Kid } from "@/lib/_data/types";
import { KidCard } from "./KidCard";

type KidListProps = {
  kids: Kid[];
};

export function KidList({ kids }: KidListProps) {
  return (
    <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
      {kids.map((kid) => (
        <KidCard key={kid.id} kid={kid} />
      ))}
    </div>
  );
}
