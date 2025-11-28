import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    return new Response(
      JSON.stringify({ error: 'Origem não autorizada' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { latitude, longitude } = await req.json();

    // Validar parâmetros
    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude e longitude são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate Limiting: 30 requests por hora por IP
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitKey = `reverse-geocode:${clientIP}`;

    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_key: rateLimitKey,
        p_limit: 30,
        p_window_minutes: 60
      });

    if (rateLimitError) {
      console.error('Erro ao verificar rate limit:', rateLimitError);
    } else if (rateLimitData && rateLimitData.length > 0 && !rateLimitData[0].allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
          remaining: 0
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar API Key do Google Maps
    const googleMapsApiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
    
    if (!googleMapsApiKey) {
      console.error('❌ VITE_GOOGLE_MAPS_API_KEY não configurada nos secrets');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📍 Fazendo reverse geocoding para:', { latitude, longitude });

    // Chamar Google Maps Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}&language=pt-BR`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API do Google Maps: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📦 Status da resposta:', data.status);
    
    if (data.status !== 'OK' || !data.results?.length) {
      return new Response(
        JSON.stringify({ 
          error: `Geocoding falhou: ${data.status}`,
          details: data.error_message || 'Não foi possível identificar a localização'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = data.results[0];
    let cidade = '';
    let estado = '';
    
    // Extrair cidade e estado dos componentes do endereço
    for (const component of result.address_components) {
      if (component.types.includes('administrative_area_level_2')) {
        cidade = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        estado = component.short_name;
      }
    }
    
    // Fallback: tentar locality para cidade
    if (!cidade) {
      for (const component of result.address_components) {
        if (component.types.includes('locality')) {
          cidade = component.long_name;
        }
      }
    }
    
    if (!cidade || !estado) {
      return new Response(
        JSON.stringify({ 
          error: 'Não foi possível extrair cidade/estado dos resultados',
          raw_data: result.address_components
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ Localização identificada:', { cidade, estado });
    
    return new Response(
      JSON.stringify({ 
        cidade, 
        estado,
        coordinates: { latitude, longitude }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro em reverse-geocode:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: 'Erro ao processar geocoding reverso'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
