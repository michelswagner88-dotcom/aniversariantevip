-- Update get_birthday_forecast to check plan_status for premium features
CREATE OR REPLACE FUNCTION public.get_birthday_forecast(p_cidade text, p_estado text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_next_7_days INTEGER;
  v_next_30_days INTEGER;
  v_previous_7_days INTEGER;
  v_trend_percentage NUMERIC;
  v_trend_direction TEXT;
  v_status TEXT;
  v_result JSON;
  v_establishment_plan TEXT;
  v_is_premium BOOLEAN := false;
BEGIN
  -- Validar parâmetros
  IF p_cidade IS NULL OR p_estado IS NULL THEN
    RETURN json_build_object(
      'error', 'Cidade e estado são obrigatórios',
      'next_7_days', 0,
      'next_30_days', 0,
      'trend', '0%',
      'status', 'unknown',
      'premium_required', true
    );
  END IF;

  -- Verificar plano do estabelecimento autenticado
  IF auth.uid() IS NOT NULL THEN
    SELECT plan_status INTO v_establishment_plan
    FROM estabelecimentos
    WHERE id = auth.uid()
    LIMIT 1;
    
    -- Considera premium: 'active', 'trialing', ou qualquer status pago (não 'pending')
    v_is_premium := (v_establishment_plan IS NOT NULL AND v_establishment_plan != 'pending');
  END IF;

  -- Contar aniversariantes dos próximos 7 dias na mesma cidade
  SELECT COUNT(*) INTO v_next_7_days
  FROM aniversariantes
  WHERE cidade = p_cidade
    AND estado = p_estado
    AND deleted_at IS NULL
    AND (
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

  -- Se não for premium, retornar apenas dados limitados/demo
  IF NOT v_is_premium THEN
    RETURN json_build_object(
      'next_7_days', LEAST(v_next_7_days, 50), -- Limitar preview a 50
      'next_30_days', LEAST(v_next_30_days, 150), -- Limitar preview a 150
      'trend', '...',
      'status', 'locked',
      'premium_required', true,
      'cidade', p_cidade,
      'estado', p_estado,
      'message', 'Upgrade para plano Gold para ver dados completos',
      'updated_at', NOW()
    );
  END IF;

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
    IF v_next_7_days > 0 THEN
      v_trend_percentage := 100;
    ELSE
      v_trend_percentage := 0;
    END IF;
  END IF;

  -- Determinar direção da tendência
  IF v_trend_percentage > 10 THEN
    v_trend_direction := '+' || ROUND(v_trend_percentage, 0)::TEXT || '%';
    v_status := 'hot';
  ELSIF v_trend_percentage < -10 THEN
    v_trend_direction := ROUND(v_trend_percentage, 0)::TEXT || '%';
    v_status := 'cold';
  ELSE
    v_trend_direction := ROUND(v_trend_percentage, 0)::TEXT || '%';
    v_status := 'stable';
  END IF;

  -- Construir resposta JSON completa para usuários premium
  v_result := json_build_object(
    'next_7_days', v_next_7_days,
    'next_30_days', v_next_30_days,
    'trend', v_trend_direction,
    'status', v_status,
    'previous_7_days', v_previous_7_days,
    'cidade', p_cidade,
    'estado', p_estado,
    'premium_required', false,
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
      'status', 'error',
      'premium_required', true
    );
END;
$function$;