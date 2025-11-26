import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpansionInsight {
  search_term: string;
  total_searches: number;
  zero_results_count: number;
  avg_latitude: number | null;
  avg_longitude: number | null;
  most_common_nearest_city: string | null;
  avg_distance_to_nearest: number | null;
  last_searched_at: string;
  unique_users: number;
  demand_score: number; // Score calculado baseado em múltiplos fatores
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar se usuário é admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar role de admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas administradores podem acessar insights.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching expansion insights for admin:', user.id);

    // Buscar insights da view
    const { data: insights, error } = await supabaseClient
      .from('expansion_insights')
      .select('*')
      .order('zero_results_count', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }

    // Calcular demand_score para cada insight
    const enrichedInsights: ExpansionInsight[] = (insights || []).map((insight: any) => {
      // Score baseado em:
      // - Número de buscas sem resultado (peso 3)
      // - Total de buscas (peso 2)
      // - Usuários únicos (peso 2)
      // - Proximidade de cidade existente (peso -1, quanto mais perto, menos urgente)
      
      let demandScore = 0;
      
      // Buscas sem resultado (mais crítico)
      demandScore += (insight.zero_results_count || 0) * 3;
      
      // Total de buscas
      demandScore += (insight.total_searches || 0) * 2;
      
      // Usuários únicos (indica interesse real, não repetição)
      demandScore += (insight.unique_users || 0) * 2;
      
      // Penalizar se há cidade próxima (menos urgente expandir)
      if (insight.avg_distance_to_nearest && insight.avg_distance_to_nearest < 50) {
        demandScore -= Math.max(0, (50 - insight.avg_distance_to_nearest) / 5);
      }
      
      return {
        ...insight,
        demand_score: Math.round(demandScore * 10) / 10,
      };
    });

    // Reordenar por demand_score
    enrichedInsights.sort((a, b) => b.demand_score - a.demand_score);

    // Estatísticas gerais
    const stats = {
      total_cities_searched: enrichedInsights.length,
      total_searches: enrichedInsights.reduce((sum, i) => sum + i.total_searches, 0),
      total_zero_results: enrichedInsights.reduce((sum, i) => sum + i.zero_results_count, 0),
      top_demand_cities: enrichedInsights.slice(0, 10),
    };

    console.log(`Returning ${enrichedInsights.length} expansion insights`);

    return new Response(
      JSON.stringify({ 
        insights: enrichedInsights,
        stats,
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-expansion-insights function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        insights: [],
        stats: {},
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
