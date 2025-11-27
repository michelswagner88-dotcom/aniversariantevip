import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { nome, endereco, cidade, estado } = await req.json();
    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      throw new Error('Google Maps API Key não configurada');
    }

    console.log(`🔍 Buscando foto para: ${nome} em ${cidade}-${estado}`);

    // Montar query de busca
    const searchQuery = `${nome} ${endereco || ''} ${cidade} ${estado}`.trim();
    const encodedQuery = encodeURIComponent(searchQuery);

    // 1. Buscar Place usando Text Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${apiKey}`;
    
    console.log(`📡 Chamando Google Places API...`);
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      console.log(`❌ Estabelecimento não encontrado no Google Places`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Estabelecimento não encontrado no Google Places' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const place = searchData.results[0];
    console.log(`✅ Place encontrado: ${place.name}`);

    // 2. Verificar se tem fotos
    if (!place.photos || place.photos.length === 0) {
      console.log(`⚠️ Place encontrado mas sem fotos disponíveis`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Nenhuma foto disponível para este estabelecimento' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 3. Pegar referência da primeira foto
    const photoReference = place.photos[0].photo_reference;
    
    // 4. Gerar URL da foto em alta qualidade (maxwidth 800)
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;
    
    console.log(`📸 Foto encontrada e URL gerada`);

    return new Response(
      JSON.stringify({ 
        success: true,
        photo_url: photoUrl,
        place_id: place.place_id,
        place_name: place.name,
        formatted_address: place.formatted_address,
        rating: place.rating || null,
        user_ratings_total: place.user_ratings_total || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao buscar foto:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
