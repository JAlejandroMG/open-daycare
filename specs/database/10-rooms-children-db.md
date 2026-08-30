# SPEC 10 — Crear tablas rooms y children y conectar /kids a la base de datos

> **Status:** Approved
> **Depends on:** SPEC 02
> **Date:** 2026-08-29
> **Objective:** Crear las tablas `rooms` y `children` en Supabase, poblar `rooms` con tres salas de seed data, y actualizar las páginas `/kids` y `/kids/[id]` para leer datos reales de la base de datos en lugar de usar datos hardcodeados.

---

## Scope

**In:**

- Migración `NNN_create_rooms_and_children.sql` con:
  - Tabla `rooms` (id, daycare_id, name, created_at).
  - Tabla `children` (id, room_id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags, photo_consent, status, created_at, updated_at).
  - FK `children.room_id → rooms.id` con `ON DELETE RESTRICT`.
  - Índices en `children.room_id` y `children.status`.
- Seed data para `rooms`: tres registros ("Soles", "Lunas", "Estrellas") vinculados al daycare existente.
- RLS habilitado en ambas tablas con políticas de lectura para usuarios autenticados del mismo daycare.
- Actualizar `app/(dashboard)/kids/page.tsx` (Server Component) para leer niños desde Supabase usando `createClient` y filtrar por `status = 'active'`.
- Actualizar `app/(dashboard)/kids/[id]/page.tsx` (Server Component) para leer un niño por ID desde Supabase, incluyendo datos completos.
- Mapear la respuesta de Supabase al tipo `Kid` local para no romper los componentes existentes.
- Actualizar `lib/_data/mock-data.ts` para eliminar el array `kids` hardcodeado.
- Mantener los componentes `KidCard`, `KidList`, `KidProfileHeader`, `KidAllergyAlert`, `KidInfoCard`, `ParentsList` sin cambios de interfaz (siguen recibiendo `Kid`).

**Out of scope (for future specs):**

- Seed data para `children` (niños) — la tabla se crea vacía y se llenará vía UI posteriormente.
- Tabla `parent_children` y vínculos padre-niño reales.
- CRUD de niños (agregar, editar, eliminar) — este spec es solo lectura; el formulario de agregar niño queda para otro spec.
- Tabla `invitations` y generación de códigos reales.
- Actualización del feed (`/`) para leer posts desde la base de datos.
- Actualización de otros modales (`Agregar niño`, `Vincular padre`) para persistir en DB.
- Cambios en el tipo `Post` o en los posts del feed.

---

## Data model

### Postgres schema (nuevas tablas)

```sql
-- Salas
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES daycares(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Niños
CREATE TYPE child_status AS ENUM ('active', 'archived');

CREATE TABLE children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  birth_date date NOT NULL,
  enrolled_at date NOT NULL,
  medical_notes text,
  allergy_tags text[] DEFAULT '{}',
  photo_consent boolean DEFAULT true,
  status child_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_children_room_id ON children(room_id);
CREATE INDEX idx_children_status ON children(status);
```

### TypeScript local (mapeo)

```ts
// Tipo existente en lib/_data/types.ts — se mantiene intacto
type Kid = {
  id: string;
  name: string;
  initial: string;
  age: string;           // calculado desde birth_date
  room: string;          // obtenido de rooms.name
  birthDate: string;     // formateado desde birth_date
  admissionDate: string; // formateado desde enrolled_at
  linkedParents: number; // hardcodeado por ahora (0–2)
  allergy?: string;      // traducido desde allergy_tags[0] si existe
  allergyNote?: string;  // medical_notes
  parents: Parent[];     // vacío por ahora
  avatarBackgroundColor: string;
  avatarTextColor: string;
};
```

Función `mapChildToKid(child, roomName): Kid` en un archivo nuevo `lib/_data/mappers.ts` que recibe una fila de `children` + `rooms.name` y devuelve el tipo `Kid` con los formatos esperados por los componentes.

