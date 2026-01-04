import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";
import { sanitizeAddress, logSecurityEvent } from "../_shared/validation.ts";
import { checkRateLimit, getRequestIdentifier, rateLimitExceededResponse } from "../_shared/rateLimit.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    logSecurityEvent('geocode_blocked_origin', { 
      origin: req.headers.get('origin') 
    }, 'warn');
    return new Response(
      JSON.stringify({ success: false, error: 'Origem não autorizada' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Rate limiting: 30 requisições por hora por IP
  const identifier = getRequestIdentifier(req);
  const { allowed, remaining } = await checkRateLimit(
    supabaseUrl,
    supabaseServiceKey,
    identifier,
    { limit: 30, windowMinutes: 60, keyPrefix: "geocode" }
  );

  if (!allowed) {
    logSecurityEvent('geocode_rate_limited', { identifier }, 'warn');
    return rateLimitExceededResponse(remaining);
  }

  try {
    const { endereco: rawEndereco } = await req.json();
    
    // VALIDAÇÃO: Endereço obrigatório e sanitizado
    if (!rawEndereco || typeof rawEndereco !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Endereço é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const endereco = sanitizeAddress(rawEndereco, 300);
    if (!endereco) {
      logSecurityEvent('geocode_invalid_address', { 
        endereco: rawEndereco.substring(0, 50) 
      }, 'warn');
      return new Response(
        JSON.stringify({ success: false, error: 'Endereço inválido ou muito longo (máximo 300 caracteres)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
    
    if (!apiKey) {
      console.error('VITE_GOOGLE_MAPS_API_KEY não configurada');
      return new Response(
        JSON.stringify({ success: false, error: 'API Key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Adicionar ", Brasil" se não tiver
    let enderecoCompleto = endereco.trim();
    if (!enderecoCompleto.toLowerCase().includes('brasil')) {
      enderecoCompleto = `${enderecoCompleto}, Brasil`;
    }
    
    console.log('[Geocode] Geocodificando:', enderecoCompleto);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoCompleto)}&key=${apiKey}&language=pt-BR&region=br`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('[Geocode] Status:', data.status);
    
    // Tratar erros específicos da API
    if (data.status === 'ZERO_RESULTS') {
      return new Response(
        JSON.stringify({ success: false, error: 'Endereço não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('[Geocode] Limite de requisições excedido');
      return new Response(
        JSON.stringify({ success: false, error: 'Limite de requisições excedido. Tente novamente mais tarde.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('[Geocode] Requisição negada:', data.error_message);
      return new Response(
        JSON.stringify({ success: false, error: 'Serviço de geocodificação indisponível' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      const location = data.results[0].geometry.location;
      return new Response(
        JSON.stringify({
          success: true,
          lat: location.lat,
          lng: location.lng,
          formatted_address: data.results[0].formatted_address,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.warn('[Geocode] Resposta inesperada:', data.status);
    return new Response(
      JSON.stringify({ success: false, error: `Erro na geocodificação: ${data.status}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Geocode] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
