-- Adicionar novos campos para bio e benefício estruturado
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS beneficio_titulo VARCHAR(150),
ADD COLUMN IF NOT EXISTS beneficio_validade VARCHAR(50) DEFAULT 'dia_aniversario',
ADD COLUMN IF NOT EXISTS beneficio_regras TEXT;

-- Constraint para limite de caracteres na bio
ALTER TABLE estabelecimentos 
ADD CONSTRAINT bio_max_length CHECK (char_length(bio) <= 500);

-- Atualizar a view pública para incluir os novos campos
DROP VIEW IF EXISTS public_estabelecimentos;
CREATE VIEW public_estabelecimentos AS
SELECT 
  id, codigo, razao_social, nome_fantasia, categoria, especialidades,
  cidade, estado, bairro, logradouro, numero, complemento, cep, endereco,
  latitude, longitude, telefone, whatsapp, instagram, site,
  horario_funcionamento, descricao_beneficio, periodo_validade_beneficio,
  regras_utilizacao, logo_url, galeria_fotos, slug, ativo, created_at,
  bio, beneficio_titulo, beneficio_validade, beneficio_regras
FROM estabelecimentos
WHERE ativo = true AND deleted_at IS NULL;