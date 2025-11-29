-- Recriar view public_estabelecimentos para incluir slug
DROP VIEW IF EXISTS public_estabelecimentos;

CREATE VIEW public_estabelecimentos AS
SELECT 
  id,
  ativo,
  bairro,
  categoria,
  cep,
  cidade,
  complemento,
  created_at,
  descricao_beneficio,
  endereco,
  estado,
  galeria_fotos,
  horario_funcionamento,
  instagram,
  latitude,
  link_cardapio,
  logo_url,
  logradouro,
  longitude,
  nome_fantasia,
  numero,
  periodo_validade_beneficio,
  razao_social,
  regras_utilizacao,
  site,
  telefone,
  whatsapp,
  slug
FROM estabelecimentos
WHERE ativo = true AND deleted_at IS NULL;