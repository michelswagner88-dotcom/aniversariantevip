-- Criar tabela de logs de segurança
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login_failed', 'login_success', 'rate_limit_hit', 'suspicious_activity', 'blocked_ip', 'registration_attempt', 'password_reset')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);

-- Habilitar RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver logs
CREATE POLICY "Only admins can view security logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Política: Sistema pode inserir logs
CREATE POLICY "System can insert security logs"
ON public.security_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Comentários na tabela
COMMENT ON TABLE public.security_logs IS 'Logs de eventos de segurança para monitoramento e auditoria';
COMMENT ON COLUMN public.security_logs.event_type IS 'Tipo do evento: login_failed, login_success, rate_limit_hit, suspicious_activity, blocked_ip, registration_attempt, password_reset';
COMMENT ON COLUMN public.security_logs.severity IS 'Severidade: info, warning, critical';