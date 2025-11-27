-- Adicionar coluna type em posts
CREATE TYPE post_type AS ENUM ('photo', 'promo', 'agenda');
ALTER TABLE posts ADD COLUMN type post_type NOT NULL DEFAULT 'photo';

-- Tabela de interações (likes e comentários)
CREATE TABLE post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment')),
  comment_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, type)
);

ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;

-- RLS para post_interactions
CREATE POLICY "Todos podem ver interações"
  ON post_interactions FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem interagir"
  ON post_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias interações"
  ON post_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela de eventos de agenda
CREATE TABLE agenda_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_time TIME,
  title TEXT NOT NULL,
  description TEXT,
  reservation_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;

-- RLS para agenda_events
CREATE POLICY "Todos podem ver eventos"
  ON agenda_events FOR SELECT
  USING (true);

CREATE POLICY "Estabelecimentos podem criar eventos"
  ON agenda_events FOR INSERT
  WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem atualizar seus eventos"
  ON agenda_events FOR UPDATE
  USING (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem deletar seus eventos"
  ON agenda_events FOR DELETE
  USING (auth.uid() = establishment_id);

-- Criar índices para performance
CREATE INDEX idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX idx_agenda_events_establishment_id ON agenda_events(establishment_id);
CREATE INDEX idx_agenda_events_event_date ON agenda_events(event_date);