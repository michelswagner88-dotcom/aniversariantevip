import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { establishmentId, establishmentName, address } = await req.json();

    if (!establishmentId || !establishmentName || !address) {
      return new Response(
        JSON.stringify({ error: 'ID, nome do estabelecimento e endereço são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cliente com service_role para UPDATE no banco
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verificar se já existe cache no banco
    const { data: existing } = await supabase
      .from('estabelecimentos')
      .select('galeria_fotos')
      .eq('id', establishmentId)
      .single();

    if (existing?.galeria_fotos && existing.galeria_fotos.length > 0) {
      console.log(`✅ Cache encontrado: ${existing.galeria_fotos.length} fotos`);
      return new Response(
        JSON.stringify({ photos: existing.galeria_fotos, cached: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Buscar Place usando Text Search
    const searchQuery = `${establishmentName} ${address}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.results?.[0]) {
      console.warn('Nenhum resultado encontrado:', searchData.status);
      return new Response(
        JSON.stringify({ photos: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const place = searchData.results[0];
    const photos = place.photos || [];

    if (photos.length === 0) {
      return new Response(
        JSON.stringify({ photos: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Download e upload para Supabase Storage
    const uploadedUrls: string[] = [];
    const photosToProcess = photos.slice(0, 5);

    for (let i = 0; i < photosToProcess.length; i++) {
      try {
        const photoRef = photosToProcess[i].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoRef}&key=${apiKey}`;
        
        // Download da imagem
        const imageResponse = await fetch(photoUrl);
        if (!imageResponse.ok) continue;
        
        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Upload para Storage
        const fileName = `${establishmentId}/${Date.now()}-${i}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('establishment-photos')
          .upload(fileName, uint8Array, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error(`Erro ao fazer upload da foto ${i}:`, uploadError);
          continue;
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('establishment-photos')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
        console.log(`✅ Foto ${i + 1} salva: ${fileName}`);
        
      } catch (error) {
        console.error(`Erro ao processar foto ${i}:`, error);
      }
    }

    // 3. Salvar URLs no banco (cache permanente)
    if (uploadedUrls.length > 0) {
      const { error: updateError } = await supabase
        .from('estabelecimentos')
        .update({ galeria_fotos: uploadedUrls })
        .eq('id', establishmentId);

      if (updateError) {
        console.error('Erro ao salvar cache no banco:', updateError);
      } else {
        console.log(`✅ ${uploadedUrls.length} fotos salvas no cache para ${establishmentName}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        photos: uploadedUrls, 
        cached: false,
        source: 'google_places'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao buscar fotos do Google Places:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage, photos: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
