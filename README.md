# OpenDayCare

Plataforma de gestión de guarderías construida con Next.js 16.3.1, React 19 y Tailwind CSS 4.

## Stack

- **Framework:** Next.js 16.3.1 (App Router)
- **UI:** React 19 + Tailwind CSS 4
- **Fonts:** Fredoka (headings) + Nunito (body)
- **Brand:** OpenDayCare — paleta cálida (bg `#FBF4EC`, accent coral `#F6A98E`/`#EC7E62`)

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Descripción |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check (TS strict) |
| `npm run build` | Build producción |

## Workflow: Spec-Driven Development

Las features grandes se desarrollan siguiendo el flujo de specs:

1. **`/spec <descripción>`** — Diseña el spec guardándolo en `specs/NN-slug.md`
2. **`/spec-impl <NN-slug>`** — Implementa un spec aprobado paso a paso
3. **`/verify-spec <NN-slug>`** — Verifica criterios de aceptación con Context7 y Playwright

Los specs viven en `specs/` y siguen la plantilla de `.agents/skills/spec/template.md`.

## Estructura

```
app/                  # App Router pages
components/           # Componentes React
lib/                  # Utilidades y helpers
proxy.ts              # Proxy de Next.js 16 (protección de rutas)
references/           # Mockups de diseño (HTML + screenshots)
specs/                # Specs de features
.agents/skills/       # Skills de agente (spec, spec-impl)
.opencode/agents/     # Agentes (spec-verifier)
.opencode/commands/   # Comandos (/verify-spec)
```

## Autenticación

El sistema usa **Supabase Auth** (email + password) con el patrón Proxy de Next.js 16:

- **`proxy.ts`** — Protección de rutas en la raíz del proyecto (reemplaza `middleware.ts` deprecado)
- **Rutas públicas:** `/login`, `/activate-account`
- **Rutas protegidas:** Todas las demás requieren sesión activa
- **Login:** `supabase.auth.signInWithPassword()` desde Client Component
- **Logout:** `supabase.auth.signOut()` con `window.location.href` para forzar recarga completa

### Credenciales de prueba

| Email | Password | Rol |
|-------|----------|-----|
| `alex@google.com` | `Abc@123` | Staff |

## Base de datos

- **Proveedor:** Supabase (project ref `umhlkncdrlpsobcusyek`)
- **Migrations:** `supabase/migrations/NNN_descriptive_name.sql`
- **Convención:** Siempre crear migración antes de modificar schema

## Diseño

Los mockups en `references/pantallas/*.dc.html` y `references/screenshots/*.png` son la fuente de verdad del UI. Copia en **español rioplatense** con voseo ("Ingresá", "Publicá", "Guardá").
