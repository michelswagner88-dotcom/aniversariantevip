-- =====================================================
-- MIGRATION: Rate Limiting Infrastructure
-- Data: 2025-11-27
-- =====================================================

-- 1. Criar tabela rate_limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- 3. Criar função de verificação de rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_minutes INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_window_expired BOOLEAN;
BEGIN
  -- Buscar registro existente
  SELECT count, window_start INTO v_current_count, v_window_start
  FROM public.rate_limits
  WHERE key = p_key;

  -- Se não existe, criar novo registro
  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (key, count, window_start)
    VALUES (p_key, 1, now());
    
    RETURN QUERY SELECT true AS allowed, (p_limit - 1) AS remaining;
    RETURN;
  END IF;

  -- Verificar se a janela expirou
  v_window_expired := (now() - v_window_start) > (p_window_minutes || ' minutes')::INTERVAL;

  -- Se expirou, resetar contador
  IF v_window_expired THEN
    UPDATE public.rate_limits
    SET count = 1, window_start = now()
    WHERE key = p_key;
    
    RETURN QUERY SELECT true AS allowed, (p_limit - 1) AS remaining;
    RETURN;
  END IF;

  -- Se excedeu o limite
  IF v_current_count >= p_limit THEN
    RETURN QUERY SELECT false AS allowed, 0 AS remaining;
    RETURN;
  END IF;

  -- Incrementar contador
  UPDATE public.rate_limits
  SET count = count + 1
  WHERE key = p_key;

  RETURN QUERY SELECT true AS allowed, (p_limit - v_current_count - 1) AS remaining;
END;
$$;

-- 4. Dar permissões de execução
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;