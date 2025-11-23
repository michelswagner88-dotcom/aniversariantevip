-- ========================================
-- OTIMIZAÇÕES DE PERFORMANCE E ÍNDICES
-- Sistema preparado para alta carga nacional
-- ========================================

-- Índices para aniversariantes
CREATE INDEX IF NOT EXISTS idx_aniversariantes_data_nascimento 
ON aniversariantes(data_nascimento);

CREATE INDEX IF NOT EXISTS idx_aniversariantes_cpf 
ON aniversariantes(cpf);

CREATE INDEX IF NOT EXISTS idx_aniversariantes_created_at 
ON aniversariantes(created_at DESC);

-- Índices para estabelecimentos
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_categoria 
ON estabelecimentos USING GIN(categoria);

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cidade_estado 
ON estabelecimentos(cidade, estado);

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cnpj 
ON estabelecimentos(cnpj);

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_location 
ON estabelecimentos(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Índices para cupons (alta frequência de consultas)
CREATE INDEX IF NOT EXISTS idx_cupons_aniversariante_id 
ON cupons(aniversariante_id);

CREATE INDEX IF NOT EXISTS idx_cupons_estabelecimento_id 
ON cupons(estabelecimento_id);

CREATE INDEX IF NOT EXISTS idx_cupons_codigo 
ON cupons(codigo);

CREATE INDEX IF NOT EXISTS idx_cupons_usado_validade 
ON cupons(usado, data_validade) 
WHERE usado = false;

CREATE INDEX IF NOT EXISTS idx_cupons_data_emissao 
ON cupons(data_emissao DESC);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

-- Índices para user_roles (queries frequentes)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role 
ON user_roles(user_id, role);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_estabelecimento 
ON favoritos(usuario_id, estabelecimento_id);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
ON analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type 
ON analytics(event_type);

CREATE INDEX IF NOT EXISTS idx_estabelecimento_analytics_estab_data 
ON estabelecimento_analytics(estabelecimento_id, data_evento DESC);

-- ========================================
-- FUNÇÃO PARA GERAR CÓDIGO DE CUPOM ÚNICO
-- ========================================
CREATE OR REPLACE FUNCTION generate_unique_coupon_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código único com prefixo VIP
    new_code := 'VIP-' || 
                UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Verificar se código já existe
    SELECT EXISTS(SELECT 1 FROM cupons WHERE codigo = new_code) INTO code_exists;
    
    -- Se não existe, retornar
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- ========================================
-- FUNÇÃO OTIMIZADA PARA EMITIR CUPOM
-- Com validações e tratamento de erros
-- ========================================
CREATE OR REPLACE FUNCTION emit_coupon(
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
BEGIN
  -- Validar aniversariante existe
  IF NOT EXISTS(SELECT 1 FROM aniversariantes WHERE id = p_aniversariante_id) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
                        NULL::TIMESTAMP WITH TIME ZONE, 'Aniversariante não encontrado'::TEXT;
    RETURN;
  END IF;
  
  -- Validar estabelecimento existe
  IF NOT EXISTS(SELECT 1 FROM estabelecimentos WHERE id = p_estabelecimento_id) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
                        NULL::TIMESTAMP WITH TIME ZONE, 'Estabelecimento não encontrado'::TEXT;
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
  
  -- Retornar sucesso
  RETURN QUERY SELECT v_cupom_id, v_codigo, now(), v_data_validade, NULL::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    RAISE WARNING 'Erro ao emitir cupom: %', SQLERRM;
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
                        NULL::TIMESTAMP WITH TIME ZONE, SQLERRM::TEXT;
END;
$$;

-- ========================================
-- FUNÇÃO PARA VALIDAR E USAR CUPOM
-- ========================================
CREATE OR REPLACE FUNCTION use_coupon(
  p_codigo TEXT,
  p_estabelecimento_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  cupom_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cupom RECORD;
BEGIN
  -- Buscar cupom
  SELECT * INTO v_cupom
  FROM cupons
  WHERE codigo = p_codigo
  AND estabelecimento_id = p_estabelecimento_id
  FOR UPDATE; -- Lock para evitar uso concorrente
  
  -- Validações
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Cupom não encontrado ou inválido'::TEXT, NULL::JSONB;
    RETURN;
  END IF;
  
  IF v_cupom.usado THEN
    RETURN QUERY SELECT false, 'Cupom já foi utilizado'::TEXT, 
                        jsonb_build_object('data_uso', v_cupom.data_uso);
    RETURN;
  END IF;
  
  IF v_cupom.data_validade < now() THEN
    RETURN QUERY SELECT false, 'Cupom expirado'::TEXT, 
                        jsonb_build_object('data_validade', v_cupom.data_validade);
    RETURN;
  END IF;
  
  -- Marcar como usado
  UPDATE cupons
  SET usado = true,
      data_uso = now()
  WHERE id = v_cupom.id;
  
  -- Retornar sucesso
  RETURN QUERY SELECT true, 'Cupom validado com sucesso'::TEXT,
                      jsonb_build_object(
                        'codigo', v_cupom.codigo,
                        'data_uso', now()
                      );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao usar cupom: %', SQLERRM;
    RETURN QUERY SELECT false, 'Erro ao processar cupom'::TEXT, NULL::JSONB;
END;
$$;

-- ========================================
-- STATISTICS PARA QUERY PLANNER
-- ========================================
ANALYZE aniversariantes;
ANALYZE estabelecimentos;
ANALYZE cupons;
ANALYZE profiles;
ANALYZE user_roles;
ANALYZE favoritos;