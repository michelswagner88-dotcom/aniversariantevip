import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calcularDistancia } from '@/lib/geoUtils';
import { Tables } from '@/integrations/supabase/types';

type Estabelecimento = Tables<'estabelecimentos'>;

interface EstabelecimentoComDistancia extends Estabelecimento {
  distancia: number;
}

interface UseEstabelecimentosProximosOptions {
  userLat?: number;
  userLng?: number;
  raioKm?: number;
  categoria?: string[];
  enabled?: boolean;
}

/**
 * Hook para buscar estabelecimentos por proximidade
 * @param userLat Latitude do usuário
 * @param userLng Longitude do usuário
 * @param raioKm Raio de busca em quilômetros (padrão: 10km)
 * @param categoria Filtro de categoria
 * @param enabled Habilitar query
 * @returns Estabelecimentos ordenados por distância
 */
export const useEstabelecimentosProximos = ({
  userLat,
  userLng,
  raioKm = 10,
  categoria,
  enabled = true,
}: UseEstabelecimentosProximosOptions) => {
  return useQuery<EstabelecimentoComDistancia[]>({
    queryKey: ['estabelecimentos-proximos', userLat, userLng, raioKm, categoria],
    queryFn: async () => {
      if (!userLat || !userLng) {
        throw new Error('Localização do usuário não fornecida');
      }

      let query = supabase
        .from('public_estabelecimentos')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      // Aplicar filtro de categoria se fornecido
      if (categoria && categoria.length > 0) {
        query = query.overlaps('categoria', categoria);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data) return [];

      // Calcular distância e filtrar por raio
      const comDistancia = data
        .map((est) => ({
          ...est,
          distancia: calcularDistancia(
            userLat,
            userLng,
            Number(est.latitude),
            Number(est.longitude)
          ),
        }))
        .filter((est) => est.distancia <= raioKm)
        .sort((a, b) => a.distancia - b.distancia);

      return comDistancia as EstabelecimentoComDistancia[];
    },
    enabled: enabled && !!userLat && !!userLng,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
