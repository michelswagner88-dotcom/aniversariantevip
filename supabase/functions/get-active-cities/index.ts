import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';
import { checkRateLimit, getRequestIdentifier, rateLimitExceededResponse } from "../_shared/rateLimit.ts";

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
  includeNearby?: boolean; // Flag para incluir cidades vizinhas mesmo sem estabelecimentos
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Rate limiting: 60 requisições por 1 minuto por IP
  const identifier = getRequestIdentifier(req);
  const { allowed, remaining } = await checkRateLimit(
    supabaseUrl,
    supabaseServiceKey,
    identifier,
    { limit: 60, windowMinutes: 1, keyPrefix: "cities" }
  );

  if (!allowed) {
    return rateLimitExceededResponse(remaining);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { userLat, userLng, searchTerm, includeNearby }: RequestBody = 
      req.method === 'POST' ? await req.json() : {};

    console.log('Fetching active cities...', { userLat, userLng, searchTerm, includeNearby });

    // Buscar todas as cidades ativas com contagem de estabelecimentos
    let query = supabaseClient
      .from('estabelecimentos')
      .select('cidade, estado, latitude, longitude')
      .eq('ativo', true)
      .is('deleted_at', null)
      .not('cidade', 'is', null)
      .not('estado', 'is', null);

    // Aplicar filtro de busca se fornecido (busca por prefixo case-insensitive)
    if (searchTerm && searchTerm.trim()) {
      query = query.ilike('cidade', `${searchTerm.trim()}%`);
    }

    const { data: establishments, error } = await query;

    if (error) {
      console.error('Error fetching establishments:', error);
      throw error;
    }

    // Se não encontrou estabelecimentos e tem termo de busca, buscar cidades próximas
    if ((!establishments || establishments.length === 0) && searchTerm && userLat && userLng) {
      console.log('No exact matches, fetching nearby cities...');
      
      // Buscar todas as cidades sem filtro de nome
      const { data: allEstablishments } = await supabaseClient
        .from('estabelecimentos')
        .select('cidade, estado, latitude, longitude')
        .eq('ativo', true)
        .is('deleted_at', null)
        .not('cidade', 'is', null)
        .not('estado', 'is', null);

      if (!allEstablishments || allEstablishments.length === 0) {
        return new Response(
          JSON.stringify({ 
            cities: [], 
            searchedCity: searchTerm,
            message: `Ainda não chegamos em ${searchTerm}. Veja o que tem perto de você:` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Agrupar e calcular distâncias
      const cityMap = new Map<string, ActiveCity>();
      allEstablishments.forEach((est) => {
        const key = `${est.cidade}-${est.estado}`;
        if (cityMap.has(key)) {
          const existing = cityMap.get(key)!;
          existing.total_estabelecimentos += 1;
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

      let nearbyCities = Array.from(cityMap.values())
        .map(city => ({
          ...city,
          distancia: city.latitude && city.longitude
            ? calculateDistance(userLat, userLng, city.latitude, city.longitude)
            : null,
        }))
        .filter((city): city is typeof city & { distancia: number } => city.distancia !== null)
        .sort((a, b) => a.distancia - b.distancia)
        .slice(0, 10); // Top 10 cidades mais próximas

      return new Response(
        JSON.stringify({ 
          cities: nearbyCities,
          searchedCity: searchTerm,
          isNearbyResults: true,
          message: `Ainda não chegamos em ${searchTerm}. Veja o que tem perto de você:` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    const resultsFound = cities.length;
    let nearestCity: string | null = null;
    let nearestDistance: number | null = null;

    // Se usuário forneceu localização, calcular distâncias e ordenar
    if (userLat && userLng) {
      cities = cities.map(city => {
        const distancia = city.latitude && city.longitude
          ? calculateDistance(userLat, userLng, city.latitude, city.longitude)
          : null;
        
        // Rastrear cidade mais próxima
        if (distancia !== null && (nearestDistance === null || distancia < nearestDistance)) {
          nearestDistance = distancia;
          nearestCity = `${city.cidade}, ${city.estado}`;
        }
        
        return {
          ...city,
          distancia,
        };
      }).sort((a: any, b: any) => {
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

    // Registrar analytics de busca
    if (searchTerm && searchTerm.trim()) {
      try {
        await supabaseClient
          .from('search_analytics')
          .insert({
            search_term: searchTerm.trim(),
            user_lat: userLat || null,
            user_lng: userLng || null,
            results_found: resultsFound,
            nearest_available_city: nearestCity,
            nearest_distance_km: nearestDistance,
            metadata: {
              has_geolocation: !!(userLat && userLng),
              total_cities_available: cities.length,
            }
          });
        console.log(`Analytics recorded for search: ${searchTerm}`);
      } catch (analyticsError) {
        // Não falhar a requisição se analytics falhar
        console.error('Error recording search analytics:', analyticsError);
      }
    }

    // Limitar a 50 cidades para performance
    cities = cities.slice(0, 50);

    console.log(`Found ${cities.length} active cities`);

    return new Response(
      JSON.stringify({ 
        cities,
        isNearbyResults: false,
        message: null 
      }),
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
