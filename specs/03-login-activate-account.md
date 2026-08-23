# SPEC 03 — Implementar pantallas de login y activar cuenta

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-08-22
> **Objective:** Implementar las páginas `/login` y `/activate-account` replicando fielmente los diseños de `references/pantallas/login.dc.html` y `references/pantallas/activar-cuenta.dc.html`, con inputs editables hardcodeados, navegación entre ellas y responsive, sin lógica de autenticación.

---

## Scope

**In:**

- Página `/login` con layout de dos columnas en desktop: panel lateral coral izquierdo (logo, frase, nombre de guardería) y formulario derecho (email, contraseña, "¿Olvidaste tu contraseña?", botón "Iniciar sesión", link a `/activate-account`).
- Inputs de email y contraseña editables, con valores/placeholders hardcodeados.
- Página `/activate-account` con formulario centrado: logo, título "Bienvenida a OpenDayCare", card de invitación (niño y sala), código de invitación, email, contraseña, checkbox de autorización, botón "Activar mi cuenta", link a `/login`.
- Navegación entre ambas páginas usando `<Link>` de Next.js.
- Responsive: en `/login`, en mobile se oculta el panel lateral y se muestra solo el formulario centrado. `/activate-account` siempre centrado.
- Fuentes Fredoka (headings) + Nunito (body) y paleta cálida (`#FBF4EC`, coral `#F6A98E`/`#EC7E62`).
- Copy en español rioplatense (voseo).

**Out of scope (for future specs):**

- Componente de selección "Ingreso como" (Personal / Familia) en login.
- Lógica de autenticación real (login, registro, validación de contraseña).
- Backend/API.
- Funcionalidad de "¿Olvidaste tu contraseña?" (pantalla futura).
- Otras pantallas.

---

## Data model

This feature introduces no new data structures. It uses hardcoded placeholder values directly in the JSX inputs.

---

## Implementation plan

1. **Crear `app/login/page.tsx`** — layout de dos columnas en desktop: panel lateral izquierdo con gradiente coral, círculos decorativos, logo OpenDayCare, frase y nombre de guardería; panel derecho con formulario centrado (título, subtítulo, input email con valor hardcodeado, input contraseña con placeholder, link "¿Olvidaste tu contraseña?", botón "Iniciar sesión", link a `/activate-account`). En mobile (`< lg`), el panel lateral se oculta con `hidden lg:flex` y el formulario ocupa todo el viewport centrado.

2. **Crear `app/activate-account/page.tsx`** — contenedor centrado vertical y horizontalmente, fondo `#FBF4EC`, ancho máximo ~440px. Incluye: logo/icono gradiente, título, subtítulo, card blanca con avatar del niño y sala, input código de invitación con valor hardcodeado, input email con valor hardcodeado, input contraseña con valor hardcodeado, label-checkbox de autorización (estilo hardcodeado como en el mock), botón "Activar mi cuenta", link a `/login`. Todos los inputs son editables.

3. **Verificar navegación** — los links "Activá tu cuenta" (desde login) e "Iniciar sesión" (desde activar cuenta) usan `<Link href="/...">` de Next.js.

4. **Verificar responsive** — en mobile, `/login` muestra solo el formulario centrado; `/activate-account` permanece centrado.

5. **Ejecutar `npm run lint` y `npx tsc --noEmit`** para verificar que no hay errores.

---

## Acceptance criteria

- [ ] `/login` muestra en desktop el panel coral izquierdo y el formulario derecho.
- [ ] `/login` en mobile oculta el panel lateral y muestra solo el formulario centrado.
- [ ] `/activate-account` muestra el formulario centrado en todas las vistas.
- [ ] Los inputs de email, contraseña, código de invitación son editables y tienen valores/placeholders hardcodeados.
- [ ] El link "Activá tu cuenta" en login apunta a `/activate-account` y funciona.
- [ ] El link "Iniciar sesión" en activate-account apunta a `/login` y funciona.
- [ ] Se usan las fuentes Fredoka y Nunito correctamente.
- [ ] La paleta de colores coincide con los mockups (fondo cálido, acentos coral).
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Rutas `/login` y `/activate-account` (mix inglés/español según convención del proyecto y mockups).
- **Sí:** Inputs editables con valores iniciales hardcodeados (placeholders) para simular datos sin lógica de estado.
- **Sí:** Sin componente de selección "Personal / Familia" en login — solo diseño estático como se pidió.
- **Sí:** Sin layout compartido `(dashboard)` — estas páginas son públicas y no llevan sidebar.
- **No:** No se implementa lógica de autenticación ni manejo de formularios (sin `onSubmit`, sin validación).
- **No:** No se usa `next/image` porque no hay imágenes reales, solo íconos SVG inline y avatares con iniciales.

---

## What is **not** in this spec

- Lógica de autenticación real.
- Componente de selección "Ingreso como" (Personal / Familia).
- Backend/API.
- Pantalla de "¿Olvidaste tu contraseña?".
- Otras pantallas del mockup.

Cada una de esas, si llega, va en su propio spec.
