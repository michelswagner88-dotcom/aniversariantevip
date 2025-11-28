-- Adicionar coluna para galeria de fotos (array de URLs)
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS galeria_fotos TEXT[] DEFAULT '{}';

COMMENT ON COLUMN estabelecimentos.galeria_fotos IS 'Array com URLs das fotos adicionais do estabelecimento (máximo 4 fotos, pois logo_url é a principal)';