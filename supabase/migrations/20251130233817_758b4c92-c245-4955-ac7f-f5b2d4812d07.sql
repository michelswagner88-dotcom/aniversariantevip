-- ============================================
-- SISTEMA DE ESPECIALIDADES
-- ============================================

-- 1. Adicionar coluna de especialidades (array de texto)
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS especialidades TEXT[] DEFAULT '{}';

-- 2. Criar tabela de especialidades disponíveis (para gerenciar no admin)
CREATE TABLE IF NOT EXISTS especialidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL,
  nome TEXT NOT NULL,
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(categoria, nome)
);

-- 3. Habilitar RLS
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;

-- 4. Política de leitura pública
CREATE POLICY "Especialidades são públicas"
ON especialidades FOR SELECT
USING (ativo = true);

-- 5. Política de escrita para admins
CREATE POLICY "Admins podem gerenciar especialidades"
ON especialidades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'colaborador')
  )
);

-- 6. Inserir especialidades por categoria

-- ACADEMIA
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Academia', 'Musculação', '💪', 1),
('Academia', 'CrossFit', '🏋️', 2),
('Academia', 'Yoga', '🧘', 3),
('Academia', 'Pilates', '🧘‍♀️', 4),
('Academia', 'Natação', '🏊', 5),
('Academia', 'Artes Marciais', '🥋', 6),
('Academia', 'Funcional', '🏃', 7),
('Academia', 'Dança', '💃', 8),
('Academia', 'Spinning', '🚴', 9),
('Academia', 'Ginástica', '🤸', 10)
ON CONFLICT (categoria, nome) DO NOTHING;

-- BAR
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Bar', 'Cervejaria', '🍺', 1),
('Bar', 'Coquetelaria', '🍸', 2),
('Bar', 'Wine Bar', '🍷', 3),
('Bar', 'Karaokê', '🎤', 4),
('Bar', 'Sports Bar', '⚽', 5),
('Bar', 'Boteco', '🍻', 6),
('Bar', 'Música ao Vivo', '🎵', 7),
('Bar', 'Rooftop', '🌅', 8)
ON CONFLICT (categoria, nome) DO NOTHING;

-- BARBEARIA
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Barbearia', 'Tradicional', '💈', 1),
('Barbearia', 'Moderna', '✂️', 2),
('Barbearia', 'Premium', '👑', 3),
('Barbearia', 'Barba', '🧔', 4),
('Barbearia', 'Tratamentos', '💆‍♂️', 5)
ON CONFLICT (categoria, nome) DO NOTHING;

-- CAFETERIA
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Cafeteria', 'Café Especial', '☕', 1),
('Cafeteria', 'Padaria', '🥐', 2),
('Cafeteria', 'Sorveteria', '🍦', 3),
('Cafeteria', 'Açaí', '🫐', 4),
('Cafeteria', 'Sucos/Smoothies', '🥤', 5),
('Cafeteria', 'Bubble Tea', '🧋', 6),
('Cafeteria', 'Casa de Chá', '🍵', 7)
ON CONFLICT (categoria, nome) DO NOTHING;

-- CASA NOTURNA
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Casa Noturna', 'Balada', '🎵', 1),
('Casa Noturna', 'Show ao Vivo', '🎤', 2),
('Casa Noturna', 'Pista de Dança', '🕺', 3),
('Casa Noturna', 'DJ', '🎧', 4),
('Casa Noturna', 'Lounge', '🍾', 5),
('Casa Noturna', 'Temática', '🎭', 6)
ON CONFLICT (categoria, nome) DO NOTHING;

-- CONFEITARIA
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Confeitaria', 'Bolos', '🎂', 1),
('Confeitaria', 'Cupcakes', '🧁', 2),
('Confeitaria', 'Tortas', '🍰', 3),
('Confeitaria', 'Biscoitos', '🍪', 4),
('Confeitaria', 'Chocolates', '🍫', 5),
('Confeitaria', 'Doces Finos', '🍬', 6),
('Confeitaria', 'Encomendas', '🎁', 7)
ON CONFLICT (categoria, nome) DO NOTHING;

-- ENTRETENIMENTO
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Entretenimento', 'Cinema', '🎬', 1),
('Entretenimento', 'Teatro', '🎭', 2),
('Entretenimento', 'Boliche', '🎳', 3),
('Entretenimento', 'Escape Room', '🔐', 4),
('Entretenimento', 'Parque', '🎢', 5),
('Entretenimento', 'Games', '🎮', 6),
('Entretenimento', 'Laser Tag', '🎯', 7),
('Entretenimento', 'Kart', '🏎️', 8)
ON CONFLICT (categoria, nome) DO NOTHING;

