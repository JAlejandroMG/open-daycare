import type { CurrentUser, Kid, Post } from "./types";

export const currentUser: CurrentUser = {
  name: "Caro Giménez",
  role: "Maestra",
  room: "Sala Soles",
  initial: "C",
};

export const posts: Post[] = [
  {
    id: "post-1",
    type: "achievement",
    childNames: ["Mateo"],
    childInitials: ["M"],
    avatarBackgroundColors: ["bg-[#A9D9E8]"],
    avatarTextColors: ["text-[#1F7A93]"],
    publishedAt: "14:20",
    authorName: "Caro Giménez",
    isAuthor: true,
    recipients: ["familia de Mateo"],
    content:
      "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likesCount: 3,
    commentsCount: 1,
  },
  {
    id: "post-2",
    type: "activity",
    childNames: ["Mateo"],
    childInitials: ["M"],
    avatarBackgroundColors: ["bg-[#A9D9E8]"],
    avatarTextColors: ["text-[#1F7A93]"],
    publishedAt: "09:40",
    authorName: "Caro Giménez",
    isAuthor: true,
    recipients: ["familia de Mateo"],
    content:
      "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoPlaceholder: "Foto · pintando con témperas",
    likesCount: 5,
    commentsCount: 2,
  },
  {
    id: "post-3",
    type: "announcement",
    childNames: ["Anuncio general"],
    childInitials: ["A"],
    avatarBackgroundColors: ["bg-[#CCD8F4]"],
    avatarTextColors: ["text-[#4E72C8]"],
    publishedAt: "07:50",
    authorName: "Caro Giménez",
    isAuthor: true,
    recipients: ["toda la sala"],
    content:
      "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likesCount: 8,
    commentsCount: 0,
  },
];

// Los datos de niños ahora vienen de la base de datos (Supabase).
// Ver: app/(dashboard)/kids/page.tsx y app/(dashboard)/kids/[id]/page.tsx
export const kids: Kid[] = [];