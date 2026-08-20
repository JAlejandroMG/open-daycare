import type { CurrentUser, Post } from "./types";

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
    childName: "Mateo",
    childInitial: "M",
    avatarBackgroundColor: "bg-[#A9D9E8]",
    avatarTextColor: "text-[#1F7A93]",
    publishedAt: "14:20",
    authorName: "Caro Giménez",
    isAuthor: true,
    recipient: "familia de Mateo",
    content:
      "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likesCount: 3,
    commentsCount: 1,
  },
  {
    id: "post-2",
    type: "activity",
    childName: "Mateo",
    childInitial: "M",
    avatarBackgroundColor: "bg-[#A9D9E8]",
    avatarTextColor: "text-[#1F7A93]",
    publishedAt: "09:40",
    authorName: "Caro Giménez",
    isAuthor: true,
    recipient: "familia de Mateo",
    content:
      "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoPlaceholder: "Foto · pintando con témperas",
    likesCount: 5,
    commentsCount: 2,
  },
  {
    id: "post-3",
    type: "announcement",
    childName: "Anuncio general",
    childInitial: "",
    avatarBackgroundColor: "bg-[#CCD8F4]",
    avatarTextColor: "text-[#4E72C8]",
    publishedAt: "07:50",
    authorName: "Caro Giménez",
    isAuthor: true,
    recipient: "toda la sala",
    content:
      "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likesCount: 8,
    commentsCount: 0,
  },
];