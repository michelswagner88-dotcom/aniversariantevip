-- ============================================
-- ANIVERSARIANTE VIP - SEGURANÇA E AUDITORIA
-- ============================================

-- 1. ADICIONAR SOFT DELETE (deleted_at) às tabelas principais
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.aniversariantes 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.estabelecimentos 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.cupons 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. CRIAR TRIGGERS DE UPDATED_AT (se não existirem)
-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para aniversariantes
DROP TRIGGER IF EXISTS update_aniversariantes_updated_at ON public.aniversariantes;
CREATE TRIGGER update_aniversariantes_updated_at
  BEFORE UPDATE ON public.aniversariantes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para estabelecimentos
DROP TRIGGER IF EXISTS update_estabelecimentos_updated_at ON public.estabelecimentos;
CREATE TRIGGER update_estabelecimentos_updated_at
  BEFORE UPDATE ON public.estabelecimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. CRIAR TRIGGER DE AUTO-CRIAÇÃO DE PROFILE (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. ADICIONAR ÍNDICES PARA PERFORMANCE E SEGURANÇA
-- Índice para soft delete em profiles
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at 
  ON public.profiles(deleted_at) 
  WHERE deleted_at IS NULL;

-- Índice para soft delete em estabelecimentos
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_deleted_at 
  ON public.estabelecimentos(deleted_at) 
  WHERE deleted_at IS NULL;

-- Índice para cupons ativos
CREATE INDEX IF NOT EXISTS idx_cupons_active 
  ON public.cupons(aniversariante_id, estabelecimento_id, created_at) 
  WHERE usado = false AND deleted_at IS NULL;

-- 5. ADICIONAR CONSTRAINT DE PREVENÇÃO DE FRAUDE
-- Impedir múltiplos cupons ativos do mesmo usuário para o mesmo estabelecimento
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_coupon 
  ON public.cupons(aniversariante_id, estabelecimento_id) 
  WHERE usado = false AND deleted_at IS NULL;

-- 6. MELHORAR RLS POLICIES COM SOFT DELETE
-- Atualizar policy de leitura pública de estabelecimentos
DROP POLICY IF EXISTS "Todos podem ver estabelecimentos publicamente" ON public.estabelecimentos;
CREATE POLICY "Todos podem ver estabelecimentos publicamente"
  ON public.estabelecimentos
  FOR SELECT
  USING (deleted_at IS NULL);

-- Atualizar policy de leitura de profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  USING (deleted_at IS NULL);

-- 7. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON COLUMN public.profiles.deleted_at IS 'Soft delete timestamp - NULL means active record';
COMMENT ON COLUMN public.aniversariantes.deleted_at IS 'Soft delete timestamp - NULL means active record';
COMMENT ON COLUMN public.estabelecimentos.deleted_at IS 'Soft delete timestamp - NULL means active record';
COMMENT ON COLUMN public.cupons.deleted_at IS 'Soft delete timestamp - NULL means active record';

COMMENT ON INDEX idx_unique_active_coupon IS 'Prevents fraud: one active coupon per user per establishment';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Auto-updates updated_at timestamp on row modification';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates profile when new user signs up';