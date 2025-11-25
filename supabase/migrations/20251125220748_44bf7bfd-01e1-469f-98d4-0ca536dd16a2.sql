-- Criar tabela para rastrear eventos de e-mail
CREATE TABLE IF NOT EXISTS public.email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  email_type TEXT NOT NULL, -- 'welcome', 'birthday_reminder', 'birthday_today'
  email_address TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_email_analytics_user_id ON public.email_analytics(user_id);
CREATE INDEX idx_email_analytics_email_type ON public.email_analytics(email_type);
CREATE INDEX idx_email_analytics_sent_at ON public.email_analytics(sent_at);
CREATE INDEX idx_email_analytics_opened_at ON public.email_analytics(opened_at);

-- Habilitar RLS
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins podem ver todas as analytics de email"
  ON public.email_analytics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Sistema pode inserir analytics de email"
  ON public.email_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar analytics de email"
  ON public.email_analytics
  FOR UPDATE
  USING (true);

-- Comentários para documentação
COMMENT ON TABLE public.email_analytics IS 'Rastreia envios, aberturas e cliques de e-mails do sistema';
COMMENT ON COLUMN public.email_analytics.email_type IS 'Tipo de e-mail: welcome, birthday_reminder, birthday_today';
COMMENT ON COLUMN public.email_analytics.click_count IS 'Número total de cliques no e-mail';
