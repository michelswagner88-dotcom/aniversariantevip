-- ============================================
-- OTIMIZAÇÕES DE ESCALABILIDADE
-- ============================================

-- 1. Índice composto cidade + ativo (busca mais comum)
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cidade_ativo 
ON estabelecimentos(cidade, ativo) 
WHERE ativo = true AND deleted_at IS NULL;

-- 2. Índice para busca textual em nome_fantasia
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_nome_search 
ON estabelecimentos USING GIN(
  to_tsvector('portuguese', COALESCE(nome_fantasia, ''))
);

-- 3. Índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_created_desc 
ON estabelecimentos(created_at DESC) 
WHERE ativo = true AND deleted_at IS NULL;

-- ============================================
-- VIEWS MATERIALIZADAS
-- ============================================

-- 4. View de estabelecimentos populares com contagem de favoritos
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_estabelecimentos_populares AS
SELECT 
    e.id,
    e.nome_fantasia,
    e.slug,
    e.categoria,
    e.especialidades,
    e.cidade,
    e.estado,
    e.bairro,
    e.latitude,
    e.longitude,
    e.descricao_beneficio,
    e.logo_url,
    e.created_at,
    COUNT(f.id) AS total_favoritos
FROM estabelecimentos e
LEFT JOIN favoritos f ON f.estabelecimento_id = e.id
WHERE e.ativo = true AND e.deleted_at IS NULL
GROUP BY e.id;

-- Índices na view materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_estab_pop_id 
ON mv_estabelecimentos_populares(id);

CREATE INDEX IF NOT EXISTS idx_mv_estab_pop_cidade 
ON mv_estabelecimentos_populares(cidade);

CREATE INDEX IF NOT EXISTS idx_mv_estab_pop_favoritos 
ON mv_estabelecimentos_populares(total_favoritos DESC);

-- 5. View de contagem por cidade
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_contagem_cidades AS
SELECT 
    cidade,
    estado,
    COUNT(*) AS total_estabelecimentos,
    COUNT(*) FILTER (WHERE 'Restaurante' = ANY(categoria)) AS restaurantes,
    COUNT(*) FILTER (WHERE 'Bar' = ANY(categoria)) AS bares,
    COUNT(*) FILTER (WHERE 'Salão de Beleza' = ANY(categoria)) AS saloes,
    COUNT(*) FILTER (WHERE 'Academia' = ANY(categoria)) AS academias
FROM estabelecimentos
WHERE ativo = true AND deleted_at IS NULL
GROUP BY cidade, estado;

-- Índice na view de cidades
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_contagem_cidade_estado 
ON mv_contagem_cidades(cidade, estado);

CREATE INDEX IF NOT EXISTS idx_mv_contagem_total 
ON mv_contagem_cidades(total_estabelecimentos DESC);

-- ============================================
-- FUNÇÃO PARA REFRESH DAS VIEWS
-- ============================================

-- 6. Função para atualizar views materializadas
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_estabelecimentos_populares;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_contagem_cidades;
END;
$$;

-- 7. Função para limpar rate_limits antigos
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;