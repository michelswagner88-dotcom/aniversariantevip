import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface DailyRegistration {
  date: string;
  aniversariantes: number;
  estabelecimentos: number;
}

export interface CityStats {
  cidade: string;
  estado: string;
  total_estabelecimentos: number;
  estabelecimentos_ativos: number;
  total_aniversariantes: number;
}

export interface GrowthMetrics {
  dailyRegistrations: DailyRegistration[];
  citiesCovered: CityStats[];
  activationRate: number;
  totalCities: number;
  totalEstablishments: number;
  activeEstablishments: number;
  totalUsers: number;
  growthRate: number;
}

export const useAdminGrowthMetrics = (daysBack: number = 30) => {
  return useQuery<GrowthMetrics>({
    queryKey: ['admin-growth-metrics', daysBack],
    queryFn: async () => {
      const startDate = format(subDays(startOfDay(new Date()), daysBack), 'yyyy-MM-dd');

      // Buscar registros diários de aniversariantes
      const { data: aniversariantes } = await supabase
        .from('aniversariantes')
        .select('created_at')
        .gte('created_at', startDate)
        .is('deleted_at', null);

      // Buscar registros diários de estabelecimentos
      const { data: estabelecimentos } = await supabase
        .from('estabelecimentos')
        .select('created_at, ativo')
        .gte('created_at', startDate)
        .is('deleted_at', null);

      // Buscar totais gerais
      const { data: allEstablishments } = await supabase
        .from('estabelecimentos')
        .select('id, ativo')
        .is('deleted_at', null);

      const { data: allUsers } = await supabase
        .from('aniversariantes')
        .select('id')
        .is('deleted_at', null);

      // Buscar cidades cobertas
      const { data: cities } = await supabase
        .from('estabelecimentos')
        .select('cidade, estado, ativo')
        .is('deleted_at', null)
        .not('cidade', 'is', null)
        .not('estado', 'is', null);

      // Processar registros diários
      const dailyMap = new Map<string, { aniversariantes: number; estabelecimentos: number }>();
      
      for (let i = 0; i < daysBack; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMap.set(date, { aniversariantes: 0, estabelecimentos: 0 });
      }

      aniversariantes?.forEach((user) => {
        const date = format(new Date(user.created_at), 'yyyy-MM-dd');
        if (dailyMap.has(date)) {
          dailyMap.get(date)!.aniversariantes++;
        }
      });

      estabelecimentos?.forEach((est) => {
        const date = format(new Date(est.created_at), 'yyyy-MM-dd');
        if (dailyMap.has(date)) {
          dailyMap.get(date)!.estabelecimentos++;
        }
      });

      const dailyRegistrations = Array.from(dailyMap.entries())
        .map(([date, counts]) => ({
          date: format(new Date(date), 'dd/MM'),
          aniversariantes: counts.aniversariantes,
          estabelecimentos: counts.estabelecimentos,
        }))
        .reverse();

      // Processar cidades cobertas
      const cityMap = new Map<string, CityStats>();
      
      cities?.forEach((est) => {
        const key = `${est.cidade}-${est.estado}`;
        if (!cityMap.has(key)) {
          cityMap.set(key, {
            cidade: est.cidade,
            estado: est.estado,
            total_estabelecimentos: 0,
            estabelecimentos_ativos: 0,
            total_aniversariantes: 0,
          });
        }
        const stats = cityMap.get(key)!;
        stats.total_estabelecimentos++;
        if (est.ativo) {
          stats.estabelecimentos_ativos++;
        }
      });

      // Buscar aniversariantes por cidade
      const { data: usersByCities } = await supabase
        .from('aniversariantes')
        .select('cidade, estado')
        .is('deleted_at', null)
        .not('cidade', 'is', null)
        .not('estado', 'is', null);

      usersByCities?.forEach((user) => {
        const key = `${user.cidade}-${user.estado}`;
        if (cityMap.has(key)) {
          cityMap.get(key)!.total_aniversariantes++;
        }
      });

      const citiesCovered = Array.from(cityMap.values())
        .sort((a, b) => b.total_estabelecimentos - a.total_estabelecimentos)
        .slice(0, 20); // Top 20 cidades

      // Calcular taxa de ativação
      const totalEstablishments = allEstablishments?.length || 0;
      const activeEstablishments = allEstablishments?.filter(e => e.ativo).length || 0;
      const activationRate = totalEstablishments > 0 
        ? (activeEstablishments / totalEstablishments) * 100 
        : 0;

      // Calcular taxa de crescimento (comparando últimos 7 dias com 7 dias anteriores)
      const last7Days = dailyRegistrations.slice(-7);
      const previous7Days = dailyRegistrations.slice(-14, -7);
      
      const last7Total = last7Days.reduce((sum, day) => sum + day.aniversariantes + day.estabelecimentos, 0);
      const previous7Total = previous7Days.reduce((sum, day) => sum + day.aniversariantes + day.estabelecimentos, 0);
      
      const growthRate = previous7Total > 0 
        ? ((last7Total - previous7Total) / previous7Total) * 100 
        : 0;

      return {
        dailyRegistrations,
        citiesCovered,
        activationRate,
        totalCities: cityMap.size,
        totalEstablishments,
        activeEstablishments,
        totalUsers: allUsers?.length || 0,
        growthRate,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
  });
};
