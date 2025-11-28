-- Atualizar função upsert_establishment_bulk para aceitar campos vazios com segurança

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
  -- Fazer upsert baseado no CNPJ
  INSERT INTO estabelecimentos (
    razao_social,
    nome_fantasia,
    cnpj,
    categoria,
    telefone,
    whatsapp,
    endereco,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    latitude,
    longitude,
    instagram,
    site,
    descricao_beneficio,
    periodo_validade_beneficio,
    logo_url,
    ativo,
    plan_status,
    cidade,
    estado
  )
  VALUES (
    COALESCE((p_data->>'razao_social')::TEXT, 'Pendente de preenchimento'),
    COALESCE((p_data->>'nome_fantasia')::TEXT, 'Pendente de preenchimento'),
    (p_data->>'cnpj')::TEXT,
    CASE 
      WHEN p_data->'categoria' IS NULL OR jsonb_typeof(p_data->'categoria') = 'null' 
      THEN '{}'::TEXT[]
      ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'categoria'))::TEXT[]
    END,
    (p_data->>'telefone')::TEXT,
    (p_data->>'whatsapp')::TEXT,
    (p_data->>'endereco')::TEXT,
    (p_data->>'cep')::TEXT,
    (p_data->>'logradouro')::TEXT,
    (p_data->>'numero')::TEXT,
    (p_data->>'complemento')::TEXT,
    (p_data->>'bairro')::TEXT,
    (p_data->>'latitude')::NUMERIC,
    (p_data->>'longitude')::NUMERIC,
    (p_data->>'instagram')::TEXT,
    (p_data->>'site')::TEXT,
    (p_data->>'descricao_beneficio')::TEXT,
    (p_data->>'periodo_validade_beneficio')::TEXT,
    (p_data->>'logo_url')::TEXT,
    COALESCE((p_data->>'ativo')::BOOLEAN, true),
    COALESCE((p_data->>'plan_status')::TEXT, 'active'),
    (p_data->>'cidade')::TEXT,
    (p_data->>'estado')::TEXT
  )
  ON CONFLICT (cnpj) 
  DO UPDATE SET
    razao_social = COALESCE(EXCLUDED.razao_social, 'Pendente de preenchimento'),
    nome_fantasia = COALESCE(EXCLUDED.nome_fantasia, 'Pendente de preenchimento'),
    categoria = EXCLUDED.categoria,
    telefone = EXCLUDED.telefone,
    whatsapp = EXCLUDED.whatsapp,
    endereco = EXCLUDED.endereco,
    cep = EXCLUDED.cep,
    logradouro = EXCLUDED.logradouro,
    numero = EXCLUDED.numero,
    complemento = EXCLUDED.complemento,
    bairro = EXCLUDED.bairro,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    instagram = EXCLUDED.instagram,
    site = EXCLUDED.site,
    descricao_beneficio = EXCLUDED.descricao_beneficio,
    periodo_validade_beneficio = EXCLUDED.periodo_validade_beneficio,
    logo_url = EXCLUDED.logo_url,
    ativo = EXCLUDED.ativo,
    plan_status = EXCLUDED.plan_status,
    cidade = EXCLUDED.cidade,
    estado = EXCLUDED.estado,
    updated_at = NOW()
  RETURNING id INTO v_id;
  
  -- Retornar sucesso com o ID
  v_result := jsonb_build_object(
    'success', true,
    'id', v_id,
    'message', 'Estabelecimento inserido/atualizado com sucesso'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Retornar erro
    v_result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erro ao processar estabelecimento'
    );
    RETURN v_result;
END;
$function$;