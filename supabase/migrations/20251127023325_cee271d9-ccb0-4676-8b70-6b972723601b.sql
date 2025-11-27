-- Criar tabela de seguidores
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, establishment_id)
);

-- Índices para performance
CREATE INDEX idx_followers_user ON public.followers(user_id);
CREATE INDEX idx_followers_establishment ON public.followers(establishment_id);

-- RLS para followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios seguidores"
ON public.followers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem seguir estabelecimentos"
ON public.followers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deixar de seguir"
ON public.followers FOR DELETE
USING (auth.uid() = user_id);

-- Criar tabela de posts (feed)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_posts_establishment ON public.posts(establishment_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- RLS para posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver posts"
ON public.posts FOR SELECT
USING (true);

CREATE POLICY "Estabelecimentos podem criar seus posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem atualizar seus posts"
ON public.posts FOR UPDATE
USING (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem deletar seus posts"
ON public.posts FOR DELETE
USING (auth.uid() = establishment_id);

-- Criar tabela de stories
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_stories_establishment ON public.stories(establishment_id);
CREATE INDEX idx_stories_expires_at ON public.stories(expires_at);

-- RLS para stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver stories ativos"
ON public.stories FOR SELECT
USING (expires_at > now());

CREATE POLICY "Estabelecimentos podem criar stories"
ON public.stories FOR INSERT
WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem deletar seus stories"
ON public.stories FOR DELETE
USING (auth.uid() = establishment_id);

-- Função para verificar limite diário de posts
CREATE OR REPLACE FUNCTION check_daily_post_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  posts_today INTEGER;
BEGIN
  -- Contar posts do estabelecimento hoje
  SELECT COUNT(*) INTO posts_today
  FROM public.posts
  WHERE establishment_id = NEW.establishment_id
    AND created_at >= CURRENT_DATE;
  
  -- Se já postou hoje, bloquear
  IF posts_today >= 1 THEN
    RAISE EXCEPTION 'Limite diário atingido. Você já postou hoje! Volte amanhã para compartilhar mais conteúdo.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para posts
CREATE TRIGGER enforce_daily_post_limit
BEFORE INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION check_daily_post_limit();

-- Função para verificar limite diário de stories
CREATE OR REPLACE FUNCTION check_daily_story_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stories_today INTEGER;
BEGIN
  -- Contar stories do estabelecimento hoje
  SELECT COUNT(*) INTO stories_today
  FROM public.stories
  WHERE establishment_id = NEW.establishment_id
    AND created_at >= CURRENT_DATE;
  
  -- Se já postou story hoje, bloquear
  IF stories_today >= 1 THEN
    RAISE EXCEPTION 'Limite diário atingido. Você já postou um Story hoje! Volte amanhã para postar novamente.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para stories
CREATE TRIGGER enforce_daily_story_limit
BEFORE INSERT ON public.stories
FOR EACH ROW
EXECUTE FUNCTION check_daily_story_limit();

-- Trigger para atualizar updated_at em posts
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();