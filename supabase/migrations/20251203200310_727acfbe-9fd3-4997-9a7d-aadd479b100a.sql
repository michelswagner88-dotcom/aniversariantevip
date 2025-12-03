-- ============================================
-- REMOVER FK QUE IMPEDE IMPORTS ADMIN
-- ============================================
-- A coluna tem_conta_acesso já controla se estabelecimento tem conta
-- RLS policies já protegem os dados
-- Esta FK é redundante e impede operações administrativas legítimas

ALTER TABLE estabelecimentos 
DROP CONSTRAINT IF EXISTS fk_estabelecimentos_user;

-- Também remover caso tenha outro nome
ALTER TABLE estabelecimentos 
DROP CONSTRAINT IF EXISTS estabelecimentos_id_fkey;