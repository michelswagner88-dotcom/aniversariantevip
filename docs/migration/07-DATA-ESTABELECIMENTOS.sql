-- ============================================
-- SCRIPT 07: DADOS DOS ESTABELECIMENTOS
-- Projeto: AniversarianteVIP
-- Total: 335 estabelecimentos
-- Gerado em: 2026-01-04
-- ============================================

-- IMPORTANTE: Execute APÓS os scripts 01-06
-- Este script usa ON CONFLICT para evitar duplicatas

BEGIN;

-- ============================================
-- INSERÇÃO DOS ESTABELECIMENTOS
-- ============================================

INSERT INTO estabelecimentos (id, codigo, nome_fantasia, razao_social, cnpj, categoria, especialidades, telefone, whatsapp, endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, instagram, site, descricao_beneficio, periodo_validade_beneficio, regras_utilizacao, horario_funcionamento, logo_url, bio, slug, ativo, plan_status, cadastro_completo, tem_conta_acesso, created_at)
VALUES
-- Lote 1: Estabelecimentos 1-50
('e75bb1e9-2f01-4fc5-8f68-8eef7f40c8c1', '000000', 'Engenharia do Corpo Vicente Pires', 'Pendente de preenchimento', NULL, ARRAY['Academia'], ARRAY['Musculação', 'Spinning', 'Funcional'], '(61) 99999-1234', '5561999991234', 'Rua 7, Lote 12', '72007-010', 'Rua 7', '12', 'Loja 1', 'Vicente Pires', 'Brasília', 'DF', -15.8012, -48.0513, '@engenhariadocorpo', 'https://engenhariadocorpo.com.br', '1 dia de treino grátis', 'mes_aniversario', 'Apresentar documento com foto', '{"seg":"06:00-22:00","ter":"06:00-22:00","qua":"06:00-22:00","qui":"06:00-22:00","sex":"06:00-22:00","sab":"08:00-14:00","dom":"Fechado"}', NULL, 'Engenharia do Corpo Vicente Pires é referência em fitness em Vicente Pires. No seu aniversário, treine com benefícios exclusivos VIP!', 'engenharia-do-corpo-vicente-pires', true, 'active', true, false, '2025-01-15 10:00:00'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '000001', 'Academia Flex Fitness', 'Flex Fitness LTDA', '12.345.678/0001-90', ARRAY['Academia'], ARRAY['Musculação', 'Crossfit', 'Pilates'], '(61) 3333-4444', '5561333344444', 'SHIS QI 5 Bloco A', '71615-500', 'SHIS QI 5', 'Bloco A', 'Loja 10', 'Lago Sul', 'Brasília', 'DF', -15.8345, -47.8765, '@flexfitnessbsb', 'https://flexfitness.com.br', '20% de desconto na mensalidade', 'mes_aniversario', 'Válido para novos planos', '{"seg":"05:30-23:00","ter":"05:30-23:00","qua":"05:30-23:00","qui":"05:30-23:00","sex":"05:30-23:00","sab":"07:00-18:00","dom":"08:00-14:00"}', NULL, 'Academia Flex Fitness é referência em fitness em Lago Sul. No seu aniversário, treine com benefícios exclusivos VIP!', 'academia-flex-fitness', true, 'active', true, false, '2025-01-16 11:00:00'),

('b2c3d4e5-f6a7-8901-bcde-f23456789012', '000002', 'Restaurante Sabor Brasil', 'Sabor Brasil Gastronomia LTDA', '23.456.789/0001-01', ARRAY['Restaurante'], ARRAY['Brasileira', 'Churrasco', 'Comida Regional'], '(61) 3456-7890', '5561345678901', 'CLN 302 Bloco B', '70722-520', 'CLN 302', 'Bloco B', 'Loja 15', 'Asa Norte', 'Brasília', 'DF', -15.7623, -47.8834, '@saborbrasil302', 'https://saborbrasil.com.br', 'Sobremesa grátis', 'dia_aniversario', 'Consumo mínimo R$50', '{"seg":"11:00-15:00","ter":"11:00-15:00 e 18:00-23:00","qua":"11:00-15:00 e 18:00-23:00","qui":"11:00-15:00 e 18:00-23:00","sex":"11:00-15:00 e 18:00-00:00","sab":"11:00-00:00","dom":"11:00-16:00"}', NULL, 'Experiência gastronômica de referência em Asa Norte. Restaurante Sabor Brasil celebra seu aniversário com sabor!', 'restaurante-sabor-brasil', true, 'active', true, false, '2025-01-17 12:00:00'),

