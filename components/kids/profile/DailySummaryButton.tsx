export function DailySummaryButton() {
  return (
    <a
      href="/resumen-dia"
      className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#3F362E] px-[13px] py-3 text-[15px] font-extrabold text-white"
    >
      <svg
        className="h-[18px] w-[18px]"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      Resumen del día
    </a>
  );
}
