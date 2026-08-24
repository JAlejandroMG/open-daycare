"use client";

import { useState } from "react";
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

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const router = useRouter();
  const [recipientKidId, setRecipientKidId] = useState<string>("");
  const [type, setType] = useState<PostType | "">("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  if (!isOpen) return null;

  const selectKid = (id: string) => {
    setRecipientKidId(id === recipientKidId ? "" : id);
    setErrors((prev) => ({ ...prev, recipient: undefined }));
  };

  const selectAll = () => {
    setRecipientKidId(recipientKidId === "all" ? "" : "all");
    setErrors((prev) => ({ ...prev, recipient: undefined }));
  };

  const handlePublish = () => {
    const newErrors: FormErrors = {};
    if (!recipientKidId) newErrors.recipient = "Seleccioná un destinatario";
    if (!type) newErrors.type = "Seleccioná un tipo";
    if (!description.trim()) newErrors.description = "Escribí una descripción";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const selectedKid = kids.find((k) => k.id === recipientKidId);
    const isAllRoom = recipientKidId === "all";

    const now = new Date();
    const publishedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newPost = {
      id: `post-${Date.now()}`,
      type: type as PostType,
      childName: isAllRoom ? "Anuncio general" : selectedKid!.name.split(" ")[0],
      childInitial: isAllRoom ? "A" : selectedKid!.initial,
      avatarBackgroundColor: isAllRoom
        ? "bg-[#CCD8F4]"
        : `bg-[${selectedKid!.avatarBackgroundColor}]`,
      avatarTextColor: isAllRoom
        ? "text-[#4E72C8]"
        : `text-[${selectedKid!.avatarTextColor}]`,
      publishedAt,
      authorName: currentUser.name,
      isAuthor: true,
      recipient: isAllRoom ? "toda la sala" : `familia de ${selectedKid!.name.split(" ")[0]}`,
      content: description.trim(),
      likesCount: 0,
      commentsCount: 0,
    };

    posts.unshift(newPost);
    router.refresh();
    alert("Publicación creada");
    onClose();
    setRecipientKidId("");
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
      <div className="relative z-10 mx-4 max-w-[580px] w-full overflow-hidden rounded-3xl border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]">
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
            {kids.map((kid) => {
              const selected = recipientKidId === kid.id;
              return (
                <button
                  key={kid.id}
                  type="button"
                  onClick={() => selectKid(kid.id)}
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
                  {kid.name.split(" ")[0]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={selectAll}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                recipientKidId === "all"
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
                      selected
                        ? config.badgeClassName
                        : "border border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
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
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: undefined }));
            }}
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
        </div>
      </div>
    </div>
  );
}
