import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveCity {
  cidade: string;
  estado: string;
  total_estabelecimentos: number;
  latitude: number | null;
  longitude: number | null;
  distancia?: number | null;
}

interface UseActiveCitiesOptions {
  userLat?: number;
  userLng?: number;
  searchTerm?: string;
  enabled?: boolean;
}

export const useActiveCities = (options: UseActiveCitiesOptions = {}) => {
  const { userLat, userLng, searchTerm, enabled = true } = options;

  return useQuery({
    queryKey: ['active-cities', userLat, userLng, searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-active-cities', {
        body: { 
          userLat, 
          userLng, 
          searchTerm 
        }
      });

      if (error) throw error;
      
      return (data?.cities || []) as ActiveCity[];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos (cidades não mudam com frequência)
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