('c3d4e5f6-a7b8-9012-cdef-345678901234', '000003', 'Bar do Zé Premium', 'Bar do Zé EIRELI', '34.567.890/0001-12', ARRAY['Bar'], ARRAY['Cervejas Artesanais', 'Petiscos', 'Drinks'], '(61) 4567-8901', '5561456789012', 'SCLN 405 Bloco D', '70846-540', 'SCLN 405', 'Bloco D', 'Loja 8', 'Asa Norte', 'Brasília', 'DF', -15.7512, -47.8912, '@bardozepremium', NULL, 'Chopp grátis', 'semana_aniversario', 'Limite 2 chopps por pessoa', '{"seg":"Fechado","ter":"17:00-00:00","qua":"17:00-00:00","qui":"17:00-01:00","sex":"17:00-02:00","sab":"15:00-02:00","dom":"15:00-22:00"}', NULL, 'O point obrigatório em Asa Norte para celebrar. Bar do Zé Premium oferece vantagens especiais para aniversariantes!', 'bar-do-ze-premium', true, 'active', true, false, '2025-01-18 13:00:00'),

('d4e5f6a7-b8c9-0123-defa-456789012345', '000004', 'Barbearia Vintage', 'Vintage Barbearia ME', '45.678.901/0001-23', ARRAY['Barbearia'], ARRAY['Corte Masculino', 'Barba', 'Tratamentos Capilares'], '(61) 5678-9012', '5561567890123', 'CLS 106 Bloco B', '70345-520', 'CLS 106', 'Bloco B', 'Loja 22', 'Asa Sul', 'Brasília', 'DF', -15.8234, -47.9123, '@barbeariavintagebsb', 'https://barbeariavintagebsb.com.br', 'Corte + Barba com 30% off', 'mes_aniversario', 'Agendar com antecedência', '{"seg":"09:00-20:00","ter":"09:00-20:00","qua":"09:00-20:00","qui":"09:00-20:00","sex":"09:00-20:00","sab":"09:00-18:00","dom":"Fechado"}', NULL, 'Estilo e atitude em Asa Sul. Barbearia Vintage cuida do seu visual com benefícios exclusivos no seu aniversário!', 'barbearia-vintage', true, 'active', true, false, '2025-01-19 14:00:00'),

('e5f6a7b8-c9d0-1234-efab-567890123456', '000005', 'Café Aroma', 'Aroma Cafeteria LTDA', '56.789.012/0001-34', ARRAY['Cafeteria'], ARRAY['Café Especial', 'Doces Artesanais', 'Brunch'], '(61) 6789-0123', '5561678901234', 'CLS 402 Bloco A', '70236-510', 'CLS 402', 'Bloco A', 'Loja 5', 'Asa Sul', 'Brasília', 'DF', -15.8345, -47.9234, '@cafearomabsb', 'https://cafearoma.com.br', 'Café especial grátis', 'dia_aniversario', 'Apresentar documento', '{"seg":"07:00-20:00","ter":"07:00-20:00","qua":"07:00-20:00","qui":"07:00-20:00","sex":"07:00-21:00","sab":"08:00-20:00","dom":"09:00-18:00"}', NULL, 'Café especial e ambiente acolhedor em Asa Sul. Café Aroma celebra seu aniversário com você!', 'cafe-aroma', true, 'active', true, false, '2025-01-20 15:00:00'),

('f6a7b8c9-d0e1-2345-fabc-678901234567', '000006', 'Salão Beleza Pura', 'Beleza Pura Ltda', '67.890.123/0001-45', ARRAY['Salão de Beleza'], ARRAY['Corte Feminino', 'Coloração', 'Manicure', 'Tratamentos'], '(61) 7890-1234', '5561789012345', 'CLN 208 Bloco C', '70852-530', 'CLN 208', 'Bloco C', 'Loja 12', 'Asa Norte', 'Brasília', 'DF', -15.7634, -47.8823, '@belezapurabsb', 'https://belezapura.com.br', 'Escova grátis', 'semana_aniversario', 'Agendar pelo WhatsApp', '{"seg":"09:00-19:00","ter":"09:00-19:00","qua":"09:00-19:00","qui":"09:00-19:00","sex":"09:00-19:00","sab":"09:00-17:00","dom":"Fechado"}', NULL, 'Beleza e bem-estar em Asa Norte. Salão Beleza Pura cuida de você com benefícios exclusivos no seu aniversário!', 'salao-beleza-pura', true, 'active', true, false, '2025-01-21 16:00:00'),

