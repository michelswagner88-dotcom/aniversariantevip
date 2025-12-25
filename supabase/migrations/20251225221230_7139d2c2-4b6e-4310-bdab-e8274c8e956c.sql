-- 1. Adicionar coluna tipo_beneficio
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS tipo_beneficio TEXT;

-- 2. Adicionar coluna fotos (JSONB para múltiplas fotos com tamanhos)
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS fotos JSONB DEFAULT '[]'::jsonb;

-- 3. Corrigir registros existentes com cadastro incompleto marcado incorretamente
UPDATE estabelecimentos 
SET cadastro_completo = true 
WHERE cadastro_completo = false 
  AND cnpj IS NOT NULL 
  AND (nome_fantasia IS NOT NULL OR razao_social IS NOT NULL);