<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16.3.1 (App Router) + React 19 + Tailwind CSS 4. Tailwind is configured only through `@tailwindcss/postcss` and the CSS `@theme` in `app/globals.css` — there is no `tailwind.config`.
- Path alias `@/*` → repo root (see `tsconfig.json`).
- `app/` contains the App Router structure with `(dashboard)` route group.

## Commands

- `npm run dev` — dev server. Re-adds the auto-generated block at the top of this file on start; don't fight it.
- `npm run lint` — ESLint. There is **no test script and no typecheck script** in `package.json`.
- `npx tsc --noEmit` — standalone typecheck (TS is `strict`).
- `npm run build` — production build; also surfaces TS/type errors.

## Design source of truth

- `references/pantallas/*.dc.html` are the design mockups (DesignCompose-runtime HTML; they render the UI live in a browser). `references/screenshots/*.png` are static previews of the same screens. Build the UI to match these files — not to your own idea of the app.
- Brand: **OpenDayCare**. Fonts: Fredoka (headings) + Nunito (body). Warm palette (bg `#FBF4EC`, accent coral `#F6A98E`/`#EC7E62`).
- All UI copy is in **Spanish (Rioplatense)** — voseo forms like "Ingresá", "Publicá", "Guardá".

## Workflow: spec-driven development

- `.agents/skills/` provides the `/spec` and `/spec-impl` commands (installed from `klerith/fernando-skills`, pinned in `skills-lock.json`).
- Large features start with `/spec`, which writes `specs/NN-slug.md` (folder is created on first use). Specs and answers must match the conversation's language (repo default: Spanish).
- `/spec-impl NN-slug` only runs specs whose state means "Approved"; it works on a `spec-NN-slug` branch, pauses after each plan step for diff review, and never auto-commits.
- `/verify-spec NN-slug` verifies acceptance criteria of a spec using Context7 (for Next.js patterns) and Playwright (for visual comparison). Runs via the `spec-verifier` agent defined in `.opencode/agents/spec-verifier.md`.
- `CLAUDE.md` only imports `@AGENTS.md` — this file is the single source of agent instructions.

## Agents

- `spec-verifier` (`.opencode/agents/spec-verifier.md`): verifies acceptance criteria of specs. Uses Context7 + Playwright for visual comparison. Invoked via `/verify-spec`.

## MCPs

- Playwright: configured in `opencode.json` (`HEADLESS=false`). Playwright screenshots and any document Playwright-related must live in `.playwright-mcp/` (gitignored).
- Context7: use it to fetch up-to-date framework documentation.
- Supabase: remote MCP for database, auth, edge functions, debugging, and branching. Project ref: `umhlkncdrlpsobcusyek`.

## Skills

- Supabase (`.agents/skills/supabase/`): instructions for working with Supabase products, client libraries, RLS, and debugging.
- Postgres Best Practices (`.agents/skills/supabase-postgres-best-practices/`): schema design, migrations, RLS policies, indexes, triggers, and performance tuning.

## Code rules
- Follow Clean Code principles.
- Function and variable names in english.

## Database rules
- **Always create a migration file** when modifying the database schema. Never apply DDL changes directly to the remote project without a corresponding migration in `supabase/migrations/`.
- Migration files are versioned in git and serve as the single source of truth for the database schema.
- Naming convention: `NNN_descriptive_name.sql` (e.g., `001_create_daycares.sql`, `002_add_email_to_users.sql`).
- Each migration should be idempotent when possible (use `IF NOT EXISTS`, `IF EXISTS`).