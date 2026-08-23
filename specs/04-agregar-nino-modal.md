# SPEC 04 — Implementar modal "Agregar niño" en /kids

> **Status:** Implemented
> **Depends on:** SPEC 02
> **Date:** 2026-08-23
> **Objective:** Implementar el modal "Agregar niño" accesible desde `/kids`, con 5 campos (3 obligatorios con validación de front-end), salas hardcodeadas, máscara de fecha y agregado local al mock de niños.

---

## Scope

**In:**

- Modal centrado con overlay, replicando el diseño de `references/pantallas/agregar-nino.dc.html`.
- 5 campos: Nombre completo, Fecha de nacimiento, Sala, Alergias (etiquetas), Notas médicas.
- 3 campos obligatorios: Nombre completo, Fecha de nacimiento, Sala.
- Validación de front-end: si falta algún campo obligatorio al hacer click en Guardar, mostrar borde rojo/mensaje de error y no cerrar el modal.
- Input de fecha con máscara automática `dd/mm/aaaa` que formatea mientras se escribe.
- Dropdown de Sala con 3 opciones hardcodeadas: Soles, Lunas, Estrellas.
- Botón Guardar: si pasa validación, agrega el niño al array mock localmente, muestra alert de éxito y cierra el modal.
- La lista de `/kids` se actualiza inmediatamente para mostrar el nuevo niño.
- Botón Cancelar cierra el modal sin agregar nada.
- Responsive: el modal se adapta a mobile (padding, ancho).

**Out of scope (for future specs):**

- Persistencia real (localStorage, backend/API). Los datos se pierden al recargar.
- Edición de niño existente.
- Cálculo automática de edad a partir de la fecha.
- Subida de fotos de perfil.
- Autenticación o permisos.

---

## Data model

```ts
type RoomOption = "Soles" | "Lunas" | "Estrellas";

type AddKidFormState = {
  fullName: string;
  birthDate: string;   // formato dd/mm/aaaa
  room: RoomOption | "";
  allergies: string;
  medicalNotes: string;
};

type AddKidFormErrors = {
  fullName?: string;
  birthDate?: string;
  room?: string;
};
```

No se introducen cambios en el tipo `Kid` existente; el modal construye un objeto `Kid` completo a partir del formulario (generando `id`, `initial`, `age`, `avatarBackgroundColor`, etc.).

---

## Implementation plan

1. **Crear `components/kids/AddKidModal.tsx`** (`"use client"`) — esqueleto del modal con overlay backdrop (`fixed inset-0 bg-black/30`), panel centrado (`max-w-[520px]`, fondo `#FBF4EC`, bordes redondeados). Header con "Cancelar", "Agregar niño", "Guardar". Sin campos todavía.

2. **Implementar campos del formulario en `AddKidModal`** — Nombre completo (input text), Fecha de nacimiento (input text con placeholder `dd/mm/aaaa`), Sala (dropdown custom o `<select>` estilizado con las 3 opciones), Alergias (input text), Notas médicas (`<textarea>`). Todos con estilos del mockup.

3. **Implementar máscara de fecha** — en el `onChange` del input de fecha, formatear automáticamente a `dd/mm/aaaa` (insertar `/` después de 2do y 4to carácter, limitar a 10 chars, solo números).

4. **Implementar validación de front-end** — al hacer click en Guardar, verificar que `fullName`, `birthDate` (longitud 10) y `room` no estén vacíos. Si hay errores, marcar campos con borde rojo (`border-red-400`) y mostrar mensaje de error debajo de cada campo. No cerrar el modal.

5. **Implementar lógica de guardado** — si la validación pasa, construir un objeto `Kid` (generar `id` como timestamp, `initial` como primera letra del nombre, `age` hardcodeada como "1 año", `avatarBackgroundColor` y `avatarTextColor` desde un array predefinido, `linkedParents: 0`). Agregarlo al array `kids` de `lib/_data/mock-data.ts` (mutación en memoria). Mostrar `alert("¡Niño agregado con éxito!")`. Cerrar el modal y limpiar el formulario.

