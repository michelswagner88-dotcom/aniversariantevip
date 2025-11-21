-- Adicionar colunas cidade e estado à tabela estabelecimentos

ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS categoria TEXT;

-- Atualizar estabelecimentos existentes com valores padrão
UPDATE estabelecimentos 
SET 
  cidade = 'Florianópolis',
  estado = 'SC',
  categoria = 'restaurante'
WHERE cidade IS NULL OR estado IS NULL;

-- Criar índices para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cidade ON estabelecimentos(cidade);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_estado ON estabelecimentos(estado);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_categoria ON estabelecimentos(categoria);