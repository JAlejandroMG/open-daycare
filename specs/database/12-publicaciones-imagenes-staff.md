# SPEC 12 — Publicaciones persistentes con imágenes para staff (Feed + Crear)

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 06, SPEC 10, SPEC 11
> **Date:** 2026-09-03
> **Objective:** Conectar la creación y visualización de publicaciones a la base de datos, permitir subida de hasta 10 imágenes reales a Supabase Storage, y actualizar el feed en tiempo real para staff y padres.

---

## Scope

**In:**

- Migración SQL (`012_create_posts_and_related.sql`) con tablas `posts`, `post_children`, `post_photos`, enum `post_type`, índices y RLS policies.
- Bucket `post-photos` en Supabase Storage con políticas de acceso.
- Ajuste del enum `post_type` para incluir `cheer`, y sincronización de keys frontend (`food`→`meal`, `picture`→`photo`).
- Server Action `createPost` que persiste el post, sus children relacionados y sus fotos.
- Server Action `getDaycareChildren` para listar niños activos del daycare en el modal.
- Query real en el feed (`/`) que lee posts con joins a `users`, `post_children`, `post_photos`, `reactions` y `comments`.
- Mapper `mapDbPostToUiPost` para transformar rows de DB al tipo `Post` del frontend.
- Componente `RealtimePostsProvider` que suscribe a `postgres_changes` en `posts` y actualiza el feed sin refrescar la página.
- `CreatePostModal` refactorizado para:
  - Usar children reales de la DB (pasados desde el layout).
  - Permitir seleccionar y previsualizar hasta 10 imágenes.
  - Subir imágenes a Storage antes de persistir el post.
  - Llamar `createPost` en lugar de mutar mock data.
- `PostBody` actualizado para renderizar imágenes reales (`<img>`) en lugar de placeholder visual.
- `PostActions` mostrando contadores reales de likes y comentarios (aunque la interactividad seguirá siendo dummy).
- RLS policies que garanticen:
  - Solo `staff`/`admin` pueden crear posts y subir fotos.
  - Padres solo ven posts donde sus hijos están etiquetados + anuncios generales.
  - Todo usuario autenticado pertenece al mismo daycare.

**Out of scope (for future specs):**

- Vista de detalle de publicación (`detalle-publicacion.dc.html`).
- Vista de foto a pantalla completa (`foto.dc.html`).
- Feed específico para padres (`familia-feed.dc.html`) — el RLS ya lo filtra, pero no se crea una ruta separada todavía.
- Interactividad real de likes (dar/quitar).
- Interactividad real de comentarios (escribir/enviar).
- Edición o eliminación de publicaciones (botón "Editar" sigue siendo dummy).
- Notificaciones push/email al publicar.
- Procesamiento de imágenes (thumbnail, compresión, EXIF).

---

## Data model

### Database

```sql
-- Enum (expandido con cheer)
CREATE TYPE post_type AS ENUM (
  'meal', 'nap', 'activity', 'achievement',
  'photo', 'announcement', 'cheer'
);

-- Tabla posts
CREATE TABLE IF NOT EXISTS public.posts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    room_id      uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
    type         post_type NOT NULL,
    title        text,                    -- nullable, ej. "Anuncio general"
    body         text NOT NULL,
    published_at timestamptz DEFAULT now(),
    created_at   timestamptz DEFAULT now(),
    updated_at   timestamptz DEFAULT now()
);

-- Tabla intermedia post_children
CREATE TABLE IF NOT EXISTS public.post_children (
    post_id    uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    child_id   uuid REFERENCES public.children(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, child_id)
);

-- Tabla post_photos
CREATE TABLE IF NOT EXISTS public.post_photos (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    url        text NOT NULL,
    width      int,
    height     int,
    position   int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX idx_post_children_post_id ON public.post_children(post_id);
CREATE INDEX idx_post_children_child_id ON public.post_children(child_id);
CREATE INDEX idx_post_photos_post_id ON public.post_photos(post_id);
```

### Frontend types (ajustados)

