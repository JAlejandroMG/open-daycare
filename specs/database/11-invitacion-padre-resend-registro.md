# SPEC 11 — Flujo de invitación de padres con email Resend y registro por código

> **Status:** Approved
> **Depends on:** SPEC 05
> **Date:** 2026-08-31
> **Objective:** Implementar el flujo completo de invitación de padres desde el modal "Vincular padre", incluyendo generación de código de invitación, persistencia en base de datos, envío de email vía Resend desde Server Action de Next.js, y registro del padre en `/activate-account` validando el código con Supabase Auth.

---

## Scope

**In:**

- Migración `004_create_invitations_and_parent_children.sql` con enums (`relationship_type`, `invitation_status`), tablas `invitations` y `parent_children`, índices, RLS policies y grants.
- Generación de código de invitación de 5 caracteres alfanuméricos (letras mayúsculas + números) con verificación de unicidad en la tabla `invitations`.
- Server Action `app/actions/invitation.ts` que recibe `childId`, `fullName`, `email`, `relationship`, genera el código, inserta en `invitations` con `expires_at = now() + interval '7 days'`, y envía email HTML vía Resend.
- Email HTML con brand OpenDayCare, nombre del niño, código de invitación visible y link directo a `/activate-account?code=XXXXX`.
- Actualización del `LinkParentModal` (SPEC 05) para usar la Server Action real en lugar de `alert()` hardcodeado, mostrando estados de carga y error.
- Actualización de `/activate-account/page.tsx` para conectar con Supabase Auth `signUp()` con `emailConfirm: false` (deshabilitar confirmación por email de Supabase), validar el código contra `invitations`, crear fila en `public.users`, marcar invitación como `accepted`, e insertar vínculo en `parent_children`.
- Variable de entorno `NEXT_PUBLIC_APP_URL` para construir el link del email (puede ser `http://localhost:3000` en dev).
- Variable de entorno `RESEND_API_KEY` en `.env` (valor agregado manualmente).
- En `/activate-account`, el campo de código de invitación solo se muestra si la URL contiene query param `?code=`. Cuando se muestra, aparece vacío y editable para que el usuario ingrese el código manualmente. Si no hay query param, el campo no aparece.
- Validación de que el email del padre al registrarse coincida exactamente con el email guardado en la invitación.
- Manejo de errores visuales en el modal y en la página de activación (campos rojos, mensajes).
- `npm run lint` y `npx tsc --noEmit` pasan sin errores.

**Out of scope (for future specs):**

- Re-envío o cancelación de invitaciones.
- Edición o eliminación de padres vinculados.
- Notificación por email al staff cuando el padre acepta.
- Límite de cantidad de padres por niño.
- Validación de contraseña fuerte en el registro.
- Flujo de "¿Olvidaste tu contraseña?".
- Otros modales o pantallas.

---

## Data model

```ts
// Enums (Postgres)
type RelationshipType = "mother" | "father" | "guardian";
type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

// invitations (nueva tabla)
type Invitation = {
  id: string;           // uuid PK
  child_id: string;     // uuid FK → children
  invited_by: string;   // uuid FK → users (staff)
  full_name: string;
  email: string;
  relationship: RelationshipType;
  code: string;         // UNIQUE, 5 chars, uppercase alphanumeric
  status: InvitationStatus;
  expires_at: string;   // timestamptz
  accepted_at?: string; // timestamptz nullable
  created_at: string;
};

// parent_children (nueva tabla)
type ParentChild = {
  id: string;
  parent_id: string;    // uuid FK → users
  child_id: string;     // uuid FK → children
  relationship: RelationshipType;
  created_at: string;
};
```

Este feature modifica el tipo `Kid` existente solo en la medida en que ahora los `parents` pueden provenir de `parent_children` en lugar de mock data. Los tipos del modal (`LinkParentFormState`, `LinkParentFormErrors`) se mantienen.

---

## Implementation plan

1. **Crear migración `004_create_invitations_and_parent_children.sql`** — definir enums `relationship_type` e `invitation_status`, tablas `invitations` (con `code UNIQUE`, `expires_at`, `status` default `pending`) y `parent_children` (con `UNIQUE(parent_id, child_id)`), índices en `code`, `child_id`, `parent_id`, RLS policies para que solo usuarios del mismo daycare puedan leer/insertar, y grants necesarios. Aplicar migración.

2. **Instalar dependencia `resend`** — `npm install resend`. Agregar `RESEND_API_KEY=` a `.env` (el valor se completa manualmente). Documentar en spec que se requiere.

3. **Crear Server Action `app/actions/invitation.ts`** (`"use server"`):
   - Función `generateInvitationCode(): Promise<string>` — loop que genera 5 caracteres alfanuméricos mayúsculos y verifica unicidad contra `invitations.code` antes de retornar.
   - Función `sendParentInvitation(formData)` — recibe `childId`, `fullName`, `email`, `relationship`. Valida campos. Genera código. Inserta en `invitations`. Llama a Resend para enviar email HTML. Retorna `{ success: true }` o `{ success: false, error: string }`.

4. **Actualizar `LinkParentModal.tsx`** — reemplazar `alert("Invitación enviada")` por llamada a `sendParentInvitation()`. Agregar estado `isSubmitting` (deshabilita botón, muestra spinner). Agregar manejo de errores (mensaje de error general bajo el botón). En éxito: cerrar modal, limpiar formulario, mostrar mensaje de éxito (puede ser un `alert` simple por ahora).

5. **Actualizar `app/activate-account/page.tsx`** — convertir el formulario estático en un formulario controlado con estado. Leer query param `code` desde la URL. Si existe `?code=`, renderizar el campo de código de invitación (vacío, editable). Si no existe, no renderizar el campo. El usuario ingresa el código manualmente cuando el campo está visible. Agregar validación de campos en cliente antes de submit.

