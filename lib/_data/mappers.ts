import type { Kid } from "./types";

const AVATAR_COLORS = [
  { bg: "#A9D9E8", text: "#1F7A93" },
  { bg: "#F4B8CC", text: "#C44A7A" },
  { bg: "#B9DEC4", text: "#3E8B62" },
  { bg: "#F4DC8E", text: "#9A7B1E" },
  { bg: "#C9B6E8", text: "#7B5FC0" },
];

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const ALLERGY_LABELS: Record<string, string> = {
  peanut: "MANÍ",
  mani: "MANÍ",
  milk: "LÁCTEOS",
  lactosa: "LACTOSA",
  lactose: "LACTOSA",
  gluten: "GLUTEN",
  egg: "HUEVO",
  huevo: "HUEVO",
  nuts: "FRUTOS SECOS",
  "frutos secos": "FRUTOS SECOS",
  shellfish: "MARISCOS",
  mariscos: "MARISCOS",
  soy: "SOJA",
  soja: "SOJA",
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getAvatarColors(name: string) {
  const index = hashString(name) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDate();
  const month = MONTHS_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatAdmissionDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const month = MONTHS_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${year}`;
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate + "T00:00:00");
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  return `${years} año${years !== 1 ? "s" : ""}`;
}

function mapAllergyTag(tag: string): string | undefined {
  const lower = tag.toLowerCase().trim();
  return ALLERGY_LABELS[lower] ?? tag.toUpperCase();
}

type ChildRow = {
  id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[] | null;
  photo_consent: boolean | null;
  status: string;
  created_at: string;
  updated_at: string;
  room_id: string;
};

export function mapChildToKid(
  child: ChildRow,
  roomName: string
): Kid {
  const colors = getAvatarColors(child.full_name);
  const firstName = child.full_name.split(" ")[0];
  const allergyTags = child.allergy_tags ?? [];

  return {
    id: child.id,
    name: child.full_name,
    initial: firstName[0].toUpperCase(),
    age: calculateAge(child.birth_date),
    room: roomName,
    birthDate: formatDate(child.birth_date),
    admissionDate: formatAdmissionDate(child.enrolled_at),
    linkedParents: 0,
    allergy: allergyTags.length > 0 ? mapAllergyTag(allergyTags[0]) : undefined,
    allergyNote: child.medical_notes ?? undefined,
    parents: [],
    avatarBackgroundColor: colors.bg,
    avatarTextColor: colors.text,
  };
}
