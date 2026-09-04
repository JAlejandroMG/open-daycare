-- Enum post_type (expandido con cheer)
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
    title        text,
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
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_children_post_id ON public.post_children(post_id);
CREATE INDEX IF NOT EXISTS idx_post_children_child_id ON public.post_children(child_id);
CREATE INDEX IF NOT EXISTS idx_post_photos_post_id ON public.post_photos(post_id);

-- Activar Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_photos ENABLE ROW LEVEL SECURITY;

-- posts: lectura para usuarios autenticados del mismo daycare
CREATE POLICY "posts_select_same_daycare" ON public.posts
    FOR SELECT
    TO authenticated
    USING (
        author_id IN (
            SELECT u.id
            FROM public.users u
            WHERE u.daycare_id = (
                SELECT u2.daycare_id
                FROM public.users u2
                WHERE u2.id = (SELECT auth.uid())
            )
        )
    );

-- posts: inserción para staff/admin del mismo daycare
CREATE POLICY "posts_insert_staff_same_daycare" ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = (SELECT auth.uid())
        AND author_id IN (
            SELECT u.id
            FROM public.users u
            WHERE u.role IN ('staff', 'admin')
            AND u.daycare_id = (
                SELECT u2.daycare_id
                FROM public.users u2
                WHERE u2.id = (SELECT auth.uid())
            )
        )
    );

-- posts: actualización para el autor
CREATE POLICY "posts_update_author" ON public.posts
    FOR UPDATE
    TO authenticated
    USING (author_id = (SELECT auth.uid()))
    WITH CHECK (author_id = (SELECT auth.uid()));

-- post_children: lectura para usuarios autenticados del mismo daycare
CREATE POLICY "post_children_select_same_daycare" ON public.post_children
    FOR SELECT
    TO authenticated
    USING (
        post_id IN (
            SELECT p.id
            FROM public.posts p
            WHERE p.author_id IN (
                SELECT u.id
                FROM public.users u
                WHERE u.daycare_id = (
                    SELECT u2.daycare_id
                    FROM public.users u2
                    WHERE u2.id = (SELECT auth.uid())
                )
            )
        )
    );

-- post_children: inserción para staff/admin del mismo daycare
CREATE POLICY "post_children_insert_staff_same_daycare" ON public.post_children
    FOR INSERT
    TO authenticated
    WITH CHECK (
        post_id IN (
            SELECT p.id
            FROM public.posts p
            WHERE p.author_id = (SELECT auth.uid())
        )
    );

-- post_photos: lectura para usuarios autenticados del mismo daycare
CREATE POLICY "post_photos_select_same_daycare" ON public.post_photos
    FOR SELECT
    TO authenticated
    USING (
        post_id IN (
            SELECT p.id
            FROM public.posts p
            WHERE p.author_id IN (
                SELECT u.id
                FROM public.users u
                WHERE u.daycare_id = (
                    SELECT u2.daycare_id
                    FROM public.users u2
                    WHERE u2.id = (SELECT auth.uid())
                )
            )
        )
    );

-- post_photos: inserción para staff/admin del mismo daycare
CREATE POLICY "post_photos_insert_staff_same_daycare" ON public.post_photos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        post_id IN (
            SELECT p.id
            FROM public.posts p
            WHERE p.author_id = (SELECT auth.uid())
        )
    );

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.posts TO authenticated;
GRANT SELECT, INSERT ON public.post_children TO authenticated;
GRANT SELECT, INSERT ON public.post_photos TO authenticated;
