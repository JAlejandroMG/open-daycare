# SPEC 07 — Autenticación con Supabase y protección de rutas

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 03
> **Date:** 2026-08-28
> **Objective:** Implementar login real con Supabase Auth (email + password), protección de rutas con el patrón Proxy de Next.js 16, logout funcional en el sidebar y actualización del `currentUser` del sidebar para mostrar el usuario autenticado.

---

## Scope

**In:**

- Archivo `proxy.ts` en la raíz siguiendo el patrón Proxy de Next.js 16 (sustituye `middleware.ts` deprecado).
- Rutas públicas: `/login`, `/activate-account`. Todas las demás requieren autenticación.
- Login funcional en `/login` usando `supabase.auth.signInWithPassword()` desde un Client Component.
- Mensajes de error inline en el formulario de login (sin `alert`).
- Redirección a `/` al autenticarse exitosamente.
- Redirección a `/login` al acceder a una ruta protegida sin sesión.
- Redirección a `/` al acceder a `/login` o `/activate-account` con sesión activa.
- Logout real en el sidebar: botón que ejecuta `supabase.auth.signOut()` y redirige a `/login`.
- Actualización del `currentUser` en el sidebar: mostrar nombre y avatar derivados del usuario autenticado real.

**Out of scope (for future specs):**

- Actualización de `currentUser` en `FeedHeader`, `NewPostPrompt` y `CreatePostModal`.
- Pantalla `/activate-account` con lógica real de registro (solo se protege, no se modifica).
- Pantalla de "¿Olvidaste tu contraseña?" / reseteo de contraseña.
- Tabla de usuarios en la base de datos (perfil, roles, sala).
- Manejo de roles y permisos granulares.
- Persistencia de datos del perfil de usuario.
- Autenticación con proveedores externos (Google, etc.).

---

## Data model

Este feature no introduce nuevas estructuras de datos. Utiliza el objeto `User` de Supabase Auth (`@supabase/supabase-js`) y los helpers existentes en `utils/supabase/`.

```ts
// Objeto User de Supabase Auth (proporcionado por supabase-js)
type User = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    // otros campos opcionales
  };
  // ...
};

// Estado local del formulario de login
type LoginFormState = {
  email: string;
  password: string;
  error: string | null;
  isLoading: boolean;
};
```

---

## Implementation plan

1. **Crear `proxy.ts` en la raíz** — archivo Proxy de Next.js 16 (sustituye el patrón `middleware.ts` deprecado). Exporta la función `proxy(request: NextRequest)` y un `config` con `matcher`. Usa `createServerClient` de `@supabase/ssr` con `getAll()` y `setAll()` en cookies. Llama `supabase.auth.getSession()` (lectura de cookies, sin network call) para verificar la sesión. Define `PUBLIC_ROUTES = ["/login", "/activate-account"]`. Si no hay sesión y la ruta no es pública, redirige a `/login`. Si hay sesión y la ruta es pública, redirige a `/`.

2. **Modificar `app/(dashboard)/layout.tsx`** — convertir a Server Component async. Obtener el usuario autenticado con `createClient` de `utils/supabase/server.ts` y `supabase.auth.getUser()`. Si no hay usuario, redirigir a `/login` (defensa en profundidad). Pasar el objeto `user` como prop a `Sidebar` y `SidebarDrawer`.

3. **Modificar `components/feed/Sidebar.tsx`** — aceptar prop `user: User` (de `@supabase/supabase-js`) y pasarlo a `SidebarContent`.

4. **Modificar `components/feed/SidebarDrawer.tsx`** — aceptar prop `user: User` y pasarlo a `SidebarContent`.

5. **Modificar `components/feed/SidebarContent.tsx`** — aceptar prop `user: User`. Derivar datos del usuario autenticado: `name` de `user.user_metadata?.name || user.email?.split("@")[0] || "Usuario"`, `initial` de la primera letra del nombre. Mantener `role` y `room` del mock `currentUser` (no hay tabla de usuarios todavía). Reemplazar el `<a href="/login">` del logout por un `<button>` que ejecuta `supabase.auth.signOut()` usando `createClient` de `utils/supabase/client.ts`, y luego redirige a `/login` con `window.location.href`.

6. **Modificar `app/(auth)/login/page.tsx`** — convertir a Client Component (`"use client"`). Estado: `email`, `password`, `error` (string | null), `isLoading` (boolean). Usar `createClient` de `utils/supabase/client.ts`. En `onSubmit`: prevenir default, llamar `supabase.auth.signInWithPassword({ email, password })`. Si hay error, mostrar mensaje inline en rojo debajo del botón. Si éxito, `router.push("/")`. Reemplazar `defaultValue` hardcodeado por placeholders. Agregar `disabled={isLoading}` al botón.

