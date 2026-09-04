"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { currentUser, kids, posts } from "@/lib/_data/mock-data";
import { POST_TYPE_CONFIG } from "@/lib/_data/post-type-config";
import type { PostType } from "@/lib/_data/types";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormErrors = {
  recipient?: string;
  type?: string;
  description?: string;
};

function getFirstName(name: string): string {
  return name.split(" ")[0];
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const router = useRouter();
  const [recipientKidIds, setRecipientKidIds] = useState<string[]>([]);
  const [type, setType] = useState<PostType | "">("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isAllRoom = recipientKidIds.includes("all");

  const toggleKid = useCallback(
    (id: string) => {
      if (isAllRoom) {
        setRecipientKidIds([id]);
      } else {
        setRecipientKidIds((prev) =>
          prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
        );
      }
      setErrors((prev) => ({ ...prev, recipient: undefined }));
    },
    [isAllRoom]
  );

  const selectAll = useCallback(() => {
    if (isAllRoom) {
      setRecipientKidIds([]);
    } else {
      setRecipientKidIds(["all"]);
    }
    setErrors((prev) => ({ ...prev, recipient: undefined }));
  }, [isAllRoom]);

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
      setErrors((prev) => ({ ...prev, description: undefined }));
    },
    []
  );

  if (!isOpen) return null;

  const handlePublish = () => {
    const newErrors: FormErrors = {};
    if (recipientKidIds.length === 0) newErrors.recipient = "Seleccioná al menos un destinatario";
    if (!type) newErrors.type = "Seleccioná un tipo";
    if (!description.trim()) newErrors.description = "Escribí una descripción";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const now = new Date();
    const publishedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let childNames: string[];
    let childInitials: string[];
    let avatarBackgroundColors: string[];
    let avatarTextColors: string[];
    let recipientsList: string[];

    if (isAllRoom) {
      childNames = ["Anuncio general"];
      childInitials = ["A"];
      avatarBackgroundColors = ["bg-[#CCD8F4]"];
      avatarTextColors = ["text-[#4E72C8]"];
      recipientsList = ["toda la sala"];
    } else {
      const selectedKids = kids.filter((k) => recipientKidIds.includes(k.id));
      childNames = selectedKids.map((k) => getFirstName(k.name));
      childInitials = selectedKids.map((k) => k.initial);
      avatarBackgroundColors = selectedKids.map((k) => `bg-[${k.avatarBackgroundColor}]`);
      avatarTextColors = selectedKids.map((k) => `text-[${k.avatarTextColor}]`);
      recipientsList = selectedKids.map((k) => `familia de ${getFirstName(k.name)}`);
    }

    const newPost = {
      id: `post-${Date.now()}`,
      type: type as PostType,
      childNames,
      childInitials,
      avatarBackgroundColors,
      avatarTextColors,
      publishedAt,
      authorName: currentUser.name,
      isAuthor: true,
      recipients: recipientsList,
      content: description.trim(),
      photos: [],
      likesCount: 0,
      commentsCount: 0,
    };

    posts.unshift(newPost);
    router.refresh();
    alert("Publicación creada");
    onClose();
    setRecipientKidIds([]);
    setType("");
    setDescription("");
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-[580px] overflow-y-auto rounded-3xl border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]">
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-bold text-[#94887B]"
          >
            Cancelar
          </button>
          <span className="font-heading text-lg font-semibold text-[#3F362E]">
            Nueva publicación
          </span>
          <button
            type="button"
            onClick={handlePublish}
            className="text-[15px] font-extrabold text-[#D9583C]"
          >
            Publicar
          </button>
        </div>
        <div className="px-[26px] py-6">
          <div className="mb-[10px] text-xs font-extrabold tracking-[.7px] text-[#94887B]">
            PARA
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {kids.length === 0 ? (
              <p className="text-sm text-[#94887B]">
                No hay niños cargados todavía.
              </p>
            ) : (
              kids.map((kid) => {
                const selected = !isAllRoom && recipientKidIds.includes(kid.id);
                return (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => toggleKid(kid.id)}
                    className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-bold ${
                      selected
                        ? "border-[1.5px] border-[#3F362E] bg-[#3F362E] text-white"
                        : "border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
                  >
                    <span
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-full font-heading text-[13px] font-semibold"
                      style={{
                        backgroundColor: kid.avatarBackgroundColor,
                        color: kid.avatarTextColor,
                      }}
                    >
                      {kid.initial}
                    </span>
                    {getFirstName(kid.name)}
                  </button>
                );
              })
            )}
            <button
              type="button"
              onClick={selectAll}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                isAllRoom
                  ? "border-[1.5px] border-[#3F362E] bg-[#3F362E] text-white"
                  : "border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
              }`}
            >
              Toda la sala
            </button>
          </div>
          {errors.recipient ? (
            <p className="-mt-[18px] mb-[22px] text-xs text-red-500">
              {errors.recipient}
            </p>
          ) : null}
          <div className="mb-[10px] text-xs font-extrabold tracking-[.7px] text-[#94887B]">
            TIPO
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {(Object.entries(POST_TYPE_CONFIG) as [PostType, (typeof POST_TYPE_CONFIG)[PostType]][]).map(
              ([key, config]) => {
                const selected = type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setType(selected ? "" : key);
                      setErrors((prev) => ({ ...prev, type: undefined }));
                    }}
                    className={`rounded-full px-4 py-2 text-[13.5px] font-extrabold ${
                      selected ? "ring-2 ring-offset-2 ring-[#3F362E]" : ""
                    }`}
                    style={{
                      backgroundColor: config.backgroundColor,
                      color: config.textColor,
                    }}
                  >
                    {config.label}
                  </button>
                );
              }
            )}
          </div>
          {errors.type ? (
            <p className="-mt-[18px] mb-[22px] text-xs text-red-500">
              {errors.type}
            </p>
          ) : null}
          <div className="mb-[10px] text-xs font-extrabold tracking-[.7px] text-[#94887B]">
            DESCRIPCIÓN
          </div>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Contá cómo le fue hoy…"
            className={`mb-[22px] w-full resize-y rounded-[14px] border-[1.5px] bg-white p-[14px_16px] text-[15px] leading-[1.5] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none ${
              errors.description ? "border-red-400" : "border-[#EADFD0]"
            }`}
            rows={4}
          />
          {errors.description ? (
            <p className="-mt-[18px] mb-[22px] text-xs text-red-500">
              {errors.description}
            </p>
          ) : null}
          <div className="mb-[10px] text-xs font-extrabold tracking-[.7px] text-[#94887B]">
            FOTOS
          </div>
          <div className="flex gap-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-[14px] border border-[#ECE0D0] bg-[#F4ECE1] text-[#CBB89F]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
              </svg>
            </div>
            <div className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C5503A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-xs">Agregar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
