"use client";

import { useState } from "react";

type ParentRelationship = "Mamá" | "Papá" | "Tutor/a";

type LinkParentModalProps = {
  kidName: string;
  isOpen: boolean;
  onClose: () => void;
};

export function LinkParentModal({ kidName, isOpen, onClose }: LinkParentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState<ParentRelationship>("Mamá");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-6 pt-10 sm:pt-[40px]">
      <div className="w-full max-w-[480px] overflow-hidden rounded-3xl border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]">
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <div>
            <div className="font-[Fredoka] text-[18px] font-semibold text-[#3F362E]">
              Vincular padre
            </div>
            <div className="text-[13px] text-[#A89A8B]">a {kidName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-[26px] py-[22px]">
          <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] p-[13px] pr-4">
            <svg
              className="mt-[1px] flex-none"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4E72C8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
              Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {kidName}.
            </span>
          </div>

          <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            NOMBRE DEL PADRE/MADRE
          </div>
          <input
            type="text"
            placeholder="Ej. Diego Fernández"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
          />

          <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            EMAIL
          </div>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
          />

          <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            PARENTESCO
          </div>
          <div className="mb-5 flex gap-[9px]">
            {(["Mamá", "Papá", "Tutor/a"] as const).map((rel) => (
              <button
                key={rel}
                type="button"
                onClick={() => setRelationship(rel)}
                className={`flex-1 rounded-full border-[1.5px] py-[11px] text-[14px] font-extrabold ${
                  relationship === rel
                    ? "border-[#9FB8EC] bg-[#CCD8F4] text-[#4E72C8]"
                    : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                }`}
              >
                {rel}
              </button>
            ))}
          </div>

          <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center">
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
              CÓDIGO DE INVITACIÓN
            </div>
            <div className="font-[Fredoka] text-[34px] font-semibold tracking-[7px] text-[#8A7234]">
              7K4P9
            </div>
            <div className="mt-[6px] text-[13px] text-[#A88526]">Vence en 7 días</div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)]"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4z" />
              <path d="M22 2 11 13" />
            </svg>
            Enviar invitación
          </button>
        </div>
      </div>
    </div>
  );
}
