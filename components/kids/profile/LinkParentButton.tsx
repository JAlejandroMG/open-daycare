type LinkParentButtonProps = {
  onClick?: () => void;
};

export function LinkParentButton({ onClick }: LinkParentButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 pt-2"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-dashed border-[#D8CBBA] text-[#B0A290]">
        <svg
          className="h-[18px] w-[18px]"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span className="text-[14.5px] font-extrabold text-[#C5503A]">
        Vincular otro padre
      </span>
    </button>
  );
}
