"use client";

type AddKidModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddKidModal({ isOpen, onClose }: AddKidModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-6 py-10">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button
            onClick={onClose}
            className="text-[15px] font-bold text-[#94887B]"
          >
            Cancelar
          </button>
          <span className="font-heading text-[18px] font-semibold text-[#3F362E]">
            Agregar niño
          </span>
          <button className="text-[15px] font-extrabold text-[#D9583C]">
            Guardar
          </button>
        </div>
        <div className="px-[26px] py-6">
          {/* Form fields will go here */}
        </div>
      </div>
    </div>
  );
}