```ts
// lib/_data/types.ts
export type PostType =
  | "achievement"
  | "activity"
  | "announcement"
  | "meal"      // was food
  | "nap"
  | "cheer"
  | "photo";    // was picture

export type Post = {
  id: string;
  type: PostType;
  childNames: string[];
  childInitials: string[];
  avatarBackgroundColors: string[];
  avatarTextColors: string[];
  publishedAt: string;        // "14:20"
  authorName: string;
  isAuthor: boolean;
  recipients: string[];
  content: string;
  photos: string[];           // URLs reales de post_photos
  likesCount: number;
  commentsCount: number;
};
```

---

## Implementation plan

### 1. Base de datos y Storage
- Crear `supabase/migrations/012_create_posts_and_related.sql` con enum, tablas, índices, RLS policies y grants.
- Crear bucket `post-photos` (público) con policies: SELECT para authenticated del daycare; INSERT/DELETE para staff/admin del daycare.

### 2. Tipos y config frontend
- Actualizar `lib/_data/types.ts`: renombrar `food`→`meal`, `picture`→`photo`. Agregar campo `photos: string[]` a `Post`.
- Actualizar `lib/_data/post-type-config.ts`: renombrar keys, mantener labels UI ("COMIDA", "FOTO").
- Actualizar `lib/_data/mock-data.ts`: renombrar enum values en los 3 posts mock.
- Crear `lib/utils/avatar-colors.ts`: función determinística `getAvatarColors(childId)` que devuelve `{ bg, text }`.

### 3. Server Actions
- Crear `app/(dashboard)/actions/posts.ts`:
  - `createPost(formData)` — valida rol staff/admin, inserta post + post_children + post_photos en transacción implícita (múltiples queries). Si `"all"` en recipientIds, obtiene todos los children activos del daycare.
  - `getDaycareChildren()` — query a `children` filtrado por RLS, retorna array de niños activos.

### 4. Layout — pasar children al sidebar
- Modificar `app/(dashboard)/layout.tsx`: fetchear `children` activos del daycare y pasarlos como prop a `Sidebar` y `SidebarDrawer`.
- Modificar `Sidebar.tsx`, `SidebarContent.tsx`, `CreatePostButton.tsx` para recibir y propagar `childrenList`.

### 5. Refactor de CreatePostModal
- Modificar `components/feed/CreatePostModal.tsx`:
  - Recibir `childrenList` prop en lugar de importar `kids` mock.
  - Agregar estado `selectedFiles: File[]` con preview de thumbnails (máximo 10).
  - Agregar `<input type="file" accept="image/*" multiple hidden />`.
  - Handler de publicación:
    1. Validar campos obligatorios (frontend).
    2. Subir archivos a Storage bucket `post-photos` usando `createClient()` del browser, obtener URLs públicas.
    3. Llamar Server Action `createPost` con `recipientIds`, `type`, `description`, `photoUrls`.
    4. Si éxito: `router.refresh()`, cerrar modal, limpiar estado.
  - Remover `alert()` nativo; usar estado loading en el botón "Publicar".

### 6. Feed — leer de la DB
- Modificar `app/(dashboard)/page.tsx`:
  - Reemplazar import de `posts` mock por query real a Supabase con joins.
  - Transformar resultado usando un mapper antes de renderizar.
- Crear `lib/mappers/post-mapper.ts`: `mapDbPostToUiPost(dbPost, currentUserId)` que genera `childNames`, `childInitials`, `avatarColors`, `publishedAt` (formato HH:MM), `isAuthor`, `recipients`, `likesCount`, `commentsCount`, `photos`.

### 7. Realtime
- Crear `components/feed/RealtimePostsProvider.tsx` (client component):
  - Recibe `initialPosts` prop.
  - Al montar, suscribe a canal `posts` con `supabase.channel('posts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, ...)`.
  - Al recibir INSERT: hacer query al post completo con joins, mapearlo, y prepend al estado local.
- Modificar `page.tsx`: envolver el listado de posts con `<RealtimePostsProvider>`.

