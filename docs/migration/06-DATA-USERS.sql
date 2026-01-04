-- ==============================================================================
-- FASE 6: MIGRAR DADOS - PROFILES, USER_ROLES, ADMINS, ANIVERSARIANTES
-- Execute este script APÓS a migração de especialidades
-- ATENÇÃO: Estes dados dependem de usuários existentes em auth.users!
-- ==============================================================================

-- ==============================================================================
-- IMPORTANTE: ANTES DE EXECUTAR ESTE SCRIPT
-- Os usuários PRECISAM existir na tabela auth.users do projeto PRO
-- Opções:
-- 1. Usuários fazem novo cadastro no sistema
-- 2. Migrar via Supabase Admin API (se tiver acesso ao projeto Cloud)
-- 3. Contatar suporte Lovable para exportar auth.users
-- ==============================================================================

-- ==============================================================================
-- PROFILES (12 registros)
-- EXECUTE SOMENTE APÓS os usuários estarem criados em auth.users
-- ==============================================================================

INSERT INTO profiles (id, email, nome, stripe_account_id, stripe_onboarding_completed, created_at, updated_at) VALUES
('b59d37ad-6e1a-4ca6-91e9-fb1ffdf3aaf9', 'teste@auditoria.com', 'Teste Auditoria', NULL, false, '2025-11-27 15:05:24.544725+00', '2025-11-27 15:05:24.544725+00'),
('46cc5de7-3b1a-4c23-b508-fd7d0c3d205e', 'rha_michels@hotmail.com', 'Rhaiza Michels', NULL, false, '2025-11-27 20:46:34.763742+00', '2025-11-27 23:16:23.072549+00'),
('403fbe3b-2026-42cf-90f5-a0843bfba9ba', 'michaelclasensarda@gmail.com', 'Vânia clasen', NULL, false, '2025-11-27 20:24:28.608455+00', '2025-11-28 01:21:13.100607+00'),
('f04ceb1c-04b1-49e9-91a7-3d82d2251f5b', 'rogeriomichels7@gmail.com', 'Rogério michels', NULL, false, '2025-11-27 20:47:05.938531+00', '2025-11-28 01:46:18.196675+00'),
('2b45a0de-9b8c-49c5-af8d-a85ebb4aed5f', 'vaniaclasen@hotmail.com', 'Vania Clasen Michels', NULL, false, '2025-11-28 01:38:47.877689+00', '2025-11-28 01:48:35.012934+00'),
('52e6b5f5-8b65-4f57-b24a-6e7ae77a9629', 'michelswagner88@gmail.com', 'wagner michels', NULL, false, '2025-11-28 22:25:02.167006+00', '2025-11-28 22:36:33.603564+00'),
('6638c785-62d8-44a3-a392-d66d6bab1cd6', 'vendasonlabs@gmail.com', '', NULL, false, '2025-11-29 01:14:54.233884+00', '2025-11-29 01:14:54.233884+00'),
('4b363281-a702-422d-b72e-09353668f5ad', 'rogeriomichels.imoveis@gmail.com', '', NULL, false, '2025-11-29 01:28:07.161008+00', '2025-11-29 01:28:07.161008+00'),
('b5b0bbfc-3e6b-44f7-95bc-691215ce7e2d', 'robertinhoferreirinha777@gmail.com', '', NULL, false, '2025-11-29 01:51:56.420796+00', '2025-11-29 01:51:56.420796+00'),
('0d901944-d6e9-4ece-8d1c-aadf85c15901', 'wagnermichels@hotmail.com', 'wagner michels', NULL, false, '2025-11-29 02:03:18.230441+00', '2025-11-29 02:03:18.230441+00'),
('d683b64b-42bd-4a92-b47b-19b6ffcb421a', 'vaniaclasen10@gmail.com', '', NULL, false, '2025-11-30 06:41:28.008684+00', '2025-11-30 06:41:28.008684+00'),
('f45bf917-63a5-4ab2-843d-e367e707c10f', 'clasenmichael80@gmail.com', '', NULL, false, '2025-12-25 21:31:30.288007+00', '2025-12-25 21:31:30.288007+00')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nome = EXCLUDED.nome,
  updated_at = NOW();

