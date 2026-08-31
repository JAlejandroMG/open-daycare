-- Enums
CREATE TYPE child_status AS ENUM ('active', 'archived');

-- Salas
CREATE TABLE IF NOT EXISTS public.rooms (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    daycare_id  uuid NOT NULL REFERENCES public.daycares(id) ON DELETE CASCADE,
    name        text NOT NULL,
    created_at  timestamptz DEFAULT now()
);

-- Niños
CREATE TABLE IF NOT EXISTS public.children (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    full_name       text NOT NULL,
    birth_date      date NOT NULL,
    enrolled_at     date NOT NULL,
    medical_notes   text,
    allergy_tags    text[] DEFAULT '{}',
    photo_consent   boolean DEFAULT true,
    status          child_status NOT NULL DEFAULT 'active',
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_children_room_id ON public.children(room_id);
CREATE INDEX IF NOT EXISTS idx_children_status ON public.children(status);

-- Activar Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Política de lectura para rooms: usuarios autenticados del mismo daycare
CREATE POLICY "rooms_select_same_daycare" ON public.rooms
    FOR SELECT
    TO authenticated
    USING (
        daycare_id = (
            SELECT u.daycare_id
            FROM public.users u
            WHERE u.id = (SELECT auth.uid())
        )
    );

-- Política de lectura para children: usuarios autenticados del mismo daycare
CREATE POLICY "children_select_same_daycare" ON public.children
    FOR SELECT
    TO authenticated
    USING (
        room_id IN (
            SELECT r.id
            FROM public.rooms r
            WHERE r.daycare_id = (
                SELECT u.daycare_id
                FROM public.users u
                WHERE u.id = (SELECT auth.uid())
            )
        )
    );

-- Otorgar permisos de lectura
GRANT SELECT ON public.rooms TO authenticated;
GRANT SELECT ON public.children TO authenticated;

-- Política de inserción para children: usuarios autenticados del mismo daycare
CREATE POLICY "children_insert_same_daycare" ON public.children
    FOR INSERT
    TO authenticated
    WITH CHECK (
        room_id IN (
            SELECT r.id
            FROM public.rooms r
            WHERE r.daycare_id = (
                SELECT u.daycare_id
                FROM public.users u
                WHERE u.id = (SELECT auth.uid())
            )
        )
    );

-- Otorgar permisos de inserción
GRANT INSERT ON public.children TO authenticated;

-- Seed data: tres salas vinculadas al daycare existente
INSERT INTO public.rooms (daycare_id, name)
SELECT d.id, s.name
FROM (SELECT id FROM public.daycares LIMIT 1) d
CROSS JOIN (VALUES ('Soles'), ('Lunas'), ('Estrellas')) AS s(name);
