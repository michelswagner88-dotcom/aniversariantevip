import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

// Tipos de foto do Google Places
type PhotoType = 'COVER' | 'INTERIOR' | 'EXTERIOR' | 'FOOD' | 'DRINK' | 'MENU' | 'OTHER';

interface GooglePhoto {
  photo_reference: string;
  width: number;
  height: number;
}

// URLs blacklistadas que indicam logos, ícones, etc
const URL_BLACKLIST = [
  'logo', 'icon', 'favicon', 'map', 'streetview', 
  'screenshot', 'qr', 'placeholder', 'avatar', 
  'profile', 'thumbnail', 'default'
];

/**
 * Valida se uma foto atende aos critérios de qualidade
 */
function isPhotoValid(photo: GooglePhoto): boolean {
  // Tamanho mínimo (rejeitar fotos muito pequenas)
  if (photo.width < 400 || photo.height < 300) {
    console.log(`   ❌ Foto rejeitada: muito pequena (${photo.width}x${photo.height})`);
    return false;
  }
  
  // Proporção aceitável (entre 1:2 e 2:1)
  const ratio = photo.width / photo.height;
  if (ratio < 0.5 || ratio > 2.0) {
    console.log(`   ❌ Foto rejeitada: proporção ruim (${ratio.toFixed(2)})`);
    return false;
  }
  
  // Ignorar fotos muito quadradas pequenas (provavelmente logos)
  if (photo.width < 500 && photo.height < 500 && ratio > 0.9 && ratio < 1.1) {
    console.log(`   ❌ Foto rejeitada: provável logo (quadrada pequena)`);
    return false;
  }
  
  return true;
}

/**
 * Seleciona a melhor foto de um array de fotos
 * Prioriza fotos maiores e com melhor proporção
 */
function selectBestPhoto(photos: GooglePhoto[]): GooglePhoto | null {
  if (!photos || photos.length === 0) return null;
  
  // Filtrar fotos válidas
  const validPhotos = photos.filter(isPhotoValid);
  
  console.log(`   📊 ${validPhotos.length}/${photos.length} fotos passaram na validação`);
  
  if (validPhotos.length === 0) return null;
  
  // Ordenar por área (maior primeiro) - prioriza qualidade
  validPhotos.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  
  // Retornar a maior foto válida
  return validPhotos[0];
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    const { nome, endereco, cidade, estado, skipValidation } = await req.json();
    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      throw new Error('Google Maps API Key não configurada');
    }

    console.log(`🔍 Buscando foto para: ${nome} em ${cidade}-${estado}`);
    console.log(`   🛡️ Validação de qualidade: ${skipValidation ? 'DESATIVADA' : 'ATIVADA'}`);

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
          error: 'Estabelecimento não encontrado no Google Places',
          validation_applied: !skipValidation
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
          error: 'Nenhuma foto disponível para este estabelecimento',
          place_name: place.name,
          validation_applied: !skipValidation
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`   📸 ${place.photos.length} fotos disponíveis no Google Places`);

    // 3. Selecionar melhor foto com validação de qualidade
    let selectedPhoto: GooglePhoto | null;
    
    if (skipValidation) {
      // Modo sem validação: pegar a primeira foto
      selectedPhoto = place.photos[0];
      console.log(`   ⚡ Modo rápido: usando primeira foto sem validação`);
    } else {
      // Modo padrão: validar e selecionar melhor foto
      selectedPhoto = selectBestPhoto(place.photos);
    }
    
    if (!selectedPhoto) {
      console.log(`❌ Nenhuma foto passou na validação de qualidade`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Nenhuma foto de qualidade disponível (todas rejeitadas pela validação)',
          photos_available: place.photos.length,
          photos_valid: 0,
          place_name: place.name,
          validation_applied: true,
          tip: 'Tente novamente com skipValidation: true para forçar uso de qualquer foto'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // 4. Gerar URL da foto em alta qualidade (maxwidth 800)
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${selectedPhoto.photo_reference}&key=${apiKey}`;
    
    console.log(`📸 Foto selecionada: ${selectedPhoto.width}x${selectedPhoto.height}`);
    console.log(`✅ URL gerada com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true,
        photo_url: photoUrl,
        photo_dimensions: {
          width: selectedPhoto.width,
          height: selectedPhoto.height
        },
        place_id: place.place_id,
        place_name: place.name,
        formatted_address: place.formatted_address,
        rating: place.rating || null,
        user_ratings_total: place.user_ratings_total || null,
        photos_available: place.photos.length,
        validation_applied: !skipValidation
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
