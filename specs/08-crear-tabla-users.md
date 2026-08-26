# SPEC 08 — Crear tabla users y enums en Supabase

> **Status:** Approved
> **Depends on:** SPEC 07
> **Date:** 2026-08-25
> **Objective:** Crear la tabla `users`, los enums `user_role` y `user_status`, activar RLS con política básica e insertar un usuario staff de seed para pruebas.

---

## Scope

**In:**

- Crear archivo de migración SQL local: `supabase/migrations/002_create_users_and_enums.sql`.
- Ejecutar la migración en el proyecto remoto de Supabase.
- Enums `user_role` (`staff`, `parent`, `admin`) y `user_status` (`pending`, `active`).
- Tabla `users` con columnas: `id uuid PK` (FK → `auth.users`), `daycare_id uuid FK → daycares`, `role user_role`, `status user_status`, `full_name text`, `avatar_url text` (nullable), `notify_on_post boolean default true`, `daily_summary_enabled boolean default true`, `created_at timestamptz`, `updated_at timestamptz`.
- Activar Row Level Security (RLS) en la tabla `users`.
- Crear política RLS básica: `Allow authenticated read` (SELECT para `authenticated`).
- Insertar 1 registro de seed: usuario staff con `id = '00000000-0000-0000-0000-000000000001'`, vinculado a "Guardería Sala Soles" (primer daycare de SPEC 07), `role = 'staff'`, `status = 'active'`, `full_name = 'Alex'`.
- Documentar en el spec las credenciales del staff: `alex@google.com` / `Abc@123`.

**Out of scope (for future specs):**

- Trigger `AFTER INSERT` en `auth.users` para crear fila automática en `public.users`.
- Creación del usuario real en `auth.users` (tabla del sistema de Supabase). Se documenta como paso manual o script aparte.
- Otras tablas (`rooms`, `children`, `posts`, `invitations`, etc.).
- Instalación de `supabase-js`, `@supabase/ssr` o cualquier cliente de Supabase.
- Edge Functions, triggers adicionales o funciones de Postgres.
- Autenticación, autorización avanzada o políticas RLS complejas (por daycare, por rol, etc.).
- Conexión de la UI de Next.js a la tabla.

---

