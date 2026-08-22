import type { Parent } from "@/lib/_data/types";

type ParentCardProps = {
  parent: Parent;
};

function StatusBadge({ status }: { status: "active" | "pending" }) {
  return (
    <span
      className={`rounded-full px-[9px] py-[4px] text-[10.5px] font-extrabold ${
        status === "active"
          ? "bg-[#CFEBD8] text-[#3E9B6C]"
          : "bg-[#F7E7A6] text-[#9A7B1E]"
      }`}
    >
      {status === "active" ? "ACTIVA" : "PENDIENTE"}
    </span>
  );
}

export function ParentCard({ parent }: ParentCardProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-heading text-base font-semibold text-white"
        style={{ backgroundColor: parent.avatarBackgroundColor }}
      >
        {parent.initial}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-extrabold text-[#3F362E]">
          {parent.name}
        </span>
        <span className="block text-[12.5px] text-[#A89A8B]">
          {parent.relation} ·{" "}
          {parent.status === "active" ? "activa" : "invitación enviada"}
        </span>
      </span>
      <StatusBadge status={parent.status} />
    </div>
  );
}
