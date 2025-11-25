-- Adicionar coluna para rastrear data de liberação de fundos (hold de 30 dias)
ALTER TABLE referrals
ADD COLUMN hold_release_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Adicionar índice para queries de comissões por status e data de liberação
CREATE INDEX IF NOT EXISTS idx_referrals_status_release_date 
ON referrals(status, hold_release_date);

-- Adicionar comentários para documentação
COMMENT ON COLUMN referrals.hold_release_date IS 'Data em que os fundos da comissão serão liberados para saque (30 dias após o pagamento)';
COMMENT ON COLUMN referrals.status IS 'Status da comissão: pending (aguardando), held (em hold), paid (liberado para saque), failed (falha no processamento)';