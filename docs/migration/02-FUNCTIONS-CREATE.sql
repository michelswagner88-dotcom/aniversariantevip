-- ==============================================================================
-- FASE 2: CRIAR FUNÇÕES DO BANCO DE DADOS
-- Execute este script APÓS o 01-SCHEMA-CREATE.sql
-- ==============================================================================

-- ==============================================================================
-- FUNÇÕES AUXILIARES
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- ==============================================================================
-- FUNÇÃO: handle_new_user (trigger para novos usuários)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Criar trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- FUNÇÕES DE VERIFICAÇÃO DE ROLES
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = check_user_id 
    AND ativo = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_aniversariante(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'aniversariante'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_estabelecimento(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'estabelecimento'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_colaborador(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'colaborador'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_establishment_owner(establishment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT auth.uid() = establishment_id
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_level(check_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_nivel TEXT;
BEGIN
  SELECT nivel INTO admin_nivel 
  FROM admins 
  WHERE user_id = check_user_id 
  AND ativo = true;
  
  RETURN admin_nivel;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_last_access(admin_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE admins 
  SET ultimo_acesso = NOW() 
  WHERE user_id = admin_user_id;
END;
$function$;

-- ==============================================================================
-- FUNÇÕES DE GERAÇÃO DE CÓDIGO/SLUG
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.gerar_proximo_codigo()
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_slug(nome text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRANSLATE(
            nome,
            'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
            'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
          ),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_city_slug(cidade text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRANSLATE(
          cidade,
          'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
          'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
        ),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(NEW.nome_fantasia);
  final_slug := base_slug;
  
  WHILE EXISTS (
    SELECT 1 FROM public.estabelecimentos 
    WHERE slug = final_slug 
    AND cidade = NEW.cidade 
    AND estado = NEW.estado
    AND id != NEW.id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$function$;

-- ==============================================================================
-- FUNÇÕES DE CUPOM
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.generate_unique_coupon_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'VIP-' || 
                UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    SELECT EXISTS(SELECT 1 FROM cupons WHERE codigo = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.emit_coupon(p_aniversariante_id uuid, p_estabelecimento_id uuid)
RETURNS TABLE(cupom_id uuid, codigo text, data_emissao timestamp with time zone, data_validade timestamp with time zone, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_codigo TEXT;
  v_data_validade TIMESTAMP WITH TIME ZONE;
  v_periodo_validade TEXT;
  v_cupom_id UUID;
  v_data_nascimento DATE;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM aniversariantes WHERE id = p_aniversariante_id) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
                        NULL::TIMESTAMP WITH TIME ZONE, 'Aniversariante não encontrado'::TEXT;
    RETURN;
  END IF;
  
  IF NOT EXISTS(SELECT 1 FROM estabelecimentos WHERE id = p_estabelecimento_id) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
                        NULL::TIMESTAMP WITH TIME ZONE, 'Estabelecimento não encontrado'::TEXT;
    RETURN;
  END IF;
  
  SELECT data_nascimento INTO v_data_nascimento 
  FROM aniversariantes 
  WHERE id = p_aniversariante_id;
  
  SELECT COALESCE(periodo_validade_beneficio, 'mes_aniversario') 
  INTO v_periodo_validade
  FROM estabelecimentos 
  WHERE id = p_estabelecimento_id;
  
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
  ELSE
    v_data_validade := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::INT,
      EXTRACT(MONTH FROM v_data_nascimento)::INT,
      1
    ) + INTERVAL '1 month';
  END IF;
  
  v_codigo := generate_unique_coupon_code();
  
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
  
  RETURN QUERY SELECT v_cupom_id, v_codigo, now(), v_data_validade, NULL::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao emitir cupom: %', SQLERRM;
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
                        NULL::TIMESTAMP WITH TIME ZONE, SQLERRM::TEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.emit_coupon_secure(p_aniversariante_id uuid, p_estabelecimento_id uuid)
RETURNS TABLE(cupom_id uuid, codigo text, data_emissao timestamp with time zone, data_validade timestamp with time zone, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_codigo TEXT;
  v_data_validade TIMESTAMP WITH TIME ZONE;
  v_periodo_validade TEXT;
  v_cupom_id UUID;
  v_data_nascimento DATE;
  v_contador_semanal INTEGER;
  v_semana_atual DATE;
BEGIN
  IF auth.uid() != p_aniversariante_id THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 'Você só pode emitir cupons para si mesmo'::TEXT;
    RETURN;
  END IF;

  IF NOT EXISTS(SELECT 1 FROM aniversariantes WHERE id = p_aniversariante_id) THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 'Aniversariante não encontrado'::TEXT;
    RETURN;
  END IF;
  
  IF NOT EXISTS(SELECT 1 FROM estabelecimentos WHERE id = p_estabelecimento_id) THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 'Estabelecimento não encontrado'::TEXT;
    RETURN;
  END IF;

  v_semana_atual := DATE_TRUNC('week', NOW())::DATE;
  
  SELECT contador_semanal INTO v_contador_semanal
  FROM cupom_rate_limit
  WHERE aniversariante_id = p_aniversariante_id
    AND estabelecimento_id = p_estabelecimento_id
    AND semana_referencia = v_semana_atual;

  IF v_contador_semanal IS NOT NULL AND v_contador_semanal >= 1 THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      'Você já emitiu um cupom para este estabelecimento esta semana. Aguarde para emitir novamente.'::TEXT;
    RETURN;
  END IF;
  
  SELECT data_nascimento INTO v_data_nascimento 
  FROM aniversariantes 
  WHERE id = p_aniversariante_id;
  
  SELECT COALESCE(periodo_validade_beneficio, 'mes_aniversario') 
  INTO v_periodo_validade
  FROM estabelecimentos 
  WHERE id = p_estabelecimento_id;
  
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
  ELSE
    v_data_validade := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::INT,
      EXTRACT(MONTH FROM v_data_nascimento)::INT,
      1
    ) + INTERVAL '1 month';
  END IF;
  
  v_codigo := generate_unique_coupon_code();
  
  INSERT INTO cupons (
    aniversariante_id, estabelecimento_id, codigo, data_validade, usado
  ) VALUES (
    p_aniversariante_id, p_estabelecimento_id, v_codigo, v_data_validade, false
  )
  RETURNING id INTO v_cupom_id;

  INSERT INTO cupom_rate_limit (
    aniversariante_id, estabelecimento_id, ultima_emissao, contador_semanal, semana_referencia
  ) VALUES (
    p_aniversariante_id, p_estabelecimento_id, NOW(), 1, v_semana_atual
  )
  ON CONFLICT (aniversariante_id, estabelecimento_id, semana_referencia)
  DO UPDATE SET
    ultima_emissao = NOW(),
    contador_semanal = cupom_rate_limit.contador_semanal + 1;
  
  RETURN QUERY SELECT v_cupom_id, v_codigo, NOW(), v_data_validade, NULL::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao emitir cupom: %', SQLERRM;
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, 
      NULL::TIMESTAMP WITH TIME ZONE, SQLERRM::TEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.use_coupon(p_codigo text, p_estabelecimento_id uuid)
RETURNS TABLE(success boolean, message text, cupom_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cupom RECORD;
BEGIN
  SELECT * INTO v_cupom
  FROM cupons
  WHERE codigo = p_codigo
  AND estabelecimento_id = p_estabelecimento_id
  FOR UPDATE;
  
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
  
  UPDATE cupons
  SET usado = true, data_uso = now()
  WHERE id = v_cupom.id;
  
  RETURN QUERY SELECT true, 'Cupom validado com sucesso'::TEXT,
                      jsonb_build_object('codigo', v_cupom.codigo, 'data_uso', now());
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao usar cupom: %', SQLERRM;
    RETURN QUERY SELECT false, 'Erro ao processar cupom'::TEXT, NULL::JSONB;
END;
$function$;

-- ==============================================================================
-- FUNÇÕES DE BIO E ESTABELECIMENTO
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.generate_establishment_bio(p_nome text, p_categoria text, p_bairro text, p_cidade text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_location TEXT;
  v_bio TEXT;
BEGIN
  v_location := COALESCE(NULLIF(p_bairro, ''), p_cidade, 'sua região');
  
  CASE COALESCE(p_categoria, 'Outros')
    WHEN 'Academia' THEN
      v_bio := COALESCE(p_nome, 'Academia') || ' é referência em fitness em ' || v_location || '. No seu aniversário, treine com benefícios exclusivos VIP!';
    WHEN 'Bar' THEN
      v_bio := 'O point obrigatório em ' || v_location || ' para celebrar. ' || COALESCE(p_nome, 'Bar') || ' oferece vantagens especiais para aniversariantes!';
    WHEN 'Barbearia' THEN
      v_bio := 'Estilo e atitude em ' || v_location || '. ' || COALESCE(p_nome, 'Barbearia') || ' cuida do seu visual com benefícios exclusivos no seu aniversário!';
    WHEN 'Cafeteria' THEN
      v_bio := 'Café especial e ambiente acolhedor em ' || v_location || '. ' || COALESCE(p_nome, 'Cafeteria') || ' celebra seu aniversário com você!';
    WHEN 'Casa Noturna' THEN
      v_bio := 'A noite é sua em ' || v_location || '! ' || COALESCE(p_nome, 'Casa Noturna') || ' oferece entrada VIP e benefícios exclusivos para aniversariantes!';
    WHEN 'Confeitaria' THEN
      v_bio := 'Doces momentos em ' || v_location || '. ' || COALESCE(p_nome, 'Confeitaria') || ' torna seu aniversário ainda mais especial!';
    WHEN 'Entretenimento' THEN
      v_bio := 'Diversão garantida em ' || v_location || '! ' || COALESCE(p_nome, 'Entretenimento') || ' tem surpresas especiais para aniversariantes!';
    WHEN 'Hospedagem' THEN
      v_bio := 'Conforto e exclusividade em ' || v_location || '. ' || COALESCE(p_nome, 'Hospedagem') || ' celebra seu aniversário com você!';
    WHEN 'Loja' THEN
      v_bio := COALESCE(p_nome, 'Loja') || ' em ' || v_location || ' tem ofertas imperdíveis para aniversariantes. Presenteie-se!';
    WHEN 'Restaurante' THEN
      v_bio := 'Experiência gastronômica de referência em ' || v_location || '. ' || COALESCE(p_nome, 'Restaurante') || ' celebra seu aniversário com sabor!';
    WHEN 'Salão de Beleza' THEN
      v_bio := 'Beleza e bem-estar em ' || v_location || '. ' || COALESCE(p_nome, 'Salão') || ' cuida de você com benefícios exclusivos no seu aniversário!';
    WHEN 'Saúde e Suplementos' THEN
      v_bio := 'Saúde e qualidade de vida em ' || v_location || '. ' || COALESCE(p_nome, 'Saúde') || ' oferece vantagens especiais para aniversariantes!';
    WHEN 'Serviços' THEN
      v_bio := COALESCE(p_nome, 'Serviços') || ' em ' || v_location || ' oferece atendimento VIP para aniversariantes. Aproveite!';
    WHEN 'Sorveteria' THEN
      v_bio := 'Sabores refrescantes em ' || v_location || '! ' || COALESCE(p_nome, 'Sorveteria') || ' adoça seu aniversário com benefícios exclusivos!';
    ELSE
      v_bio := COALESCE(p_nome, 'Estabelecimento') || ' em ' || v_location || ' tem benefícios exclusivos para aniversariantes. Venha celebrar!';
  END CASE;
  
  RETURN v_bio;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_generate_bio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.bio IS NULL OR TRIM(NEW.bio) = '' THEN
    NEW.bio := generate_establishment_bio(
      NEW.nome_fantasia,
      COALESCE((NEW.categoria)[1], 'Outros'),
      NEW.bairro,
      NEW.cidade
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- ==============================================================================
-- FUNÇÕES DE RATE LIMIT
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_limit integer, p_window_minutes integer)
RETURNS TABLE(allowed boolean, remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_window_expired BOOLEAN;
BEGIN
  SELECT count, window_start INTO v_current_count, v_window_start
  FROM public.rate_limits
  WHERE key = p_key;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (key, count, window_start)
    VALUES (p_key, 1, now());
    
    RETURN QUERY SELECT true AS allowed, (p_limit - 1) AS remaining;
    RETURN;
  END IF;

  v_window_expired := (now() - v_window_start) > (p_window_minutes || ' minutes')::INTERVAL;

  IF v_window_expired THEN
    UPDATE public.rate_limits
    SET count = 1, window_start = now()
    WHERE key = p_key;
    
    RETURN QUERY SELECT true AS allowed, (p_limit - 1) AS remaining;
    RETURN;
  END IF;

  IF v_current_count >= p_limit THEN
    RETURN QUERY SELECT false AS allowed, 0 AS remaining;
    RETURN;
  END IF;

  UPDATE public.rate_limits
  SET count = count + 1
  WHERE key = p_key;

  RETURN QUERY SELECT true AS allowed, (p_limit - v_current_count - 1) AS remaining;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$function$;

-- ==============================================================================
-- FUNÇÕES DE POST/STORY LIMITS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_daily_post_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  posts_today INTEGER;
BEGIN
  SELECT COUNT(*) INTO posts_today
  FROM public.posts
  WHERE establishment_id = NEW.establishment_id
    AND created_at >= CURRENT_DATE;
  
  IF posts_today >= 1 THEN
    RAISE EXCEPTION 'Limite diário atingido. Você já postou hoje! Volte amanhã para compartilhar mais conteúdo.';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_daily_story_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stories_today INTEGER;
BEGIN
  SELECT COUNT(*) INTO stories_today
  FROM public.stories
  WHERE establishment_id = NEW.establishment_id
    AND created_at >= CURRENT_DATE;
  
  IF stories_today >= 1 THEN
    RAISE EXCEPTION 'Limite diário atingido. Você já postou um Story hoje! Volte amanhã para postar novamente.';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'post_views' THEN
    UPDATE posts SET views_count = views_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_TABLE_NAME = 'post_shares' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- ==============================================================================
-- FUNÇÕES DE VIEWS MATERIALIZADAS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_estabelecimentos_populares;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_contagem_cidades;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_estabelecimentos_populares(p_cidade text DEFAULT NULL::text, p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, nome_fantasia text, slug text, categoria text[], especialidades text[], cidade text, estado text, bairro text, latitude numeric, longitude numeric, descricao_beneficio text, logo_url text, total_favoritos bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    mv.id, mv.nome_fantasia, mv.slug, mv.categoria, mv.especialidades,
    mv.cidade, mv.estado, mv.bairro, mv.latitude, mv.longitude,
    mv.descricao_beneficio, mv.logo_url, mv.total_favoritos
  FROM mv_estabelecimentos_populares mv
  WHERE (p_cidade IS NULL OR mv.cidade = p_cidade)
  ORDER BY mv.total_favoritos DESC
  LIMIT p_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_contagem_cidades()
RETURNS TABLE(cidade text, estado text, total_estabelecimentos bigint, restaurantes bigint, bares bigint, saloes bigint, academias bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    mv.cidade, mv.estado, mv.total_estabelecimentos,
    mv.restaurantes, mv.bares, mv.saloes, mv.academias
  FROM mv_contagem_cidades mv
  ORDER BY mv.total_estabelecimentos DESC;
END;
$function$;

-- ==============================================================================
-- FUNÇÃO DE SECURITY LOG
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_user_id uuid DEFAULT auth.uid(), p_metadata jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'info'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_logs (event_type, user_id, metadata, severity)
  VALUES (p_event_type, p_user_id, p_metadata, p_severity);
END;
$function$;

-- ==============================================================================
-- FUNÇÃO DE BIRTHDAY FORECAST
-- ==============================================================================

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
BEGIN
  IF p_cidade IS NULL OR p_estado IS NULL THEN
    RETURN json_build_object(
      'error', 'Cidade e estado são obrigatórios',
      'next_7_days', 0, 'next_30_days', 0, 'trend', '0%', 'status', 'unknown'
    );
  END IF;

  SELECT COUNT(*) INTO v_next_7_days
  FROM aniversariantes
  WHERE cidade = p_cidade AND estado = p_estado AND deleted_at IS NULL
    AND (EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento)) 
    BETWEEN (EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(DAY FROM CURRENT_DATE))
    AND (EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '7 days'), EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '7 days'));

  SELECT COUNT(*) INTO v_next_30_days
  FROM aniversariantes
  WHERE cidade = p_cidade AND estado = p_estado AND deleted_at IS NULL
    AND (EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento)) 
    BETWEEN (EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(DAY FROM CURRENT_DATE))
    AND (EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '30 days'), EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '30 days'));

  SELECT COUNT(*) INTO v_previous_7_days
  FROM aniversariantes
  WHERE cidade = p_cidade AND estado = p_estado AND deleted_at IS NULL
    AND (EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento)) 
    BETWEEN (EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '7 days'), EXTRACT(DAY FROM CURRENT_DATE - INTERVAL '7 days'))
    AND (EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 day'), EXTRACT(DAY FROM CURRENT_DATE - INTERVAL '1 day'));

  IF v_previous_7_days > 0 THEN
    v_trend_percentage := ((v_next_7_days - v_previous_7_days)::NUMERIC / v_previous_7_days::NUMERIC) * 100;
  ELSE
    IF v_next_7_days > 0 THEN v_trend_percentage := 100;
    ELSE v_trend_percentage := 0;
    END IF;
  END IF;

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

  v_result := json_build_object(
    'next_7_days', v_next_7_days, 'next_30_days', v_next_30_days,
    'trend', v_trend_direction, 'status', v_status,
    'previous_7_days', v_previous_7_days, 'cidade', p_cidade,
    'estado', p_estado, 'updated_at', NOW()
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro em get_birthday_forecast: %', SQLERRM;
    RETURN json_build_object(
      'error', SQLERRM, 'next_7_days', 0, 'next_30_days', 0, 'trend', '0%', 'status', 'error'
    );
END;
$function$;

-- ==============================================================================
-- FUNÇÃO DE UPSERT BULK
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.upsert_establishment_bulk(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSONB;
  v_id UUID;
BEGIN
  IF (p_data->>'cnpj') IS NOT NULL AND (p_data->>'cnpj')::TEXT != '' THEN
    INSERT INTO estabelecimentos (
      codigo, razao_social, nome_fantasia, cnpj, categoria, especialidades,
      telefone, whatsapp, endereco, cep, logradouro, numero, complemento, bairro,
      latitude, longitude, instagram, site, descricao_beneficio, periodo_validade_beneficio,
      regras_utilizacao, horario_funcionamento, logo_url, ativo, plan_status,
      cadastro_completo, tem_conta_acesso, cidade, estado
    )
    VALUES (
      (p_data->>'codigo')::TEXT,
      COALESCE((p_data->>'razao_social')::TEXT, 'Pendente de preenchimento'),
      COALESCE((p_data->>'nome_fantasia')::TEXT, 'Pendente de preenchimento'),
      (p_data->>'cnpj')::TEXT,
      CASE WHEN p_data->'categoria' IS NULL OR jsonb_typeof(p_data->'categoria') = 'null' 
        THEN '{}'::TEXT[] ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'categoria'))::TEXT[] END,
      CASE WHEN p_data->'especialidades' IS NULL OR jsonb_typeof(p_data->'especialidades') = 'null' 
        THEN '{}'::TEXT[] ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'especialidades'))::TEXT[] END,
      (p_data->>'telefone')::TEXT, (p_data->>'whatsapp')::TEXT, (p_data->>'endereco')::TEXT,
      (p_data->>'cep')::TEXT, (p_data->>'logradouro')::TEXT, (p_data->>'numero')::TEXT,
      (p_data->>'complemento')::TEXT, (p_data->>'bairro')::TEXT,
      (p_data->>'latitude')::NUMERIC, (p_data->>'longitude')::NUMERIC,
      (p_data->>'instagram')::TEXT, (p_data->>'site')::TEXT,
      (p_data->>'descricao_beneficio')::TEXT, (p_data->>'periodo_validade_beneficio')::TEXT,
      (p_data->>'regras_utilizacao')::TEXT, (p_data->>'horario_funcionamento')::TEXT,
      (p_data->>'logo_url')::TEXT, COALESCE((p_data->>'ativo')::BOOLEAN, true),
      COALESCE((p_data->>'plan_status')::TEXT, 'active'),
      COALESCE((p_data->>'cadastro_completo')::BOOLEAN, true),
      COALESCE((p_data->>'tem_conta_acesso')::BOOLEAN, false),
      (p_data->>'cidade')::TEXT, (p_data->>'estado')::TEXT
    )
    ON CONFLICT (cnpj) DO UPDATE SET
      codigo = COALESCE(EXCLUDED.codigo, estabelecimentos.codigo),
      razao_social = COALESCE(EXCLUDED.razao_social, 'Pendente de preenchimento'),
      nome_fantasia = COALESCE(EXCLUDED.nome_fantasia, 'Pendente de preenchimento'),
      categoria = EXCLUDED.categoria, especialidades = EXCLUDED.especialidades,
      telefone = EXCLUDED.telefone, whatsapp = EXCLUDED.whatsapp,
      endereco = EXCLUDED.endereco, cep = EXCLUDED.cep, logradouro = EXCLUDED.logradouro,
      numero = EXCLUDED.numero, complemento = EXCLUDED.complemento, bairro = EXCLUDED.bairro,
      latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
      instagram = EXCLUDED.instagram, site = EXCLUDED.site,
      descricao_beneficio = EXCLUDED.descricao_beneficio,
      periodo_validade_beneficio = EXCLUDED.periodo_validade_beneficio,
      regras_utilizacao = EXCLUDED.regras_utilizacao,
      horario_funcionamento = EXCLUDED.horario_funcionamento,
      logo_url = EXCLUDED.logo_url, ativo = EXCLUDED.ativo, plan_status = EXCLUDED.plan_status,
      cadastro_completo = EXCLUDED.cadastro_completo, tem_conta_acesso = EXCLUDED.tem_conta_acesso,
      cidade = EXCLUDED.cidade, estado = EXCLUDED.estado, updated_at = NOW()
    RETURNING id INTO v_id;
  ELSE
    INSERT INTO estabelecimentos (
      codigo, razao_social, nome_fantasia, cnpj, categoria, especialidades,
      telefone, whatsapp, endereco, cep, logradouro, numero, complemento, bairro,
      latitude, longitude, instagram, site, descricao_beneficio, periodo_validade_beneficio,
      regras_utilizacao, horario_funcionamento, logo_url, ativo, plan_status,
      cadastro_completo, tem_conta_acesso, cidade, estado
    )
    VALUES (
      (p_data->>'codigo')::TEXT,
      COALESCE((p_data->>'razao_social')::TEXT, 'Pendente de preenchimento'),
      COALESCE((p_data->>'nome_fantasia')::TEXT, 'Pendente de preenchimento'),
      NULL,
      CASE WHEN p_data->'categoria' IS NULL OR jsonb_typeof(p_data->'categoria') = 'null' 
        THEN '{}'::TEXT[] ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'categoria'))::TEXT[] END,
      CASE WHEN p_data->'especialidades' IS NULL OR jsonb_typeof(p_data->'especialidades') = 'null' 
        THEN '{}'::TEXT[] ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'especialidades'))::TEXT[] END,
      (p_data->>'telefone')::TEXT, (p_data->>'whatsapp')::TEXT, (p_data->>'endereco')::TEXT,
      (p_data->>'cep')::TEXT, (p_data->>'logradouro')::TEXT, (p_data->>'numero')::TEXT,
      (p_data->>'complemento')::TEXT, (p_data->>'bairro')::TEXT,
      (p_data->>'latitude')::NUMERIC, (p_data->>'longitude')::NUMERIC,
      (p_data->>'instagram')::TEXT, (p_data->>'site')::TEXT,
      (p_data->>'descricao_beneficio')::TEXT, (p_data->>'periodo_validade_beneficio')::TEXT,
      (p_data->>'regras_utilizacao')::TEXT, (p_data->>'horario_funcionamento')::TEXT,
      (p_data->>'logo_url')::TEXT, COALESCE((p_data->>'ativo')::BOOLEAN, true),
      COALESCE((p_data->>'plan_status')::TEXT, 'active'),
      COALESCE((p_data->>'cadastro_completo')::BOOLEAN, true),
      COALESCE((p_data->>'tem_conta_acesso')::BOOLEAN, false),
      (p_data->>'cidade')::TEXT, (p_data->>'estado')::TEXT
    )
    RETURNING id INTO v_id;
  END IF;
  
  v_result := jsonb_build_object('success', true, 'id', v_id, 'message', 'Estabelecimento inserido/atualizado com sucesso');
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    v_result := jsonb_build_object('success', false, 'error', SQLERRM, 'message', 'Erro ao processar estabelecimento');
    RETURN v_result;
END;
$function$;

-- ==============================================================================
-- CRIAR TRIGGERS
-- ==============================================================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aniversariantes_updated_at
  BEFORE UPDATE ON public.aniversariantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estabelecimentos_updated_at
  BEFORE UPDATE ON public.estabelecimentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para gerar slug automaticamente
CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT OR UPDATE ON public.estabelecimentos
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_slug();

-- Trigger para gerar bio automaticamente
CREATE TRIGGER trigger_generate_bio
  BEFORE INSERT OR UPDATE ON public.estabelecimentos
  FOR EACH ROW EXECUTE FUNCTION public.trigger_generate_bio();

-- Triggers para limites diários
CREATE TRIGGER check_daily_post_limit_trigger
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.check_daily_post_limit();

CREATE TRIGGER check_daily_story_limit_trigger
  BEFORE INSERT ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.check_daily_story_limit();

-- Triggers para contadores de posts
CREATE TRIGGER update_post_views_counter
  AFTER INSERT ON public.post_views
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counters();

CREATE TRIGGER update_post_shares_counter
  AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counters();

COMMIT;
