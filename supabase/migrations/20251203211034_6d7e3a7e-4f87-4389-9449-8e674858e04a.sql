-- ============================================
-- MIGRAR CATEGORIAS PARA NOVO SISTEMA
-- ============================================
-- "Loja de Presentes" e "Moda e Acessórios" → "Loja"
-- "Outros Comércios" → "Outros"

-- Migrar "Loja de Presentes" → "Loja"
UPDATE estabelecimentos 
SET categoria = ARRAY(
  SELECT DISTINCT CASE 
    WHEN elem = 'Loja de Presentes' THEN 'Loja' 
    ELSE elem 
  END
  FROM unnest(categoria) AS elem
)
WHERE 'Loja de Presentes' = ANY(categoria);

-- Migrar "Moda e Acessórios" → "Loja"
UPDATE estabelecimentos 
SET categoria = ARRAY(
  SELECT DISTINCT CASE 
    WHEN elem = 'Moda e Acessórios' THEN 'Loja' 
    ELSE elem 
  END
  FROM unnest(categoria) AS elem
)
WHERE 'Moda e Acessórios' = ANY(categoria);

-- Migrar "Outros Comércios" → "Outros"
UPDATE estabelecimentos 
SET categoria = ARRAY(
  SELECT DISTINCT CASE 
    WHEN elem = 'Outros Comércios' THEN 'Outros' 
    ELSE elem 
  END
  FROM unnest(categoria) AS elem
)
WHERE 'Outros Comércios' = ANY(categoria);

-- Remover duplicatas de categoria no array (caso "Loja" apareça duas vezes)
UPDATE estabelecimentos
SET categoria = ARRAY(SELECT DISTINCT unnest(categoria))
WHERE array_length(categoria, 1) > 1;