-- =====================================================
-- SEED DATA - KitchenOS CEO Presentation Demo
-- Rode no SQL Editor do Supabase
-- Seguro rodar múltiplas vezes (ON CONFLICT DO NOTHING)
-- =====================================================

-- =====================
-- 0. MIGRAÇÃO: Atualizar constraint de status dos pedidos
-- =====================
-- Passo 1: Remover constraint antigo
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Passo 2: Converter dados antigos ANTES de criar novo constraint
UPDATE public.orders SET status = 'confirmed' WHERE status = 'pending';
UPDATE public.orders SET status = 'consumed' WHERE status = 'missed';

-- Passo 3: Criar novo constraint
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('confirmed', 'canceled', 'consumed'));

-- =====================
-- 1. FUNCIONÁRIOS (25 + 2 cozinha)
-- =====================
INSERT INTO public.users (name, cpf, role, department, phone) VALUES
('Ana Carolina Silva',      '111.111.111-01', 'employee', 'Administrativo', '5511999001001'),
('Bruno Oliveira Santos',   '111.111.111-02', 'employee', 'Comercial',      '5511999001002'),
('Camila Ferreira Lima',    '111.111.111-03', 'employee', 'TI',             '5511999001003'),
('Diego Almeida Costa',     '111.111.111-04', 'employee', 'Financeiro',     '5511999001004'),
('Eduarda Souza Pereira',   '111.111.111-05', 'employee', 'RH',             '5511999001005'),
('Felipe Rodrigues Neto',   '111.111.111-06', 'employee', 'Produção',       '5511999001006'),
('Gabriela Martins Rocha',  '111.111.111-07', 'employee', 'TI',             '5511999001007'),
('Henrique Barbosa Dias',   '111.111.111-08', 'employee', 'Comercial',      '5511999001008'),
('Isabela Nascimento Cruz', '111.111.111-09', 'employee', 'Administrativo', '5511999001009'),
('João Pedro Araújo',       '111.111.111-10', 'employee', 'Produção',       '5511999001010'),
('Karolina Gomes Vieira',   '111.111.111-11', 'employee', 'Financeiro',     '5511999001011'),
('Lucas Carvalho Moura',    '111.111.111-12', 'employee', 'TI',             '5511999001012'),
('Mariana Ribeiro Lopes',   '111.111.111-13', 'employee', 'RH',             '5511999001013'),
('Nicolas Teixeira Pinto',  '111.111.111-14', 'employee', 'Comercial',      '5511999001014'),
('Olivia Cardoso Mendes',   '111.111.111-15', 'employee', 'Produção',       '5511999001015'),
('Pedro Henrique Azevedo',  '111.111.111-16', 'employee', 'Administrativo', '5511999001016'),
('Rafaela Castro Correia',  '111.111.111-17', 'employee', 'TI',             '5511999001017'),
('Samuel Monteiro Ramos',   '111.111.111-18', 'employee', 'Financeiro',     '5511999001018'),
('Tatiana Freitas Nunes',   '111.111.111-19', 'employee', 'Comercial',      '5511999001019'),
('Vinicius Pires Machado',  '111.111.111-20', 'employee', 'Produção',       '5511999001020'),
('Yasmin Duarte Campos',    '111.111.111-21', 'employee', 'RH',             '5511999001021'),
('Wagner Melo Fonseca',     '111.111.111-22', 'employee', 'Administrativo', '5511999001022'),
('Larissa Braga Cunha',     '111.111.111-23', 'employee', 'TI',             '5511999001023'),
('Ricardo Nogueira Vaz',    '111.111.111-24', 'employee', 'Produção',       '5511999001024'),
('Fernanda Leal Pacheco',   '111.111.111-25', 'employee', 'Financeiro',     '5511999001025'),
('Chef Carlos Alberto',     '111.111.111-90', 'kitchen_staff', 'Cozinha',   '5511999009001'),
('Aux. Maria das Graças',   '111.111.111-91', 'kitchen_staff', 'Cozinha',   '5511999009002')
ON CONFLICT (cpf) DO NOTHING;