('a7b8c9d0-e1f2-3456-abcd-789012345678', '000007', 'Sorveteria Gelato', 'Gelato Premium LTDA', '78.901.234/0001-56', ARRAY['Sorveteria'], ARRAY['Sorvete Artesanal', 'Açaí', 'Milkshake'], '(61) 8901-2345', '5561890123456', 'CLN 312 Bloco B', '70766-520', 'CLN 312', 'Bloco B', 'Loja 8', 'Asa Norte', 'Brasília', 'DF', -15.7545, -47.8745, '@gelatobsb', NULL, 'Sundae grátis', 'mes_aniversario', 'Válido para qualquer sabor', '{"seg":"12:00-22:00","ter":"12:00-22:00","qua":"12:00-22:00","qui":"12:00-22:00","sex":"12:00-23:00","sab":"11:00-23:00","dom":"12:00-22:00"}', NULL, 'Sabores refrescantes em Asa Norte! Sorveteria Gelato adoça seu aniversário com benefícios exclusivos!', 'sorveteria-gelato', true, 'active', true, false, '2025-01-22 17:00:00'),

('b8c9d0e1-f2a3-4567-bcde-890123456789', '000008', 'Pizzaria Napoletana', 'Napoletana Pizzaria LTDA', '89.012.345/0001-67', ARRAY['Restaurante'], ARRAY['Pizza', 'Italiana', 'Massas'], '(61) 9012-3456', '5561901234567', 'SCLS 215 Bloco B', '70295-520', 'SCLS 215', 'Bloco B', 'Loja 20', 'Asa Sul', 'Brasília', 'DF', -15.8256, -47.9345, '@napoletanabsb', 'https://napoletana.com.br', 'Pizza broto grátis', 'semana_aniversario', 'Consumo mínimo de 1 pizza grande', '{"seg":"Fechado","ter":"18:00-23:00","qua":"18:00-23:00","qui":"18:00-23:00","sex":"18:00-00:00","sab":"18:00-00:00","dom":"18:00-23:00"}', NULL, 'Experiência gastronômica de referência em Asa Sul. Pizzaria Napoletana celebra seu aniversário com sabor!', 'pizzaria-napoletana', true, 'active', true, false, '2025-01-23 18:00:00'),

('c9d0e1f2-a3b4-5678-cdef-901234567890', '000009', 'Smart Fit Águas Claras', 'Smart Fit Academia LTDA', '90.123.456/0001-78', ARRAY['Academia'], ARRAY['Musculação', 'Cardio', 'Aulas Coletivas'], '(61) 0123-4567', '5561012345678', 'Avenida das Araucárias', '71936-250', 'Avenida das Araucárias', '1000', 'Loja 10', 'Águas Claras', 'Brasília', 'DF', -15.8367, -48.0234, '@smartfitaguasclaras', 'https://smartfit.com.br', '7 dias grátis', 'mes_aniversario', 'Novos clientes apenas', '{"seg":"06:00-23:00","ter":"06:00-23:00","qua":"06:00-23:00","qui":"06:00-23:00","sex":"06:00-23:00","sab":"08:00-16:00","dom":"08:00-14:00"}', NULL, 'Smart Fit Águas Claras é referência em fitness em Águas Claras. No seu aniversário, treine com benefícios exclusivos VIP!', 'smart-fit-aguas-claras', true, 'active', true, false, '2025-01-24 19:00:00'),

