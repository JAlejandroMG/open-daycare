"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChild } from "@/app/(dashboard)/kids/actions";

type Room = {
  id: string;
  name: string;
};

type AddKidFormState = {
  fullName: string;
  birthDate: string;
  room: string;
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

function formatDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function validateBirthDate(dateStr: string): string | null {
  if (dateStr.length < 10) return "Completá la fecha (dd/mm/aaaa)";

  const [dayStr, monthStr, yearStr] = dateStr.split("/");
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "La fecha no es válida";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return "La fecha no puede ser futura";
  }

  const maxAgeDate = new Date(today);
  maxAgeDate.setFullYear(today.getFullYear() - 12);
  if (date < maxAgeDate) {
    return "El niño debe tener entre 0 y 12 años";
  }

  return null;
}

type AddKidModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
};

export function AddKidModal({ isOpen, onClose, rooms }: AddKidModalProps) {
  const router = useRouter();
  const [form, setForm] = useState<AddKidFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<AddKidFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  function updateField<K extends keyof AddKidFormState>(
    field: K,
    value: AddKidFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof AddKidFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setSubmitError(null);
  }

  function handleBlur(field: keyof AddKidFormState) {
    setErrors((prev) => {
      const next = { ...prev };

      if (field === "fullName") {
        next.fullName = form.fullName.trim()
          ? undefined
          : "El nombre es obligatorio";
      }

      if (field === "birthDate") {
        const error = validateBirthDate(form.birthDate);
        next.birthDate = error || undefined;
      }

      if (field === "room") {
        next.room = form.room ? undefined : "Seleccioná una sala";
      }

      return next;
    });
  }

  function validate(): boolean {
    const newErrors: AddKidFormErrors = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = "El nombre es obligatorio";
    }
    const birthDateError = validateBirthDate(form.birthDate);
    if (birthDateError) {
      newErrors.birthDate = birthDateError;
    }
    if (!form.room) {
      newErrors.room = "Seleccioná una sala";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createChild({
      full_name: form.fullName.trim(),
      birth_date: form.birthDate,
      room: form.room,
      allergy_tags: form.allergies.trim() || undefined,
      medical_notes: form.medicalNotes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error ?? "Error al guardar");
      return;
    }

    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-6 py-10">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[15px] font-bold text-[#94887B]"
          >
            Cancelar
          </button>
          <span className="font-heading text-[18px] font-semibold text-[#3F362E]">
            Agregar niño
          </span>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="text-[15px] font-extrabold text-[#D9583C] disabled:opacity-50"
          >
            {isSubmitting ? "Guardando…" : "Guardar"}
          </button>
        </div>

        <div className="px-[26px] py-6">
          {submitError && (
            <div className="mb-4 rounded-[12px] bg-[#FBDAD6] px-4 py-3 text-[14px] text-[#C5413A]">
              {submitError}
            </div>
          )}

          {/* Nombre completo */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            NOMBRE COMPLETO
          </label>
          <input
            type="text"
            placeholder="Ej. Martina López"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
            disabled={isSubmitting}
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
          <div className="mb-[18px] flex flex-col gap-[14px] sm:flex-row">
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
                onBlur={() => handleBlur("birthDate")}
                disabled={isSubmitting}
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
                  onChange={(e) => updateField("room", e.target.value)}
                  onBlur={() => handleBlur("room")}
                  disabled={isSubmitting}
                  className={`w-full appearance-none rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] pr-10 text-[15px] font-bold text-[#3F362E] focus:outline-none ${
                    errors.room ? "border-red-400" : "border-[#EADFD0]"
                  }`}
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="min-h-[90px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] leading-[1.5] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
