import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HeroStats {
  establishments: number;
  users: number;
  cities: number;
}

export const useHeroStats = () => {
  return useQuery({
    queryKey: ['hero-stats'],
    queryFn: async (): Promise<HeroStats> => {
      // Fetch establishment count
      const { count: establishmentCount } = await supabase
        .from('estabelecimentos')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true)
        .is('deleted_at', null);

      // Fetch user count
      const { count: userCount } = await supabase
        .from('aniversariantes')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Fetch distinct cities
      const { data: citiesData } = await supabase
        .from('estabelecimentos')
        .select('cidade')
        .eq('ativo', true)
        .is('deleted_at', null)
        .not('cidade', 'is', null);

      const uniqueCities = new Set(citiesData?.map(e => e.cidade) || []);

      return {
        establishments: establishmentCount || 0,
        users: userCount || 0,
        cities: uniqueCities.size
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};
