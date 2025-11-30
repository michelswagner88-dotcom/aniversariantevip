import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Origem não autorizada' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { rua, numero, bairro, cidade, estado } = await req.json();
    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
    
    if (!apiKey) {
      console.error('VITE_GOOGLE_MAPS_API_KEY não configurada');
      return new Response(
        JSON.stringify({ success: false, error: 'API Key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Montar endereço completo
    const partes = [];
    if (rua) partes.push(rua);
    if (numero) partes.push(numero);
    if (bairro) partes.push(bairro);
    if (cidade) partes.push(cidade);
    if (estado) partes.push(estado);
    partes.push('Brasil');
    
    const endereco = partes.join(', ');
    
    console.log('[Geocode] Geocodificando:', endereco);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&key=${apiKey}&language=pt-BR&region=br`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('[Geocode] Status:', data.status);
    
    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      return new Response(
        JSON.stringify({
          success: true,
          latitude: data.results[0].geometry.location.lat,
          longitude: data.results[0].geometry.location.lng,
          endereco_formatado: data.results[0].formatted_address,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fallback: tentar só com cidade + estado
    if (cidade && estado) {
      const enderecoSimples = `${cidade}, ${estado}, Brasil`;
      console.log('[Geocode] Tentando fallback:', enderecoSimples);
      
      const urlFallback = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoSimples)}&key=${apiKey}&language=pt-BR&region=br`;
      const responseFallback = await fetch(urlFallback);
      const dataFallback = await responseFallback.json();
      
      if (dataFallback.status === 'OK' && dataFallback.results?.[0]?.geometry?.location) {
        console.log('[Geocode] Fallback sucesso - usando centro da cidade');
        return new Response(
          JSON.stringify({
            success: true,
            latitude: dataFallback.results[0].geometry.location.lat,
            longitude: dataFallback.results[0].geometry.location.lng,
            endereco_formatado: dataFallback.results[0].formatted_address,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.warn('[Geocode] Falha:', data.status);
    return new Response(
      JSON.stringify({ success: false, error: data.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Geocode] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
