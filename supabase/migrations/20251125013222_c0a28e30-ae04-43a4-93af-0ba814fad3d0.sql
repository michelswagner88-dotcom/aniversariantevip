-- Adicionar campos de afiliação na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false;

-- Adicionar campo de referência na tabela estabelecimentos
ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES profiles(id);
ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'pending';

-- Criar tabela de referrals para rastreamento de comissões
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  stripe_transfer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies para referrals
CREATE POLICY "Users can view their own referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "System can manage referrals"
ON referrals FOR ALL
USING (true)
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_establishment ON referrals(establishment_id);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_referred_by ON estabelecimentos(referred_by_user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER referrals_updated_at
BEFORE UPDATE ON referrals
FOR EACH ROW
EXECUTE FUNCTION update_referrals_updated_at();

-- View para estatísticas de afiliados
CREATE OR REPLACE VIEW affiliate_stats AS
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

-- Grant access
GRANT SELECT ON affiliate_stats TO authenticated;