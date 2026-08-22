import Link from "next/link";
import type { Kid } from "@/lib/_data/types";

type KidCardProps = {
  kid: Kid;
};

function AllergyBadge({ allergy }: { allergy: string }) {
  return (
    <span className="rounded-full bg-[#FBD8CC] px-[9px] py-[5px] text-[11px] font-extrabold text-[#D9684A]">
      {allergy}
    </span>
  );
}

function NavigateArrow() {
  return (
    <svg
      className="h-[18px] w-[18px] flex-none text-[#CBB89F]"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function KidCard({ kid }: KidCardProps) {
  const parentsLabel =
    kid.linkedParents === 0
      ? "sin padres vinculados"
      : kid.linkedParents === 1
        ? "1 padre vinculado"
        : `${kid.linkedParents} padres vinculados`;

  return (
    <Link
      href={`/kids/${kid.id}`}
      className="group flex items-center gap-4 rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition duration-150 hover:-translate-y-0.5 hover:border-[#F2A78E]"
    >
      <span
        className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-heading text-[19px] font-semibold"
        style={{
          backgroundColor: kid.avatarBackgroundColor,
          color: kid.avatarTextColor,
        }}
      >
        {kid.initial}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-[16px] font-semibold text-[#3F362E]">
          {kid.name}
        </span>
        <span className="block text-[13px] text-[#A89A8B]">
          {kid.age} · {parentsLabel}
        </span>
      </span>
      {kid.allergy ? (
        <AllergyBadge allergy={kid.allergy} />
      ) : (
        <NavigateArrow />
      )}
    </Link>
  );
}