-- =====================
-- 2. PRATOS (15 dias: -7 a +7 relativo a hoje)
-- =====================

-- Dia -7
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Strogonoff de Frango', 'Peito de frango em tiras ao molho cremoso, arroz branco e batata palha', 'main', '/dishes/strogonoff_frango.png', CURRENT_DATE - 7),
('Frango Grelhado Fit', 'Peito de frango grelhado com mix de legumes salteados e arroz integral', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE - 7),
('Hambúrguer Artesanal', 'Hambúrguer artesanal 180g com queijo, alface, tomate e molho especial', 'snack', '/dishes/hamburguer.png', CURRENT_DATE - 7);

-- Dia -6
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Feijoada Completa', 'Feijão preto com carnes suínas, arroz, couve, farofa e laranja', 'main', '/dishes/feijoada.png', CURRENT_DATE - 6),
('Peixe Grelhado com Legumes', 'Filé de tilápia grelhado com legumes ao vapor e arroz integral', 'fit', '/dishes/peixe_grelhado.png', CURRENT_DATE - 6),
('Coxinha de Frango', 'Coxinha crocante recheada com frango desfiado e catupiry', 'snack', '/dishes/hamburguer.png', CURRENT_DATE - 6);

-- Dia -5
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Macarrão à Bolonhesa', 'Massa al dente com molho bolonhesa caseiro e queijo parmesão', 'main', '/dishes/macarrao_bolonhesa.png', CURRENT_DATE - 5),
('Salada Caesar Proteica', 'Alface romana, frango desfiado, croutons integrais e parmesão', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE - 5),
('Pão de Queijo com Café', 'Pão de queijo mineiro quentinho acompanhado de café coado', 'snack', '/dishes/hamburguer.png', CURRENT_DATE - 5);

-- Dia -4
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Prato Feito Tradicional', 'Arroz, feijão, bife grelhado, salada e farofa', 'main', '/dishes/arroz_feijao_bife.png', CURRENT_DATE - 4),
('Bowl de Quinoa', 'Quinoa com legumes grelhados, grão de bico e molho tahine', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE - 4),
('Sanduíche Natural', 'Pão integral com peito de peru, queijo branco, alface e tomate', 'snack', '/dishes/hamburguer.png', CURRENT_DATE - 4);

-- Dia -3
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Escondidinho de Carne Seca', 'Purê de mandioca gratinado com carne seca desfiada', 'main', '/dishes/strogonoff_frango.png', CURRENT_DATE - 3),
('Wrap Integral de Atum', 'Tortilla integral com atum, folhas verdes e cream cheese light', 'fit', '/dishes/peixe_grelhado.png', CURRENT_DATE - 3),
('Empada de Palmito', 'Empada folhada recheada com palmito e requeijão', 'snack', '/dishes/hamburguer.png', CURRENT_DATE - 3);

-- Dia -2
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Frango à Parmegiana', 'Filé de frango empanado com molho de tomate e queijo gratinado', 'main', '/dishes/arroz_feijao_bife.png', CURRENT_DATE - 2),
('Salmão ao Molho de Maracujá', 'Filé de salmão com molho agridoce de maracujá e aspargos', 'fit', '/dishes/peixe_grelhado.png', CURRENT_DATE - 2),
('Pastel de Carne', 'Pastel crocante recheado com carne moída temperada', 'snack', '/dishes/hamburguer.png', CURRENT_DATE - 2);

-- Dia -1 (ontem)
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Lasanha de Carne', 'Camadas de massa, molho bolonhesa e bechamel gratinado', 'main', '/dishes/macarrao_bolonhesa.png', CURRENT_DATE - 1),
('Peito de Peru com Batata Doce', 'Peito de peru fatiado com batata doce assada e salada verde', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE - 1),
('Mini Pizza Margherita', 'Mini pizza com molho de tomate, mussarela e manjericão fresco', 'snack', '/dishes/hamburguer.png', CURRENT_DATE - 1);

