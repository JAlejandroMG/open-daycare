# SPEC 06 — Implementar modal "Nueva publicación" en el feed

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-08-24
> **Objective:** Implementar el modal "Nueva publicación" activado desde el sidebar en `/`, con destinatarios hardcodeados, 7 tipos de post, validación de campos obligatorios y agregado inmediato al feed.

---

## Scope

**In:**

- Modal centrado con overlay backdrop, replicando el diseño de `references/pantallas/crear-publicacion.dc.html`.
- Header con "Cancelar" (izquierda), "Nueva publicación" (centro), "Publicar" (derecha).
- Sección "PARA": pills de cada niño del mock (avatar + nombre) + pill "Toda la sala". **Selección múltiple obligatoria**. "Toda la sala" es excluyente: si se selecciona, deselecciona los individuales; si se selecciona uno o más individuales, deselecciona "Toda la sala".
- Sección "TIPO": 7 pills de tipo de publicación con colores del mockup. Selección única obligatoria.
- Sección "DESCRIPCIÓN": `<textarea>` con placeholder "Contá cómo le fue hoy…". Campo obligatorio.
- Validación de front-end: si falta destinatario, tipo o descripción, mostrar borde rojo/mensaje de error y no cerrar el modal.
- Al pasar validación: construir objeto `Post`, agregarlo al array `posts` de `lib/_data/mock-data.ts`, ejecutar `router.refresh()` para actualizar el feed, mostrar `alert("Publicación creada")`, cerrar el modal y limpiar el formulario.
- Click en "Cancelar" o en el overlay cierra el modal sin publicar.
- Integración con el botón "Nueva publicación" del sidebar (desktop y mobile drawer).
- Responsive: el modal se adapta a mobile (ancho completo con márgenes, no desbordar).
- Expansión de `PostType` y `POST_TYPE_CONFIG` para incluir los 7 tipos.

**Out of scope (for future specs):**

- Funcionalidad de la sección "FOTOS" (solo visual en este spec).
- Click en `NewPostPrompt` para abrir el mismo modal.
- Persistencia real (localStorage, backend/API). Los datos se pierden al recargar.
- Edición o eliminación de publicaciones.
- Conexión a backend/API.
- Autenticación o permisos.

---

## Data model

```ts
// Expansión en lib/_data/types.ts
type PostType =
  | "achievement"
  | "activity"
  | "announcement"
  | "food"
  | "nap"
  | "cheer"
  | "picture";

// Cambios en el tipo Post (lib/_data/types.ts)
// childName: string → childNames: string[]
// childInitial: string → childInitials: string[]
// avatarBackgroundColor: string → avatarBackgroundColors: string[]
// avatarTextColor: string → avatarTextColors: string[]
// recipient: string → recipients: string[]

// Form state local del modal
type CreatePostFormState = {
  recipientKidIds: string[] | ["all"] | []; // [] = sin seleccionar
  type: PostType | "";
  description: string;
};

type CreatePostFormErrors = {
  recipient?: string;
  type?: string;
  description?: string;
};
```

Este feature expande `PostType` y `POST_TYPE_CONFIG`. Modifica la estructura de `Post` para soportar múltiples destinatarios.

---

## Implementation plan

1. **Actualizar `lib/_data/types.ts`** — expandir `PostType` con `"food" | "nap" | "cheer" | "picture"`. Modificar tipo `Post`: `childName` → `childNames: string[]`, `childInitial` → `childInitials: string[]`, `avatarBackgroundColor` → `avatarBackgroundColors: string[]`, `avatarTextColor` → `avatarTextColors: string[]`, `recipient` → `recipients: string[]`.

2. **Actualizar `lib/_data/post-type-config.ts`** — agregar configs para `food`, `nap`, `cheer`, `picture` con labels en español, clases Tailwind y colores hex (backgroundColor, textColor) según el mockup.

3. **Actualizar mock data (`lib/_data/mock-data.ts`)** — convertir los 3 posts existentes al nuevo formato de arrays.

4. **Actualizar `components/feed/post/PostHeader.tsx`** — renderizar múltiples avatares de 32px en fila horizontal. Mostrar todos los nombres truncados si son muchos.

5. **Actualizar `components/feed/post/PostBody.tsx`** — mostrar "Para: familias de Mateo, Sofía y Benjamín" cuando hay múltiples destinatarios.

