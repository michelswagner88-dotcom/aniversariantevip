-- Recriar a view public_estabelecimentos incluindo o campo logradouro
DROP VIEW IF EXISTS public_estabelecimentos;

CREATE VIEW public_estabelecimentos AS
SELECT 
  id,
  nome_fantasia,
  razao_social,
  logo_url,
  categoria,
  -- Campos de endereço completos
  logradouro,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  latitude,
  longitude,
  -- Contato
  telefone,
  whatsapp,
  instagram,
  site,
  link_cardapio,
  horario_funcionamento,
  -- Benefício
  descricao_beneficio,
  regras_utilizacao,
  periodo_validade_beneficio,
  galeria_fotos,
  ativo,
  created_at
FROM estabelecimentos
WHERE deleted_at IS NULL;