-- Dia 0 (HOJE)
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Costela no Bafo', 'Costela bovina assada lentamente com temperos especiais', 'main', '/dishes/arroz_feijao_bife.png', CURRENT_DATE),
('Tilápia com Legumes no Vapor', 'Filé de tilápia com brócolis, cenoura e abobrinha no vapor', 'fit', '/dishes/peixe_grelhado.png', CURRENT_DATE),
('Tapioca Recheada', 'Tapioca com queijo coalho e tomate seco', 'snack', '/dishes/hamburguer.png', CURRENT_DATE);

-- Dia +1
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Picanha Grelhada', 'Corte nobre grelhado ao ponto com arroz, farofa e vinagrete', 'main', '/dishes/arroz_feijao_bife.png', CURRENT_DATE + 1),
('Bowl Tropical Fit', 'Frutas frescas, granola, iogurte natural e mel', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE + 1),
('Açaí com Granola', 'Açaí batido com banana, granola crocante e mel', 'snack', '/dishes/hamburguer.png', CURRENT_DATE + 1);

-- Dia +2
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Galinhada Caipira', 'Arroz com frango caipira, pequi, açafrão e temperos regionais', 'main', '/dishes/strogonoff_frango.png', CURRENT_DATE + 2),
('Omelete Fit de Claras', 'Omelete de claras com espinafre, tomate seco e cottage', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE + 2),
('Misto Quente', 'Pão de forma com presunto e queijo quente na chapa', 'snack', '/dishes/hamburguer.png', CURRENT_DATE + 2);

-- Dia +3
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Carne de Panela', 'Carne bovina cozida lentamente com legumes e molho encorpado', 'main', '/dishes/arroz_feijao_bife.png', CURRENT_DATE + 3),
('Salada Mediterrânea', 'Mix de folhas, pepino, tomate, azeitona e queijo feta', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE + 3),
('Esfirra de Carne', 'Esfirra aberta com carne moída temperada e hortelã', 'snack', '/dishes/hamburguer.png', CURRENT_DATE + 3);

-- Dia +4
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Lombo Assado', 'Lombo suíno assado com molho de mostarda e ervas', 'main', '/dishes/arroz_feijao_bife.png', CURRENT_DATE + 4),
('Frango Desfiado Low Carb', 'Frango desfiado com abóbora, espinafre e azeite de oliva', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE + 4),
('Bolo de Cenoura', 'Bolo caseiro de cenoura com cobertura de chocolate', 'snack', '/dishes/hamburguer.png', CURRENT_DATE + 4);

-- Dia +5
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Bife Acebolado', 'Bife bovino grelhado com cebolas caramelizadas', 'main', '/dishes/arroz_feijao_bife.png', CURRENT_DATE + 5),
('Peixe com Purê de Abóbora', 'Filé de peixe com purê de abóbora e salada verde', 'fit', '/dishes/peixe_grelhado.png', CURRENT_DATE + 5),
('Torta de Frango', 'Torta de massa folhada recheada com frango e requeijão', 'snack', '/dishes/hamburguer.png', CURRENT_DATE + 5);

-- Dia +6
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Arroz Carreteiro', 'Arroz com charque, linguiça e temperos gaúchos', 'main', '/dishes/feijoada.png', CURRENT_DATE + 6),
('Wrap de Frango Fit', 'Wrap integral com frango, rúcula e molho de iogurte', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE + 6),
('Crepe de Presunto e Queijo', 'Crepe fino recheado com presunto e queijo gratinado', 'snack', '/dishes/hamburguer.png', CURRENT_DATE + 6);

-- Dia +7
INSERT INTO public.menu_items (name, description, type, photo_url, date) VALUES
('Vatapá Baiano', 'Prato típico baiano com camarão, dendê e amendoim', 'main', '/dishes/feijoada.png', CURRENT_DATE + 7),
('Bowl Proteico', 'Arroz integral, frango, ovo, edamame e molho shoyu', 'fit', '/dishes/frango_grelhado.png', CURRENT_DATE + 7),
('Croissant Recheado', 'Croissant amanteigado recheado com presunto e queijo', 'snack', '/dishes/hamburguer.png', CURRENT_DATE + 7);