6. **Crear `components/feed/CreatePostModal.tsx`** (`"use client"`) — esqueleto del modal con overlay backdrop (`fixed inset-0 bg-black/30 z-[60]`), panel centrado (`max-w-[580px]`, fondo `#FBF4EC`, bordes redondeados `rounded-3xl`). Header con "Cancelar", "Nueva publicación", "Publicar". Sin campos todavía.

7. **Implementar sección "PARA" en `CreatePostModal`** — importar `kids` desde `mock-data.ts`. Renderizar pills redondeados con avatar (`initial`, colores del kid) y nombre (primer nombre). Pill adicional "Toda la sala". Estado: `recipientKidIds` (array). **Selección múltiple**: toggle en array. Lógica excluyente: si se elige "Toda la sala", se limpia array de kids individuales; si se elige un kid individual, se deselecciona "Toda la sala".

8. **Implementar sección "TIPO" en `CreatePostModal`** — renderizar 7 pills desde `POST_TYPE_CONFIG`. Single-select. Cada pill usa inline styles con `backgroundColor` y `textColor` del config. Estado: `type`.

9. **Implementar sección "DESCRIPCIÓN" en `CreatePostModal`** — `<textarea>` con estilos del mockup (fondo blanco, borde `#EADFD0`, bordes redondeados). Placeholder "Contá cómo le fue hoy…". Estado: `description`.

10. **Implementar sección "FOTOS" en `CreatePostModal`** — visual solamente: dos cuadros de 96×96px (placeholder de imagen + botón "Agregar" con borde dashed).

11. **Implementar validación de front-end** — al hacer click en "Publicar", verificar que `recipientKidIds.length > 0`, `type !== ""` y `description.trim() !== ""`. Si hay errores, marcar campos con borde rojo (`border-red-400`) y mostrar mensaje de error debajo de cada campo. No cerrar el modal.

12. **Implementar lógica de publicación** — si la validación pasa:
   - Si es "Toda la sala": hardcodear `childNames: ["Anuncio general"]`, `childInitials: ["A"]`, colores de avatar del anuncio existente, `recipients: ["toda la sala"]`.
   - Si son kids individuales: obtener datos de cada kid seleccionado. Construir arrays `childNames`, `childInitials`, `avatarBackgroundColors`, `avatarTextColors` con los datos de cada kid. `recipients` será `["familia de Mateo", "familia de Sofía", ...]`.
   - Construir objeto `Post` con `id` generado como timestamp, `publishedAt` como hora actual `HH:MM`, `authorName: currentUser.name`, `isAuthor: true`, `likesCount: 0`, `commentsCount: 0`.
   - Hacer `push()` al array `posts` de `lib/_data/mock-data.ts`.
   - Llamar `router.refresh()` (desde `useRouter` de `next/navigation`) para forzar re-render del server component del feed.
   - Mostrar `alert("Publicación creada")`.
   - Cerrar el modal y limpiar el formulario.

13. **Crear `components/feed/CreatePostButton.tsx`** (`"use client"`) — contiene el botón "Nueva publicación" con gradiente coral (extraído del sidebar actual) y maneja `isModalOpen`. Renderiza `CreatePostModal` cuando `isModalOpen` es true.

14. **Actualizar `components/feed/SidebarContent.tsx`** — reemplazar el `<a href="/crear-publicacion">` actual por `<CreatePostButton />`. Mantener todos los estilos visuales del botón.

15. **Verificar responsive** — en mobile el modal debe tener ancho completo con márgenes (`mx-4`), padding adecuado, y no desbordar.

16. **Ejecutar `npm run lint` y `npx tsc --noEmit`** para verificar que no hay errores.

---

## Acceptance criteria

