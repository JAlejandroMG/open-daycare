"use client";

import { useState } from "react";
import { kids } from "@/lib/_data/mock-data";
import { POST_TYPE_CONFIG } from "@/lib/_data/post-type-config";
import type { PostType } from "@/lib/_data/types";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [recipientKidId, setRecipientKidId] = useState<string>("");
  const [type, setType] = useState<PostType | "">("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const selectKid = (id: string) => {
    setRecipientKidId(id === recipientKidId ? "" : id);
  };

  const selectAll = () => {
    setRecipientKidId(recipientKidId === "all" ? "" : "all");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative z-10 mx-4 max-w-[580px] w-full overflow-hidden rounded-3xl border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]">
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-bold text-[#94887B]"
          >
            Cancelar
          </button>
          <span className="font-heading text-lg font-semibold text-[#3F362E]">
            Nueva publicación
          </span>
          <button
            type="button"
            className="text-[15px] font-extrabold text-[#D9583C]"
          >
            Publicar
          </button>
        </div>
        <div className="px-[26px] py-6">
          <div className="mb-[10px] text-xs font-extrabold tracking-[.7px] text-[#94887B]">
            PARA
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {kids.map((kid) => {
              const selected = recipientKidId === kid.id;
              return (
                <button
                  key={kid.id}
                  type="button"
                  onClick={() => selectKid(kid.id)}
                  className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-bold ${
                    selected
                      ? "border-[1.5px] border-[#3F362E] bg-[#3F362E] text-white"
                      : "border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                  }`}
                >
                  <span
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full font-heading text-[13px] font-semibold"
                    style={{
                      backgroundColor: kid.avatarBackgroundColor,
                      color: kid.avatarTextColor,
                    }}
                  >
                    {kid.initial}
                  </span>
                  {kid.name.split(" ")[0]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={selectAll}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                recipientKidId === "all"
                  ? "border-[1.5px] border-[#3F362E] bg-[#3F362E] text-white"
                  : "border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
              }`}
            >
              Toda la sala
            </button>
          </div>
          <div className="mb-[10px] text-xs font-extrabold tracking-[.7px] text-[#94887B]">
            TIPO
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {(Object.entries(POST_TYPE_CONFIG) as [PostType, (typeof POST_TYPE_CONFIG)[PostType]][]).map(
              ([key, config]) => {
                const selected = type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(selected ? "" : key)}
                    className={`rounded-full px-4 py-2 text-[13.5px] font-extrabold ${
                      selected
                        ? config.badgeClassName
                        : "border border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
                  >
                    {config.label}
                  </button>
                );
              }
            )}
          </div>
          <div className="mb-[10px] text-xs font-extrabold tracking-[.7px] text-[#94887B]">
            DESCRIPCIÓN
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contá cómo le fue hoy…"
            className="mb-[22px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white p-[14px_16px] text-[15px] leading-[1.5] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
