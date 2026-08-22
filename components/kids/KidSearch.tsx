"use client";

import { useState } from "react";
import type { Kid } from "@/lib/_data/types";
import { KidList } from "./KidList";

type KidSearchProps = {
  kids: Kid[];
};

export function KidSearch({ kids }: KidSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = kids.filter((kid) =>
    kid.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-[#ECE0D0] bg-[#FFFDF9] p-[12px]">
        <svg
          className="h-[18px] w-[18px] text-[#B0A290]"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Buscar niño…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
        />
      </div>

      <div className="mb-[14px] flex items-center gap-3">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#3F362E]">
          SALA SOLES
        </span>
        <span className="text-[13px] text-[#A89A8B]">{kids.length} niños</span>
        <span className="h-[1px] flex-1 bg-[#E7DAC8]" />
      </div>

      <KidList kids={filtered} />
    </div>
  );
}
