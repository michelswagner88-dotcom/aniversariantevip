import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NavigationMetrics {
  total_clicks: number;
  clicks_by_app: {
    app_name: string;
    count: number;
  }[];
  top_establishments: {
    establishment_id: string;
    nome_fantasia: string;
    total_clicks: number;
    clicks_by_app: {
      uber: number;
      '99': number;
      waze: number;
      maps: number;
    };
  }[];
  recent_clicks: {
    app_name: string;
    created_at: string;
    establishment_id: string;
  }[];
}

/**
 * Hook para admins visualizarem métricas de navegação
 * Usado para relatórios B2B e negociações com parceiros
 */
export const useNavigationMetrics = (establishmentId?: string, days: number = 30) => {
  return useQuery<NavigationMetrics>({
    queryKey: ['navigation-metrics', establishmentId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('navigation_logs')
        .select(`
          *,
          estabelecimentos!inner(nome_fantasia)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (establishmentId) {
        query = query.eq('establishment_id', establishmentId);
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      // Processar métricas
      const totalClicks = logs?.length || 0;

      // Cliques por app
      const clicksByApp = logs?.reduce((acc: any[], log) => {
        const existing = acc.find(item => item.app_name === log.app_name);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ app_name: log.app_name, count: 1 });
        }
        return acc;
      }, []) || [];

      // Top estabelecimentos
      const establishmentMap = new Map();
      logs?.forEach((log: any) => {
        const estId = log.establishment_id;
        if (!establishmentMap.has(estId)) {
          establishmentMap.set(estId, {
            establishment_id: estId,
            nome_fantasia: log.estabelecimentos?.nome_fantasia || 'Desconhecido',
            total_clicks: 0,
            clicks_by_app: { uber: 0, '99': 0, waze: 0, maps: 0 },
          });
        }
        const est = establishmentMap.get(estId);
        est.total_clicks++;
        est.clicks_by_app[log.app_name as keyof typeof est.clicks_by_app]++;
      });

      const topEstablishments = Array.from(establishmentMap.values())
        .sort((a, b) => b.total_clicks - a.total_clicks)
        .slice(0, 10);

      // Cliques recentes
      const recentClicks = logs?.slice(0, 50).map(log => ({
        app_name: log.app_name,
        created_at: log.created_at,
        establishment_id: log.establishment_id,
      })) || [];

      return {
        total_clicks: totalClicks,
        clicks_by_app: clicksByApp,
        top_establishments: topEstablishments,
        recent_clicks: recentClicks,
      };
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
  });
};
