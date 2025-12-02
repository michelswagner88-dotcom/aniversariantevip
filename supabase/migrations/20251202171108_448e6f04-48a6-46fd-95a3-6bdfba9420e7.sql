-- Atualizar função de upsert para suportar o campo codigo
CREATE OR REPLACE FUNCTION public.upsert_establishment_bulk(p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_result JSONB;
  v_id UUID;
BEGIN
  -- Fazer upsert baseado no CNPJ (se existir) ou insert direto
  IF (p_data->>'cnpj') IS NOT NULL AND (p_data->>'cnpj')::TEXT != '' THEN
    INSERT INTO estabelecimentos (
      codigo,
      razao_social,
      nome_fantasia,
      cnpj,
      categoria,
      especialidades,
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
      regras_utilizacao,
      horario_funcionamento,
      logo_url,
      ativo,
      plan_status,
      cadastro_completo,
      tem_conta_acesso,
      cidade,
      estado
    )
    VALUES (
      (p_data->>'codigo')::TEXT,
      COALESCE((p_data->>'razao_social')::TEXT, 'Pendente de preenchimento'),
      COALESCE((p_data->>'nome_fantasia')::TEXT, 'Pendente de preenchimento'),
      (p_data->>'cnpj')::TEXT,
      CASE 
        WHEN p_data->'categoria' IS NULL OR jsonb_typeof(p_data->'categoria') = 'null' 
        THEN '{}'::TEXT[]
        ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'categoria'))::TEXT[]
      END,
      CASE 
        WHEN p_data->'especialidades' IS NULL OR jsonb_typeof(p_data->'especialidades') = 'null' 
        THEN '{}'::TEXT[]
        ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'especialidades'))::TEXT[]
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
      (p_data->>'regras_utilizacao')::TEXT,
      (p_data->>'horario_funcionamento')::TEXT,
      (p_data->>'logo_url')::TEXT,
      COALESCE((p_data->>'ativo')::BOOLEAN, true),
      COALESCE((p_data->>'plan_status')::TEXT, 'active'),
      COALESCE((p_data->>'cadastro_completo')::BOOLEAN, true),
      COALESCE((p_data->>'tem_conta_acesso')::BOOLEAN, false),
      (p_data->>'cidade')::TEXT,
      (p_data->>'estado')::TEXT
    )
    ON CONFLICT (cnpj) 
    DO UPDATE SET
      codigo = COALESCE(EXCLUDED.codigo, estabelecimentos.codigo),
      razao_social = COALESCE(EXCLUDED.razao_social, 'Pendente de preenchimento'),
      nome_fantasia = COALESCE(EXCLUDED.nome_fantasia, 'Pendente de preenchimento'),
      categoria = EXCLUDED.categoria,
      especialidades = EXCLUDED.especialidades,
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
      regras_utilizacao = EXCLUDED.regras_utilizacao,
      horario_funcionamento = EXCLUDED.horario_funcionamento,
      logo_url = EXCLUDED.logo_url,
      ativo = EXCLUDED.ativo,
      plan_status = EXCLUDED.plan_status,
      cadastro_completo = EXCLUDED.cadastro_completo,
      tem_conta_acesso = EXCLUDED.tem_conta_acesso,
      cidade = EXCLUDED.cidade,
      estado = EXCLUDED.estado,
      updated_at = NOW()
    RETURNING id INTO v_id;
  ELSE
    -- Sem CNPJ: insert direto com codigo único
    INSERT INTO estabelecimentos (
      codigo,
      razao_social,
      nome_fantasia,
      cnpj,
      categoria,
      especialidades,
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
      regras_utilizacao,
      horario_funcionamento,
      logo_url,
      ativo,
      plan_status,
      cadastro_completo,
      tem_conta_acesso,
      cidade,
      estado
    )
    VALUES (
      (p_data->>'codigo')::TEXT,
      COALESCE((p_data->>'razao_social')::TEXT, 'Pendente de preenchimento'),
      COALESCE((p_data->>'nome_fantasia')::TEXT, 'Pendente de preenchimento'),
      NULL,
      CASE 
        WHEN p_data->'categoria' IS NULL OR jsonb_typeof(p_data->'categoria') = 'null' 
        THEN '{}'::TEXT[]
        ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'categoria'))::TEXT[]
      END,
      CASE 
        WHEN p_data->'especialidades' IS NULL OR jsonb_typeof(p_data->'especialidades') = 'null' 
        THEN '{}'::TEXT[]
        ELSE ARRAY(SELECT jsonb_array_elements_text(p_data->'especialidades'))::TEXT[]
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
      (p_data->>'regras_utilizacao')::TEXT,
      (p_data->>'horario_funcionamento')::TEXT,
      (p_data->>'logo_url')::TEXT,
      COALESCE((p_data->>'ativo')::BOOLEAN, true),
      COALESCE((p_data->>'plan_status')::TEXT, 'active'),
      COALESCE((p_data->>'cadastro_completo')::BOOLEAN, true),
      COALESCE((p_data->>'tem_conta_acesso')::BOOLEAN, false),
      (p_data->>'cidade')::TEXT,
      (p_data->>'estado')::TEXT
    )
    RETURNING id INTO v_id;
  END IF;
  
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
$$;