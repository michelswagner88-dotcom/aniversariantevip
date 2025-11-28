-- Adicionar colunas de geolocalização na tabela estabelecimentos
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS endereco_formatado TEXT;

-- Criar índice para buscas geoespaciais
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_location ON estabelecimentos(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;