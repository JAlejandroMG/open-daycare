-- Tabla raíz: guarderías
CREATE TABLE IF NOT EXISTS public.daycares (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    address    text,
    created_at timestamptz DEFAULT now()
);

-- Activar Row Level Security
ALTER TABLE public.daycares ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para anon y authenticated
CREATE POLICY "Allow public read" ON public.daycares
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Otorgar permisos de lectura
GRANT SELECT ON public.daycares TO anon, authenticated;