6. **Crear Server Action `app/actions/activate-account.ts`** (`"use server"`):
   - Función `registerParentWithInvitation(formData)` — recibe `code`, `email`, `password`, `fullName`.
   - Busca invitación por `code` con `status = 'pending'` y `expires_at > now()`.
   - Valida que `email` coincida con `invitation.email`.
   - Llama a `supabase.auth.signUp()` con `emailConfirm: false` (para evitar doble confirmación).
   - Inserta fila en `public.users` con `role = 'parent'`, `status = 'active'`, `daycare_id` del niño.
   - Actualiza `invitations` a `status = 'accepted'`, `accepted_at = now()`.
   - Inserta en `parent_children` con `relationship` de la invitación.
   - Retorna `{ success: true }` o `{ success: false, error: string }`.

7. **Actualizar `app/activate-account/page.tsx`** — conectar el submit del formulario a `registerParentWithInvitation()`. Mostrar errores debajo de campos. En éxito, redirigir a `/login` con mensaje de éxito (o auto-login).

8. **Verificar proxy.ts** — asegurar que `/activate-account` sigue siendo ruta pública.

9. **Ejecutar `npm run lint` y `npx tsc --noEmit`**.

---

## Acceptance criteria

- [ ] La migración `004_create_invitations_and_parent_children.sql` crea las tablas y enums sin errores.
- [ ] El código de invitación generado tiene exactamente 5 caracteres alfanuméricos en mayúsculas.
- [ ] El código es único en la tabla `invitations`.
- [ ] El modal "Vincular padre" envía la invitación vía Server Action y muestra un estado de carga.
- [ ] Al enviar la invitación, se inserta un registro en `invitations` con `status = 'pending'` y `expires_at` en 7 días.
- [ ] Se envía un email real vía Resend con el código y un link a `/activate-account?code=XXXXX`.
- [ ] El email incluye el nombre del niño y el brand OpenDayCare.
- [ ] Si el envío falla, el modal muestra un mensaje de error y no cierra.
- [ ] En éxito, el modal cierra y limpia el formulario.
- [ ] `/activate-account` muestra el campo de código de invitación solo si la URL tiene `?code=XXXXX`.
- [ ] Cuando se muestra, el campo de código aparece vacío y editable para ingreso manual.
- [ ] Si no hay query param, el campo de código no aparece en el formulario.
- [ ] Al registrarse, se valida que el código exista, esté pendiente y no haya expirado.
- [ ] Se valida que el email del registro coincida con el de la invitación.
- [ ] Se crea el usuario en `auth.users` vía `supabase.auth.signUp()` sin confirmación de email.
- [ ] Se crea la fila en `public.users` con `role = 'parent'`.
- [ ] Se marca la invitación como `accepted`.
- [ ] Se crea el vínculo en `parent_children`.
- [ ] En éxito, el padre puede iniciar sesión con su email y contraseña.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Desactivar confirmación de email de Supabase Auth (`emailConfirm: false`). El código de invitación ya valida la identidad del padre; evita fricción adicional.
- **Sí:** Server Action de Next.js para enviar email con Resend. Más simple que Edge Function para este caso; la API key de Resend vive en variables de entorno del servidor y nunca llega al cliente.
- **Sí:** Validar que el email del registro coincida exactamente con el email de la invitación. Evita que alguien reutilice un código con otra dirección.
- **Sí:** El link del email incluye el código como query param (`?code=XXXXX`) para mostrar el campo de código en `/activate-account`, pero el padre siempre ingresa el código manualmente.
- **Sí:** La Server Action de registro maneja todo el flujo atómico (signUp → insert users → update invitation → insert parent_children). Si algo falla, el usuario puede reintentar; Supabase Auth maneja el caso de email ya existente.
- **Sí:** Variable de entorno `NEXT_PUBLIC_APP_URL` para el dominio base del link. Permite cambiar fácilmente entre localhost y producción.
- **Sí:** Variable de entorno `RESEND_API_KEY` en `.env` con valor vacío por defecto; se completa manualmente. No se commitea el valor real.
- **No:** No se usa trigger de Postgres para crear `parent_children`. Se prefiere control explícito en la Server Action para manejo de errores y trazabilidad.
- **No:** No se implementa re-envío de invitación. Si el email falla, el staff debe generar una nueva.
- **No:** No se implementa cancelación de invitación. Una vez enviada, queda pendiente hasta que expire o se acepte.
- **No:** No se agrega lógica de "olvidé mi contraseña" ni validación de contraseña fuerte. El scope es mínimo.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Resend API key expuesta accidentalmente en cliente | La key solo se usa en Server Action (`"use server"`); nunca se importa en componentes cliente. |
| `signUp()` sin confirmación de email podría ser rechazado por políticas de Supabase | Verificar en dashboard de Supabase que "Confirm email" esté deshabilitado para el proyecto. |
| Código de invitación colisiona (probabilidad baja pero no cero) | Loop de generación con verificación de unicidad en DB antes de retornar. |
| El email llega a spam | Usar dominio verificado en Resend; en dev, usar `resend.com` con email de test. |

---

## What is **not** in this spec

- Re-envío o cancelación de invitaciones.
- Edición o eliminación de padres vinculados.
- Notificación por email al staff cuando el padre acepta.
- Límite de cantidad de padres por niño.
- Validación de contraseña fuerte.
- Flujo de "¿Olvidaste tu contraseña?".
- Auto-login inmediato después de la activación (se redirige a `/login`).

Cada una de esas, si llega, va en su propio spec.
