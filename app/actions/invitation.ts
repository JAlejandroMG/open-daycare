"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type RelationshipType = "mother" | "father" | "guardian";

const RELATIONSHIP_MAP: Record<string, RelationshipType> = {
  Mamá: "mother",
  Papá: "father",
  "Tutor/a": "guardian",
};

type InvitationResult = { success: true } | { success: false; error: string };

async function generateInvitationCode(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes, (b) => chars[b % chars.length]).join("");

    const { data } = await supabase
      .from("invitations")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (!data) return code;
  }

  throw new Error("No se pudo generar un código único después de 10 intentos");
}

export async function sendParentInvitation(
  childId: string,
  fullName: string,
  email: string,
  relationship: string
): Promise<InvitationResult> {
  try {
    if (!childId?.trim()) {
      return { success: false, error: "El niño es obligatorio" };
    }
    if (!fullName?.trim()) {
      return { success: false, error: "El nombre es obligatorio" };
    }
    if (!email?.trim()) {
      return { success: false, error: "El email es obligatorio" };
    }

    const dbRelationship = RELATIONSHIP_MAP[relationship];
    if (!dbRelationship) {
      return { success: false, error: "Parentesco inválido" };
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

    const { data: staffUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!staffUser || staffUser.role !== "staff") {
      return { success: false, error: "Solo el staff puede enviar invitaciones" };
    }

    const { data: child } = await supabase
      .from("children")
      .select("id, full_name, rooms!inner(daycare_id)")
      .eq("id", childId)
      .single();

    if (!child) {
      return { success: false, error: "Niño no encontrado" };
    }

    const code = await generateInvitationCode();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: insertError } = await supabase.from("invitations").insert({
      child_id: childId,
      invited_by: user.id,
      full_name: fullName.trim(),
      email: email.trim(),
      relationship: dbRelationship,
      code,
      status: "pending",
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("Error inserting invitation:", insertError);
      return { success: false, error: "Error al guardar la invitación" };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const activationLink = `${appUrl}/activate-account?code=${code}`;

    const { error: emailError } = await resend.emails.send({
      from: "OpenDayCare <onboarding@resend.dev>",
      to: email.trim(),
      subject: `Invitación para vincularte con ${child.full_name}`,
      html: `
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #FBF4EC; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: 'Fredoka', Arial, sans-serif; color: #3F362E; font-size: 24px; margin: 0;">
              OpenDayCare
            </h1>
          </div>
          <div style="background-color: white; border-radius: 16px; padding: 28px; border: 1.5px solid #ECE0D0;">
            <p style="color: #3F362E; font-size: 15px; line-height: 1.5; margin: 0 0 16px;">
              Hola <strong>${fullName.trim()}</strong>,
            </p>
            <p style="color: #3F362E; font-size: 15px; line-height: 1.5; margin: 0 0 16px;">
              Fuiste invitado/a a vincularte con <strong>${child.full_name}</strong> en OpenDayCare.
            </p>
            <p style="color: #3F362E; font-size: 15px; line-height: 1.5; margin: 0 0 24px;">
              Usá el siguiente código para activar tu cuenta:
            </p>
            <div style="background-color: #FBF1D6; border: 1.5px dashed #E6D08A; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="font-family: 'Fredoka', Arial, sans-serif; font-size: 36px; font-weight: 600; color: #8A7234; letter-spacing: 7px; margin: 0;">
                ${code}
              </p>
              <p style="color: #A88526; font-size: 13px; margin: 8px 0 0;">
                Vence en 7 días
              </p>
            </div>
            <div style="text-align: center;">
              <a href="${activationLink}"
                 style="display: inline-block; background: linear-gradient(to bottom, #F4977E, #EE8164); color: white; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 14px; text-decoration: none;">
                Activar cuenta
              </a>
            </div>
          </div>
          <p style="color: #A89A8B; font-size: 12px; text-align: center; margin-top: 20px;">
            Si no esperabas este correo, podés ignorarlo.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return {
        success: false,
        error: "Error al enviar el email. Verificá la configuración de Resend.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sendParentInvitation:", error);
    return { success: false, error: "Error inesperado" };
  }
}
