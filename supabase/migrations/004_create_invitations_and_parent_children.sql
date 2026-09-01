-- Enums
CREATE TYPE relationship_type AS ENUM ('mother', 'father', 'guardian');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- Tabla invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id      uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    invited_by    uuid REFERENCES public.users(id) ON DELETE SET NULL,
    full_name     text NOT NULL,
    email         text NOT NULL,
    relationship  relationship_type NOT NULL,
    code          text NOT NULL UNIQUE,
    status        invitation_status NOT NULL DEFAULT 'pending',
    expires_at    timestamptz NOT NULL,
    accepted_at   timestamptz,
    created_at    timestamptz DEFAULT now(),
    CONSTRAINT invitations_code_format CHECK (code ~ '^[A-Z0-9]{5}$')
);

-- Tabla parent_children
CREATE TABLE IF NOT EXISTS public.parent_children (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    child_id      uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    relationship  relationship_type NOT NULL,
    created_at    timestamptz DEFAULT now(),
    UNIQUE (parent_id, child_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_invitations_code ON public.invitations(code);
CREATE INDEX IF NOT EXISTS idx_invitations_child_id ON public.invitations(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_parent_id ON public.parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child_id ON public.parent_children(child_id);

-- RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

-- invitations: lectura para usuarios autenticados del mismo daycare
CREATE POLICY "invitations_select_same_daycare" ON public.invitations
    FOR SELECT
    TO authenticated
    USING (
        child_id IN (
            SELECT c.id
            FROM public.children c
            JOIN public.rooms r ON r.id = c.room_id
            WHERE r.daycare_id = (
                SELECT u.daycare_id
                FROM public.users u
                WHERE u.id = (SELECT auth.uid())
            )
        )
    );

-- invitations: inserción para staff del mismo daycare
CREATE POLICY "invitations_insert_staff_same_daycare" ON public.invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        invited_by = (SELECT auth.uid())
        AND child_id IN (
            SELECT c.id
            FROM public.children c
            JOIN public.rooms r ON r.id = c.room_id
            WHERE r.daycare_id = (
                SELECT u.daycare_id
                FROM public.users u
                WHERE u.id = (SELECT auth.uid())
            )
        )
    );

-- invitations: actualización para usuarios autenticados del mismo daycare
CREATE POLICY "invitations_update_same_daycare" ON public.invitations
    FOR UPDATE
    TO authenticated
    USING (
        child_id IN (
            SELECT c.id
            FROM public.children c
            JOIN public.rooms r ON r.id = c.room_id
            WHERE r.daycare_id = (
                SELECT u.daycare_id
                FROM public.users u
                WHERE u.id = (SELECT auth.uid())
            )
        )
    )
    WITH CHECK (
        child_id IN (
            SELECT c.id
            FROM public.children c
            JOIN public.rooms r ON r.id = c.room_id
            WHERE r.daycare_id = (
                SELECT u.daycare_id
                FROM public.users u
                WHERE u.id = (SELECT auth.uid())
            )
        )
    );

-- parent_children: lectura para usuarios autenticados del mismo daycare
CREATE POLICY "parent_children_select_same_daycare" ON public.parent_children
    FOR SELECT
    TO authenticated
    USING (
        child_id IN (
            SELECT c.id
            FROM public.children c
            JOIN public.rooms r ON r.id = c.room_id
            WHERE r.daycare_id = (
                SELECT u.daycare_id
                FROM public.users u
                WHERE u.id = (SELECT auth.uid())
            )
        )
    );

-- parent_children: inserción para usuarios autenticados del mismo daycare
CREATE POLICY "parent_children_insert_same_daycare" ON public.parent_children
    FOR INSERT
    TO authenticated
    WITH CHECK (
        child_id IN (
            SELECT c.id
            FROM public.children c
            JOIN public.rooms r ON r.id = c.room_id
            WHERE r.daycare_id = (
                SELECT u.daycare_id
                FROM public.users u
                WHERE u.id = (SELECT auth.uid())
            )
        )
    );

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.invitations TO authenticated;
GRANT SELECT, INSERT ON public.parent_children TO authenticated;
