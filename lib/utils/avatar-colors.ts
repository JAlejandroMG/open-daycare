const AVATAR_COLORS = [
  { bg: "bg-[#A9D9E8]", text: "text-[#1F7A93]" },
  { bg: "bg-[#F6A98E]", text: "text-[#EC7E62]" },
  { bg: "bg-[#CFEBD8]", text: "text-[#3E9B6C]" },
  { bg: "bg-[#CCD8F4]", text: "text-[#4E72C8]" },
  { bg: "bg-[#E7DCF6]", text: "text-[#7B5FC0]" },
  { bg: "bg-[#F9D2DE]", text: "text-[#C56486]" },
  { bg: "bg-[#FBD8CC]", text: "text-[#D9684A]" },
  { bg: "bg-[#B8E6D0]", text: "text-[#2D8F6F]" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarColors(childId: string): {
  bg: string;
  text: string;
} {
  const index = hashString(childId) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
