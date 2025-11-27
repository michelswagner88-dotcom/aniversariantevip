-- =====================================================
-- MIGRATION: Tornar campos de aniversariantes obrigatórios
-- Data: 2025-01-27
-- =====================================================

-- Atualizar registros existentes que tenham campos NULL
UPDATE aniversariantes 
SET 
  telefone = COALESCE(telefone, ''),
  cep = COALESCE(cep, ''),
  estado = COALESCE(estado, ''),
  cidade = COALESCE(cidade, ''),
  bairro = COALESCE(bairro, ''),
  logradouro = COALESCE(logradouro, '')
WHERE telefone IS NULL 
   OR cep IS NULL 
   OR estado IS NULL 
   OR cidade IS NULL 
   OR bairro IS NULL 
   OR logradouro IS NULL;

-- Tornar campos obrigatórios
ALTER TABLE aniversariantes 
  ALTER COLUMN telefone SET NOT NULL,
  ALTER COLUMN cep SET NOT NULL,
  ALTER COLUMN estado SET NOT NULL,
  ALTER COLUMN cidade SET NOT NULL,
  ALTER COLUMN bairro SET NOT NULL,
  ALTER COLUMN logradouro SET NOT NULL;