import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Cache simples em memória para rate limiting
const requestCache = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 10; // requisições
const RATE_WINDOW = 60000; // 1 minuto

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userCache = requestCache.get(userId);
  
  if (!userCache || now - userCache.timestamp > RATE_WINDOW) {
    requestCache.set(userId, { count: 1, timestamp: now });
    return true;
  }
  
  if (userCache.count >= RATE_LIMIT) {
    return false;
  }
  
  userCache.count++;
  return true;
}

// Limpar cache antigo periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > RATE_WINDOW) {
      requestCache.delete(key);
    }
  }
}, 60000);

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

  let supabase;
  
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autenticação não fornecido");
    }

    // Criar cliente com token do usuário
    const token = authHeader.replace("Bearer ", "");
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ 
          error: "Limite de requisições excedido. Tente novamente em alguns minutos." 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { estabelecimento_id } = await req.json();
    
    if (!estabelecimento_id) {
      throw new Error("ID do estabelecimento é obrigatório");
    }

    console.log(`Emitindo cupom - User: ${user.id}, Estabelecimento: ${estabelecimento_id}`);

    // Verificar se usuário é aniversariante
    const { data: anivData, error: anivError } = await supabase
      .from('aniversariantes')
      .select('id, data_nascimento')
      .eq('id', user.id)
      .single();

    if (anivError || !anivData) {
      throw new Error("Você precisa ser um aniversariante cadastrado");
    }

    // Verificar se já existe cupom ativo
    const { data: existingCoupon } = await supabase
      .from('cupons')
      .select('id, codigo, data_validade')
      .eq('aniversariante_id', user.id)
      .eq('estabelecimento_id', estabelecimento_id)
      .eq('usado', false)
      .gte('data_validade', new Date().toISOString())
      .single();

    if (existingCoupon) {
      console.log(`Cupom existente encontrado: ${existingCoupon.codigo}`);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Você já possui um cupom ativo para este estabelecimento",
          cupom: existingCoupon,
          already_exists: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Chamar função do banco para emitir cupom (com todas as validações e locks)
    const { data: result, error: emitError } = await supabase
      .rpc('emit_coupon', {
        p_aniversariante_id: user.id,
        p_estabelecimento_id: estabelecimento_id
      });

    if (emitError) {
      throw emitError;
    }

    if (!result || result.length === 0 || result[0].error_message) {
      throw new Error(result?.[0]?.error_message || "Erro ao emitir cupom");
    }

    const cupomData = result[0];
    
    console.log(`Cupom emitido com sucesso: ${cupomData.codigo}`);

    // Registrar analytics (fire and forget - sem await para não bloquear)
    supabase
      .from('estabelecimento_analytics')
      .insert({
        estabelecimento_id,
        user_id: user.id,
        tipo_evento: 'cupom_emitido',
        metadata: { codigo: cupomData.codigo }
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Cupom emitido com sucesso!",
        cupom: {
          id: cupomData.cupom_id,
          codigo: cupomData.codigo,
          data_emissao: cupomData.data_emissao,
          data_validade: cupomData.data_validade
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Erro ao emitir cupom:", error);
    
    const errorMessage = error.message || "Erro ao processar solicitação";
    const statusCode = error.message?.includes("autenticado") ? 401 : 500;

    return new Response(
      JSON.stringify({ 
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
