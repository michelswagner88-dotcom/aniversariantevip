-- EMERGÊNCIA: Parar gasto de R$100/dia no Google Places API
-- 1. Criar coluna de backup para guardar as URLs originais
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS logo_url_backup TEXT;

-- 2. Criar colunas de controle para migração futura
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS foto_migrada BOOLEAN DEFAULT false;

ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS foto_migrada_em TIMESTAMPTZ;

-- 3. Salvar backup e ZERAR as URLs do Google (para o gasto imediatamente)
UPDATE estabelecimentos 
SET 
  logo_url_backup = logo_url,
  logo_url = NULL
WHERE logo_url LIKE '%googleapis.com%';