import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  identifier: string; // email ou IP
  action: 'login' | 'signup';
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5, // 5 tentativas
    windowMinutes: 15, // em 15 minutos
    blockDurationMinutes: 30, // bloqueia por 30 minutos
  },
  signup: {
    maxAttempts: 3, // 3 tentativas
    windowMinutes: 60, // em 1 hora
    blockDurationMinutes: 60, // bloqueia por 1 hora
  },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { identifier, action }: RateLimitRequest = await req.json();

    if (!identifier || !action) {
      return new Response(
        JSON.stringify({ 
          error: 'Parâmetros obrigatórios: identifier, action' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = RATE_LIMITS[action];
    if (!config) {
      return new Response(
        JSON.stringify({ error: 'Ação inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rateLimitKey = `auth:${action}:${identifier.toLowerCase()}`;

    console.log(`🔒 Verificando rate limit para: ${rateLimitKey}`);

    // Chamar função do banco para verificar rate limit
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: rateLimitKey,
      p_limit: config.maxAttempts,
      p_window_minutes: config.windowMinutes,
    });

    if (error) {
      console.error('Erro ao verificar rate limit:', error);
      throw error;
    }

    const result = data[0];
    
    if (!result.allowed) {
      console.log(`❌ Rate limit excedido para: ${rateLimitKey}`);
      
      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          retryAfter: config.blockDurationMinutes,
          message: action === 'login' 
            ? `Muitas tentativas de login. Aguarde ${config.blockDurationMinutes} minutos e tente novamente.`
            : `Muitas tentativas de cadastro. Aguarde ${config.blockDurationMinutes} minutos e tente novamente.`,
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(config.blockDurationMinutes * 60),
          } 
        }
      );
    }

    console.log(`✅ Rate limit OK. Tentativas restantes: ${result.remaining}`);

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: result.remaining,
        maxAttempts: config.maxAttempts,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na edge function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno ao verificar limite de tentativas',
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
