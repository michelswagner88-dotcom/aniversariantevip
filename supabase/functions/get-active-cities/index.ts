import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActiveCity {
  cidade: string;
  estado: string;
  total_estabelecimentos: number;
  latitude: number | null;
  longitude: number | null;
}

interface RequestBody {
  userLat?: number;
  userLng?: number;
  searchTerm?: string;
}

// Fórmula Haversine para calcular distância entre dois pontos em km
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { userLat, userLng, searchTerm }: RequestBody = 
      req.method === 'POST' ? await req.json() : {};

    console.log('Fetching active cities...', { userLat, userLng, searchTerm });

    // Buscar todas as cidades ativas com contagem de estabelecimentos
    let query = supabaseClient
      .from('estabelecimentos')
      .select('cidade, estado, latitude, longitude')
      .eq('ativo', true)
      .is('deleted_at', null)
      .not('cidade', 'is', null)
      .not('estado', 'is', null);

    // Aplicar filtro de busca se fornecido
    if (searchTerm && searchTerm.trim()) {
      query = query.ilike('cidade', `%${searchTerm.trim()}%`);
    }

    const { data: establishments, error } = await query;

    if (error) {
      console.error('Error fetching establishments:', error);
      throw error;
    }

    if (!establishments || establishments.length === 0) {
      return new Response(
        JSON.stringify({ cities: [], message: 'Nenhuma cidade encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Agrupar por cidade e contar estabelecimentos
    const cityMap = new Map<string, ActiveCity>();
    
    establishments.forEach((est) => {
      const key = `${est.cidade}-${est.estado}`;
      if (cityMap.has(key)) {
        const existing = cityMap.get(key)!;
        existing.total_estabelecimentos += 1;
        
        // Atualizar coordenadas médias (se disponíveis)
        if (est.latitude && est.longitude) {
          if (existing.latitude && existing.longitude) {
            existing.latitude = (existing.latitude * (existing.total_estabelecimentos - 1) + est.latitude) / existing.total_estabelecimentos;
            existing.longitude = (existing.longitude * (existing.total_estabelecimentos - 1) + est.longitude) / existing.total_estabelecimentos;
          } else {
            existing.latitude = est.latitude;
            existing.longitude = est.longitude;
          }
        }
      } else {
        cityMap.set(key, {
          cidade: est.cidade,
          estado: est.estado,
          total_estabelecimentos: 1,
          latitude: est.latitude,
          longitude: est.longitude,
        });
      }
    });

    let cities = Array.from(cityMap.values());

    // Se usuário forneceu localização, calcular distâncias e ordenar
    if (userLat && userLng) {
      cities = cities.map(city => ({
        ...city,
        distancia: city.latitude && city.longitude
          ? calculateDistance(userLat, userLng, city.latitude, city.longitude)
          : null,
      })).sort((a: any, b: any) => {
        // Primeiro, ordenar por distância (se disponível)
        if (a.distancia !== null && b.distancia !== null) {
          return a.distancia - b.distancia;
        }
        if (a.distancia !== null) return -1;
        if (b.distancia !== null) return 1;
        
        // Se não tiver distância, ordenar por número de estabelecimentos
        return b.total_estabelecimentos - a.total_estabelecimentos;
      });
    } else {
      // Sem geolocalização: ordenar por popularidade (mais estabelecimentos)
      cities = cities.sort((a, b) => b.total_estabelecimentos - a.total_estabelecimentos);
    }

    // Limitar a 50 cidades para performance
    cities = cities.slice(0, 50);

    console.log(`Found ${cities.length} active cities`);

    return new Response(
      JSON.stringify({ cities }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-active-cities function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        cities: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
