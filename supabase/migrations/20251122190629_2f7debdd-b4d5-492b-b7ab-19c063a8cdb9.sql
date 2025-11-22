-- Adicionar novos campos na tabela estabelecimentos
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS link_cardapio TEXT,
ADD COLUMN IF NOT EXISTS periodo_validade_beneficio TEXT DEFAULT 'dia_aniversario',
ADD COLUMN IF NOT EXISTS regras_utilizacao TEXT;

-- Converter categoria de TEXT para TEXT[] (array)
ALTER TABLE estabelecimentos 
ALTER COLUMN categoria TYPE TEXT[] USING ARRAY[categoria]::TEXT[];

-- Criar índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_categoria ON estabelecimentos USING GIN(categoria);

-- Comentários para documentação
COMMENT ON COLUMN estabelecimentos.link_cardapio IS 'Link para o cardápio digital do estabelecimento';
COMMENT ON COLUMN estabelecimentos.periodo_validade_beneficio IS 'Quando o benefício é válido: dia_aniversario, semana_aniversario, mes_aniversario';
COMMENT ON COLUMN estabelecimentos.regras_utilizacao IS 'Regras detalhadas de utilização do benefício';
COMMENT ON COLUMN estabelecimentos.categoria IS 'Array de categorias do estabelecimento (pode ter múltiplas)';