"use client";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  if (!isOpen) return null;

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
        <div className="px-[26px] py-6" />
      </div>
    </div>
  );
}
