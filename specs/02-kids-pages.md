# SPEC 02 — Implementar páginas de niños (/kids) y perfil de niño (/kids/[id])

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-08-21
> **Objective:** Implementar las pantallas de lista de niños (`/kids`) y perfil de niño (`/kids/[id]`) replicando fielmente los diseños de `references/pantallas/ninos.dc.html` y `references/pantallas/perfil-nino.dc.html`, con sidebar compartida, datos mock y descomposición en componentes.

---

## Scope

**In:**

- Layout compartido con sidebar (`app/(dashboard)/layout.tsx`) reutilizable por Feed, Kids y KidsProfile.
- Página `/kids`: lista de niños en grid de 2 columnas, con búsqueda filtrable, header "Niños", botón "Agregar niño", separador "SALA SOLES · 8 niños".
- Cada card de niño muestra: avatar con inicial, nombre, edad, cantidad de padres vinculados, badge de alergia/condición (si aplica) o flecha de navegación.
- Página `/kids/[id]`: perfil de niño con header (avatar grande, nombre, edad, sala), botón "Editar", alerta de alergias, datos personales (fecha de nacimiento, sala, ingreso), sección de padres vinculados con estados.
- Tipos `Kid`, `Parent` y mock data en `lib/_data/mock-data.ts`.
- Componentes descompuestos: `KidCard`, `KidList`, `KidsHeader`, `KidSearch`, `KidProfileHeader`, `KidAllergyAlert`, `KidInfoCard`, `ParentsList`, `ParentCard`, `LinkParentButton`, `DailySummaryButton`.
- Responsive: sidebar oculto en mobile con drawer hamburguesa (reutilizar patrón de SPEC 01).
- Fuentes Fredoka + Nunito y paleta cálida `#F6ECDF` / `#FFFDF9`.

**Out of scope:**

- Funcionalidad de "Agregar niño" (formulario).
- Funcionalidad de "Editar" (formulario).
- Funcionalidad de "Resumen del día" (pantalla futura).
- Funcionalidad de "Vincular otro padre" (formulario).
- Backend/API real.
- Autenticación.
- Otras pantallas: avisos, mi cuenta, crear publicación.

---

## Data model

```ts
type Parent = {
  id: string;
  name: string;
  initial: string;
  relation: string; // "Mamá", "Papá"
  status: "active" | "pending";
  avatarBackgroundColor: string;
};

type Kid = {
  id: string;
  name: string;
  initial: string;
  age: string; // "3 años"
  room: string; // "Soles"
  birthDate: string; // "12 mar 2022"
  admissionDate: string; // "feb 2025"
  linkedParents: number;
  allergy?: string; // "MANÍ", "LACTOSA"
  allergyNote?: string;
  parents: Parent[];
  avatarBackgroundColor: string;
  avatarTextColor: string;
};
```

Mock data en `lib/_data/mock-data.ts`. Para los 7 niños sin perfil detallado, definir solo los campos usados en la lista (`id`, `name`, `initial`, `age`, `linkedParents`, `allergy?`, `avatarBackgroundColor`, `avatarTextColor`). Solo Mateo tiene `parents` completo.

---

## Implementation plan

1. **Crear `app/(dashboard)/layout.tsx`** — extraer sidebar del feed actual a un layout compartido. Incluye `SidebarDrawer` para mobile (pattern de SPEC 01). Verificar que `/` y `/kids` funcionen.

2. **Mover `app/page.tsx`** a `app/(dashboard)/page.tsx` (o ajustar rutas según estructura que mejor funcione con Next.js App Router).

3. **Actualizar `lib/_data/mock-data.ts`** — agregar array `kids` con 8 niños y tipos `Kid` y `Parent`. Solo Mateo tiene array `parents` completo. Los demás usan `linkedParents: number` sin array.

4. **Crear `components/kids/KidCard.tsx`** — card con avatar (inicial + color de fondo), nombre, edad, padres vinculados, badge de alergia (rojo/rosado) o flecha a la derecha. Hover con borde coral y `translateY(-2px)`.

5. **Crear `components/kids/KidList.tsx`** — grid de 2 columnas (`grid-cols-1 lg:grid-cols-2`) con gap 14px. Recibe array filtrado de `kids`.

6. **Crear `components/kids/KidsHeader.tsx`** — título "GESTIÓN" (letter-spacing 0.8px, color `#D9583C`), h1 "Niños" (Fredoka), botón "Agregar niño" coral con ícono +.

7. **Crear `components/kids/KidSearch.tsx`** — input con ícono de lupa, placeholder "Buscar niño…", borde redondeado, fondo `#FFFDF9`. Filtrado local via `useState`.

