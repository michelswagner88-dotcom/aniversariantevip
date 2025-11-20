-- ============================================
-- Fix 1: Migrate favoritos table to UUID types
-- ============================================

-- Add new UUID columns
ALTER TABLE favoritos ADD COLUMN usuario_id_new uuid;
ALTER TABLE favoritos ADD COLUMN estabelecimento_id_new uuid;

-- Migrate existing data (cast text to uuid)
UPDATE favoritos SET 
  usuario_id_new = usuario_id::uuid,
  estabelecimento_id_new = estabelecimento_id::uuid
WHERE usuario_id IS NOT NULL AND estabelecimento_id IS NOT NULL;

-- Drop old policies
DROP POLICY IF EXISTS "Usuários podem adicionar favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuários podem remover seus favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios favoritos" ON favoritos;

-- Drop old text columns
ALTER TABLE favoritos DROP COLUMN usuario_id;
ALTER TABLE favoritos DROP COLUMN estabelecimento_id;

-- Rename new columns
ALTER TABLE favoritos RENAME COLUMN usuario_id_new TO usuario_id;
ALTER TABLE favoritos RENAME COLUMN estabelecimento_id_new TO estabelecimento_id;

-- Set NOT NULL constraint
ALTER TABLE favoritos ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE favoritos ALTER COLUMN estabelecimento_id SET NOT NULL;

-- Add foreign key constraints for referential integrity
ALTER TABLE favoritos 
  ADD CONSTRAINT favoritos_estabelecimento_fkey 
  FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- Create new simplified RLS policies with UUID types
CREATE POLICY "Users can view own favorites"
ON favoritos FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can add favorites"
ON favoritos FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can remove own favorites"
ON favoritos FOR DELETE
USING (auth.uid() = usuario_id);

-- ============================================
-- Fix 2: Add database constraints for input validation
-- ============================================

-- CPF format validation (must be exactly 11 digits)
ALTER TABLE aniversariantes 
  ADD CONSTRAINT cpf_format CHECK (cpf ~ '^\d{11}$');

-- Phone number length validation (10-15 characters)
ALTER TABLE aniversariantes
  ADD CONSTRAINT telefone_length CHECK (length(telefone) BETWEEN 10 AND 15);

-- CNPJ format validation (must be exactly 14 digits)
ALTER TABLE estabelecimentos 
  ADD CONSTRAINT cnpj_format CHECK (cnpj ~ '^\d{14}$' OR cnpj = '');

-- Establishment phone validation
ALTER TABLE estabelecimentos
  ADD CONSTRAINT estabelecimento_telefone_length CHECK (telefone IS NULL OR length(telefone) BETWEEN 10 AND 15);