## Data model

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('staff', 'parent', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active');

-- Tabla users
CREATE TABLE IF NOT EXISTS public.users (
    id                      uuid PRIMARY KEY,
    daycare_id              uuid REFERENCES public.daycares(id) ON DELETE SET NULL,
    role                    user_role NOT NULL,
    status                  user_status NOT NULL DEFAULT 'active',
    full_name               text NOT NULL,
    avatar_url              text,
    notify_on_post          boolean DEFAULT true,
    daily_summary_enabled   boolean DEFAULT true,
    created_at              timestamptz DEFAULT now(),
    updated_at              timestamptz DEFAULT now()
);

-- Nota: id es FK a auth.users(id), pero no se declara CONSTRAINT FK
-- porque auth.users es tabla del sistema y puede variar según entorno.
-- El trigger de auth.users va en un spec futuro de autenticación.
```

Convenciones seguidas:

- Nombres de tablas, columnas y enums en **inglés**.
- PK `id` tipo `uuid` (sin `gen_random_uuid()` porque debe coincidir con `auth.users(id)`).
- `created_at` / `updated_at` tipo `timestamptz`.
- `avatar_url` nullable (no todos los usuarios tienen avatar inicialmente).
- `daycare_id` con `ON DELETE SET NULL` (si se borra la guardería, el usuario queda huérfano pero no se elimina).
- No se declara FK explícita a `auth.users` para evitar dependencia de tabla del sistema en migraciones.

---

## Implementation plan

1. **Crear archivo de migración `002_create_users_and_enums.sql`** — contiene:
   - `CREATE TYPE user_role AS ENUM (...)`
   - `CREATE TYPE user_status AS ENUM (...)`
   - `CREATE TABLE public.users (...)`
   - `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
   - `CREATE POLICY "Allow authenticated read" ON public.users FOR SELECT TO authenticated USING (true);`
   - `GRANT SELECT ON public.users TO authenticated;`

2. **Aplicar migración en el proyecto remoto** — usar MCP `apply_migration` con nombre `create_users_and_enums`.

3. **Verificar que los enums y la tabla existen** — usar MCP `execute_sql` con consultas a `pg_type` e `information_schema.tables`.

4. **Insertar seed data** — ejecutar `INSERT INTO public.users (...) VALUES (...)` con el usuario staff:
   - `id = '00000000-0000-0000-0000-000000000001'`
   - `daycare_id = (SELECT id FROM public.daycares WHERE name = 'Guardería Sala Soles' LIMIT 1)`
   - `role = 'staff'`
   - `status = 'active'`
   - `full_name = 'Alex'`

5. **Verificar seed data** — ejecutar `SELECT * FROM public.users;` y confirmar 1 fila.

6. **Verificar RLS y políticas** — consultar `pg_policies` para confirmar que la política "Allow authenticated read" existe.

7. **Ejecutar `npm run lint` y `npx tsc --noEmit`** para asegurar que el repo sigue limpio.

---

## Acceptance criteria

- [ ] Existe el archivo `supabase/migrations/002_create_users_and_enums.sql` con el DDL completo, RLS y política.
- [ ] Los enums `user_role` y `user_status` existen en la base de datos.
- [ ] La tabla `users` aparece en el Supabase Dashboard (Table Editor).
- [ ] La tabla tiene las columnas `id`, `daycare_id`, `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at`, `updated_at`.
- [ ] Row Level Security está activado en la tabla `users`.
- [ ] Existe la política `Allow authenticated read` permitiendo SELECT a `authenticated`.
- [ ] La tabla contiene exactamente 1 fila de seed data.
- [ ] La fila de seed tiene `full_name = 'Alex'`, `role = 'staff'`, `status = 'active'`, y `daycare_id` apuntando a "Guardería Sala Soles".
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Migraciones imperativas locales en `supabase/migrations/`. Consistente con SPEC 07.
- **Sí:** Activar RLS desde el inicio. Establece la convención de seguridad para todas las tablas futuras.
- **Sí:** Política de lectura básica para `authenticated` (`USING (true)`). Suficiente hasta que llegue autenticación y roles en specs posteriores.
- **Sí:** `id` sin `DEFAULT gen_random_uuid()`. Debe coincidir con `auth.users(id)`; se generará desde el cliente o trigger.
- **Sí:** `daycare_id` con `ON DELETE SET NULL`. Evita eliminar usuarios si se borra una guardería.
- **Sí:** Seed de 1 usuario staff. Incluye "Alex" para facilitar demos y desarrollo futuro.
- **Sí:** No declarar FK explícita a `auth.users`. Es tabla del sistema; se mantiene por convención de código.
- **No:** No se crea el trigger `AFTER INSERT` en `auth.users`. Requiere flujo de autenticación que aún no existe; va en spec futuro.
- **No:** No se crea el usuario en `auth.users` desde la migración. Es tabla del sistema de Supabase; se documenta como paso manual.
- **No:** No se instala `supabase-js` ni `@supabase/ssr`. La conexión cliente va en otro spec cuando se implemente autenticación o API.
- **No:** No se crean índices adicionales. La tabla es pequeña y la PK cubre el acceso principal.
- **No:** No se crea columna `email` en `public.users`. Supabase Auth ya gestiona emails en `auth.users`.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| `id` sin DEFAULT puede causar errores si se inserta sin UUID válido | El insert se hará siempre con UUID explícito o desde trigger de auth (futuro). El seed usa UUID fijo. |
| RLS activado sin políticas de escritura bloquea futuros INSERT/UPDATE desde la app | Aceptado por ahora. Cuando se implemente escritura, se agregarán políticas específicas en el spec correspondiente. |
| El usuario de seed no existe en `auth.users`; no se puede autenticar como él todavía | Documentado en el spec. Se creará el usuario en `auth.users` manualmente o vía script cuando se implemente auth. |
| `daycare_id` SET NULL puede dejar usuarios huérfanos | Aceptado. En producción se puede cambiar a RESTRICT o agregar lógica de negocio para prevenir borrado de daycares con usuarios. |

---

## What is **not** in this spec

- Trigger `AFTER INSERT` en `auth.users`.
- Creación del usuario real en `auth.users`.
- Otras tablas del schema (`rooms`, `children`, `posts`, `invitations`, etc.).
- Instalación de clientes de Supabase (`supabase-js`, `@supabase/ssr`).
- Edge Functions, triggers adicionales o funciones de Postgres.
- Autenticación, autorización avanzada o políticas RLS complejas.
- Conexión de la UI de Next.js a la tabla.

Cada una de esas, si llega, va en su propio spec.
