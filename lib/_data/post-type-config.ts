import type { PostType } from "./types";

type PostTypeConfig = {
  label: string;
  badgeClassName: string;
  dotClassName: string;
  backgroundColor: string;
  textColor: string;
};

export const POST_TYPE_CONFIG: Record<PostType, PostTypeConfig> = {
  achievement: {
    label: "LOGRO",
    badgeClassName: "bg-[#CFEBD8] text-[#3E9B6C]",
    dotClassName: "bg-[#3E9B6C]",
    backgroundColor: "#CFEBD8",
    textColor: "#3E9B6C",
  },
  activity: {
    label: "ACTIVIDAD",
    badgeClassName: "bg-[#2E89A6] text-white",
    dotClassName: "bg-[#2E89A6]",
    backgroundColor: "#2E89A6",
    textColor: "#ffffff",
  },
  announcement: {
    label: "ANUNCIO",
    badgeClassName: "bg-[#CCD8F4] text-[#4E72C8]",
    dotClassName: "bg-[#4E72C8]",
    backgroundColor: "#CCD8F4",
    textColor: "#4E72C8",
  },
  food: {
    label: "COMIDA",
    badgeClassName: "bg-[#9A7B1E] text-white",
    dotClassName: "bg-[#9A7B1E]",
    backgroundColor: "#9A7B1E",
    textColor: "#ffffff",
  },
  nap: {
    label: "SIESTA",
    badgeClassName: "bg-[#E7DCF6] text-[#7B5FC0]",
    dotClassName: "bg-[#7B5FC0]",
    backgroundColor: "#E7DCF6",
    textColor: "#7B5FC0",
  },
  cheer: {
    label: "ÁNIMO",
    badgeClassName: "bg-[#F9D2DE] text-[#C56486]",
    dotClassName: "bg-[#C56486]",
    backgroundColor: "#F9D2DE",
    textColor: "#C56486",
  },
  picture: {
    label: "FOTO",
    badgeClassName: "bg-[#FBD8CC] text-[#D9684A]",
    dotClassName: "bg-[#D9684A]",
    backgroundColor: "#FBD8CC",
    textColor: "#D9684A",
  },
};
