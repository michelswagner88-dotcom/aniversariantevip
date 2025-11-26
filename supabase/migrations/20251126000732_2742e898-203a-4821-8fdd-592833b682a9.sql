-- Recriar a view SEM security definer para permitir RLS correto
DROP VIEW IF EXISTS public.expansion_insights;

CREATE OR REPLACE VIEW public.expansion_insights 
WITH (security_invoker = true)
AS
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