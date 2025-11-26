-- Função RPC para previsão de aniversariantes (Radar de Oportunidades)
CREATE OR REPLACE FUNCTION public.get_birthday_forecast(p_cidade TEXT, p_estado TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_7_days INTEGER;
  v_next_30_days INTEGER;
  v_previous_7_days INTEGER;
  v_trend_percentage NUMERIC;
  v_trend_direction TEXT;
  v_status TEXT;
  v_result JSON;
BEGIN
  -- Validar parâmetros
  IF p_cidade IS NULL OR p_estado IS NULL THEN
    RETURN json_build_object(
      'error', 'Cidade e estado são obrigatórios',
      'next_7_days', 0,
      'next_30_days', 0,
      'trend', '0%',
      'status', 'unknown'
    );
  END IF;

  -- Contar aniversariantes dos próximos 7 dias na mesma cidade
  SELECT COUNT(*) INTO v_next_7_days
  FROM aniversariantes
  WHERE cidade = p_cidade
    AND estado = p_estado
    AND deleted_at IS NULL
    AND (
      -- Considera o mês/dia do aniversário nos próximos 7 dias
      (EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento)) 
      BETWEEN 
      (EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(DAY FROM CURRENT_DATE))
      AND
      (EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '7 days'), EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '7 days'))
    );

  -- Contar aniversariantes dos próximos 30 dias
  SELECT COUNT(*) INTO v_next_30_days
  FROM aniversariantes
  WHERE cidade = p_cidade
    AND estado = p_estado
    AND deleted_at IS NULL
    AND (
      (EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento)) 
      BETWEEN 
      (EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(DAY FROM CURRENT_DATE))
      AND
      (EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '30 days'), EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '30 days'))
    );

  -- Contar aniversariantes dos 7 dias ANTERIORES (para comparação de tendência)
  SELECT COUNT(*) INTO v_previous_7_days
  FROM aniversariantes
  WHERE cidade = p_cidade
    AND estado = p_estado
    AND deleted_at IS NULL
    AND (
      (EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento)) 
      BETWEEN 
      (EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '7 days'), EXTRACT(DAY FROM CURRENT_DATE - INTERVAL '7 days'))
      AND
      (EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 day'), EXTRACT(DAY FROM CURRENT_DATE - INTERVAL '1 day'))
    );

  -- Calcular tendência percentual
  IF v_previous_7_days > 0 THEN
    v_trend_percentage := ((v_next_7_days - v_previous_7_days)::NUMERIC / v_previous_7_days::NUMERIC) * 100;
  ELSE
    -- Se não havia ninguém na semana passada mas há agora, tendência é +100%
    IF v_next_7_days > 0 THEN
      v_trend_percentage := 100;
    ELSE
      v_trend_percentage := 0;
    END IF;
  END IF;

  -- Determinar direção da tendência
  IF v_trend_percentage > 10 THEN
    v_trend_direction := '+' || ROUND(v_trend_percentage, 0)::TEXT || '%';
    v_status := 'hot'; -- Alta demanda
  ELSIF v_trend_percentage < -10 THEN
    v_trend_direction := ROUND(v_trend_percentage, 0)::TEXT || '%';
    v_status := 'cold'; -- Baixa demanda
  ELSE
    v_trend_direction := ROUND(v_trend_percentage, 0)::TEXT || '%';
    v_status := 'stable'; -- Demanda estável
  END IF;

  -- Construir resposta JSON anonimizada (sem dados pessoais - LGPD compliant)
  v_result := json_build_object(
    'next_7_days', v_next_7_days,
    'next_30_days', v_next_30_days,
    'trend', v_trend_direction,
    'status', v_status,
    'previous_7_days', v_previous_7_days,
    'cidade', p_cidade,
    'estado', p_estado,
    'updated_at', NOW()
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro em get_birthday_forecast: %', SQLERRM;
    RETURN json_build_object(
      'error', SQLERRM,
      'next_7_days', 0,
      'next_30_days', 0,
      'trend', '0%',
      'status', 'error'
    );
END;
$$;

-- Comentários de documentação
COMMENT ON FUNCTION public.get_birthday_forecast(TEXT, TEXT) IS 
'Função de inteligência preditiva que retorna previsão de demanda de aniversariantes por região. Dados anonimizados (LGPD compliant). Usado no Radar de Oportunidades do dashboard de estabelecimentos.';

-- Grant de execução para authenticated users
GRANT EXECUTE ON FUNCTION public.get_birthday_forecast(TEXT, TEXT) TO authenticated;