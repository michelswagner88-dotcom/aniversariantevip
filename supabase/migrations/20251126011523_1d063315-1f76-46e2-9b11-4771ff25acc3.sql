-- Criar tabela de logs de navegação para rastreamento B2B
CREATE TABLE IF NOT EXISTS public.navigation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL CHECK (app_name IN ('uber', '99', 'waze', 'maps')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_navigation_logs_establishment ON public.navigation_logs(establishment_id);
CREATE INDEX IF NOT EXISTS idx_navigation_logs_created_at ON public.navigation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_logs_app_name ON public.navigation_logs(app_name);

-- RLS Policies
ALTER TABLE public.navigation_logs ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (registro de clique)
CREATE POLICY "Qualquer um pode registrar navegação"
  ON public.navigation_logs
  FOR INSERT
  WITH CHECK (true);

-- Apenas admins podem ler os dados (para análise comercial)
CREATE POLICY "Admins podem ver logs de navegação"
  ON public.navigation_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Comentários para documentação
COMMENT ON TABLE public.navigation_logs IS 'Registra cliques em apps de navegação para análise de tráfego gerado e negociações B2B';
COMMENT ON COLUMN public.navigation_logs.app_name IS 'Nome do app: uber, 99, waze, ou maps';
COMMENT ON COLUMN public.navigation_logs.establishment_id IS 'ID do estabelecimento que gerou o tráfego';
COMMENT ON COLUMN public.navigation_logs.user_id IS 'ID do usuário que clicou (nullable para não autenticados)';