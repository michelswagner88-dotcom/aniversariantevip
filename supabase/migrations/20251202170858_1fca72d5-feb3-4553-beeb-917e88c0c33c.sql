-- Adicionar coluna codigo na tabela estabelecimentos
ALTER TABLE public.estabelecimentos 
ADD COLUMN codigo VARCHAR(6) UNIQUE;

-- Criar índice para busca rápida por código
CREATE INDEX idx_estabelecimentos_codigo ON public.estabelecimentos(codigo);

-- Função para gerar próximo código sequencial (6 dígitos: 000000, 000001, etc)
CREATE OR REPLACE FUNCTION public.gerar_proximo_codigo()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ultimo_codigo INTEGER;
  novo_codigo VARCHAR(6);
BEGIN
  SELECT COALESCE(MAX(CAST(codigo AS INTEGER)), -1) + 1 
  INTO ultimo_codigo
  FROM estabelecimentos
  WHERE codigo ~ '^\d+$';
  
  novo_codigo := LPAD(ultimo_codigo::TEXT, 6, '0');
  RETURN novo_codigo;
END;
$$;

-- Atualizar a view public_estabelecimentos para incluir codigo
DROP VIEW IF EXISTS public.public_estabelecimentos;

CREATE VIEW public.public_estabelecimentos AS
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