import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

interface EstabelecimentoSemFotos {
  id: string;
  nome_fantasia: string;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
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
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { limit = 10 } = await req.json().catch(() => ({}));

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar estabelecimentos SEM galeria_fotos
    const { data: estabelecimentos, error: fetchError } = await supabase
      .from('estabelecimentos')
      .select('id, nome_fantasia, logradouro, numero, bairro, cidade, estado')
      .eq('ativo', true)
      .or('galeria_fotos.is.null,galeria_fotos.eq.{}')
      .limit(limit);

    if (fetchError) {
      console.error('Erro ao buscar estabelecimentos:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar estabelecimentos', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!estabelecimentos || estabelecimentos.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Nenhum estabelecimento sem fotos encontrado',
          processed: 0,
          success: 0,
          failed: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📷 Processando ${estabelecimentos.length} estabelecimentos sem fotos...`);

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      details: [] as { id: string; nome: string; status: string; photosCount?: number; error?: string }[]
    };

    for (const est of estabelecimentos as EstabelecimentoSemFotos[]) {
      results.processed++;
      
      try {
        // Montar endereço
        const endereco = [est.logradouro, est.numero, est.bairro, est.cidade, est.estado]
          .filter(Boolean)
          .join(', ');

        if (!endereco || endereco.length < 10) {
          console.warn(`⚠️ Endereço insuficiente para ${est.nome_fantasia}`);
          results.failed++;
          results.details.push({
            id: est.id,
            nome: est.nome_fantasia || 'Sem nome',
            status: 'failed',
            error: 'Endereço insuficiente'
          });
          continue;
        }

        // Buscar Place usando Text Search
        const searchQuery = `${est.nome_fantasia} ${endereco}`;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.status !== 'OK' || !searchData.results?.[0]) {
          console.warn(`⚠️ Place não encontrado para ${est.nome_fantasia}`);
          results.failed++;
          results.details.push({
            id: est.id,
            nome: est.nome_fantasia || 'Sem nome',
            status: 'failed',
            error: 'Place não encontrado no Google'
          });
          continue;
        }

        const place = searchData.results[0];
        const photos = place.photos || [];

        if (photos.length === 0) {
          console.warn(`⚠️ Nenhuma foto para ${est.nome_fantasia}`);
          results.failed++;
          results.details.push({
            id: est.id,
            nome: est.nome_fantasia || 'Sem nome',
            status: 'failed',
            error: 'Nenhuma foto disponível'
          });
          continue;
        }

        // Download e upload para Supabase Storage
        const uploadedUrls: string[] = [];
        const photosToProcess = photos.slice(0, 5);

        for (let i = 0; i < photosToProcess.length; i++) {
          try {
            const photoRef = photosToProcess[i].photo_reference;
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoRef}&key=${apiKey}`;
            
            const imageResponse = await fetch(photoUrl);
            if (!imageResponse.ok) continue;
            
            const imageBlob = await imageResponse.blob();
            const arrayBuffer = await imageBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            const fileName = `${est.id}/${Date.now()}-${i}.jpg`;
            const { error: uploadError } = await supabase.storage
              .from('establishment-photos')
              .upload(fileName, uint8Array, {
                contentType: 'image/jpeg',
                upsert: true
              });

            if (uploadError) {
              console.error(`Erro ao fazer upload da foto ${i}:`, uploadError);
              continue;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('establishment-photos')
              .getPublicUrl(fileName);
            
            uploadedUrls.push(publicUrl);
            
          } catch (error) {
            console.error(`Erro ao processar foto ${i}:`, error);
          }
        }

        // Salvar URLs no banco
        if (uploadedUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('estabelecimentos')
            .update({ galeria_fotos: uploadedUrls })
            .eq('id', est.id);

          if (updateError) {
            console.error('Erro ao salvar fotos:', updateError);
            results.failed++;
            results.details.push({
              id: est.id,
              nome: est.nome_fantasia || 'Sem nome',
              status: 'failed',
              error: 'Erro ao salvar no banco'
            });
          } else {
            console.log(`✅ ${uploadedUrls.length} fotos salvas para ${est.nome_fantasia}`);
            results.success++;
            results.details.push({
              id: est.id,
              nome: est.nome_fantasia || 'Sem nome',
              status: 'success',
              photosCount: uploadedUrls.length
            });
          }
        } else {
          results.failed++;
          results.details.push({
            id: est.id,
            nome: est.nome_fantasia || 'Sem nome',
            status: 'failed',
            error: 'Nenhuma foto processada com sucesso'
          });
        }

        // Pequeno delay entre requests para não exceder rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Erro ao processar ${est.nome_fantasia}:`, error);
        results.failed++;
        results.details.push({
          id: est.id,
          nome: est.nome_fantasia || 'Sem nome',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    console.log(`📊 Resultado: ${results.success} sucesso, ${results.failed} falhas de ${results.processed} processados`);

    return new Response(
      JSON.stringify({
        message: `Processamento concluído`,
        ...results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no batch-fetch-photos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
