-- Adicionar campos de geolocalização para aniversariantes
ALTER TABLE aniversariantes 
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Criar índice para busca geoespacial eficiente
CREATE INDEX IF NOT EXISTS idx_aniversariantes_location 
ON aniversariantes(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;