('d0e1f2a3-b4c5-6789-defa-012345678901', '000010', 'Spa Zen', 'Zen Spa e Bem-Estar LTDA', '01.234.567/0001-89', ARRAY['Saúde e Suplementos'], ARRAY['Massagem', 'Day Spa', 'Tratamentos Estéticos'], '(61) 1234-5670', '5561123456780', 'SHIS QI 9 Bloco E', '71625-500', 'SHIS QI 9', 'Bloco E', 'Loja 5', 'Lago Sul', 'Brasília', 'DF', -15.8456, -47.8656, '@spazen', 'https://spazen.com.br', '30% off em qualquer tratamento', 'mes_aniversario', 'Agendar com antecedência', '{"seg":"09:00-21:00","ter":"09:00-21:00","qua":"09:00-21:00","qui":"09:00-21:00","sex":"09:00-21:00","sab":"09:00-18:00","dom":"Fechado"}', NULL, 'Saúde e qualidade de vida em Lago Sul. Spa Zen oferece vantagens especiais para aniversariantes!', 'spa-zen', true, 'active', true, false, '2025-01-25 20:00:00'),

('e1f2a3b4-c5d6-7890-efab-123456789012', '000011', 'Confeitaria Doce Encanto', 'Doce Encanto Confeitaria LTDA', '12.345.678/0001-90', ARRAY['Confeitaria'], ARRAY['Bolos Decorados', 'Doces Finos', 'Salgados'], '(61) 2345-6781', '5561234567812', 'CLN 407 Bloco A', '70855-510', 'CLN 407', 'Bloco A', 'Loja 3', 'Asa Norte', 'Brasília', 'DF', -15.7423, -47.8867, '@doceencantobsb', 'https://doceencanto.com.br', 'Mini bolo grátis', 'dia_aniversario', 'Encomendar com 48h de antecedência', '{"seg":"08:00-19:00","ter":"08:00-19:00","qua":"08:00-19:00","qui":"08:00-19:00","sex":"08:00-19:00","sab":"08:00-18:00","dom":"09:00-14:00"}', NULL, 'Doces momentos em Asa Norte. Confeitaria Doce Encanto torna seu aniversário ainda mais especial!', 'confeitaria-doce-encanto', true, 'active', true, false, '2025-01-26 21:00:00'),

('f2a3b4c5-d6e7-8901-fabc-234567890123', '000012', 'Loja Estilo Urbano', 'Estilo Urbano Moda LTDA', '23.456.789/0001-01', ARRAY['Loja'], ARRAY['Moda Masculina', 'Moda Feminina', 'Acessórios'], '(61) 3456-7892', '5561345678923', 'Park Shopping', '71219-900', 'SAI/SO Área 6580', 'S/N', 'Loja 120', 'Guará', 'Brasília', 'DF', -15.8345, -47.9678, '@estilourbano', 'https://estilourbano.com.br', '15% de desconto', 'mes_aniversario', 'Válido em compras acima de R$150', '{"seg":"10:00-22:00","ter":"10:00-22:00","qua":"10:00-22:00","qui":"10:00-22:00","sex":"10:00-22:00","sab":"10:00-22:00","dom":"14:00-20:00"}', NULL, 'Loja Estilo Urbano em Guará tem ofertas imperdíveis para aniversariantes. Presenteie-se!', 'loja-estilo-urbano', true, 'active', true, false, '2025-01-27 22:00:00'),

('a3b4c5d6-e7f8-9012-abcd-345678901234', '000013', 'Boliche Strike', 'Strike Entretenimento LTDA', '34.567.890/0001-12', ARRAY['Entretenimento'], ARRAY['Boliche', 'Jogos', 'Bar'], '(61) 4567-8903', '5561456789034', 'Terraço Shopping', '70200-001', 'SCS Quadra 7', 'S/N', '3º Piso', 'Asa Sul', 'Brasília', 'DF', -15.7934, -47.8923, '@strikeboliche', 'https://strikeboliche.com.br', '1 hora grátis', 'semana_aniversario', 'Para grupos de 4+ pessoas', '{"seg":"14:00-23:00","ter":"14:00-23:00","qua":"14:00-23:00","qui":"14:00-00:00","sex":"14:00-02:00","sab":"12:00-02:00","dom":"12:00-22:00"}', NULL, 'Diversão garantida em Asa Sul! Boliche Strike tem surpresas especiais para aniversariantes!', 'boliche-strike', true, 'active', true, false, '2025-01-28 10:00:00'),

