-- ===================================================================
-- FASE 2: CORREÇÃO DE VULNERABILIDADES DE SEGURANÇA
-- ===================================================================

-- 1. REMOVER POLÍTICA PERMISSIVA EM PROFILES
-- Problema: Qualquer usuário autenticado podia ver todos os perfis
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 2. CONVERTER VIEWS PARA SECURITY INVOKER (PostgreSQL 15+)
-- Isso faz as views respeitarem as permissões do usuário que as chama
ALTER VIEW public.public_estabelecimentos SET (security_invoker = on);
ALTER VIEW public.expansion_insights SET (security_invoker = on);

-- 3. RECRIAR affiliate_stats COM SEGURANÇA APRIMORADA
DROP VIEW IF EXISTS public.affiliate_stats;

CREATE VIEW public.affiliate_stats 
WITH (security_invoker = on)
AS
SELECT 
  p.id AS user_id,
  -- Remover exposição de dados sensíveis (email, stripe_account_id)
  count(DISTINCT e.id) AS total_establishments,
  count(DISTINCT CASE WHEN e.plan_status = 'active' THEN e.id END) AS active_establishments,
  COALESCE(sum(CASE WHEN r.status = 'paid' THEN r.commission_amount ELSE 0 END), 0) AS total_earned,
  COALESCE(sum(CASE WHEN r.status = 'pending' THEN r.commission_amount ELSE 0 END), 0) AS pending_commission
FROM public.profiles p
LEFT JOIN public.estabelecimentos e ON e.referred_by_user_id = p.id
LEFT JOIN public.referrals r ON r.referrer_id = p.id
WHERE p.id = auth.uid()  -- CRÍTICO: Só retorna dados do próprio usuário
GROUP BY p.id;

-- 4. ADICIONAR POLÍTICA DELETE DEFENSIVA EM CUPONS
-- Estabelecimentos podem deletar seus próprios cupons
CREATE POLICY "Establishments can delete their coupons"
ON public.cupons FOR DELETE
USING (auth.uid() = estabelecimento_id);

-- 5. GARANTIR QUE search_analytics TEM POLICY PARA ADMIN
-- (expansion_insights já herda RLS da tabela base)
-- A policy "Admins podem ver analytics de busca" já existe