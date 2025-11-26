import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExpansionInsight {
  search_term: string;
  total_searches: number;
  zero_results_count: number;
  avg_latitude: number | null;
  avg_longitude: number | null;
  most_common_nearest_city: string | null;
  avg_distance_to_nearest: number | null;
  last_searched_at: string;
  unique_users: number;
  demand_score: number;
}

export interface ExpansionStats {
  total_cities_searched: number;
  total_searches: number;
  total_zero_results: number;
  top_demand_cities: ExpansionInsight[];
}

export interface ExpansionInsightsResponse {
  insights: ExpansionInsight[];
  stats: ExpansionStats;
  generated_at: string;
}

export const useExpansionInsights = (enabled: boolean = true) => {
  return useQuery<ExpansionInsightsResponse>({
    queryKey: ['expansion-insights'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('get-expansion-insights', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      
      return data as ExpansionInsightsResponse;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos (dados de analytics não mudam muito rápido)
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
};
