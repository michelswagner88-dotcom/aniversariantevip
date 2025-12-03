-- ============================================
-- CORREÇÃO DE SEGURANÇA: Remover views materializadas da API
-- ============================================

-- Revogar acesso público às views materializadas
-- Elas serão usadas apenas internamente via funções RPC

REVOKE ALL ON mv_estabelecimentos_populares FROM anon, authenticated;
REVOKE ALL ON mv_contagem_cidades FROM anon, authenticated;

-- Criar funções RPC seguras para acessar os dados das views

-- Função para buscar estabelecimentos populares
CREATE OR REPLACE FUNCTION get_estabelecimentos_populares(
  p_cidade TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  nome_fantasia TEXT,
  slug TEXT,
  categoria TEXT[],
  especialidades TEXT[],
  cidade TEXT,
  estado TEXT,
  bairro TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  descricao_beneficio TEXT,
  logo_url TEXT,
  total_favoritos BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mv.id,
    mv.nome_fantasia,
    mv.slug,
    mv.categoria,
    mv.especialidades,
    mv.cidade,
    mv.estado,
    mv.bairro,
    mv.latitude,
    mv.longitude,
    mv.descricao_beneficio,
    mv.logo_url,
    mv.total_favoritos
  FROM mv_estabelecimentos_populares mv
  WHERE (p_cidade IS NULL OR mv.cidade = p_cidade)
  ORDER BY mv.total_favoritos DESC
  LIMIT p_limit;
END;
$$;

-- Função para buscar contagem por cidade
CREATE OR REPLACE FUNCTION get_contagem_cidades()
RETURNS TABLE (
  cidade TEXT,
  estado TEXT,
  total_estabelecimentos BIGINT,
  restaurantes BIGINT,
  bares BIGINT,
  saloes BIGINT,
  academias BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mv.cidade,
    mv.estado,
    mv.total_estabelecimentos,
    mv.restaurantes,
    mv.bares,
    mv.saloes,
    mv.academias
  FROM mv_contagem_cidades mv
  ORDER BY mv.total_estabelecimentos DESC;
END;
$$;