- [ ] Click en "Nueva publicación" en el sidebar abre el modal centrado con overlay en desktop.
- [ ] En mobile, click en "Nueva publicación" dentro del drawer hamburguesa abre el mismo modal.
- [ ] El header del modal muestra "Cancelar", "Nueva publicación" y "Publicar".
- [ ] La sección "PARA" muestra un pill por cada niño de `mock-data.ts` más "Toda la sala".
- [ ] Los pills de niño muestran avatar redondo con inicial y nombre.
- [ ] Se pueden seleccionar múltiples niños a la vez.
- [ ] "Toda la sala" es excluyente: seleccionarla deselecciona todos los niños individuales.
- [ ] Seleccionar uno o más niños individuales deselecciona "Toda la sala".
- [ ] La sección "TIPO" muestra 7 pills: Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio.
- [ ] Cada pill de tipo tiene los colores de fondo y texto del mockup.
- [ ] Solo un tipo puede estar seleccionado a la vez.
- [ ] La descripción es un `<textarea>` con placeholder "Contá cómo le fue hoy…".
- [ ] La sección "FOTOS" muestra dos cuadros de 96×96px (placeholder de imagen + botón "Agregar").
- [ ] Intentar publicar con campos obligatorios vacíos muestra errores visuales (borde rojo/mensaje) y no cierra el modal.
- [ ] Completar destinatario(s), tipo y descripción, y hacer click en "Publicar" agrega el post al feed de `/` inmediatamente.
- [ ] Después de publicar se muestra `alert("Publicación creada")` y el modal se cierra.
- [ ] Click en "Cancelar" o en el overlay cierra el modal sin publicar ni mostrar errores.
- [ ] El diseño del modal coincide con `references/pantallas/crear-publicacion.dc.html` (colores, bordes, tipografía, bordes redondeados).
- [ ] En mobile el modal es responsive y no se corta.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Componente auto-contenido `CreatePostButton` que encapsula el botón del sidebar y el estado del modal. Evita ensuciar `SidebarContent` con lógica de modal.
- **Sí:** Reutilizar el array `kids` de `lib/_data/mock-data.ts` para los destinatarios. Evita duplicar datos y mantiene consistencia.
- **Sí:** Expansión de `PostType` y `POST_TYPE_CONFIG` en los archivos de datos existentes. Mantiene la fuente única de verdad para labels y colores.
- **Sí:** `router.refresh()` para actualizar el feed server component después de mutar `mock-data.ts`. Es el mecanismo estándar de Next.js App Router para re-renderizar server components desde el cliente.
- **Sí:** Para "Toda la sala", hardcodear `childNames: ["Anuncio general"]`, `childInitials: ["A"]` y colores de avatar del anuncio existente. Es consistente con el mock data actual.
- **Sí:** Para múltiples kids individuales, construir arrays con los datos de cada kid seleccionado. `recipients` será `["familia de Mateo", "familia de Sofía", ...]`.
- **Sí:** En `PostHeader`, renderizar múltiples avatares de 32px en fila horizontal y mostrar todos los nombres truncados si son muchos.
- **Sí:** En `PostBody`, mostrar "Para: familias de Mateo, Sofía y Benjamín" cuando hay múltiples destinatarios.
- **Sí:** Alert nativo de JavaScript para el mensaje de éxito. Simple y consistente con SPEC 04 y SPEC 05.
- **Sí:** Sección "FOTOS" visual solamente (dos cuadros de 96×96px). La funcionalidad de upload queda para un spec futuro.
- **No:** No se conecta `NewPostPrompt` al modal. Solo el botón del sidebar abre el modal en este spec.
- **No:** No se crea un componente de Toast reutilizable. Se usa `alert()` para mantener el scope mínimo.
- **No:** No se implementa localStorage ni persistencia. Los datos son puramente en memoria.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| `router.refresh()` puede no actualizar el feed si el usuario no está en `/` | El post igual se agrega a `mock-data.ts`; al navegar a `/` se verá. Se acepta este comportamiento para el alcance actual. |
| `SidebarContent` se renderiza en desktop y mobile drawer; dos instancias de `CreatePostButton` coexisten | Cada instancia tiene su propio estado; solo una es interactiva a la vez según el viewport. El modal usa `fixed` con `z-[60]` para asegurar que quede por encima. |
| Mutar `mock-data.ts` directamente puede causar side-effects en otros componentes | Solo se muta desde `CreatePostModal` al publicar; no hay otros escritores concurrentes en este spec. |
| Cambiar el tipo `Post` puede romper componentes existentes | Actualizar `PostHeader`, `PostBody` y mock data existente para usar el nuevo formato de arrays. |

---

## What is **not** in this spec

- Funcionalidad de la sección "FOTOS" (solo visual).
- Apertura del modal desde `NewPostPrompt`.
- Persistencia de datos (localStorage, backend).
- Edición o eliminación de publicaciones.
- Componente de toast reutilizable.
- Autenticación o permisos.

Cada una de esas, si llega, va en su propio spec.
