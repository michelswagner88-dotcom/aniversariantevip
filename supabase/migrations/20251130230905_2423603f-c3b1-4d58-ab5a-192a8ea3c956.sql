-- ============================================
-- TABELA ADMINS - ANIVERSARIANTE VIP
-- ============================================

-- 1. CRIAR TABELA DE ADMINS
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  nome TEXT,
  nivel TEXT DEFAULT 'admin' CHECK (nivel IN ('viewer', 'admin', 'super_admin')),
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMPTZ,
  criado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_ativo ON admins(ativo);

-- 3. TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_admins_updated_at ON admins;
CREATE TRIGGER trigger_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admins_updated_at();

-- 4. HABILITAR RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE SEGURANÇA

-- Apenas super_admins podem ver todos os admins
CREATE POLICY "Super admins podem ver todos os admins"
ON admins FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_id = auth.uid() 
    AND a.nivel = 'super_admin' 
    AND a.ativo = true
  )
  OR user_id = auth.uid()
);

-- Apenas super_admins podem inserir novos admins
CREATE POLICY "Super admins podem criar admins"
ON admins FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_id = auth.uid() 
    AND a.nivel = 'super_admin' 
    AND a.ativo = true
  )
);

-- Apenas super_admins podem atualizar admins
CREATE POLICY "Super admins podem atualizar admins"
ON admins FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_id = auth.uid() 
    AND a.nivel = 'super_admin' 
    AND a.ativo = true
  )
);

-- Apenas super_admins podem deletar admins
CREATE POLICY "Super admins podem deletar admins"
ON admins FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_id = auth.uid() 
    AND a.nivel = 'super_admin' 
    AND a.ativo = true
  )
);

-- 6. FUNÇÃO PARA VERIFICAR SE É ADMIN ATIVO
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = check_user_id 
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. FUNÇÃO PARA VERIFICAR NÍVEL DO ADMIN
CREATE OR REPLACE FUNCTION get_admin_level(check_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  admin_nivel TEXT;
BEGIN
  SELECT nivel INTO admin_nivel 
  FROM admins 
  WHERE user_id = check_user_id 
  AND ativo = true;
  
  RETURN admin_nivel;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. FUNÇÃO PARA REGISTRAR ÚLTIMO ACESSO
CREATE OR REPLACE FUNCTION update_admin_last_access(admin_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE admins 
  SET ultimo_acesso = NOW() 
  WHERE user_id = admin_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;