8. **Crear `app/(dashboard)/kids/page.tsx`** — ensambla `KidsHeader`, `KidSearch`, `KidList`. Incluye separador "SALA SOLES" con contador.

9. **Crear `components/kids/profile/KidProfileHeader.tsx`** — avatar grande (84px, inicial), nombre (Fredoka 28px), edad/sala, botón "Editar" con borde.

10. **Crear `components/kids/profile/KidAllergyAlert.tsx`** — banner con fondo `#FBDAD6`, ícono warning, título "Alergias y notas", nota descriptiva.

11. **Crear `components/kids/profile/KidInfoCard.tsx`** — card blanca con 3 filas (fecha nacimiento, sala, ingreso), separador entre filas.

12. **Crear `components/kids/profile/DailySummaryButton.tsx`** — botón oscuro `#3F362E` con ícono sol.

13. **Crear `components/kids/profile/ParentCard.tsx`** — avatar, nombre, relación, badge de estado ("ACTIVA" verde `#CFEBD8`, "PENDIENTE" amarillo `#F7E7A6`).

14. **Crear `components/kids/profile/LinkParentButton.tsx`** — botón dashed con ícono + y texto "Vincular otro padre" en rojo `#C5503A`.

15. **Crear `components/kids/profile/ParentsList.tsx`** — agrupa `ParentCard` items y `LinkParentButton`.

16. **Crear `app/(dashboard)/kids/[id]/page.tsx`** — obtiene `kid` por `params.id` desde mock data. Muestra "Volver a Niños" link. Ensambla `KidProfileHeader`, `KidAllergyAlert`, `KidInfoCard`, `ParentsList`, `DailySummaryButton`.

17. **Ejecutar `npm run lint` y `npx tsc --noEmit`**.

18. **Verificar responsive** — en mobile sidebar oculta con drawer.

---

## Acceptance criteria

- [ ] `/kids` muestra lista de 8 niños en grid de 2 columnas.
- [ ] `/kids` tiene input de búsqueda que filtra por nombre en tiempo real.
- [ ] `/kids` muestra header "GESTIÓN · Niños" y botón "Agregar niño".
- [ ] Cada `KidCard` muestra: avatar, nombre, edad, padres vinculados, badge de alergia o flecha.
- [ ] `KidCard` tiene hover con borde coral y `translateY(-2px)`.
- [ ] `/kids/[id]` muestra perfil completo del niño según diseño.
- [ ] `/kids/[id]` tiene alerta de alergias con color `#FBDAD6` si `kid.allergy` existe.
- [ ] `/kids/[id]` muestra datos personales (fecha nacimiento, sala, ingreso) en card blanca.
- [ ] `/kids/[id]` muestra padres vinculados con estados "ACTIVA" (verde) y "PENDIENTE" (amarillo).
- [ ] Link "Volver a Niños" funciona y apunta a `/kids`.
- [ ] El sidebar es compartido entre `/`, `/kids` y `/kids/[id]`.
- [ ] En mobile el sidebar se oculta y se accede vía drawer hamburguesa.
- [ ] `npm run lint` pasa sin errores.
- [ ] `npx tsc --noEmit` pasa sin errores.

---

## Decisions

- **Sí:** Layout compartido `app/(dashboard)/layout.tsx` para evitar repetir sidebar en cada página.
- **Sí:** `/kids/[id]` con ID numérico para simplificar mock data lookup.
- **Sí:** Búsqueda local con `useState` en `KidSearch` para interacción inmediata.
- **Sí:** Mock data en `lib/_data/mock-data.ts` existente, centralizando todo el mock del proyecto.
- **Sí:** Botones "Agregar niño", "Editar", "Resumen del día", "Vincular otro padre" son visuales sin acción (comentario `// TODO` en código).
- **Sí:** Reutilizar patrón de drawer mobile de SPEC 01.
- **Sí:** Tipos `Kid` y `Parent` exportados desde `mock-data.ts`.
- **No:** No se crea `/kids/[slug]` porque complica el lookup en mock data sin beneficio claro.
- **No:** No se fragmentan los componentes más allá de lo necesario.

---

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Mover `page.tsx` al grupo `(dashboard)` rompe rutas existentes | Probar `npm run dev` inmediatamente después del paso 1 y 2. |
| Mock data de padres no está completo para todos los niños | Solo definir `parents` completo para Mateo. Los demás usan `linkedParents: number`. |

---

## What is **not** in this spec

- Funcionalidad de agregar/editar niño.
- Funcionalidad de resumen del día.
- Funcionalidad de vincular padre.
- Backend/API y autenticación.
- Las demás pantallas del mockup.
