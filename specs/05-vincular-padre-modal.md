# SPEC 05 — Implementar modal "Vincular padre" en perfil de niño

> **Status:** Approved
> **Depends on:** SPEC 02
> **Date:** 2026-08-23
> **Objective:** Implementar el modal "Vincular padre" activado desde el enlace "Vincular otro padre" en `/kids/[id]`, con datos hardcodeados, validación de campos obligatorios y diseño fiel al mockup.

---

## Scope

**In:**

- Modal centrado con overlay, replicando el diseño de `references/pantallas/vincular-padre.dc.html`.
- Header con título "Vincular padre" y subtítulo dinámico con el nombre del niño (ej. "a Mateo Fernández").
- Caja informativa azul con ícono y texto explicativo.
- 3 campos obligatorios: Nombre del padre/madre (input text), Email (input type email), Parentesco (botones de selección única: Mamá, Papá, Tutor/a).
- Selección de parentesco con estado visual activo/inactivo; "Mamá" pre-seleccionada por defecto.
- Código de invitación hardcodeado (`7K4P9`) con indicación "Vence en 7 días".
- Botón "Enviar invitación" con gradiente coral e ícono.
- Validación de front-end: si falta algún campo obligatorio al hacer click en Enviar, mostrar borde rojo/mensaje de error y no cerrar el modal.
- Al pasar validación: mostrar `alert("Invitación enviada")`, cerrar el modal y limpiar el formulario.
- Botón de cierre (X) en el header que cierra el modal sin enviar.
- Responsive: el modal se adapta a mobile.
- Integración con la página de perfil de niño existente (`/kids/[id]`).

**Out of scope (for future specs):**

- Generación dinámica del código de invitación.
- Envío real de correo electrónico.
- Persistencia del padre vinculado (backend, localStorage).
- Edición o eliminación de padres vinculados.
- Autenticación o permisos.
- Otros modales o pantallas.

---

## Data model

```ts
type ParentRelationship = "Mamá" | "Papá" | "Tutor/a";

type LinkParentFormState = {
  name: string;
  email: string;
  relationship: ParentRelationship;
};

type LinkParentFormErrors = {
  name?: string;
  email?: string;
  relationship?: string;
};
```

Este feature no modifica el tipo `Kid` existente. El modal opera con estado local puro.

---

## Implementation plan

1. **Crear `components/kids/profile/LinkParentModal.tsx`** (`"use client"`) — esqueleto del modal con overlay backdrop (`fixed inset-0 bg-black/30`), panel centrado (`max-w-[480px]`, fondo `#FBF4EC`, bordes redondeados). Header con título, subtítulo dinámico (nombre del niño pasado como prop) y botón de cierre (X). Sin campos todavía.

2. **Implementar campos del formulario en `LinkParentModal`** — input Nombre del padre/madre, input Email, grupo de botones Parentesco (Mamá/Papá/Tutor/a), caja de código de invitación hardcodeado. Todos con estilos del mockup. Mamá pre-seleccionada por defecto.

3. **Implementar validación de front-end** — al hacer click en "Enviar invitación", verificar que `name`, `email` y `relationship` no estén vacíos. Si hay errores, marcar campos con borde rojo (`border-red-400`) y mostrar mensaje de error debajo de cada campo. No cerrar el modal.

4. **Implementar lógica de envío** — si la validación pasa, mostrar `alert("Invitación enviada")`, llamar `onClose()` y limpiar el formulario.

5. **Crear `components/kids/profile/KidProfileClient.tsx`** (`"use client"`) — wrapper que recibe `kid` como prop, maneja `isModalOpen`, renderiza `LinkParentButton` (pasando `onClick={() => setIsModalOpen(true)}`) y `LinkParentModal` (pasando `kid`, `isOpen`, `onClose`).

6. **Actualizar `components/kids/profile/LinkParentButton.tsx`** — recibir `onClick?: () => void` como prop. Cambiar `<a href="/vincular-padre">` a `<button onClick={onClick}>`. Mantener estilos visuales.

7. **Actualizar `app/(dashboard)/kids/[id]/page.tsx`** — usar `KidProfileClient` pasando `kid` en lugar de renderizar los componentes directamente. La lógica de `notFound()` y búsqueda del niño permanece en el server component.

8. **Verificar responsive** — en mobile el modal debe tener padding adecuado, ancho completo con márgenes, y no desbordar.

9. **Ejecutar `npm run lint` y `npx tsc --noEmit`** para verificar que no hay errores.

---

## Acceptance criteria

- [ ] Click en "Vincular otro padre" en `/kids/[id]` abre el modal centrado con overlay.
- [ ] El header muestra "Vincular padre" y el subtítulo incluye el nombre del niño actual.
- [ ] El modal muestra la caja informativa azul con el texto correcto.
- [ ] Los placeholders coinciden con el mockup (`Ej. Diego Fernández`, `correo@ejemplo.com`).
- [ ] Los botones de parentesco muestran "Mamá", "Papá" y "Tutor/a"; "Mamá" aparece pre-seleccionada con estilo activo.
- [ ] Click en un botón de parentesco no seleccionado lo marca como activo y desactiva los demás.
- [ ] El código de invitación muestra `7K4P9` y el texto "Vence en 7 días".
- [ ] Intentar enviar con campos obligatorios vacíos muestra errores visuales (borde rojo/mensaje) y no cierra el modal.
- [ ] Completar todos los campos obligatorios y hacer click en "Enviar invitación" muestra `alert("Invitación enviada")`, cierra el modal y limpia el formulario.
- [ ] Click en la X del header cierra el modal sin enviar ni mostrar errores.
- [ ] El diseño del modal coincide con `references/pantallas/vincular-padre.dc.html` (colores, bordes, tipografía, gradientes).
- [ ] En mobile el modal es responsive y no se corta.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Componente wrapper cliente (`KidProfileClient`) para manejar estado del modal. Evita convertir toda la página a cliente y mantiene la búsqueda del niño en el server.
- **Sí:** Código de invitación hardcodeado (`7K4P9`). La generación dinámica va en otro spec.
- **Sí:** Input de email como `<input type="email">` para activar validación nativa del teclado en mobile, aunque la validación real se hace manualmente.
- **Sí:** Botones de parentesco como `<button>` con estado local en lugar de `<select>` o radio buttons. Coincide con el diseño visual del mockup.
- **Sí:** Alert nativo de JavaScript para el mensaje de éxito. Simple y consistente con SPEC 04.
- **No:** No se persiste el padre vinculado. El modal es puramente visual y de placeholder.
- **No:** No se genera el código de invitación dinámicamente. Es un valor fijo hardcodeado.
- **No:** No se crea un componente de Toast reutilizable. Se usa `alert()` para mantener el scope mínimo.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Conversión de `LinkParentButton` de `<a>` a `<button>` puede afectar estilos o accesibilidad | Mantener los mismos estilos visuales; agregar `type="button"` para evitar submit accidental. |
| Introducir `KidProfileClient` como wrapper puede complicar el flujo de datos si se agregan más interacciones | El wrapper solo maneja el estado del modal; no muta datos ni afecta el render del resto de la página. |

---

## What is **not** in this spec

- Generación dinámica de códigos de invitación.
- Envío real de correos electrónicos.
- Persistencia de padres vinculados (backend, localStorage).
- Edición o eliminación de padres existentes.
- Componente de toast reutilizable.
- Autenticación o permisos.

Cada una de esas, si llega, va en su propio spec.
