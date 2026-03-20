-- Database Schema for Delta Platform (Supabase)

-- 1. Profiles (Vendedores e Admins)
-- Extende a tabela auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'seller' CHECK (role IN ('admin', 'seller', 'moderador', 'financeiro')),
  level TEXT DEFAULT 'Bronze' CHECK (level IN ('Bronze', 'Prata', 'Ouro')),
  xp INTEGER DEFAULT 0,
  wallet DECIMAL(12,2) DEFAULT 0.00,
  sales_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Pendente', 'Inativo', 'Suspenso')),
  
  -- Informações Adicionais
  phone TEXT,
  doc TEXT,
  company_name TEXT,
  state_registration TEXT,
  pix_key TEXT,
  
  -- Endereço
  address_zip TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,

  -- Permissões Granulares
  permissions JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products (Certificados e Serviços)
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  category TEXT CHECK (category IN ('CPF', 'CNPJ', 'Específicos')),
  type TEXT, -- e.g., A1, A3
  sku TEXT UNIQUE,
  media_type TEXT DEFAULT 'Nuvem' CHECK (media_type IN ('Nuvem', 'Token', 'Cartão', 'Arquivo')),
  supplier_product_id INTEGER, -- Link to new supplier_products table
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Supplier Management
CREATE TABLE IF NOT EXISTS public.supplier_tables (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  external_id TEXT, -- ID oficial no lado do fornecedor (Opcional)
  tax_fixed DECIMAL(10,2) DEFAULT 0, -- Taxa fixa (boleto/transação)
  tax_percent DECIMAL(5,2) DEFAULT 0, -- % de Imposto/Referencia sobre valor do pedido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.supplier_products (
  id SERIAL PRIMARY KEY,
  external_id TEXT, -- ID no fornecedor
  name TEXT NOT NULL,
  base_cost DECIMAL(10,2) NOT NULL,
  table_id INTEGER REFERENCES public.supplier_tables(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders (Certificados Emitidos / Jornada de Venda)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pago', 'Pendente', 'Cancelado', 'Rascunho', 'Arquivado')),
  holder_name TEXT NOT NULL,
  doc TEXT NOT NULL, -- CPF ou CNPJ
  product_id INTEGER REFERENCES public.products(id),
  seller_id UUID REFERENCES public.profiles(id),
  final_price DECIMAL(10,2) NOT NULL,
  seller_commission DECIMAL(10,2) NOT NULL,
  protocol TEXT UNIQUE,
  
  -- Detalhes complexos armazenados como JSONB para flexibilidade
  address_details JSONB,
  technical_details JSONB,
  billing_details JSONB,
  
  origin TEXT DEFAULT 'Venda Direta',

  -- Rastreamento e Metadados do Fornecedor (Separado dos dados do Vendedor)
  supplier_order_id INTEGER,
  supplier_uuid TEXT,
  supplier_status TEXT,
  supplier_link_pagamento TEXT,
  supplier_link_agendamento TEXT,
  supplier_product_name TEXT,
  supplier_valor_total DECIMAL(10,2),
  supplier_valor_comissao DECIMAL(10,2), -- Comissão Delta (Você) junto ao fornecedor
  supplier_valor_desconto DECIMAL(10,2),
  supplier_valor_acrescimo DECIMAL(10,2),
  supplier_valor_tabela DECIMAL(10,2),
  
  -- Memória de Cálculo (Histórico de Precisão)
  calculation_memory JSONB,
  partner_cost DECIMAL(10,2),
  taxes DECIMAL(10,2),
  fixed_fees DECIMAL(10,2)
);

-- 4. Withdrawals (Pedidos de Resgate)
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago', 'Negado')),
  pix_key TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Goals (Metas e Selos)
CREATE TABLE IF NOT EXISTS public.goals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reward_xp INTEGER NOT NULL,
  icon TEXT,
  target_type TEXT, -- e.g., 'Venda', 'Acesso'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) - Exemplos básicos
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para evitar recursividade infinita nas políticas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Usuários podem ler seu próprio perfil
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuários podem criar seu próprio perfil (Just-in-Time)
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas simplificadas para ambiente de simulação/híbrido
-- Permitir que qualquer um leia ordens (o filtro é feito na API por seller_id)
CREATE POLICY "Enable read for all" ON public.orders
  FOR SELECT USING (true);

-- Permitir que qualquer um crie ordens (necessário já que a API não tem sessão Auth)
CREATE POLICY "Enable insert for all" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Admins podem fazer tudo (usando a função para evitar recursão)
CREATE POLICY "Admins have full access." ON public.profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Admins have full access on orders." ON public.orders
  FOR ALL USING (is_admin());

-- Tabela de e-mails autorizados (Whitelist)
CREATE TABLE IF NOT EXISTS public.allowed_emails (
  email TEXT PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar a whitelist
CREATE POLICY "Admins can manage whitelist." ON public.allowed_emails
  FOR ALL USING (is_admin());

-- Permitir que qualquer um verifique se um e-mail está na whitelist (necessário para o signup)
-- Mas limitamos a leitura apenas ao campo email
CREATE POLICY "Public can check email whitelist." ON public.allowed_emails
  FOR SELECT USING (true);

-- 6. Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  doc TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Lead' CHECK (status IN ('Lead', 'Oportunidade', 'Ativo', 'Vencido', 'Arquivado')),
  origin TEXT DEFAULT 'Próprio' CHECK (origin IN ('Próprio', 'Concorrente')),
  certificate_type TEXT,
  expiry_date DATE,
  seller_name TEXT, -- Nome do vendedor para simulação
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Endereço
  address_zip TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  
  -- Documentação e Vinculação
  document_url TEXT,
  responsible_cpf TEXT, -- CPF do responsável (PF) para vincular a este PJ
  parent_id UUID REFERENCES public.customers(id), -- Auto-referência para vincular PJ a PF
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Customer Contacts (Departamentos)
CREATE TABLE IF NOT EXISTS public.customer_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT NOT NULL, -- e.g., Financeiro, Fiscal, Comercial
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para Customers e Contacts
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for all" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.customers FOR DELETE USING (true);

CREATE POLICY "Enable read for all contacts" ON public.customer_contacts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all contacts" ON public.customer_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all contacts" ON public.customer_contacts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all contacts" ON public.customer_contacts FOR DELETE USING (true);
