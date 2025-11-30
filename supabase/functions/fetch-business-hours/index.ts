import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

const GOOGLE_PLACES_API_KEY = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    return new Response(
      JSON.stringify({ error: 'Origem não autorizada' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { estabelecimentoId, nome, endereco, cidade, estado } = await req.json();

    console.log('Buscando horário para:', { nome, cidade, estado });

    // Buscar Place ID usando Text Search
    const searchQuery = `${nome} ${endereco} ${cidade} ${estado} Brasil`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      console.warn('Estabelecimento não encontrado no Google');
      return new Response(
        JSON.stringify({ success: false, error: 'Estabelecimento não encontrado no Google' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const placeId = searchData.results[0].place_id;
    console.log('Place ID encontrado:', placeId);

    // Buscar detalhes do lugar (incluindo horário)
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours,formatted_phone_number,website&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (!detailsData.result) {
      console.warn('Detalhes não encontrados');
      return new Response(
        JSON.stringify({ success: false, error: 'Detalhes não encontrados' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = detailsData.result;
    
    // Formatar horário de funcionamento
    let horarioFormatado = null;
    if (result.opening_hours?.weekday_text) {
      horarioFormatado = result.opening_hours.weekday_text
        .map((dia: string) => {
          return dia
            .replace('segunda-feira', 'Seg')
            .replace('terça-feira', 'Ter')
            .replace('quarta-feira', 'Qua')
            .replace('quinta-feira', 'Qui')
            .replace('sexta-feira', 'Sex')
            .replace('sábado', 'Sáb')
            .replace('domingo', 'Dom')
            .replace('Fechado', 'Fechado')
            .replace(' – ', '-');
        })
        .join(' | ');
      
      console.log('Horário formatado:', horarioFormatado);
    }

    // Atualizar no banco se tiver horário
    if (horarioFormatado && estabelecimentoId) {
      const updateData: any = { horario_funcionamento: horarioFormatado };
      
      // Opcionalmente atualizar telefone e site se não tiver
      if (result.formatted_phone_number) {
        updateData.telefone = result.formatted_phone_number;
      }
      if (result.website) {
        updateData.site = result.website;
      }

      const { error: updateError } = await supabase
        .from('estabelecimentos')
        .update(updateData)
        .eq('id', estabelecimentoId);

      if (updateError) {
        console.error('Erro ao atualizar:', updateError);
        throw updateError;
      }

      console.log('Estabelecimento atualizado com sucesso');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        horario: horarioFormatado,
        telefone: result.formatted_phone_number || null,
        site: result.website || null,
        placeId: placeId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao buscar horário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
