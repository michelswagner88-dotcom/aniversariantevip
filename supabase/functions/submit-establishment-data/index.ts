import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    // Validar campos obrigatórios
    const requiredFields = ['cnpj', 'razao_social', 'nome_fantasia', 'endereco', 'cep', 'cidade', 'estado', 'categoria'];
    for (const field of requiredFields) {
      if (!establishmentData[field]) {
        throw new Error(`Campo obrigatório faltando: ${field}`);
      }
    }

    // Verificar se CNPJ já existe
    const { data: existingEstablishment } = await supabaseClient
      .from('estabelecimentos')
      .select('id')
      .eq('cnpj', establishmentData.cnpj)
      .single();

    if (existingEstablishment) {
      throw new Error('CNPJ já cadastrado no sistema');
    }

    // Processar referral se existir
    let referredByUserId = null;
    if (establishmentData.referral_code) {
      const { data: referrer } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('id', establishmentData.referral_code)
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
        cnpj: establishmentData.cnpj,
        razao_social: establishmentData.razao_social,
        nome_fantasia: establishmentData.nome_fantasia,
        telefone: establishmentData.phoneFixed || null,
        whatsapp: establishmentData.phoneWhatsapp || null,
        endereco: establishmentData.endereco,
        logradouro: establishmentData.logradouro || null,
        numero: establishmentData.numero || null,
        complemento: establishmentData.complemento || null,
        bairro: establishmentData.bairro || null,
        cep: establishmentData.cep,
        cidade: establishmentData.cidade,
        estado: establishmentData.estado,
        latitude: establishmentData.latitude || null,
        longitude: establishmentData.longitude || null,
        categoria: establishmentData.categoria,
        descricao_beneficio: establishmentData.descricao_beneficio || null,
        regras_utilizacao: establishmentData.regras_utilizacao || null,
        periodo_validade_beneficio: establishmentData.periodo_validade_beneficio || 'mes_aniversario',
        horario_funcionamento: establishmentData.horario_funcionamento || null,
        instagram: establishmentData.instagram || null,
        site: establishmentData.site || null,
        logo_url: establishmentData.logo_url || null,
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
