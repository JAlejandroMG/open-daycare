"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

type CreatePostResult = { success: true } | { success: false; error: string };

export async function createPost(
  recipientIds: string[],
  type: string,
  description: string,
  photoUrls: string[] = []
): Promise<CreatePostResult> {
  try {
    if (!type?.trim()) {
      return { success: false, error: "El tipo es obligatorio" };
    }
    if (!description?.trim()) {
      return { success: false, error: "La descripción es obligatoria" };
    }
    if (!recipientIds || recipientIds.length === 0) {
      return { success: false, error: "Seleccioná al menos un destinatario" };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    const { data: currentUser } = await supabase
      .from("users")
      .select("id, role, daycare_id")
      .eq("id", user.id)
      .single();

    if (!currentUser || !["staff", "admin"].includes(currentUser.role)) {
      return {
        success: false,
        error: "Solo el staff puede crear publicaciones",
      };
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        type,
        body: description.trim(),
      })
      .select("id")
      .single();

    if (postError || !post) {
      console.error("Error inserting post:", postError);
      return { success: false, error: "Error al crear la publicación" };
    }

    let childIds = recipientIds;

    if (recipientIds.includes("all")) {
      const { data: rooms } = await supabase
        .from("rooms")
        .select("id")
        .eq("daycare_id", currentUser.daycare_id);

      if (rooms && rooms.length > 0) {
        const roomIds = rooms.map((r) => r.id);
        const { data: children } = await supabase
          .from("children")
          .select("id")
          .eq("status", "active")
          .in("room_id", roomIds);

        if (children) {
          childIds = children.map((c) => c.id);
        }
      }
    }

    if (childIds.length > 0) {
      const postChildren = childIds.map((childId) => ({
        post_id: post.id,
        child_id: childId,
      }));

      const { error: childrenError } = await supabase
        .from("post_children")
        .insert(postChildren);

      if (childrenError) {
        console.error("Error inserting post_children:", childrenError);
      }
    }

    if (photoUrls.length > 0) {
      const postPhotos = photoUrls.map((url, index) => ({
        post_id: post.id,
        url,
        position: index,
      }));

      const { error: photosError } = await supabase
        .from("post_photos")
        .insert(postPhotos);

      if (photosError) {
        console.error("Error inserting post_photos:", photosError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createPost:", error);
    return { success: false, error: "Error inesperado" };
  }
}

export async function getDaycareChildren() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: children, error } = await supabase
    .from("children")
    .select("id, full_name, rooms(name)")
    .eq("status", "active")
    .order("full_name");

  if (error) {
    console.error("Error fetching children:", error);
    return [];
  }

  return children || [];
}
