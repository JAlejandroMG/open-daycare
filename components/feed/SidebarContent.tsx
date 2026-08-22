"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser } from "@/lib/_data/mock-data";

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function KidsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
    </svg>
  );
}

function BellIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function AccountIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

type NavItem = {
  label: string;
  href: string;
  Icon: (props: IconProps) => React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Feed", href: "/", Icon: HomeIcon },
  { label: "Niños", href: "/kids", Icon: KidsIcon },
  { label: "Avisos", href: "/avisos", Icon: BellIcon },
  { label: "Mi cuenta", href: "/mi-cuenta", Icon: AccountIcon },
];

export function SidebarContent() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <Link href="/" className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
        <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[12px] bg-gradient-to-br from-[#F8C3A8] to-[#F2937A]">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </span>
        <span className="flex flex-col">
          <span className="font-heading text-[17px] font-semibold leading-none text-foreground">
            OpenDayCare
          </span>
          <span className="mt-[2px] text-[11.5px] text-text-muted">
            {currentUser.room}
          </span>
        </span>
      </Link>

      <a
        href="/crear-publicacion"
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] px-3 py-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nueva publicación
      </a>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = isActive(href);
          return (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${
                active
                  ? "bg-[#FBE3D8] font-extrabold text-[#D9583C]"
                  : "font-semibold text-[#6E6359]"
              }`}
            >
              <Icon className="h-[19px] w-[19px]" />
              {label}
            </a>
          );
        })}
      </nav>

      <div className="mt-[10px] border-t border-border-soft pt-[14px]">
        <div className="flex items-center gap-[11px] px-2 py-[6px]">
          <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[#F2937A] font-heading text-base font-semibold text-white">
            {currentUser.initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold text-foreground">
              {currentUser.name}
            </span>
            <span className="block text-xs text-text-muted">
              {currentUser.role} · {currentUser.room}
            </span>
          </span>
          <a
            href="/login"
            title="Cerrar sesión"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-[#F6ECDF] text-[#94887B]"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}