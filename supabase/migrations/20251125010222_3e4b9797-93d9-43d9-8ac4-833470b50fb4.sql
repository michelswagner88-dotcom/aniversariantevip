-- ============================================
-- BLINDAGEM DE SEGURANÇA ENTERPRISE
-- Camada adicional de proteção com rate limiting
-- ============================================

-- 1. Criar tabela de rate limiting para emissão de cupons
CREATE TABLE IF NOT EXISTS public.cupom_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aniversariante_id UUID NOT NULL REFERENCES aniversariantes(id) ON DELETE CASCADE,
  estabelecimento_id UUID NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
  ultima_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  contador_semanal INTEGER NOT NULL DEFAULT 1,
  semana_referencia DATE NOT NULL DEFAULT DATE_TRUNC('week', NOW())::DATE,
  UNIQUE(aniversariante_id, estabelecimento_id, semana_referencia)
);

-- Habilitar RLS
ALTER TABLE public.cupom_rate_limit ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas o próprio usuário pode ver seu histórico
CREATE POLICY "Usuários podem ver seu próprio rate limit"
ON public.cupom_rate_limit
FOR SELECT
USING (auth.uid() = aniversariante_id);

-- Policy: Sistema pode inserir/atualizar (via função)
CREATE POLICY "Sistema pode gerenciar rate limit"
ON public.cupom_rate_limit
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Atualizar função emit_coupon com rate limiting
CREATE OR REPLACE FUNCTION public.emit_coupon_secure(
  p_aniversariante_id UUID,
  p_estabelecimento_id UUID
)
RETURNS TABLE(
  cupom_id UUID,
  codigo TEXT,
  data_emissao TIMESTAMP WITH TIME ZONE,
  data_validade TIMESTAMP WITH TIME ZONE,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_codigo TEXT;
  v_data_validade TIMESTAMP WITH TIME ZONE;
  v_periodo_validade TEXT;
  v_cupom_id UUID;
  v_data_nascimento DATE;
  v_contador_semanal INTEGER;
  v_semana_atual DATE;
BEGIN
  -- Validar que o usuário autenticado é o aniversariante
  IF auth.uid() != p_aniversariante_id THEN
    RETURN QUERY SELECT 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      'Você só pode emitir cupons para si mesmo'::TEXT;
    RETURN;
  END IF;

  -- Validar aniversariante existe
  IF NOT EXISTS(SELECT 1 FROM aniversariantes WHERE id = p_aniversariante_id) THEN
    RETURN QUERY SELECT 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      'Aniversariante não encontrado'::TEXT;
    RETURN;
  END IF;
  
  -- Validar estabelecimento existe
  IF NOT EXISTS(SELECT 1 FROM estabelecimentos WHERE id = p_estabelecimento_id) THEN
    RETURN QUERY SELECT 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      'Estabelecimento não encontrado'::TEXT;
    RETURN;
  END IF;

  -- Rate Limiting: Verificar se já emitiu cupom esta semana
  v_semana_atual := DATE_TRUNC('week', NOW())::DATE;
  
  SELECT contador_semanal INTO v_contador_semanal
  FROM cupom_rate_limit
  WHERE aniversariante_id = p_aniversariante_id
    AND estabelecimento_id = p_estabelecimento_id
    AND semana_referencia = v_semana_atual;

  -- Se já emitiu cupom esta semana, bloquear
  IF v_contador_semanal IS NOT NULL AND v_contador_semanal >= 1 THEN
    RETURN QUERY SELECT 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      'Você já emitiu um cupom para este estabelecimento esta semana. Aguarde para emitir novamente.'::TEXT;
    RETURN;
  END IF;
  
  -- Buscar data de nascimento
  SELECT data_nascimento INTO v_data_nascimento 
  FROM aniversariantes 
  WHERE id = p_aniversariante_id;
  
  -- Buscar período de validade do benefício
  SELECT COALESCE(periodo_validade_beneficio, 'mes_aniversario') 
  INTO v_periodo_validade
  FROM estabelecimentos 
  WHERE id = p_estabelecimento_id;
  
  -- Calcular data de validade baseado no período
  IF v_periodo_validade = 'dia_aniversario' THEN
    v_data_validade := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::INT,
      EXTRACT(MONTH FROM v_data_nascimento)::INT,
      EXTRACT(DAY FROM v_data_nascimento)::INT
    ) + INTERVAL '1 day';
  ELSIF v_periodo_validade = 'semana_aniversario' THEN
    v_data_validade := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::INT,
      EXTRACT(MONTH FROM v_data_nascimento)::INT,
      EXTRACT(DAY FROM v_data_nascimento)::INT
    ) + INTERVAL '7 days';
  ELSE -- mes_aniversario
    v_data_validade := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::INT,
      EXTRACT(MONTH FROM v_data_nascimento)::INT,
      1
    ) + INTERVAL '1 month';
  END IF;
  
  -- Gerar código único
  v_codigo := generate_unique_coupon_code();
  
  -- Inserir cupom
  INSERT INTO cupons (
    aniversariante_id,
    estabelecimento_id,
    codigo,
    data_validade,
    usado
  ) VALUES (
    p_aniversariante_id,
    p_estabelecimento_id,
    v_codigo,
    v_data_validade,
    false
  )
  RETURNING id INTO v_cupom_id;

  -- Atualizar rate limit
  INSERT INTO cupom_rate_limit (
    aniversariante_id,
    estabelecimento_id,
    ultima_emissao,
    contador_semanal,
    semana_referencia
  ) VALUES (
    p_aniversariante_id,
    p_estabelecimento_id,
    NOW(),
    1,
    v_semana_atual
  )
  ON CONFLICT (aniversariante_id, estabelecimento_id, semana_referencia)
  DO UPDATE SET
    ultima_emissao = NOW(),
    contador_semanal = cupom_rate_limit.contador_semanal + 1;
  
  -- Retornar sucesso
  RETURN QUERY SELECT 
    v_cupom_id, 
    v_codigo, 
    NOW(), 
    v_data_validade, 
    NULL::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao emitir cupom: %', SQLERRM;
    RETURN QUERY SELECT 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      SQLERRM::TEXT;
END;
$$;

-- 3. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_cupom_rate_limit_aniversariante 
  ON cupom_rate_limit(aniversariante_id);

CREATE INDEX IF NOT EXISTS idx_cupom_rate_limit_estabelecimento 
  ON cupom_rate_limit(estabelecimento_id);

CREATE INDEX IF NOT EXISTS idx_cupom_rate_limit_semana 
  ON cupom_rate_limit(semana_referencia);

-- 4. Comentários de documentação
COMMENT ON TABLE public.cupom_rate_limit IS 
  'Controle de rate limiting para emissão de cupons. Limite: 1 cupom por estabelecimento por semana.';

COMMENT ON FUNCTION public.emit_coupon_secure IS 
  'Versão segura da função emit_coupon com rate limiting e validação de autenticação.';