7. **Ejecutar `npm run lint` y `npx tsc --noEmit`** para verificar que no hay errores.

---

## Acceptance criteria

- [ ] Existe `proxy.ts` en la raíz del proyecto con la función `proxy` exportada.
- [ ] Acceder a `/` sin sesión redirige a `/login`.
- [ ] Acceder a `/kids` sin sesión redirige a `/login`.
- [ ] Acceder a `/login` con sesión activa redirige a `/`.
- [ ] Ingresar email y password correctos en `/login` y hacer click en "Iniciar sesión" redirige a `/`.
- [ ] Ingresar credenciales incorrectas muestra un mensaje de error inline debajo del botón (en rojo, sin `alert`).
- [ ] El botón "Iniciar sesión" muestra un estado de carga mientras se procesa la autenticación.
- [ ] El sidebar desktop muestra el nombre y avatar del usuario autenticado (no el mock).
- [ ] El sidebar mobile (drawer) muestra el nombre y avatar del usuario autenticado (no el mock).
- [ ] El botón de logout en el sidebar ejecuta `supabase.auth.signOut()` y redirige a `/login`.
- [ ] Después del logout, acceder a cualquier ruta protegida redirige a `/login`.
- [ ] Los inputs de email y password inician vacíos con placeholders.
- [ ] El diseño visual de `/login` no cambia (mismos colores, tipografía, layout).
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Patrón Proxy de Next.js 16 (`proxy.ts`) en lugar de `middleware.ts` deprecado. Sigue la documentación oficial de Next.js 16.
- **Sí:** `supabase.auth.getSession()` en el proxy (lectura de cookies, 0 network calls) en lugar de `getUser()` (network call al auth server). Más rápido para un handler que corre en cada request.
- **Sí:** `supabase.auth.getUser()` en el Server Component del layout. Más seguro (verifica contra el auth server) y solo corre una vez por navegación.
- **Sí:** Client Component para `/login`. Permite manejo de estado local (error inline, loading) sin complejidad de Server Actions. El proxy ya protege server-side.
- **Sí:** Logout con `window.location.href` en lugar de `router.push`. Fuerza recarga completa para que el proxy valide la sesión eliminada y limpie cookies.
- **Sí:** Derivar `name` e `initial` del usuario de `user.user_metadata?.name || user.email`. No requiere tabla de usuarios.
- **Sí:** Mantener `role` y `room` del mock `currentUser` en el sidebar. No hay tabla de usuarios con esta información todavía.
- **No:** No se actualizan `FeedHeader`, `NewPostPrompt` ni `CreatePostModal` con el usuario real. Se mantiene `currentUser` del mock en esos componentes. Va en un spec futuro.
- **No:** No se implementa `/activate-account` con lógica real de registro.
- **No:** No se crea tabla de usuarios en la base de datos.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| `proxy.ts` ejecuta en cada request, incluyendo prefetched routes | Usar `getSession()` (0 network calls) en lugar de `getUser()` para minimizar latencia. |
| `SidebarContent` renderiza dos instancias (desktop y mobile drawer) | Cada instancia recibe el mismo `user` prop; solo una es interactiva a la vez según el viewport. |
| `window.location.href` tras logout causa flash de pantalla completa | Es necesario para que el proxy limpie la sesión; la alternativa (`router.push`) podría dejar cookies residuales. |
| Usuario sin `user_metadata.name` muestra email como nombre | El fallback a `email.split("@")[0]` produce un nombre legible. Es aceptable para el scope actual. |
| Dependencia de `@supabase/ssr` ^0.12.5 — API de `setAll` puede cambiar | La versión está fijada en `package.json`. El patrón de cookies con `getAll`/`setAll` es el recomendado actualmente. |

---

## What is **not** in this spec

- Actualización de `currentUser` en `FeedHeader`, `NewPostPrompt` y `CreatePostModal`.
- Pantalla de registro/activación de cuenta real.
- Pantalla de "¿Olvidaste tu contraseña?" o reseteo de contraseña.
- Tabla de usuarios en la base de datos (perfil, roles, sala).
- Manejo de roles y permisos granulares (RLS, etc.).
- Autenticación con proveedores externos (Google, Apple, etc.).
- Persistencia de preferencias o configuración del usuario.

Cada una de esas, si llega, va en su propio spec.
