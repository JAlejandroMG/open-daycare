"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/(dashboard)/actions/posts";
import { POST_TYPE_CONFIG } from "@/lib/_data/post-type-config";
import type { PostType } from "@/lib/_data/types";
import { createClient } from "@/utils/supabase/client";

type ChildItem = {
  id: string;
  full_name: string;
  rooms: { name: string }[];
};

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ChildItem[];
};

type FormErrors = {
  recipient?: string;
  type?: string;
  description?: string;
  photos?: string;
};

function getFirstName(name: string): string {
  return name.split(" ")[0];
}

export function CreatePostModal({
  isOpen,
  onClose,
  childrenList,
}: CreatePostModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipientKidIds, setRecipientKidIds] = useState<string[]>([]);
  const [type, setType] = useState<PostType | "">("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const remaining = 10 - selectedFiles.length;
      const newFiles = files.slice(0, remaining);

      if (newFiles.length === 0) return;

      setSelectedFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      setErrors((prev) => ({ ...prev, photos: undefined }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [selectedFiles.length]
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  if (!isOpen) return null;

  const handlePublish = async () => {
    const newErrors: FormErrors = {};
    if (recipientKidIds.length === 0)
      newErrors.recipient = "Seleccioná al menos un destinatario";
    if (!type) newErrors.type = "Seleccioná un tipo";
    if (!description.trim()) newErrors.description = "Escribí una descripción";
    if (selectedFiles.length > 10)
      newErrors.photos = "Máximo 10 fotos permitidas";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const photoUrls: string[] = [];

      if (selectedFiles.length > 0) {
        const supabase = createClient();

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${i}.${fileExt}`;
          const filePath = `posts/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from("post-photos")
            .upload(filePath, file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            setErrors({ photos: "Error al subir las fotos" });
            setIsSubmitting(false);
            return;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("post-photos").getPublicUrl(data.path);

          photoUrls.push(publicUrl);
        }
      }

      const result = await createPost(
        recipientKidIds,
        type,
        description.trim(),
        photoUrls
      );

      if (!result.success) {
        setErrors({ description: result.error });
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      onClose();
      setRecipientKidIds([]);
      setType("");
      setDescription("");
      setSelectedFiles([]);
      setPreviews([]);
      setErrors({});
    } catch (error) {
      console.error("Error publishing:", error);
      setErrors({ description: "Error inesperado al publicar" });
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
            className="text-[15px] font-extrabold text-[#D9583C] disabled:opacity-50"
          >
            {isSubmitting ? "Publicando…" : "Publicar"}
          </button>
        </div>
        <div className="px-[26px] py-6">
          <div className="mb-[10px] text-xs font-extrabold tracking-[.7px] text-[#94887B]">
            PARA
          </div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {childrenList.length === 0 ? (
              <p className="text-sm text-[#94887B]">
                No hay niños cargados todavía.
              </p>
            ) : (
              childrenList.map((child) => {
                const selected =
                  !isAllRoom && recipientKidIds.includes(child.id);
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleKid(child.id)}
                    className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-bold ${
                      selected
                        ? "border-[1.5px] border-[#3F362E] bg-[#3F362E] text-white"
                        : "border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
                  >
                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#A9D9E8] font-heading text-[13px] font-semibold text-[#1F7A93]">
                      {child.full_name.charAt(0).toUpperCase()}
                    </span>
                    {getFirstName(child.full_name)}
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
            {(
              Object.entries(POST_TYPE_CONFIG) as [
                PostType,
                (typeof POST_TYPE_CONFIG)[PostType],
              ][]
            ).map(([key, config]) => {
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
            })}
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
            FOTOS{" "}
            <span className="font-normal text-[#B6A99B]">
              (máximo 10)
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative h-24 w-24">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-24 rounded-[14px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#3F362E] text-white"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {selectedFiles.length < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]"
              >
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
              </button>
            )}
          </div>
          {errors.photos ? (
            <p className="mt-2 text-xs text-red-500">{errors.photos}</p>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