### 8. Actualizar componentes de Post
- Modificar `components/feed/post/PostHeader.tsx`: usar children reales del post, generar colores determinísticamente.
- Modificar `components/feed/post/PostBody.tsx`: reemplazar `photoPlaceholder` por grid de `<img>` usando `post.photos`.
- Modificar `components/feed/post/PostActions.tsx`: mostrar contadores reales desde el mapper (interactividad sigue dummy).
- Modificar `components/feed/PostCard.tsx`: adaptar al tipo `Post` con campo `photos`.

### 9. Verificación
- Ejecutar `npm run lint` y `npx tsc --noEmit`.
- Verificar que:
  - `build` pasa sin errores.
  - Solo staff/admin puede publicar.
  - Fotos se suben correctamente al bucket.

---

## Acceptance criteria

- [ ] Migración `012_create_posts_and_related.sql` crea tablas, índices y RLS sin errores.
- [ ] Bucket `post-photos` existe con políticas correctas.
- [ ] Enum `post_type` incluye `cheer`.
- [ ] Frontend usa `meal`/`photo` en lugar de `food`/`picture` sin romper TS.
- [ ] Staff/admin puede abrir el modal, seleccionar niños (incluyendo "Toda la sala"), elegir tipo, escribir descripción, adjuntar hasta 10 imágenes, y publicar.
- [ ] Al publicar, el post persiste en DB, se crean filas en `post_children`, y las fotos se suben a Storage con URLs guardadas en `post_photos`.
- [ ] El feed (`/`) muestra posts reales de la base de datos ordenados por `published_at DESC`.
- [ ] Cada post en el feed muestra: avatares de niños, nombre(s), hora, badge de tipo, autor, destinatarios, contenido, imágenes reales (si tiene), likes y comments count reales.
- [ ] Cuando otro staff publica un post, el feed se actualiza automáticamente (realtime) sin refrescar la página.
- [ ] Un post con "Toda la sala" crea filas en `post_children` para **todos** los niños activos del daycare.
- [ ] Botón "Editar" sigue siendo dummy (no funcional).
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Al elegir "Toda la sala" se crean filas en `post_children` para todos los children activos del daycare (no se usa `room_id` como proxy). Esto simplifica el filtrado del feed del padre: siempre se mira `post_children`.
- **Sí:** Las fotos se guardan tal cual en Storage (sin compresión ni thumbnail). El límite es 10 por publicación.
- **Sí:** El bucket `post-photos` es público para simplificar (URLs directas sin signed URLs). Las policies de Storage controlan quién puede subir.
- **Sí:** Los colores de avatar de los niños se generan determinísticamente en el frontend basándose en el `child_id` (hash). No se agregan columnas de color a la tabla `children`.
- **Sí:** El mapper `mapDbPostToUiPost` centraliza la transformación DB→UI. El tipo `Post` del frontend sigue existiendo para no romper los componentes.
- **Sí:** `router.refresh()` se llama después de publicar para forzar re-render del server component, pero el realtime ya se encarga de mostrar el post nuevo sin refrescar para otros usuarios.
- **No:** No se implementa vista de detalle de publicación ni feed separado para padres (queda para specs futuros).
- **No:** No se implementa interactividad real de likes ni comentarios (queda para specs futuros).
- **No:** No se agrega un campo `room_id` obligatorio a `posts`. Se deja nullable para anuncios generales.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Subida de múltiples imágenes puede ser lenta o fallar | Se suben secuencialmente; si falla una, se aborta y se muestra error. |
| Realtime puede duplicar posts si el INSERT llega antes que el `router.refresh()` | El provider verifica por `id` antes de agregar al estado. |
| RLS policies complejas pueden bloquear lecturas inesperadas | Las policies usan el patrón `daycare_id` ya establecido en migraciones anteriores. |
| Cambiar `PostType` keys puede romper componentes que usan strings mágicos | Se actualiza `POST_TYPE_CONFIG` y todos los usos en el codebase. |
