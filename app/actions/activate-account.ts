"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

type InvitationDetails = {
  parentName: string;
  childName: string;
  childRoom: string;
};

type InvitationResult =
  | { success: true; data: InvitationDetails }
  | { success: false; error: string };

export async function getInvitationByCode(code: string): Promise<InvitationResult> {
  try {
    if (!code?.trim()) {
      return { success: false, error: "El código es obligatorio" };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: invitation, error } = await supabase
      .from("invitations")
      .select(`
        full_name,
        children!inner (
          full_name,
          rooms!inner (name)
        )
      `)
      .eq("code", code.trim().toUpperCase())
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !invitation) {
      return { success: false, error: "Código de invitación inválido o expirado" };
    }

    const child = Array.isArray(invitation.children) ? invitation.children[0] : invitation.children;
    const room = Array.isArray(child.rooms) ? child.rooms[0] : child.rooms;

    return {
      success: true,
      data: {
        parentName: invitation.full_name,
        childName: child.full_name,
        childRoom: room.name,
      },
    };
  } catch (error) {
    console.error("Error in getInvitationByCode:", error);
    return { success: false, error: "Error al buscar la invitación" };
  }
}

type RegistrationResult = { success: true } | { success: false; error: string };

export async function registerParentWithInvitation(
  code: string,
  email: string,
  password: string
): Promise<RegistrationResult> {
  try {
    if (!code?.trim()) {
      return { success: false, error: "El código es obligatorio" };
    }
    if (!email?.trim()) {
      return { success: false, error: "El email es obligatorio" };
    }
    if (!password?.trim()) {
      return { success: false, error: "La contraseña es obligatoria" };
    }
    if (password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirm: false,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        return { success: false, error: "Este email ya está registrado. Intentá iniciar sesión." };
      }
      console.error("Error in signUp:", signUpError);
      return { success: false, error: "Error al crear la cuenta" };
    }

    if (!authData.user) {
      return { success: false, error: "No se pudo crear la cuenta" };
    }

    // Call SECURITY DEFINER function to validate invitation and create profile
    const { error: rpcError } = await supabase.rpc("register_parent", {
      p_code: code.trim().toUpperCase(),
      p_email: email.trim(),
      p_auth_user_id: authData.user.id,
    });

    if (rpcError) {
      console.error("Error in register_parent:", rpcError);
      return {
        success: false,
        error: rpcError.message || "Error al completar el registro",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in registerParentWithInvitation:", error);
    return { success: false, error: "Error inesperado" };
  }
}
