import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizarCodigoCupom } from "../_shared/sanitize.ts";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    return new Response(
      JSON.stringify({ error: "Origem não autorizada" }),
      { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autenticação não fornecido");
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se usuário é estabelecimento
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'estabelecimento')
      .single();

    if (!roles) {
      throw new Error("Apenas estabelecimentos podem validar cupons");
    }

    const { codigo } = await req.json();
    
    if (!codigo || typeof codigo !== 'string') {
      throw new Error("Código do cupom é obrigatório");
    }

    // Sanitizar código do cupom
    const codigoSanitizado = sanitizarCodigoCupom(codigo);
    console.log(`Validando cupom: ${codigoSanitizado} - Estabelecimento: ${user.id}`);

    // Chamar função do banco que faz validação com lock
    const { data: result, error: validateError } = await supabase
      .rpc('use_coupon', {
        p_codigo: codigoSanitizado,
        p_estabelecimento_id: user.id
      });

    if (validateError) {
      throw validateError;
    }

    if (!result || result.length === 0) {
      throw new Error("Erro ao processar cupom");
    }

    const validationResult = result[0];

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: validationResult.message,
          data: validationResult.cupom_data
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Cupom ${codigoSanitizado} validado com sucesso`);

    // Registrar analytics (fire and forget - sem await para não bloquear)
    supabase
      .from('estabelecimento_analytics')
      .insert({
        estabelecimento_id: user.id,
        tipo_evento: 'cupom_utilizado',
        metadata: { codigo }
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: validationResult.message,
        data: validationResult.cupom_data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Erro ao validar cupom:", error);
    
    const errorMessage = error.message || "Erro ao processar solicitação";
    const statusCode = error.message?.includes("autenticado") ? 401 : 500;

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: Deno.env.get("ENVIRONMENT") === "development" ? error.stack : undefined
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
