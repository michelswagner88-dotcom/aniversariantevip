-- =====================================================
-- MIGRATION: Proteger dados sensíveis de estabelecimentos
-- Data: 2025-01-27
-- =====================================================

-- 1. Criar VIEW pública com apenas campos seguros
CREATE OR REPLACE VIEW public.public_estabelecimentos AS
SELECT 
  id,
  nome_fantasia,
  razao_social,
  categoria,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  latitude,
  longitude,
  logo_url,
  telefone,
  whatsapp,
  instagram,
  site,
  horario_funcionamento,
  link_cardapio,
  descricao_beneficio,
  regras_utilizacao,
  periodo_validade_beneficio,
  ativo,
  created_at
FROM public.estabelecimentos
WHERE deleted_at IS NULL 
  AND ativo = true;

-- 2. Dar permissão de leitura na VIEW
GRANT SELECT ON public.public_estabelecimentos TO anon;
GRANT SELECT ON public.public_estabelecimentos TO authenticated;

-- 3. Criar policy mais restritiva na tabela original
DROP POLICY IF EXISTS "Todos podem ver estabelecimentos publicamente" ON public.estabelecimentos;

CREATE POLICY "Admins podem ver todos estabelecimentos completos"
ON public.estabelecimentos FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Donos podem ver próprio estabelecimento completo"
ON public.estabelecimentos FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);