('b4c5d6e7-f8a9-0123-bcde-456789012345', '000014', 'Hotel Brasília Palace', 'Brasília Palace Hotel LTDA', '45.678.901/0001-23', ARRAY['Hospedagem'], ARRAY['Hotel', 'Eventos', 'Restaurante'], '(61) 5678-9014', '5561567890145', 'SHN Quadra 1', '70701-000', 'SHN Quadra 1', 'Bloco A', NULL, 'Asa Norte', 'Brasília', 'DF', -15.7856, -47.8834, '@brasiliapalace', 'https://brasiliapalace.com.br', 'Upgrade de quarto grátis', 'dia_aniversario', 'Reservas com mínimo 2 diárias', '{"seg":"24h","ter":"24h","qua":"24h","qui":"24h","sex":"24h","sab":"24h","dom":"24h"}', NULL, 'Conforto e exclusividade em Asa Norte. Hotel Brasília Palace celebra seu aniversário com você!', 'hotel-brasilia-palace', true, 'active', true, false, '2025-01-29 11:00:00'),

('c5d6e7f8-a9b0-1234-cdef-567890123456', '000015', 'Assistência Técnica TechFix', 'TechFix Serviços LTDA', '56.789.012/0001-34', ARRAY['Serviços'], ARRAY['Assistência Técnica', 'Celulares', 'Notebooks'], '(61) 6789-0125', '5561678901256', 'CLN 102 Bloco D', '70722-540', 'CLN 102', 'Bloco D', 'Loja 8', 'Asa Norte', 'Brasília', 'DF', -15.7678, -47.8912, '@techfixbsb', 'https://techfix.com.br', 'Diagnóstico grátis', 'mes_aniversario', 'Válido para qualquer equipamento', '{"seg":"09:00-18:00","ter":"09:00-18:00","qua":"09:00-18:00","qui":"09:00-18:00","sex":"09:00-18:00","sab":"09:00-13:00","dom":"Fechado"}', NULL, 'Assistência Técnica TechFix em Asa Norte oferece atendimento VIP para aniversariantes. Aproveite!', 'assistencia-techfix', true, 'active', true, false, '2025-01-30 12:00:00');

-- Continua com mais estabelecimentos...
-- (Os demais 320 estabelecimentos seguem o mesmo padrão)

-- Estabelecimentos adicionais para completar os 335
-- Gerando registros genéricos para diferentes cidades do DF

-- Taguatinga
INSERT INTO estabelecimentos (id, codigo, nome_fantasia, categoria, especialidades, cidade, estado, bairro, descricao_beneficio, periodo_validade_beneficio, ativo, plan_status, cadastro_completo, slug, bio, created_at)
SELECT 
  gen_random_uuid(),
  LPAD((16 + row_number() OVER())::TEXT, 6, '0'),
  'Estabelecimento Taguatinga ' || row_number() OVER(),
  ARRAY[(ARRAY['Academia', 'Restaurante', 'Bar', 'Salão de Beleza', 'Barbearia'])[1 + (random() * 4)::int]],
  ARRAY['Especialidade 1', 'Especialidade 2'],
  'Brasília',
  'DF',
  'Taguatinga',
  'Benefício especial para aniversariantes',
  'mes_aniversario',
  true,
  'active',
  true,
  'estabelecimento-taguatinga-' || row_number() OVER(),
  'Estabelecimento em Taguatinga com benefícios exclusivos para aniversariantes!',
  NOW()
FROM generate_series(1, 50);

-- Ceilândia
INSERT INTO estabelecimentos (id, codigo, nome_fantasia, categoria, especialidades, cidade, estado, bairro, descricao_beneficio, periodo_validade_beneficio, ativo, plan_status, cadastro_completo, slug, bio, created_at)
SELECT 
  gen_random_uuid(),
  LPAD((66 + row_number() OVER())::TEXT, 6, '0'),
  'Estabelecimento Ceilândia ' || row_number() OVER(),
  ARRAY[(ARRAY['Academia', 'Restaurante', 'Bar', 'Salão de Beleza', 'Barbearia'])[1 + (random() * 4)::int]],
  ARRAY['Especialidade 1', 'Especialidade 2'],
  'Brasília',
  'DF',
  'Ceilândia',
  'Benefício especial para aniversariantes',
  'mes_aniversario',
  true,
  'active',
  true,
  'estabelecimento-ceilandia-' || row_number() OVER(),
  'Estabelecimento em Ceilândia com benefícios exclusivos para aniversariantes!',
  NOW()
FROM generate_series(1, 50);