6. **Crear `components/kids/KidsPageClient.tsx`** (`"use client"`) — wrapper que maneja el estado local de `kids` (array copiado desde mock data) y `isModalOpen`. Renderiza `KidsHeader` (pasando `onAddClick`), `KidSearch`, `KidList` (pasando el array de niños actualizado).

7. **Actualizar `components/kids/KidsHeader.tsx`** — recibir `onAddClick?: () => void` como prop. El botón "Agregar niño" cambia de `<a>` a `<button onClick={onAddClick}>`.

8. **Actualizar `app/(dashboard)/kids/page.tsx`** — usar `KidsPageClient` en lugar de componer directamente los componentes.

9. **Verificar responsive** — en mobile el modal debe tener padding adecuado y no desbordar.

10. **Ejecutar `npm run lint` y `npx tsc --noEmit`**.

---

## Acceptance criteria

- [ ] Click en "Agregar niño" en `/kids` abre el modal centrado con overlay.
- [ ] El modal muestra 5 campos: Nombre completo, Fecha de nacimiento, Sala, Alergias, Notas médicas.
- [ ] Los placeholders coinciden con el mockup (`Ej. Martina López`, `dd/mm/aaaa`, `Ej. Maní, Lactosa`, etc.).
- [ ] El input de fecha aplica máscara automática `dd/mm/aaaa` mientras se escribe.
- [ ] El dropdown de Sala tiene las 3 opciones hardcodeadas: Soles, Lunas, Estrellas.
- [ ] Intentar Guardar con campos obligatorios vacíos muestra errores visuales (borde rojo/mensaje) y no cierra el modal.
- [ ] Completar los 3 campos obligatorios y hacer click en Guardar agrega el niño a la lista de `/kids` inmediatamente.
- [ ] Después de Guardar se muestra un mensaje de éxito (`alert`) y el modal se cierra.
- [ ] Click en Cancelar cierra el modal sin agregar niño ni mostrar errores.
- [ ] El diseño del modal coincide con `references/pantallas/agregar-nino.dc.html` (colores, bordes, tipografía).
- [ ] En mobile el modal es responsive y no se corta.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Componente wrapper cliente (`KidsPageClient`) para manejar estado local de niños y apertura del modal. Evita convertir toda la página a cliente.
- **Sí:** Mutación directa del array `kids` en `mock-data.ts` en memoria. Es suficiente para el mock local y se pierde al recargar (aceptado).
- **Sí:** Input de fecha con máscara manual (`onChange`) en lugar de `<input type="date">`. Más control del formato y coincide con el diseño visual.
- **Sí:** Alert nativo de JavaScript para el mensaje de éxito. Simple, no requiere biblioteca de toasts.
- **Sí:** `age` hardcodeada a "1 año" para nuevos niños. El cálculo real de edad desde fecha de nacimiento va en otro spec.
- **Sí:** Colores de avatar rotativos desde un array predefinido para nuevos niños.
- **No:** No se usa `<form>` nativo con `onSubmit`. Se maneja el click en Guardar directamente para mayor control sobre la validación y el cierre.
- **No:** No se implementa localStorage ni persistencia. Los datos son puramente en memoria.
- **No:** No se crea un componente de Toast reutilizable. Se usa `alert()` para mantener el scope mínimo.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Mutar mock data directamente puede causar side-effects inesperados en otros componentes | Solo mutar en el cliente wrapper; el server no se re-renderiza, pero el cliente sí actualiza la UI. |
| Máscara de fecha manual puede tener bugs edge-case (borrar en medio del texto, paste) | Implementar handler robusto que re-formatee el string limpio en cada cambio. |

---

## What is **not** in this spec

- Persistencia de datos (localStorage, backend).
- Edición de niños existentes.
- Cálculo automático de edad desde fecha de nacimiento.
- Subida de fotos de perfil.
- Componente de toast reutilizable.
- Autenticación o permisos.

Cada una de esas, si llega, va en su propio spec.
