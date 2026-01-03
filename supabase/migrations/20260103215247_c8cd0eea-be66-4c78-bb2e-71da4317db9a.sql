
-- ============================================
-- CONFIGURAÇÃO COMPLETA SUPABASE PRO
-- Aniversariante VIP - Produção (CORRIGIDO)
-- ============================================

-- 1. ÍNDICES FALTANTES PARA PERFORMANCE (Foreign keys)
CREATE INDEX IF NOT EXISTS idx_analytics_user_id 
ON public.analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_flash_promos_estabelecimento 
ON public.flash_promos(estabelecimento_id);

CREATE INDEX IF NOT EXISTS idx_navigation_logs_user_id 
ON public.navigation_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_agenda_events_post_id 
ON public.agenda_events(post_id);

CREATE INDEX IF NOT EXISTS idx_admins_criado_por 
ON public.admins(criado_por);

-- 2. ÍNDICES COMPOSTOS PARA QUERIES FREQUENTES

-- Estabelecimentos ativos por cidade (listagem principal)
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cidade_ativo 
ON public.estabelecimentos(cidade, estado, ativo) 
WHERE deleted_at IS NULL AND ativo = true;

-- Cupons válidos por aniversariante
CREATE INDEX IF NOT EXISTS idx_cupons_aniversariante_valido 
ON public.cupons(aniversariante_id, data_validade) 
WHERE usado = false AND deleted_at IS NULL;

-- Stories por estabelecimento (sem filtro de NOW - será feito na query)
CREATE INDEX IF NOT EXISTS idx_stories_establishment 
ON public.stories(establishment_id, expires_at DESC);

-- Posts por estabelecimento (feed)
CREATE INDEX IF NOT EXISTS idx_posts_establishment_date 
ON public.posts(establishment_id, created_at DESC);

-- Flash promos por cidade/estado
CREATE INDEX IF NOT EXISTS idx_flash_promos_location 
ON public.flash_promos(cidade, estado, status, expires_at);

-- Aniversariantes por cidade
CREATE INDEX IF NOT EXISTS idx_aniversariantes_cidade_estado 
ON public.aniversariantes(cidade, estado);

-- 3. FUNÇÃO AUXILIAR PARA VERIFICAR SE É OWNER DE ESTABELECIMENTO
CREATE OR REPLACE FUNCTION public.is_establishment_owner(establishment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = establishment_id
$$;

-- 4. FUNÇÃO PARA VERIFICAR SE É COLABORADOR
CREATE OR REPLACE FUNCTION public.is_colaborador(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'colaborador'
  );
END;
$$;

-- 5. FUNÇÃO PARA VERIFICAR SE É ANIVERSARIANTE
CREATE OR REPLACE FUNCTION public.is_aniversariante(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'aniversariante'
  );
END;
$$;

-- 6. FUNÇÃO PARA VERIFICAR SE É ESTABELECIMENTO
CREATE OR REPLACE FUNCTION public.is_estabelecimento(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'estabelecimento'
  );
END;
$$;

-- 7. FUNÇÃO PARA LIMPAR RATE LIMITS ANTIGOS
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$;

-- 8. TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Garantir triggers de updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.estabelecimentos;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.estabelecimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.aniversariantes;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.aniversariantes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.posts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.referrals;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- 9. CONSTRAINT DE VALIDAÇÃO PARA EMAILS
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_email_format;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 10. CONSTRAINT PARA CPF VÁLIDO (11 dígitos)
ALTER TABLE public.aniversariantes
DROP CONSTRAINT IF EXISTS aniversariantes_cpf_format;

ALTER TABLE public.aniversariantes
ADD CONSTRAINT aniversariantes_cpf_format 
CHECK (cpf ~ '^\d{11}$');

-- 11. CONSTRAINT PARA DATA DE NASCIMENTO VÁLIDA
ALTER TABLE public.aniversariantes
DROP CONSTRAINT IF EXISTS aniversariantes_data_nascimento_valida;

ALTER TABLE public.aniversariantes
ADD CONSTRAINT aniversariantes_data_nascimento_valida 
CHECK (
  data_nascimento <= CURRENT_DATE 
  AND data_nascimento >= '1900-01-01'::date
);

-- 12. GRANT PERMISSIONS PARA FUNÇÕES
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_colaborador(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_aniversariante(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_estabelecimento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_establishment_owner(uuid) TO authenticated;

-- 13. ÍNDICE GIN PARA BUSCA EM ARRAYS
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_categoria_gin 
ON public.estabelecimentos USING GIN(categoria);

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_especialidades_gin 
ON public.estabelecimentos USING GIN(especialidades);

-- 14. ÍNDICE PARA BUSCA POR SLUG
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_slug_cidade 
ON public.estabelecimentos(slug, cidade, estado) 
WHERE deleted_at IS NULL AND ativo = true;

-- 15. FUNÇÃO DE AUDIT LOG
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT auth.uid(),
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_logs (
    event_type,
    user_id,
    metadata,
    severity
  ) VALUES (
    p_event_type,
    p_user_id,
    p_metadata,
    p_severity
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_security_event(text, uuid, jsonb, text) TO authenticated;

-- 16. ÍNDICE PARA FAVORITOS (lookup rápido)
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_estabelecimento 
ON public.favoritos(usuario_id, estabelecimento_id);

-- 17. ÍNDICE PARA USER_ROLES (função has_role)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role 
ON public.user_roles(user_id, role);

-- 18. ÍNDICE PARA CUPONS POR CÓDIGO (validação)
CREATE INDEX IF NOT EXISTS idx_cupons_codigo_estabelecimento 
ON public.cupons(codigo, estabelecimento_id);
