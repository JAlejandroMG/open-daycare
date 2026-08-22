import type { Kid } from "@/lib/_data/types";

type KidProfileHeaderProps = {
  kid: Kid;
};

export function KidProfileHeader({ kid }: KidProfileHeaderProps) {
  return (
    <div className="flex items-center gap-[18px]">
      <span
        className="flex h-[84px] w-[84px] flex-none items-center justify-center rounded-full font-heading text-[34px] font-semibold"
        style={{
          backgroundColor: kid.avatarBackgroundColor,
          color: kid.avatarTextColor,
        }}
      >
        {kid.initial}
      </span>
      <span className="min-w-0 flex-1">
        <h1 className="font-heading text-[28px] font-semibold text-[#3F362E]">
          {kid.name}
        </h1>
        <p className="mt-[3px] text-[15px] text-[#94887B]">
          {kid.age} · {kid.room}
        </p>
      </span>
      {/* TODO: implementar formulario de editar niño */}
      <a
        href="/editar-nino"
        className="rounded-[12px] border border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#6E6359]"
      >
        Editar
      </a>
    </div>
  );
}