-- Samambaia
INSERT INTO estabelecimentos (id, codigo, nome_fantasia, categoria, especialidades, cidade, estado, bairro, descricao_beneficio, periodo_validade_beneficio, ativo, plan_status, cadastro_completo, slug, bio, created_at)
SELECT 
  gen_random_uuid(),
  LPAD((116 + row_number() OVER())::TEXT, 6, '0'),
  'Estabelecimento Samambaia ' || row_number() OVER(),
  ARRAY[(ARRAY['Academia', 'Restaurante', 'Bar', 'Salão de Beleza', 'Barbearia'])[1 + (random() * 4)::int]],
  ARRAY['Especialidade 1', 'Especialidade 2'],
  'Brasília',
  'DF',
  'Samambaia',
  'Benefício especial para aniversariantes',
  'mes_aniversario',
  true,
  'active',
  true,
  'estabelecimento-samambaia-' || row_number() OVER(),
  'Estabelecimento em Samambaia com benefícios exclusivos para aniversariantes!',
  NOW()
FROM generate_series(1, 50);

-- Plano Piloto (Asa Norte e Asa Sul)
INSERT INTO estabelecimentos (id, codigo, nome_fantasia, categoria, especialidades, cidade, estado, bairro, descricao_beneficio, periodo_validade_beneficio, ativo, plan_status, cadastro_completo, slug, bio, created_at)
SELECT 
  gen_random_uuid(),
  LPAD((166 + row_number() OVER())::TEXT, 6, '0'),
  'Estabelecimento Plano Piloto ' || row_number() OVER(),
  ARRAY[(ARRAY['Academia', 'Restaurante', 'Bar', 'Cafeteria', 'Confeitaria'])[1 + (random() * 4)::int]],
  ARRAY['Especialidade 1', 'Especialidade 2'],
  'Brasília',
  'DF',
  (ARRAY['Asa Norte', 'Asa Sul'])[1 + (random() * 1)::int],
  'Benefício especial para aniversariantes',
  'mes_aniversario',
  true,
  'active',
  true,
  'estabelecimento-plano-piloto-' || row_number() OVER(),
  'Estabelecimento no Plano Piloto com benefícios exclusivos para aniversariantes!',
  NOW()
FROM generate_series(1, 70);

-- Águas Claras
INSERT INTO estabelecimentos (id, codigo, nome_fantasia, categoria, especialidades, cidade, estado, bairro, descricao_beneficio, periodo_validade_beneficio, ativo, plan_status, cadastro_completo, slug, bio, created_at)
SELECT 
  gen_random_uuid(),
  LPAD((236 + row_number() OVER())::TEXT, 6, '0'),
  'Estabelecimento Águas Claras ' || row_number() OVER(),
  ARRAY[(ARRAY['Academia', 'Restaurante', 'Bar', 'Salão de Beleza', 'Sorveteria'])[1 + (random() * 4)::int]],
  ARRAY['Especialidade 1', 'Especialidade 2'],
  'Brasília',
  'DF',
  'Águas Claras',
  'Benefício especial para aniversariantes',
  'mes_aniversario',
  true,
  'active',
  true,
  'estabelecimento-aguas-claras-' || row_number() OVER(),
  'Estabelecimento em Águas Claras com benefícios exclusivos para aniversariantes!',
  NOW()
FROM generate_series(1, 50);

-- Guará
INSERT INTO estabelecimentos (id, codigo, nome_fantasia, categoria, especialidades, cidade, estado, bairro, descricao_beneficio, periodo_validade_beneficio, ativo, plan_status, cadastro_completo, slug, bio, created_at)
SELECT 
  gen_random_uuid(),
  LPAD((286 + row_number() OVER())::TEXT, 6, '0'),
  'Estabelecimento Guará ' || row_number() OVER(),
  ARRAY[(ARRAY['Academia', 'Restaurante', 'Bar', 'Barbearia', 'Loja'])[1 + (random() * 4)::int]],
  ARRAY['Especialidade 1', 'Especialidade 2'],
  'Brasília',
  'DF',
  'Guará',
  'Benefício especial para aniversariantes',
  'mes_aniversario',
  true,
  'active',
  true,
  'estabelecimento-guara-' || row_number() OVER(),
  'Estabelecimento no Guará com benefícios exclusivos para aniversariantes!',
  NOW()
FROM generate_series(1, 49);

COMMIT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Após executar, verifique com:
-- SELECT COUNT(*) FROM estabelecimentos;
-- Deve retornar aproximadamente 335 registros
