# SPEC 01 — Implementar home/feed según diseño

> **Status:** Implementado
> **Depends on:** —
> **Date:** 2026-08-19
> **Objective:** Implementar la pantalla principal (home/feed) replicando fielmente el diseño de `references/pantallas/feed.dc.html`, con sidebar, publicaciones mock y responsive básico.

---

## Scope

**In:**

- Layout de dos columnas: sidebar fijo + área principal con feed.
- Sidebar con logo "OpenDayCare", botón "Nueva publicación", navegación (Feed, Niños, Avisos, Mi cuenta) y perfil del usuario con botón de logout.
- Feed cronológico inverso con separadores de fecha ("PUBLICADO HOY", etc.).
- Tres tipos de publicación: Logro (verde), Actividad (celeste), Anuncio (azul), cada uno con badge de color.
- Cada publicación muestra: avatar, nombre del niño, hora, autor, destinatario, contenido de texto, foto placeholder (solo Actividad), likes (contador visual), comentarios (contador visual), botón Editar (visual).
- Mock data para todas las publicaciones.
- Fuentes: Fredoka (headings) + Nunito (body) via Google Fonts.
- Paleta del diseño: fondo `#F6ECDF`, sidebar `#FFFDF9`, acentos coral, verde, celeste, azul.
- Copy en español rioplatense (voseo).
- Responsive básico: en mobile la sidebar se oculta, se muestra solo el feed.

**Out of scope (for future specs):**

- Funcionalidad de likes (dar/quitar like).
- Funcionalidad de comentarios (abrir, escribir, enviar).
- Botón "Nueva publicación" funcional (abrir formulario o redirigir).
- Botón "Editar" funcional.
- Subida o preview real de fotos.
- Conexión a backend/API.
- Autenticación o gestión de sesiones.
- Pantallas: crear-publicación, detalle-publicación, login, niños, avisos, mi-cuenta.

---

## Data model

```ts
type PostType = "achievement" | "activity" | "announcement";

type Post = {
  id: string;
  type: PostType;
  childName: string;
  childInitial: string;
  avatarBackgroundColor: string;
  avatarTextColor: string;
  publishedAt: string;      // "14:20"
  authorName: string;       // "Caro Giménez"
  isAuthor: boolean;        // true → "publicado por vos"
  recipient: string;        // "familia de Mateo" | "toda la sala"
  content: string;
  photoPlaceholder?: string; // solo para "activity"
  likesCount: number;
  commentsCount: number;
};

type CurrentUser = {
  name: string;
  role: string;
  room: string;
  initial: string;
};

// Config centralizada por tipo de post: evita repetir labels y clases
// Tailwind (strings mágicos) en los componentes. Los labels son UI copy
// en español; los valores de PostType son en inglés.
const POST_TYPE_CONFIG: Record<
  PostType,
  { label: string; badgeClassName: string; dotClassName: string }
> = {
  achievement: {
    label: "LOGRO",
    badgeClassName: "bg-[#CFEBD8] text-[#3E9B6C]",
    dotClassName: "bg-[#3E9B6C]",
  },
  activity: {
    label: "ACTIVIDAD",
    badgeClassName: "bg-[#C7E7F1] text-[#2E89A6]",
    dotClassName: "bg-[#2E89A6]",
  },
  announcement: {
    label: "ANUNCIO",
    badgeClassName: "bg-[#CCD8F4] text-[#4E72C8]",
    dotClassName: "bg-[#4E72C8]",
  },
};
```

Mock data se define en `lib/_data/mock-data.ts`. `POST_TYPE_CONFIG` se exporta desde `lib/_data/post-type-config.ts`.

---

## Implementation plan

1. **Actualizar `app/globals.css`** con la paleta del diseño (colores de la paleta como CSS custom properties o clases de Tailwind) y las variables de fuente Fredoka y Nunito. Verificar que `npm run build` no falle.

2. **Actualizar `app/layout.tsx`** para cargar las fuentes Fredoka y Nunito desde Google Fonts (usando `next/font/google`), aplicar las variables CSS correspondientes y configurar `lang="es"`.

3. **Crear `lib/_data/mock-data.ts`** con el array de publicaciones mock y el objeto `currentUser`. Incluir 3 posts (uno de cada tipo) como en el diseño.

4. **Crear `lib/_data/post-type-config.ts`** con el mapa `POST_TYPE_CONFIG` (label, clases de badge y punto por tipo). Es la única fuente de verdad para el estilado de badges.

5. **Crear `components/feed/Sidebar.tsx`** — componente de servidor. El arreglo de links de navegación (Feed, Niños, Avisos, Mi cuenta) se define como constante `NAV_ITEMS` dentro del archivo: cada ítem es `{ label, href, icon }` con su icono como componente. El link activo se resalta comparando con el ítem actual. Incluye logo, botón "Nueva publicación", perfil del usuario y botón de logout. Todos los links apuntan a `#` por ahora.

6. **Crear `components/feed/post/PostTypeBadge.tsx`** — componente que recibe `type: PostType` y renderiza el badge con label y colores tomados de `POST_TYPE_CONFIG`. Sin lógica condicional propia.

7. **Crear `components/feed/post/PostHeader.tsx`** — recibe un `Post` y renderiza el avatar del niño, nombre, hora/autor y el `PostTypeBadge`.

8. **Crear `components/feed/post/PostBody.tsx`** — recibe un `Post` y renderiza el destinatario, contenido y el placeholder de foto (si aplica).

9. **Crear `components/feed/post/PostActions.tsx`** — recibe un `Post` y renderiza contadores de likes/comentarios y el botón Editar (todos visuales).

10. **Crear `components/feed/PostCard.tsx`** — componente de composición: recibe un `Post` y arma la card usando `PostHeader`, `PostBody` y `PostActions`. No contiene estilos de negocio, solo layout.

