-- Corrigir view com SECURITY INVOKER para usar RLS do usuário
DROP VIEW IF EXISTS public_estabelecimentos;
CREATE VIEW public_estabelecimentos 
WITH (security_invoker = on) AS
SELECT 
  id, codigo, razao_social, nome_fantasia, categoria, especialidades,
  cidade, estado, bairro, logradouro, numero, complemento, cep, endereco,
  latitude, longitude, telefone, whatsapp, instagram, site,
  horario_funcionamento, descricao_beneficio, periodo_validade_beneficio,
  regras_utilizacao, logo_url, galeria_fotos, slug, ativo, created_at,
  bio, beneficio_titulo, beneficio_validade, beneficio_regras
FROM estabelecimentos
WHERE ativo = true AND deleted_at IS NULL;