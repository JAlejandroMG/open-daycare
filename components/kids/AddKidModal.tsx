"use client";

import { useState } from "react";

type RoomOption = "Soles" | "Lunas" | "Estrellas";

type AddKidFormState = {
  fullName: string;
  birthDate: string;
  room: RoomOption | "";
  allergies: string;
  medicalNotes: string;
};

type AddKidFormErrors = {
  fullName?: string;
  birthDate?: string;
  room?: string;
};

const INITIAL_FORM: AddKidFormState = {
  fullName: "",
  birthDate: "",
  room: "",
  allergies: "",
  medicalNotes: "",
};

const ROOM_OPTIONS: RoomOption[] = ["Soles", "Lunas", "Estrellas"];

function formatDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

type AddKidModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddKidModal({ isOpen, onClose }: AddKidModalProps) {
  const [form, setForm] = useState<AddKidFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<AddKidFormErrors>({});

  if (!isOpen) return null;

  function updateField<K extends keyof AddKidFormState>(
    field: K,
    value: AddKidFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof AddKidFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: AddKidFormErrors = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = "El nombre es obligatorio";
    }
    if (form.birthDate.length < 10) {
      newErrors.birthDate = "Completá la fecha (dd/mm/aaaa)";
    }
    if (!form.room) {
      newErrors.room = "Seleccioná una sala";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    // Save logic will be added in Step 5
  }

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
          <button
            onClick={handleSave}
            className="text-[15px] font-extrabold text-[#D9583C]"
          >
            Guardar
          </button>
        </div>

        <div className="px-[26px] py-6">
          {/* Nombre completo */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            NOMBRE COMPLETO
          </label>
          <input
            type="text"
            placeholder="Ej. Martina López"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={`mb-1 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none ${
              errors.fullName ? "border-red-400" : "border-[#EADFD0]"
            }`}
          />
          {errors.fullName && (
            <p className="mb-[10px] text-[13px] text-red-500">
              {errors.fullName}
            </p>
          )}
          {!errors.fullName && <div className="mb-[18px]" />}

          {/* Fecha de nacimiento + Sala */}
          <div className="mb-[18px] flex gap-[14px]">
            <div className="flex-1">
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                FECHA DE NACIMIENTO
              </label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                value={form.birthDate}
                onChange={(e) =>
                  updateField("birthDate", formatDateMask(e.target.value))
                }
                className={`w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none ${
                  errors.birthDate ? "border-red-400" : "border-[#EADFD0]"
                }`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-[13px] text-red-500">
                  {errors.birthDate}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                SALA
              </label>
              <div className="relative">
                <select
                  value={form.room}
                  onChange={(e) =>
                    updateField("room", e.target.value as RoomOption | "")
                  }
                  className={`w-full appearance-none rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] pr-10 text-[15px] font-bold text-[#3F362E] focus:outline-none ${
                    errors.room ? "border-red-400" : "border-[#EADFD0]"
                  }`}
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  {ROOM_OPTIONS.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B0A290"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              {errors.room && (
                <p className="mt-1 text-[13px] text-red-500">{errors.room}</p>
              )}
            </div>
          </div>

          {/* Alergias */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            ALERGIAS (ETIQUETAS)
          </label>
          <input
            type="text"
            placeholder="Ej. Maní, Lactosa"
            value={form.allergies}
            onChange={(e) => updateField("allergies", e.target.value)}
            className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
          />

          {/* Notas médicas */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            NOTAS MÉDICAS
          </label>
          <textarea
            placeholder="Indicaciones, medicación, contactos…"
            value={form.medicalNotes}
            onChange={(e) => updateField("medicalNotes", e.target.value)}
            className="min-h-[90px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] leading-[1.5] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
