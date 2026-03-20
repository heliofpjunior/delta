-- Seed data for Delta Platform
-- Run this in your Supabase SQL Editor AFTER running schema.sql

-- 1. Insert Initial Products
INSERT INTO public.products (name, description, price, commission, category, type, sku) VALUES
('e-CNPJ A1 (1 Ano)', 'Certificado para empresas, validade de 1 ano em nuvem ou arquivo.', 149.90, 45.00, 'CNPJ', 'A1', 'inv_001'),
('e-CPF A3 (3 Anos)', 'Certificado para pessoa física, validade de 3 anos em token ou cartão.', 299.00, 90.00, 'CPF', 'A3', 'inv_002'),
('e-Jurídico A1', 'Certificado específico para advogados, validade de 1 ano.', 199.00, 60.00, 'Específicos', 'A1', 'inv_003'),
('e-CPF A1 (1 Ano)', 'Certificado para pessoa física, validade de 1 ano em nuvem.', 120.00, 30.00, 'CPF', 'A1', 'inv_004');

-- 2. Insert Initial Goals
INSERT INTO public.goals (title, description, reward_xp, icon, target_type) VALUES
('Primeira Venda', 'Realize sua primeira emissão na plataforma', 500, 'Target', 'Venda'),
('Mestre do A1', 'Venda 10 certificados do tipo A1 em um único mês', 2000, 'Zap', 'Venda'),
('Sequência de Fogo', 'Acesse a plataforma por 5 dias consecutivos', 300, 'Flame', 'Acesso');

-- NOTE: To insert profiles, you need valid UUIDs from auth.users.
-- You can manually add a user in the 'Authentication' tab of your Supabase Dashboard,
-- get their 'User UID' and then run:
-- INSERT INTO public.profiles (id, full_name, email, role, level, xp, wallet) 
-- VALUES ('SEU_UUID_AQUI', 'Maria Silva', 'maria@test.com', 'seller', 'Prata', 1250, 450.00);
