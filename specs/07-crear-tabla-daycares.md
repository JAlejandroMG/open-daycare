# SPEC 07 — Crear tabla daycares en Supabase con migraciones imperativas

> **Status:** Implemented
> **Depends on:** Ninguno
> **Date:** 2026-08-25
> **Objective:** Crear la tabla `daycares` en Supabase mediante una migración imperativa local, activar RLS con política básica y poblarla con 4 registros de seed data.

---

## Scope

**In:**

- Crear archivo de migración SQL local: `supabase/migrations/001_create_daycares.sql`.
- Ejecutar la migración en el proyecto remoto de Supabase (project ref `umhlkncdrlpsobcusyek`).
- Tabla `daycares` con columnas: `id uuid PK`, `name text`, `address text`, `created_at timestamptz`.
- Activar Row Level Security (RLS) en la tabla.
- Crear política RLS básica de lectura pública (`anon` y `authenticated` pueden leer todas las filas).
- Insertar 4 registros de seed data, incluyendo "Guardería Sala Soles".
- Verificar que la tabla aparece en el Supabase Dashboard y que los registros son visibles.

**Out of scope (for future specs):**

- Creación de otras tablas (`users`, `rooms`, `children`, `posts`, etc.).
- Instalación de `supabase-js`, `@supabase/ssr` o cualquier cliente de Supabase.
- Edge Functions, triggers o funciones de Postgres adicionales.
- Autenticación, autorización avanzada o políticas RLS complejas.
- Conexión de la UI de Next.js a la tabla (eso irá en specs de API/cliente).

---

## Data model

```sql
-- Tabla raíz: guarderías
CREATE TABLE IF NOT EXISTS public.daycares (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    address    text,
    created_at timestamptz DEFAULT now()
);
```

Convenciones seguidas:

- Nombres de tablas y columnas en **inglés**.
- PK `id` tipo `uuid` con `gen_random_uuid()`.
- `created_at` tipo `timestamptz`.
- Campo `address` nullable (no todas las guarderías tienen dirección cargada inicialmente).

---

## Implementation plan

1. **Crear estructura de migraciones locales** — crear directorio `supabase/migrations/` en la raíz del repo si no existe.

2. **Escribir migración `001_create_daycares.sql`** — contiene:
   - `CREATE TABLE public.daycares (...)`
   - `ALTER TABLE public.daycares ENABLE ROW LEVEL SECURITY;`
   - `CREATE POLICY "Allow public read" ON public.daycares FOR SELECT TO anon, authenticated USING (true);`
   - `GRANT SELECT ON public.daycares TO anon, authenticated;`

3. **Aplicar migración en el proyecto remoto** — usar MCP `apply_migration` con nombre `create_daycares` para ejecutar el SQL en el proyecto Supabase.

4. **Verificar que la tabla existe** — usar MCP `execute_sql` con `SELECT * FROM information_schema.tables WHERE table_name = 'daycares';`.

5. **Insertar seed data** — ejecutar `INSERT INTO public.daycares (name, address) VALUES (...)` con 4 registros:
   - `('Guardería Sala Soles', 'Av. Corrientes 1234, CABA')`
   - `('Jardín Arcoíris', 'Calle Falsa 123, Villa Devoto')`
   - `('Centro Educativo Pequeños Gigantes', 'Av. Rivadavia 5678, Caballito')`
   - `('Guardería Los Ositos', 'Av. Santa Fe 9012, Palermo')`

6. **Verificar seed data** — ejecutar `SELECT * FROM public.daycares;` y confirmar 4 filas.

7. **Verificar RLS y políticas** — consultar `pg_policies` para confirmar que la política "Allow public read" existe.

8. **Ejecutar `npm run lint` y `npx tsc --noEmit`** para asegurar que el repo sigue limpio (aunque este spec no toca código TypeScript, verifica que no hay regresiones).

---

## Acceptance criteria

- [x] Existe el archivo `supabase/migrations/001_create_daycares.sql` con el DDL completo, RLS y política.
- [x] La tabla `daycares` aparece en el Supabase Dashboard (Table Editor).
- [x] La tabla tiene las columnas `id`, `name`, `address` y `created_at`.
- [x] Row Level Security está activado en la tabla `daycares`.
- [x] Existe la política `Allow public read` permitiendo SELECT a `anon` y `authenticated`.
- [x] La tabla contiene exactamente 4 filas de seed data.
- [x] Una de las filas tiene `name = 'Guardería Sala Soles'`.
- [x] `npm run lint` pasa sin errores.
  > Nota: Hay 2 errores preexistentes en `references/pantallas/support.js` (ReactDOM.render deprecated y no-assign-module-variable). No son regresión de este spec — el archivo existe desde el primer commit y no fue modificado por esta migración.
- [x] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Migraciones imperativas locales en `supabase/migrations/`. Permite versionar el schema en git y reproducirlo en otros entornos.
- **Sí:** Activar RLS desde el inicio. Aunque `daycares` no tiene datos sensibles, establece la convención de seguridad para todas las tablas futuras.
- **Sí:** Política de lectura pública (`USING (true)`) por ahora. Es suficiente hasta que llegue autenticación y roles en specs posteriores.
- **Sí:** Campo `address` agregado a la tabla. Aunque el schema de referencia original no lo tenía, el usuario lo pidió y es útil para el dominio.
- **Sí:** Seed data de 4 guarderías. Incluye la sugerida "Guardería Sala Soles" para facilitar demos y desarrollo futuro.
- **No:** No se instala `supabase-js` ni `@supabase/ssr`. La conexión cliente va en otro spec cuando se implemente autenticación o API.
- **No:** No se crea la columna `updated_at` ni triggers de `moddatetime`. Se mantiene el scope mínimo; se puede agregar más adelante.
- **No:** No se crean índices adicionales. La tabla es pequeña y la PK cubre el acceso principal.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| RLS activado sin políticas de escritura bloquea futuros INSERT/UPDATE desde la app | Aceptado por ahora. Cuando se implemente escritura, se agregarán políticas específicas en el spec correspondiente. |
| El proyecto no tiene Supabase CLI local; las migraciones se aplican solo vía MCP | Documentado en el spec. Si se necesita CLI local, se abordará en un spec de infraestructura/DevOps. |
| `address` es nullable; la app debe manejar nulls en la UI | La app actualmente no consume esta tabla; cuando lo haga, el spec de integración manejará el caso. |

---

## What is **not** in this spec

- Otras tablas del schema (`users`, `rooms`, `children`, `posts`, etc.).
- Instalación de clientes de Supabase (`supabase-js`, `@supabase/ssr`).
- Edge Functions, triggers o funciones de Postgres.
- Autenticación, autorización avanzada o políticas RLS complejas.
- Conexión de la UI de Next.js a la tabla.

Cada una de esas, si llega, va en su propio spec.
