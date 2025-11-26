-- Tabela para analytics de busca de cidades
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term TEXT NOT NULL,
  user_lat NUMERIC,
  user_lng NUMERIC,
  results_found INTEGER NOT NULL DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  user_agent TEXT,
  nearest_available_city TEXT,
  nearest_distance_km NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_search_term ON public.search_analytics(search_term);
CREATE INDEX IF NOT EXISTS idx_search_analytics_searched_at ON public.search_analytics(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_results_found ON public.search_analytics(results_found);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON public.search_analytics(user_id);

-- View para insights de expansão geográfica
CREATE OR REPLACE VIEW public.expansion_insights AS
SELECT 
  search_term,
  COUNT(*) as total_searches,
  SUM(CASE WHEN results_found = 0 THEN 1 ELSE 0 END) as zero_results_count,
  AVG(CASE WHEN user_lat IS NOT NULL THEN user_lat END) as avg_latitude,
  AVG(CASE WHEN user_lng IS NOT NULL THEN user_lng END) as avg_longitude,
  MODE() WITHIN GROUP (ORDER BY nearest_available_city) as most_common_nearest_city,
  AVG(nearest_distance_km) as avg_distance_to_nearest,
  MAX(searched_at) as last_searched_at,
  COUNT(DISTINCT user_id) as unique_users
FROM public.search_analytics
WHERE searched_at > NOW() - INTERVAL '30 days'
GROUP BY search_term
HAVING COUNT(*) >= 2  -- Mínimo 2 buscas para aparecer nos insights
ORDER BY zero_results_count DESC, total_searches DESC;

-- RLS Policies
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir analytics (sistema)
CREATE POLICY "Sistema pode inserir analytics de busca"
  ON public.search_analytics
  FOR INSERT
  WITH CHECK (true);

-- Apenas admins podem visualizar analytics
CREATE POLICY "Admins podem ver analytics de busca"
  ON public.search_analytics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Comentários para documentação
COMMENT ON TABLE public.search_analytics IS 'Armazena analytics de buscas de cidades para insights de expansão geográfica';
COMMENT ON COLUMN public.search_analytics.search_term IS 'Termo de busca da cidade';
COMMENT ON COLUMN public.search_analytics.results_found IS 'Quantidade de resultados encontrados (0 = sem resultados)';
COMMENT ON COLUMN public.search_analytics.nearest_available_city IS 'Cidade mais próxima com estabelecimentos disponíveis';
COMMENT ON COLUMN public.search_analytics.nearest_distance_km IS 'Distância em km até a cidade mais próxima com estabelecimentos';