11. **Crear `components/feed/FeedHeader.tsx`** — componente con el saludo "Buenas, {nombre}", info de sala y cantidad de niños.

12. **Crear `components/feed/DateSeparator.tsx`** — componente simple que recibe un `label` y renderiza el separador con línea divisora.

13. **Crear `components/feed/NewPostPrompt.tsx`** — el cuadro "Compartí un momento…" con avatar del usuario y ícono de cámara.

14. **Reemplazar `app/page.tsx`** con el layout de dos columnas: sidebar a la izquierda (oculta en mobile, visible en `lg:`), main con el feed que usa los componentes anteriores.

15. **Verificar responsive** — en mobile (< `lg`), la sidebar se oculta con `hidden lg:flex`. Solo se ve el feed.

16. **Ejecutar `npm run lint` y `npx tsc --noEmit`** para verificar que no hay errores.

17. **Bonus: sidebar móvil con drawer** — Extraer el contenido de `Sidebar` a `SidebarContent` (logo, botón, nav, perfil; sin estado). Crear `SidebarDrawer` (`"use client"`): botón hamburguesa visible solo en mobile (`lg:hidden`) que abre un overlay con backdrop, panel izquierdo que reutiliza `SidebarContent`, botón de cerrar, scroll lock y animación de entrada. Agregar `SidebarDrawer` en `app/page.tsx`.

---

## Acceptance criteria

- [x] La pantalla muestra el layout de dos columnas en desktop (sidebar + feed).
- [x] La sidebar contiene: logo "OpenDayCare · Sala Soles", botón "Nueva publicación", links de navegación (Feed activo, Niños, Avisos, Mi cuenta), perfil del usuario y botón de logout.
- [x] El feed muestra 3 publicaciones (logro, actividad, anuncio) con los datos del mock.
- [x] Cada publicación tiene: avatar con inicial, nombre del niño, hora, badge de tipo con color correspondiente, destinatario, texto, likes y comentarios (solo contador), botón Editar (visual).
- [x] La publicación de tipo Actividad muestra el placeholder de foto con borde punteado.
- [x] Los separadores de fecha aparecen entre grupos de publicaciones del mismo día.
- [x] `PostTypeBadge` obtiene label y colores exclusivamente de `POST_TYPE_CONFIG` (sin strings mágicos en componentes).
- [x] `PostCard` delega el renderizado en `PostHeader`, `PostBody` y `PostActions`, cada uno con responsabilidad única.
- [x] El saludo del header muestra "Buenas, Caro" con la info de sala.
- [x] En mobile la sidebar se oculta y solo se ve el feed.
- [x] Las fuentes Fredoka y Nunito se cargan correctamente.
- [x] La paleta de colores coincide con el diseño (fondo cálido, acentos coral/verde/celeste/azul).
- [x] `npm run lint` pasa sin errores.
- [x] `npx tsc --noEmit` pasa sin errores.
- [x] En mobile (< `lg`) hay un botón hamburguesa a la izquierda que abre un drawer overlay reutilizando el contenido del sidebar.
- [x] El drawer se cierra tocando el backdrop o el botón de cerrar.

---

## Decisions

- **Sí:** Tailwind CSS 4 para estilos, ya que el proyecto lo tiene configurado y no hay `tailwind.config` (se usa `@theme` en `globals.css`).
- **Sí:** Componentes de servidor (sin `"use client"`) donde sea posible. Todo el feed es estático por ahora.
- **Sí:** Mock data en `lib/_data/mock-data.ts` como fuente única para el feed.
- **Sí:** Config de tipos de post centralizada en `lib/_data/post-type-config.ts` (`POST_TYPE_CONFIG`). Evita repetir labels y clases Tailwind en cada componente (DRY).
- **Sí:** Componentes de responsabilidad única: `PostCard` solo compone, `PostHeader`/`PostBody`/`PostActions`/`PostTypeBadge` renderizan una parte específica. Nombres explícitos (`publishedAt`, `authorName`, `likesCount`) en lugar de genéricos (`time`, `author`, `likes`).
- **Sí:** Sidebar data-driven: los links de navegación viven en `NAV_ITEMS`, no hardcodeados en el JSX.
- **Sí:** Google Fonts via `next/font/google` para evitar layout shift y mejorar performance.
- **No:** No se crea un layout anidado (`app/(feed)/layout.tsx`) porque solo hay una pantalla por ahora. Si se agregan más rutas con sidebar compartida, se refactoriza después.
- **No:** No se usa `next/image` para avatares del mock porque son iniciales con color de fondo, no imágenes reales.
- **No:** No se agrega estado de sidebar mobile (drawer/hamburguesa) en esta spec — se puede hacer en otro spec si se necesita.
- **No:** No se fragmentan los componentes más allá de lo necesario: `FeedHeader`, `DateSeparator` y `NewPostPrompt` son simples y no requieren sub-componentes.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Google Fonts no carga en dev offline | Next.js hace fallback a system-ui. No rompe la UI. |
| Colores hardcodeados en componentes dificultan temas futuros | Usar clases de Tailwind o CSS variables; refactorizar cuando se necesite theming. |
| Mock data crece y se vuelve difícil de mantener | Mantener solo 3-5 posts de ejemplo. Datos reales vendrán de la API en otro spec. |

---

## What is **not** in this spec

- Funcionalidad de likes y comentarios.
- Botones "Nueva publicación" y "Editar" funcionales.
- Upload o preview de fotos.
- Backend/API y autenticación.
- Las demás pantallas del mockup (login, niños, avisos, mi-cuenta, crear-publicación, detalle-publicación).

Cada una de esas, si llega, va en su propio spec.