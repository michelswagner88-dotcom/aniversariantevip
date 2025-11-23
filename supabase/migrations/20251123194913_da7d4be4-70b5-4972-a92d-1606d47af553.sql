-- Criar tabela para rastrear visualizações e interações dos estabelecimentos
CREATE TABLE IF NOT EXISTS public.estabelecimento_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL, -- 'visualizacao', 'clique_telefone', 'clique_whatsapp', 'clique_instagram', 'clique_site', 'compartilhamento'
  user_id UUID,
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_estabelecimento_analytics_estabelecimento ON public.estabelecimento_analytics(estabelecimento_id);
CREATE INDEX IF NOT EXISTS idx_estabelecimento_analytics_tipo ON public.estabelecimento_analytics(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_estabelecimento_analytics_data ON public.estabelecimento_analytics(data_evento);

-- Enable RLS
ALTER TABLE public.estabelecimento_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode inserir analytics"
ON public.estabelecimento_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Estabelecimentos podem ver suas próprias analytics"
ON public.estabelecimento_analytics
FOR SELECT
USING (auth.uid() = estabelecimento_id);

CREATE POLICY "Admins podem ver todas as analytics"
ON public.estabelecimento_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));