---

## Implementation plan

1. **Crear migración `supabase/migrations/NNN_create_rooms_and_children.sql`** — crear tabla `rooms`, tabla `children`, tipo `child_status`, índices, FK. Idempotente (`IF NOT EXISTS`).

2. **Agregar seed data a la migración** — insertar tres registros en `rooms` ("Soles", "Lunas", "Estrellas") con `daycare_id` del daycare existente (usar subquery `SELECT id FROM daycares LIMIT 1`). La tabla `children` se crea vacía.

3. **Habilitar RLS y crear políticas** — en la misma migración:
   - `ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;`
   - `ALTER TABLE children ENABLE ROW LEVEL SECURITY;`
   - Política `rooms_select` para `SELECT` donde el usuario autenticado pertenezca al mismo `daycare_id` (vía `users.daycare_id`).
   - Política `children_select` análoga, vinculando `children.room_id → rooms.id` y filtrando por `users.daycare_id`.

4. **Crear `lib/_data/mappers.ts`** — función `mapChildToKid(child: Tables<'children'>, roomName: string): Kid` que:
   - Convierte `full_name` → `name`.
   - Calcula `initial` desde el primer nombre.
   - Calcula `age` desde `birth_date` (ej. "3 años").
   - Formatea `birthDate` y `admissionDate` al estilo mock ("12 mar 2022", "feb 2025").
   - Mapea `allergy_tags[0]` a etiqueta en español ("peanut" → "MANÍ", etc.) o deja `allergy` sin definir si el array está vacío.
   - Asigna `avatarBackgroundColor` y `avatarTextColor` con un algoritmo determinístico basado en el nombre.
   - `linkedParents` y `parents` quedan hardcodeados/vacíos por ahora.

5. **Actualizar `app/(dashboard)/kids/page.tsx`** — en el Server Component, usar `createClient` para hacer `supabase.from('children').select('*, rooms(name)').eq('status', 'active')`. Ordenar por `full_name`. Mapear cada fila con `mapChildToKid` y pasar el array a `KidList`.

6. **Actualizar `app/(dashboard)/kids/[id]/page.tsx`** — usar `createClient` para hacer `supabase.from('children').select('*, rooms(name)').eq('id', params.id).single()`. Si no existe, `notFound()`. Mapear con `mapChildToKid` y pasar a los componentes de perfil.

7. **Actualizar `lib/_data/mock-data.ts`** — eliminar el array `kids` hardcodeado y reemplazarlo por un comentario indicando que los datos ahora vienen de la base de datos. Mantener `posts` y `currentUser` intactos.

8. **Verificar que los componentes `KidCard`, `KidList`, `KidProfileHeader`, etc. no se rompan** — como el tipo `Kid` no cambia, los componentes deben seguir funcionando sin modificaciones. Confirmar que `kid.id` recibido desde Supabase (UUID string) funciona como parámetro de ruta y como key en React.

9. **Ejecutar `npm run lint` y `npx tsc --noEmit`** para verificar que no hay errores de tipo.

10. **Verificar visualmente** — navegar a `/kids` y `/kids/[id]` con `npm run dev`. Confirmar que la lista muestra los niños desde la base de datos (inicialmente vacía hasta que se agreguen) y que el perfil funciona cuando existan registros.

---

## Acceptance criteria

