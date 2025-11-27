-- =====================================================
-- MIGRATION: Habilitar RLS na tabela rate_limits
-- Data: 2025-11-27
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Política: Apenas a função check_rate_limit pode gerenciar rate limits
-- Usuários normais não devem acessar diretamente
CREATE POLICY "Sistema pode gerenciar rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);