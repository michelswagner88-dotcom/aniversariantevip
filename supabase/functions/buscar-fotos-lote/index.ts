import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOTE_SIZE = 50; // Processa 50 por vez
const DELAY_MS = 200; // 200ms entre requisições

interface Estabelecimento {
  id: string;
  nome_fantasia: string;
  cidade: string;
  estado: string;
  categoria: string[];
  google_place_id?: string;
  endereco?: string;
  galeria_fotos?: string[] | null;
}

// Buscar Place ID se não tiver
const buscarPlaceId = async (
  nome: string, 
  cidade: string, 
  estado: string, 
  endereco: string | null,
  apiKey: string
): Promise<string | null> => {
  try {
    const query = encodeURIComponent(`${nome} ${endereco || ''} ${cidade} ${estado} Brasil`);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Place ID search for "${nome}": ${data.status}`);
    
    return data.candidates?.[0]?.place_id || null;
  } catch (error) {
    console.error('Erro ao buscar Place ID:', error);
    return null;
  }
};

// Buscar foto do Place ID e fazer upload para Supabase Storage
const buscarFotoGoogle = async (
  placeId: string, 
  apiKey: string, 
  estabelecimentoId: string,
  supabase: any
): Promise<string | null> => {
  try {
    // Primeiro, buscar detalhes do lugar pra pegar photo_reference
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
    
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    const photoReference = data.result?.photos?.[0]?.photo_reference;
    
    if (!photoReference) {
      console.log('   Sem fotos disponíveis no Google');
      return null;
    }
    
    // Baixar a foto do Google (UMA ÚNICA VEZ)
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;
    console.log('   📥 Baixando foto do Google...');
    
    const photoResponse = await fetch(photoUrl);
    if (!photoResponse.ok) {
      console.log(`   ⚠️ Erro ao baixar foto: ${photoResponse.status}`);
      return null;
    }
    
    const imageBuffer = await photoResponse.arrayBuffer();
    const contentType = photoResponse.headers.get("content-type") || "image/jpeg";
    
    // Determinar extensão
    let extension = "jpg";
    if (contentType.includes("png")) extension = "png";
    if (contentType.includes("webp")) extension = "webp";
    
    const fileName = `establishments/${estabelecimentoId}/photo.${extension}`;
    
    // Upload para Supabase Storage
    console.log('   📤 Fazendo upload para Supabase Storage...');
    const { error: uploadError } = await supabase.storage
      .from("establishment-photos")
      .upload(fileName, imageBuffer, { 
        contentType, 
        upsert: true 
      });
    
    if (uploadError) {
      console.log(`   ⚠️ Erro no upload: ${uploadError.message}`);
      return null;
    }
    
    // Obter URL pública do Supabase Storage
    const { data: publicUrlData } = supabase.storage
      .from("establishment-photos")
      .getPublicUrl(fileName);
    
    console.log('   ✅ Foto salva no Supabase Storage!');
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error('Erro ao buscar/salvar foto:', error);
    return null;
  }
};

// Delay helper
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY')!;

    if (!googleApiKey) {
      throw new Error('VITE_GOOGLE_MAPS_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Buscando estabelecimentos sem foto...');

    // Buscar estabelecimentos que ainda não tiveram foto buscada
    // IMPORTANTE: Não buscar foto do Google se já tem galeria_fotos (fotos manuais)
    const { data: estabelecimentos, error } = await supabase
      .from('estabelecimentos')
      .select('id, nome_fantasia, cidade, estado, categoria, google_place_id, endereco, galeria_fotos, fotos')
      .eq('foto_buscada', false)
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(LOTE_SIZE);

    if (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      throw error;
    }

    if (!estabelecimentos?.length) {
      console.log('✅ Nenhum estabelecimento pendente!');
      return new Response(
        JSON.stringify({ 
          processados: 0, 
          erros: 0, 
          comFoto: 0,
          semFoto: 0,
          message: 'Nenhum estabelecimento pendente' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Processando ${estabelecimentos.length} estabelecimentos...`);

    let processados = 0;
    let erros = 0;
    let comFoto = 0;
    let semFoto = 0;

    for (const est of estabelecimentos) {
      try {
        console.log(`\n🏢 ${est.nome_fantasia} (${est.cidade})`);

        // VERIFICAR SE JÁ TEM FOTOS MANUAIS - SE TEM, PULAR BUSCA NO GOOGLE
        const temGaleriaFotos = est.galeria_fotos && est.galeria_fotos.length > 0 && 
          est.galeria_fotos.some((foto: string) => foto && foto.trim() !== '');
        
        if (temGaleriaFotos) {
          console.log('   ✅ Já tem fotos manuais na galeria - PULANDO busca no Google');
          // Marcar como processado mas NÃO sobrescrever logo_url
          await supabase
            .from('estabelecimentos')
            .update({ foto_buscada: true })
            .eq('id', est.id);
          
          comFoto++;
          processados++;
          continue; // Próximo estabelecimento
        }

        // 1. Buscar Place ID se não tiver
        let placeId = est.google_place_id;

        if (!placeId) {
          console.log('   🔎 Buscando Place ID...');
          placeId = await buscarPlaceId(
            est.nome_fantasia || '', 
            est.cidade || '', 
            est.estado || '',
            est.endereco || null,
            googleApiKey
          );

          if (placeId) {
            // Salvar Place ID pra futuro
            await supabase
              .from('estabelecimentos')
              .update({ google_place_id: placeId })
              .eq('id', est.id);
            console.log('   ✅ Place ID encontrado e salvo');
          } else {
            console.log('   ⚠️ Place ID não encontrado');
          }
        }

        // 2. Buscar foto APENAS se não tem galeria
        let fotoUrl: string | null = null;

        if (placeId) {
          console.log('   📷 Buscando foto do Google e salvando no Storage...');
          fotoUrl = await buscarFotoGoogle(placeId, googleApiKey, est.id, supabase);
        }

        // 3. Atualizar no Supabase
        await supabase
          .from('estabelecimentos')
          .update({
            logo_url: fotoUrl || null,
            foto_buscada: true, // Marca como já tentou buscar
          })
          .eq('id', est.id);

        if (fotoUrl) {
          console.log('   ✅ Foto salva!');
          comFoto++;
        } else {
          console.log('   ⚠️ Sem foto (vai usar placeholder)');
          semFoto++;
        }

        processados++;

        // Delay pra não estourar rate limit
        await delay(DELAY_MS);

      } catch (error) {
        console.error(`   ❌ Erro:`, error);
        erros++;

        // Marca como tentou mesmo com erro (pra não ficar tentando infinito)
        await supabase
          .from('estabelecimentos')
          .update({ foto_buscada: true })
          .eq('id', est.id);
      }
    }

    console.log(`\n📊 Resumo: ${processados} processados, ${comFoto} com foto, ${semFoto} sem foto, ${erros} erros`);

    return new Response(
      JSON.stringify({ 
        processados, 
        erros, 
        comFoto,
        semFoto,
        message: `${processados} estabelecimentos processados` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro na função:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
