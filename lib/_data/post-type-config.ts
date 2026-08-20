import type { PostType } from "./types";

type PostTypeConfig = {
  label: string;
  badgeClassName: string;
  dotClassName: string;
};

export const POST_TYPE_CONFIG: Record<PostType, PostTypeConfig> = {
  achievement: {
    label: "LOGRO",
    badgeClassName: "bg-[#CFEBD8] text-[#3E9B6C]",
    dotClassName: "bg-[#3E9B6C]",
  },
  activity: {
    label: "ACTIVIDAD",
    badgeClassName: "bg-[#C7E7F1] text-[#2E89A6]",
    dotClassName: "bg-[#2E89A6]",
  },
  announcement: {
    label: "ANUNCIO",
    badgeClassName: "bg-[#CCD8F4] text-[#4E72C8]",
    dotClassName: "bg-[#4E72C8]",
  },
};