-- ==============================================================================
-- USER_ROLES (5 registros)
-- ==============================================================================

INSERT INTO user_roles (id, user_id, role, created_at) VALUES
('e44ecb9c-7e91-40f9-9721-d8f2fd068de2', '403fbe3b-2026-42cf-90f5-a0843bfba9ba', 'aniversariante', '2025-11-27 20:24:29.421088+00'),
('76238a77-e1dc-456b-ac70-6cedb94f4fbf', 'f04ceb1c-04b1-49e9-91a7-3d82d2251f5b', 'aniversariante', '2025-11-27 20:47:07.024876+00'),
('a0a55438-bbe8-4a09-9b1a-a833a8f5bf78', '52e6b5f5-8b65-4f57-b24a-6e7ae77a9629', 'aniversariante', '2025-11-28 22:25:02.708486+00'),
('4f7fd723-2eee-474e-8777-0135ea92fb3d', '0d901944-d6e9-4ece-8d1c-aadf85c15901', 'admin', '2025-11-29 02:03:18.71356+00'),
('3dc2b177-50b7-4341-aaa0-4521bc4ecbd6', 'f45bf917-63a5-4ab2-843d-e367e707c10f', 'estabelecimento', '2025-12-25 21:31:31.123329+00')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ADMINS (1 registro)
-- ==============================================================================

INSERT INTO admins (id, user_id, email, nome, nivel, ativo, ultimo_acesso, created_at, updated_at) VALUES
('c8593e1a-ca48-4db9-b153-6e962a086c59', '0d901944-d6e9-4ece-8d1c-aadf85c15901', 'wagnermichels@hotmail.com', 'wagner michels', 'super_admin', true, '2026-01-02 21:58:27.642573+00', '2025-11-30 23:09:19.812164+00', '2026-01-02 21:58:27.642573+00')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nome = EXCLUDED.nome,
  nivel = EXCLUDED.nivel,
  ativo = EXCLUDED.ativo,
  ultimo_acesso = EXCLUDED.ultimo_acesso,
  updated_at = NOW();

-- ==============================================================================
-- ANIVERSARIANTES (3 registros)
-- ==============================================================================

INSERT INTO aniversariantes (id, cpf, data_nascimento, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, cadastro_completo, created_at, updated_at) VALUES
('403fbe3b-2026-42cf-90f5-a0843bfba9ba', '71630368920', '1969-06-16', '48999344065', '88025350', 'Rua Almirante Carlos da Silveira Carneiro', '', NULL, 'Agronômica', 'Florianópolis', 'SC', NULL, NULL, true, '2025-11-28 01:21:13.417049+00', '2025-11-30 20:53:28.841605+00'),
('f04ceb1c-04b1-49e9-91a7-3d82d2251f5b', '45555460910', '1964-10-02', '48991638000', '88025350', 'Rua Almirante Carlos da Silveira Carneiro', '', NULL, 'Agronômica', 'Florianópolis', 'SC', NULL, NULL, true, '2025-11-28 01:46:18.498382+00', '2025-11-30 20:53:28.841605+00'),
('52e6b5f5-8b65-4f57-b24a-6e7ae77a9629', '06010280907', '1988-12-28', '48996243161', '88025350', 'Rua Almirante Carlos da Silveira Carneiro', '', NULL, 'Agronômica', 'Florianópolis', 'SC', -27.5783071, -48.5371786, true, '2025-11-28 22:36:33.849618+00', '2025-11-30 20:53:28.841605+00')
ON CONFLICT (id) DO UPDATE SET
  cpf = EXCLUDED.cpf,
  data_nascimento = EXCLUDED.data_nascimento,
  telefone = EXCLUDED.telefone,
  bairro = EXCLUDED.bairro,
  cidade = EXCLUDED.cidade,
  estado = EXCLUDED.estado,
  updated_at = NOW();

COMMIT;
