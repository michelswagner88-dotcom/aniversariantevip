-- Adicionar campo stripe_customer_id na tabela estabelecimentos
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_stripe_customer_id 
ON estabelecimentos(stripe_customer_id);

-- Comentários
COMMENT ON COLUMN estabelecimentos.stripe_customer_id IS 'ID do customer no Stripe para processar pagamentos e comissões';