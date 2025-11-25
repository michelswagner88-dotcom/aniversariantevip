-- Recriar a view affiliate_stats SEM security definer
DROP VIEW IF EXISTS affiliate_stats;

CREATE VIEW affiliate_stats AS
SELECT 
  p.id as user_id,
  p.email,
  p.stripe_account_id,
  COUNT(DISTINCT e.id) as total_establishments,
  COUNT(DISTINCT CASE WHEN e.plan_status = 'active' THEN e.id END) as active_establishments,
  COALESCE(SUM(CASE WHEN r.status = 'paid' THEN r.commission_amount ELSE 0 END), 0) as total_earned,
  COALESCE(SUM(CASE WHEN r.status = 'pending' THEN r.commission_amount ELSE 0 END), 0) as pending_commission
FROM profiles p
LEFT JOIN estabelecimentos e ON e.referred_by_user_id = p.id
LEFT JOIN referrals r ON r.referrer_id = p.id
GROUP BY p.id, p.email, p.stripe_account_id;

COMMENT ON VIEW affiliate_stats IS 'Estatísticas de afiliados sem SECURITY DEFINER para melhor segurança';

-- Adicionar RLS policy para a view
ALTER VIEW affiliate_stats SET (security_invoker = true);