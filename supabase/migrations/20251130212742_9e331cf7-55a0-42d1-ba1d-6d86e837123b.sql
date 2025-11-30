-- Criar tabela dedicada de logs de acesso admin
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  endpoint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  authorized BOOLEAN NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consulta rápida
CREATE INDEX IF NOT EXISTS idx_admin_logs_user ON public.admin_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_authorized ON public.admin_access_logs(authorized);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_access_logs(action);

-- Habilitar RLS
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver logs
CREATE POLICY "Only admins can view admin logs"
ON public.admin_access_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Política: Sistema pode inserir logs
CREATE POLICY "System can insert admin logs"
ON public.admin_access_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Comentários
COMMENT ON TABLE public.admin_access_logs IS 'Logs dedicados de acesso e ações administrativas';
COMMENT ON COLUMN public.admin_access_logs.action IS 'Ação realizada: login_attempt, login_success, login_failed, access_denied, etc.';
COMMENT ON COLUMN public.admin_access_logs.authorized IS 'Se a ação foi autorizada ou bloqueada';