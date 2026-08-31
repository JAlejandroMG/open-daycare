"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

type CreateChildInput = {
  full_name: string;
  birth_date: string; // dd/mm/aaaa
  room: string; // room name (e.g. "Soles")
  allergy_tags?: string; // comma-separated text
  medical_notes?: string;
};

type CreateChildResult = {
  success: boolean;
  error?: string;
};

function parseDate(dateStr: string): string | null {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseAllergyTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
}

export async function createChild(
  input: CreateChildInput
): Promise<CreateChildResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { full_name, birth_date, room, allergy_tags, medical_notes } = input;

  if (!full_name.trim()) {
    return { success: false, error: "El nombre es obligatorio" };
  }

  const parsedDate = parseDate(birth_date);
  if (!parsedDate) {
    return { success: false, error: "La fecha de nacimiento no es válida" };
  }

  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("name", room)
    .single();

  if (roomError || !roomData) {
    return { success: false, error: "La sala seleccionada no existe" };
  }

  const tags = allergy_tags ? parseAllergyTags(allergy_tags) : [];

  const { error: insertError } = await supabase.from("children").insert({
    full_name: full_name.trim(),
    birth_date: parsedDate,
    room_id: roomData.id,
    enrolled_at: new Date().toISOString().slice(0, 10),
    allergy_tags: tags.length > 0 ? tags : null,
    medical_notes: medical_notes?.trim() || null,
    status: "active",
  });

  if (insertError) {
    return { success: false, error: "Error al guardar el niño" };
  }

  revalidatePath("/kids");
  return { success: true };
}
