import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { sanitizarInput, sanitizarEmail } from "../_shared/sanitize.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[SUBMIT-ESTABLISHMENT] ${step}`, details || '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Receber dados do estabelecimento
    const establishmentData = await req.json();
    logStep("Received establishment data", { cnpj: establishmentData.cnpj });

    // Sanitizar todos os campos de texto
    const dadosSanitizados = {
      ...establishmentData,
      razao_social: sanitizarInput(establishmentData.razao_social, 200),
      nome_fantasia: sanitizarInput(establishmentData.nome_fantasia, 200),
      endereco: sanitizarInput(establishmentData.endereco, 300),
      logradouro: establishmentData.logradouro ? sanitizarInput(establishmentData.logradouro, 200) : null,
      complemento: establishmentData.complemento ? sanitizarInput(establishmentData.complemento, 100) : null,
      bairro: establishmentData.bairro ? sanitizarInput(establishmentData.bairro, 100) : null,
      cidade: sanitizarInput(establishmentData.cidade, 100),
      estado: sanitizarInput(establishmentData.estado, 2),
      descricao_beneficio: establishmentData.descricao_beneficio ? sanitizarInput(establishmentData.descricao_beneficio, 500) : null,
      regras_utilizacao: establishmentData.regras_utilizacao ? sanitizarInput(establishmentData.regras_utilizacao, 500) : null,
      instagram: establishmentData.instagram ? sanitizarInput(establishmentData.instagram, 100) : null,
      site: establishmentData.site ? sanitizarInput(establishmentData.site, 200) : null,
    };

    // Validar campos obrigatórios
    const requiredFields = ['cnpj', 'razao_social', 'nome_fantasia', 'endereco', 'cep', 'cidade', 'estado', 'categoria'];
    for (const field of requiredFields) {
      if (!dadosSanitizados[field]) {
        throw new Error(`Campo obrigatório faltando: ${field}`);
      }
    }

    // Verificar se CNPJ já existe
    const { data: existingEstablishment } = await supabaseClient
      .from('estabelecimentos')
      .select('id')
      .eq('cnpj', dadosSanitizados.cnpj)
      .single();

    if (existingEstablishment) {
      throw new Error('CNPJ já cadastrado no sistema');
    }

    // Processar referral se existir
    let referredByUserId = null;
    if (dadosSanitizados.referral_code) {
      const { data: referrer } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('id', dadosSanitizados.referral_code)
        .single();
      
      if (referrer) {
        referredByUserId = referrer.id;
        logStep("Referral code valid", { referrerId: referredByUserId });
      }
    }

    // Inserir estabelecimento
    const { data: newEstablishment, error: insertError } = await supabaseClient
      .from('estabelecimentos')
      .insert({
        id: user.id,
        cnpj: dadosSanitizados.cnpj,
        razao_social: dadosSanitizados.razao_social,
        nome_fantasia: dadosSanitizados.nome_fantasia,
        telefone: dadosSanitizados.phoneFixed || null,
        whatsapp: dadosSanitizados.phoneWhatsapp || null,
        endereco: dadosSanitizados.endereco,
        logradouro: dadosSanitizados.logradouro || null,
        numero: dadosSanitizados.numero || null,
        complemento: dadosSanitizados.complemento || null,
        bairro: dadosSanitizados.bairro || null,
        cep: dadosSanitizados.cep,
        cidade: dadosSanitizados.cidade,
        estado: dadosSanitizados.estado,
        latitude: dadosSanitizados.latitude || null,
        longitude: dadosSanitizados.longitude || null,
        categoria: dadosSanitizados.categoria,
        descricao_beneficio: dadosSanitizados.descricao_beneficio || null,
        regras_utilizacao: dadosSanitizados.regras_utilizacao || null,
        periodo_validade_beneficio: dadosSanitizados.periodo_validade_beneficio || 'mes_aniversario',
        horario_funcionamento: dadosSanitizados.horario_funcionamento || null,
        instagram: dadosSanitizados.instagram || null,
        site: dadosSanitizados.site || null,
        logo_url: dadosSanitizados.logo_url || null,
        referred_by_user_id: referredByUserId,
        plan_status: 'pending',
        tem_conta_acesso: true,
      })
      .select()
      .single();

    if (insertError) {
      logStep("ERROR inserting establishment", { error: insertError });
      throw new Error(`Erro ao cadastrar estabelecimento: ${insertError.message}`);
    }

    logStep("Establishment created successfully", { id: newEstablishment.id });

    // Criar role de estabelecimento para o usuário
    await supabaseClient
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'estabelecimento'
      });

    logStep("User role created");

    return new Response(
      JSON.stringify({ 
        success: true, 
        establishmentId: newEstablishment.id,
        message: 'Estabelecimento cadastrado com sucesso'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
