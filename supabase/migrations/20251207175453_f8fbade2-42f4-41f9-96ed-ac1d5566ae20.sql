-- Adicionar campo pra controlar se já buscou foto
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS foto_buscada BOOLEAN DEFAULT false;

-- Adicionar campo pra Google Place ID (pra não buscar de novo)
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Index pra busca rápida de estabelecimentos pendentes
CREATE INDEX IF NOT EXISTS idx_foto_buscada 
ON estabelecimentos(foto_buscada) 
WHERE foto_buscada = false;

-- Marcar estabelecimentos que JÁ têm foto como foto_buscada = true
UPDATE estabelecimentos 
SET foto_buscada = true 
WHERE logo_url IS NOT NULL AND logo_url != '';