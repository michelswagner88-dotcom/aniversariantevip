-- Corrigir security definer view - alterar para SECURITY INVOKER
DROP VIEW IF EXISTS public.public_estabelecimentos;

CREATE VIEW public.public_estabelecimentos 
WITH (security_invoker = true) AS
SELECT 
  id,
  codigo,
  nome_fantasia,
  razao_social,
  categoria,
  especialidades,
  cidade,
  estado,
  bairro,
  logradouro,
  numero,
  complemento,
  cep,
  endereco,
  telefone,
  whatsapp,
  instagram,
  site,
  horario_funcionamento,
  descricao_beneficio,
  periodo_validade_beneficio,
  regras_utilizacao,
  logo_url,
  galeria_fotos,
  latitude,
  longitude,
  ativo,
  slug,
  created_at
FROM estabelecimentos
WHERE deleted_at IS NULL;