-- =====================
-- 3. PEDIDOS (dias passados + hoje + futuros)
-- Usa subqueries para evitar problemas com tipos de ID
-- =====================

-- Pedidos dos últimos 7 dias (status: consumed, com ~5% canceled)
INSERT INTO public.orders (user_id, menu_item_id, consumption_date, status, created_at)
SELECT
  u.id,
  m.id,
  m.date,
  CASE WHEN random() < 0.05 THEN 'canceled' ELSE 'consumed' END,
  (m.date - INTERVAL '1 day' + (INTERVAL '1 hour' * (8 + floor(random() * 10))))::timestamptz
FROM public.users u
CROSS JOIN LATERAL (
  SELECT id, date FROM public.menu_items
  WHERE date >= CURRENT_DATE - 7 AND date < CURRENT_DATE
  ORDER BY random()
  LIMIT 1
) m
WHERE u.role = 'employee'
  AND u.cpf LIKE '111.111.111%'
  AND random() < 0.80
ON CONFLICT DO NOTHING;

-- Gerar mais pedidos para ter volume (segunda rodada para datas diferentes)
INSERT INTO public.orders (user_id, menu_item_id, consumption_date, status, created_at)
SELECT
  u.id,
  m.id,
  m.date,
  CASE WHEN random() < 0.05 THEN 'canceled' ELSE 'consumed' END,
  (m.date - INTERVAL '1 day' + (INTERVAL '1 hour' * (8 + floor(random() * 10))))::timestamptz
FROM public.users u
CROSS JOIN LATERAL (
  SELECT id, date FROM public.menu_items
  WHERE date >= CURRENT_DATE - 7 AND date < CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.user_id = u.id AND o.consumption_date = menu_items.date
    )
  ORDER BY random()
  LIMIT 1
) m
WHERE u.role = 'employee'
  AND u.cpf LIKE '111.111.111%'
  AND random() < 0.75
ON CONFLICT DO NOTHING;

-- Pedidos de HOJE (todos confirmed)
INSERT INTO public.orders (user_id, menu_item_id, consumption_date, status, created_at)
SELECT
  u.id,
  m.id,
  CURRENT_DATE,
  'confirmed',
  (CURRENT_DATE - INTERVAL '1 day' + (INTERVAL '1 hour' * (9 + floor(random() * 8))))::timestamptz
FROM public.users u
CROSS JOIN LATERAL (
  SELECT id FROM public.menu_items
  WHERE date = CURRENT_DATE
  ORDER BY random()
  LIMIT 1
) m
WHERE u.role = 'employee'
  AND u.cpf LIKE '111.111.111%'
  AND random() < 0.85
  AND NOT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.user_id = u.id AND o.consumption_date = CURRENT_DATE
  )
ON CONFLICT DO NOTHING;

-- Pedidos FUTUROS (3 dias, confirmed)
INSERT INTO public.orders (user_id, menu_item_id, consumption_date, status, created_at)
SELECT
  u.id,
  m.id,
  m.date,
  'confirmed',
  (CURRENT_TIMESTAMP - (INTERVAL '1 hour' * floor(random() * 12)))
FROM public.users u
CROSS JOIN LATERAL (
  SELECT id, date FROM public.menu_items
  WHERE date > CURRENT_DATE AND date <= CURRENT_DATE + 3
  ORDER BY random()
  LIMIT 1
) m
WHERE u.role = 'employee'
  AND u.cpf LIKE '111.111.111%'
  AND random() < 0.60
  AND NOT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.user_id = u.id AND o.consumption_date = m.date
  )
ON CONFLICT DO NOTHING;

-- =====================
-- 4. RESUMO
-- =====================
SELECT 'SEED COMPLETO ✅' AS status,
  (SELECT count(*) FROM users WHERE cpf LIKE '111.111.111%') AS funcionarios,
  (SELECT count(*) FROM menu_items WHERE date >= CURRENT_DATE - 7 AND date <= CURRENT_DATE + 7) AS pratos,
  (SELECT count(*) FROM orders WHERE consumption_date >= CURRENT_DATE - 7) AS pedidos;
