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

-- Activar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política de lectura para authenticated
CREATE POLICY "Allow authenticated read" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- Otorgar permisos de lectura
GRANT SELECT ON public.users TO authenticated;
