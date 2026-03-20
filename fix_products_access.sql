
-- 1. Garantir que as tabelas de produtos podem ser lidas por qualquer um (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_tables ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura publica de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir leitura publica de fornecedores" ON public.supplier_products;
DROP POLICY IF EXISTS "Permitir leitura publica de tabelas" ON public.supplier_tables;

-- 3. Criar novas políticas de acesso total para leitura
CREATE POLICY "Permitir leitura publica de produtos" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de fornecedores" ON public.supplier_products
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de tabelas" ON public.supplier_tables
  FOR SELECT USING (true);

-- 4. Garantir que is_active seja true para os itens existentes (opcional, mas recomendado)
UPDATE public.products SET is_active = true WHERE is_active IS NULL;
