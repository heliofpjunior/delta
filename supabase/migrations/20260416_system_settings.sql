-- Migração: Cria tabela system_settings para armazenar configurações globais do sistema
-- Uso inicial: token de API da CertControl

CREATE TABLE IF NOT EXISTS public.system_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.system_settings;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_updated_at();

-- Segurança: apenas admins podem ler/escrever
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only read"
    ON public.system_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin only write"
    ON public.system_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