- [ ] Las tablas `rooms` y `children` existen en la base de datos con la estructura definida.
- [ ] La tabla `rooms` tiene tres registros: "Soles", "Lunas", "Estrellas", todos vinculados al daycare existente.
- [ ] La tabla `children` se crea vacía (sin seed data).
- [ ] RLS está habilitado en ambas tablas y las políticas permiten lectura a usuarios autenticados del mismo daycare.
- [ ] `/kids` lee niños desde Supabase y los muestra ordenados alfabéticamente (inicialmente vacío).
- [ ] `/kids` tiene input de búsqueda que filtra por nombre en tiempo real (filtrado local sobre los datos ya cargados).
- [ ] `/kids/[id]` lee un niño por ID desde Supabase y muestra su perfil completo.
- [ ] `/kids/[id]` muestra la alerta de alergias si el niño tiene `allergy_tags` no vacío.
- [ ] Los avatares mantienen los colores de fondo y texto calculados determinísticamente.
- [ ] Los componentes `KidCard`, `KidList`, `KidProfileHeader`, `KidAllergyAlert`, `KidInfoCard`, `ParentsList` no requieren cambios de código (solo reciben `Kid` como antes).
- [ ] `lib/_data/mock-data.ts` ya no contiene el array `kids` hardcodeado.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Mantener el tipo `Kid` local en `lib/_data/types.ts` y crear una capa de mapeo (`mappers.ts`). Evita romper todos los componentes que dependen de la forma actual de `Kid` y permite que la UI evolucione independientemente del schema de DB.
- **Sí:** Asignar `avatarBackgroundColor` y `avatarTextColor` de forma determinística basada en el nombre. Mantiene consistencia visual.
- **Sí:** Usar `ON DELETE RESTRICT` en `children.room_id`. Evita borrar una sala que tenga niños asociados por accidente.
- **Sí:** Seed data de `rooms` dentro de la migración SQL. Es la forma más simple de poblar la base de datos de forma reproducible.
- **Sí:** Política RLS vinculada a `daycare_id` vía la tabla `users`. Alineado con el schema existente y permite multitenancy futura.
- **Sí:** Filtrar `children` por `status = 'active'` en las queries del frontend. Implementa borrado lógico desde el inicio.
- **No:** No se agrega seed data para `children`. Los niños se agregarán desde cero vía UI en specs futuros.
- **No:** No se crea la tabla `parent_children` ni se migran los datos de padres. Los padres siguen como mock vacío en el perfil.
- **No:** No se modifican los tipos `Post`, `CurrentUser` ni el array `posts`. El feed sigue usando mock data.
- **No:** No se elimina `lib/_data/mock-data.ts` por completo. Solo se remueve el array `kids`; `posts` y `currentUser` se mantienen.
- **No:** No se implementa Server Action para crear/editar/eliminar niños. Es lectura pura.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| El UUID de `children.id` no es compatible con el `params.id` string usado en `/kids/[id]` | Los params de Next.js App Router son strings; los UUIDs de Supabase también son strings. Son compatibles. |
| El mapeo de fechas (birth_date → "3 años", "12 mar 2022") puede divergir del formato mock | Implementar la lógica de formateo en `mappers.ts` y documentarla. Ajustar si es necesario. |
| La búsqueda local (`KidSearch`) filtra sobre datos ya cargados; si la lista crece mucho puede ser lento | Aceptable para el volumen esperado. Si crece, se moverá a búsqueda server-side en otro spec. |
| RLS policies pueden bloquear lecturas si el usuario no tiene `daycare_id` seteado | Verificar que el usuario de test (`alex@google.com`) tenga `daycare_id` asignado antes de probar. |
| Seed data con `daycare_id` hardcodeado puede fallar si el UUID no existe | Usar subquery `SELECT id FROM daycares LIMIT 1` en la migración para obtener el daycare real. |

---

## What is **not** in this spec

- Seed data para la tabla `children` (niños).
- Tabla `parent_children` ni vínculos padre-niño reales.
- CRUD de niños (crear, editar, archivar, eliminar).
- Tabla `invitations` ni generación de códigos de invitación reales.
- Conexión del feed (`/`) o de los posts a la base de datos.
- Actualización de los modales `Agregar niño` o `Vincular padre` para persistir en DB.
- Cambios en el tipo `Post` o en el mock data de publicaciones.

Cada una de esas, si llega, va en su propio spec.
