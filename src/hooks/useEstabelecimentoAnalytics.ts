import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

export interface AnalyticsData {
  cuponsEmitidos: number;
  visualizacoesPerfil: number;
  cuponsUsados: number;
  taxaConversao: number;
  cupomsPorDia: { date: string; cupons: number }[];
  cupomsPorHorario: { hora: number; cupons: number }[];
  cupomsPorMes: { mes: string; cupons: number }[];
}

export const useEstabelecimentoAnalytics = (estabelecimentoId: string | undefined) => {
  return useQuery({
    queryKey: ['estabelecimento-analytics', estabelecimentoId],
    queryFn: async () => {
      if (!estabelecimentoId) throw new Error('ID do estabelecimento não fornecido');

      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());

      // Buscar todos os eventos de analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('estabelecimento_analytics')
        .select('*')
        .eq('estabelecimento_id', estabelecimentoId)
        .gte('data_evento', startDate.toISOString())
        .lte('data_evento', endDate.toISOString())
        .order('data_evento', { ascending: true });

      if (analyticsError) throw analyticsError;

      // Buscar cupons
      const { data: cupons, error: cuponsError } = await supabase
        .from('cupons')
        .select('*, aniversariantes(id)')
        .eq('estabelecimento_id', estabelecimentoId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (cuponsError) throw cuponsError;

      // Calcular métricas
      const cuponsEmitidos = analytics?.filter(a => a.tipo_evento === 'cupom_emitido').length || 0;
      const visualizacoesPerfil = analytics?.filter(a => a.tipo_evento === 'visualizacao_perfil').length || 0;
      const cuponsUsados = cupons?.filter(c => c.usado).length || 0;
      const taxaConversao = cuponsEmitidos > 0 ? (cuponsUsados / cuponsEmitidos) * 100 : 0;

      // Agrupar cupons por dia
      const cuponsMap = new Map<string, number>();
      analytics?.filter(a => a.tipo_evento === 'cupom_emitido').forEach(event => {
        const date = format(parseISO(event.data_evento), 'dd/MM');
        cuponsMap.set(date, (cuponsMap.get(date) || 0) + 1);
      });

      const cupomsPorDia = Array.from(cuponsMap.entries()).map(([date, cupons]) => ({
        date,
        cupons
      }));

      // Agrupar cupons por horário (0-23h)
      const horariosMap = new Map<number, number>();
      for (let i = 0; i < 24; i++) {
        horariosMap.set(i, 0);
      }

      analytics?.filter(a => a.tipo_evento === 'cupom_emitido').forEach(event => {
        const hora = parseISO(event.data_evento).getHours();
        horariosMap.set(hora, (horariosMap.get(hora) || 0) + 1);
      });

      const cupomsPorHorario = Array.from(horariosMap.entries())
        .map(([hora, cupons]) => ({
          hora,
          cupons
        }))
        .filter(item => item.cupons > 0);

      // Dados dos últimos 6 meses
      const { data: historico } = await supabase
        .from('estabelecimento_analytics')
        .select('*')
        .eq('estabelecimento_id', estabelecimentoId)
        .eq('tipo_evento', 'cupom_emitido')
        .gte('data_evento', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order('data_evento', { ascending: true });

      const mesesMap = new Map<string, number>();
      historico?.forEach(event => {
        const mes = format(parseISO(event.data_evento), 'MMM/yy');
        mesesMap.set(mes, (mesesMap.get(mes) || 0) + 1);
      });

      const cupomsPorMes = Array.from(mesesMap.entries()).map(([mes, cupons]) => ({
        mes,
        cupons
      }));

      return {
        cuponsEmitidos,
        visualizacoesPerfil,
        cuponsUsados,
        taxaConversao,
        cupomsPorDia,
        cupomsPorHorario,
        cupomsPorMes
      } as AnalyticsData;
    },
    enabled: !!estabelecimentoId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
