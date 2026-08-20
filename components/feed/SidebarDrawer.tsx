"use client";

import { useEffect, useState } from "react";
import { SidebarContent } from "./SidebarContent";

type SidebarDrawerProps = {
  activeItem: string;
};

export function SidebarDrawer({ activeItem }: SidebarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-border-soft bg-sidebar text-foreground shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)] lg:hidden"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="animate-slide-in absolute left-0 top-0 flex h-full w-[248px] flex-col overflow-y-auto border-r border-border-soft bg-sidebar px-4 py-6">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F6ECDF] text-[#94887B]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent activeItem={activeItem} />
          </aside>
        </div>
      ) : null}
    </>
  );
}