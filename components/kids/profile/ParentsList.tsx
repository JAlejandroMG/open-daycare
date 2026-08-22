import type { Parent } from "@/lib/_data/types";
import { ParentCard } from "./ParentCard";
import { LinkParentButton } from "./LinkParentButton";

type ParentsListProps = {
  parents: Parent[];
};

export function ParentsList({ parents }: ParentsListProps) {
  return (
    <div className="rounded-2xl border border-[#ECE0D0] bg-[#FFFDF9] p-4">
      <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
        PADRES VINCULADOS
      </div>
      <div className="flex flex-col gap-[14px]">
        {parents.map((parent) => (
          <ParentCard key={parent.id} parent={parent} />
        ))}
        <LinkParentButton />
      </div>
    </div>
  );
}
