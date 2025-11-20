-- Criar tabela de favoritos
CREATE TABLE public.favoritos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id TEXT NOT NULL,
  estabelecimento_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, estabelecimento_id)
);

-- Enable RLS
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seus próprios favoritos"
  ON public.favoritos
  FOR SELECT
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub' OR usuario_id = auth.uid()::text);

CREATE POLICY "Usuários podem adicionar favoritos"
  ON public.favoritos
  FOR INSERT
  WITH CHECK (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub' OR usuario_id = auth.uid()::text);

CREATE POLICY "Usuários podem remover seus favoritos"
  ON public.favoritos
  FOR DELETE
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'sub' OR usuario_id = auth.uid()::text);