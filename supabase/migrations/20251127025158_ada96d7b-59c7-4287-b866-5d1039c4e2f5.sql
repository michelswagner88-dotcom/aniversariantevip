-- Adicionar campos de analytics em posts
ALTER TABLE posts ADD COLUMN views_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN shares_count INTEGER DEFAULT 0;

-- Tabela de visualizações para tracking granular
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,
  UNIQUE(post_id, user_id, session_id)
);

ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- RLS para post_views
CREATE POLICY "Sistema pode registrar views"
  ON post_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Estabelecimentos podem ver views de seus posts"
  ON post_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_views.post_id
      AND posts.establishment_id = auth.uid()
    )
  );

-- Tabela de shares para tracking
CREATE TABLE post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  platform TEXT
);

ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- RLS para post_shares
CREATE POLICY "Usuários podem registrar shares"
  ON post_shares FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Estabelecimentos podem ver shares de seus posts"
  ON post_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_shares.post_id
      AND posts.establishment_id = auth.uid()
    )
  );

-- Função para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_views' THEN
    UPDATE posts SET views_count = views_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_TABLE_NAME = 'post_shares' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para atualizar contadores
CREATE TRIGGER increment_post_views
  AFTER INSERT ON post_views
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER increment_post_shares
  AFTER INSERT ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counters();

-- Índices para performance
CREATE INDEX idx_post_views_post_id ON post_views(post_id);
CREATE INDEX idx_post_views_user_id ON post_views(user_id);
CREATE INDEX idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX idx_post_shares_user_id ON post_shares(user_id);