-- HOSPEDAGEM
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Hospedagem', 'Hotel', '🏨', 1),
('Hospedagem', 'Pousada', '🏠', 2),
('Hospedagem', 'Resort', '🌴', 3),
('Hospedagem', 'Hostel', '🛏️', 4),
('Hospedagem', 'Airbnb', '🏡', 5),
('Hospedagem', 'Camping', '🏕️', 6),
('Hospedagem', 'Spa', '💆', 7)
ON CONFLICT (categoria, nome) DO NOTHING;

-- LOJA
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Loja', 'Moda e Acessórios', '👗', 1),
('Loja', 'Presentes', '🎁', 2),
('Loja', 'Cosméticos', '💄', 3),
('Loja', 'Joias e Bijuterias', '💍', 4),
('Loja', 'Calçados', '👟', 5),
('Loja', 'Bolsas', '👜', 6),
('Loja', 'Ótica', '🕶️', 7),
('Loja', 'Eletrônicos', '📱', 8),
('Loja', 'Brinquedos', '🧸', 9),
('Loja', 'Livraria', '📚', 10),
('Loja', 'Floricultura', '🌸', 11),
('Loja', 'Decoração', '🏠', 12),
('Loja', 'Variedades', '🛍️', 13)
ON CONFLICT (categoria, nome) DO NOTHING;

-- RESTAURANTE
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Restaurante', 'Pizzaria', '🍕', 1),
('Restaurante', 'Churrascaria', '🍖', 2),
('Restaurante', 'Sushi/Japonês', '🍣', 3),
('Restaurante', 'Hambúrguer', '🍔', 4),
('Restaurante', 'Italiana', '🇮🇹', 5),
('Restaurante', 'Brasileira', '🇧🇷', 6),
('Restaurante', 'Mexicana', '🌮', 7),
('Restaurante', 'Árabe', '🥙', 8),
('Restaurante', 'Chinesa/Asiática', '🍜', 9),
('Restaurante', 'Frutos do Mar', '🦐', 10),
('Restaurante', 'Vegetariana/Vegana', '🥗', 11),
('Restaurante', 'Self-Service', '🍽️', 12),
('Restaurante', 'Rodízio', '🔄', 13),
('Restaurante', 'Fast Food', '⚡', 14),
('Restaurante', 'Comida Caseira', '🥘', 15),
('Restaurante', 'Café da Manhã', '🍳', 16),
('Restaurante', 'Massas', '🍝', 17),
('Restaurante', 'Carnes', '🥩', 18)
ON CONFLICT (categoria, nome) DO NOTHING;

-- SALÃO DE BELEZA
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Salão de Beleza', 'Cabelo', '💇', 1),
('Salão de Beleza', 'Unhas', '💅', 2),
('Salão de Beleza', 'Estética', '🧖', 3),
('Salão de Beleza', 'Depilação', '🪮', 4),
('Salão de Beleza', 'Maquiagem', '💄', 5),
('Salão de Beleza', 'Sobrancelhas', '👁️', 6),
('Salão de Beleza', 'Tratamentos', '🧴', 7),
('Salão de Beleza', 'Completo', '✨', 8)
ON CONFLICT (categoria, nome) DO NOTHING;

-- SAÚDE E SUPLEMENTOS
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Saúde e Suplementos', 'Suplementos', '💊', 1),
('Saúde e Suplementos', 'Nutrição Esportiva', '🏋️', 2),
('Saúde e Suplementos', 'Produtos Naturais', '🌿', 3),
('Saúde e Suplementos', 'Manipulados', '🧪', 4),
('Saúde e Suplementos', 'Clínica Estética', '💉', 5),
('Saúde e Suplementos', 'Odontologia', '🦷', 6),
('Saúde e Suplementos', 'Oftalmologia', '👁️', 7),
('Saúde e Suplementos', 'Terapias', '💆', 8)
ON CONFLICT (categoria, nome) DO NOTHING;

-- SERVIÇOS
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Serviços', 'Automotivo', '🚗', 1),
('Serviços', 'Pet Shop', '🐕', 2),
('Serviços', 'Fotografia', '📸', 3),
('Serviços', 'Tatuagem', '🎨', 4),
('Serviços', 'Tecnologia', '💻', 5),
('Serviços', 'Limpeza', '🧹', 6),
('Serviços', 'Manutenção', '🔧', 7)
ON CONFLICT (categoria, nome) DO NOTHING;

-- OUTROS
INSERT INTO especialidades (categoria, nome, icone, ordem) VALUES
('Outros', 'Outros Comércios', '🏪', 1)
ON CONFLICT (categoria, nome) DO NOTHING;

-- 7. Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_especialidades_categoria ON especialidades(categoria);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_especialidades ON estabelecimentos USING GIN(especialidades);