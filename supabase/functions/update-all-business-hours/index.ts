import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_PLACES_API_KEY = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Buscar estabelecimentos sem horário
    const { data: estabelecimentos, error } = await supabase
      .from('estabelecimentos')
      .select('id, nome_fantasia, logradouro, numero, bairro, cidade, estado')
      .eq('ativo', true)
      .is('horario_funcionamento', null)
      .limit(50); // Limitar para evitar timeout

    if (error) throw error;

    console.log(`Encontrados ${estabelecimentos?.length || 0} estabelecimentos sem horário`);

    const resultados = [];

    // 2. Processar cada estabelecimento (com delay para não exceder rate limit)
    for (const est of estabelecimentos || []) {
      try {
        const endereco = `${est.logradouro}, ${est.numero} - ${est.bairro}`;
        
        // Buscar no Google Places
        const searchQuery = `${est.nome_fantasia} ${endereco} ${est.cidade} ${est.estado} Brasil`;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`;
        
        console.log(`Buscando: ${est.nome_fantasia} (${est.cidade})`);
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.results && searchData.results.length > 0) {
          const placeId = searchData.results[0].place_id;

          // Buscar detalhes
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();

          if (detailsData.result?.opening_hours?.weekday_text) {
            const horarioFormatado = detailsData.result.opening_hours.weekday_text
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

            // Atualizar no banco
            const { error: updateError } = await supabase
              .from('estabelecimentos')
              .update({ horario_funcionamento: horarioFormatado })
              .eq('id', est.id);

            if (updateError) {
              console.error(`Erro ao atualizar ${est.nome_fantasia}:`, updateError);
              resultados.push({ 
                id: est.id, 
                nome: est.nome_fantasia, 
                status: 'erro',
                error: updateError.message
              });
            } else {
              console.log(`✓ ${est.nome_fantasia} atualizado`);
              resultados.push({ 
                id: est.id, 
                nome: est.nome_fantasia, 
                status: 'atualizado',
                horario: horarioFormatado 
              });
            }
          } else {
            console.warn(`${est.nome_fantasia}: sem horário no Google`);
            resultados.push({ 
              id: est.id, 
              nome: est.nome_fantasia, 
              status: 'sem_horario_google' 
            });
          }
        } else {
          console.warn(`${est.nome_fantasia}: não encontrado no Google`);
          resultados.push({ 
            id: est.id, 
            nome: est.nome_fantasia, 
            status: 'nao_encontrado' 
          });
        }

        // Delay de 300ms entre requisições (rate limit do Google)
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        console.error(`Erro ao processar ${est.nome_fantasia}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        resultados.push({ 
          id: est.id, 
          nome: est.nome_fantasia, 
          status: 'erro',
          error: errorMessage 
        });
      }
    }

    const atualizados = resultados.filter(r => r.status === 'atualizado').length;
    console.log(`Processo concluído: ${atualizados}/${estabelecimentos?.length || 0} atualizados`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: estabelecimentos?.length || 0,
        resultados 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
