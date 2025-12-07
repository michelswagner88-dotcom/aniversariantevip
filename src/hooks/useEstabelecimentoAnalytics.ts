import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, parseISO, subDays } from 'date-fns';

export interface AnalyticsData {
  // Métricas de cupons
  cuponsEmitidos: number;
  cuponsUsados: number;
  taxaConversao: number;
  
  // Métricas de engajamento
  visualizacoesPerfil: number;
  cliquesBeneficio: number;
  cliquesWhatsApp: number;
  cliquesTelefone: number;
  cliquesInstagram: number;
  cliquesSite: number;
  cliquesNavegacao: number;
  compartilhamentos: number;
  favoritosAdicionados: number;
  
  // Taxas de conversão
  taxaViewToBenefit: number;
  taxaBenefitToWhatsApp: number;
  
  // Dados temporais
  views7d: number;
  views30d: number;
  benefitClicks7d: number;
  benefitClicks30d: number;
  
  // Dados para gráficos
  cupomsPorDia: { date: string; cupons: number }[];
  cupomsPorHorario: { hora: number; cupons: number }[];
  cupomsPorMes: { mes: string; cupons: number }[];
  engajamentoPorDia: { date: string; views: number; clicks: number }[];
}

export const useEstabelecimentoAnalytics = (estabelecimentoId: string | undefined) => {
  return useQuery({
    queryKey: ['estabelecimento-analytics', estabelecimentoId],
    queryFn: async () => {
      if (!estabelecimentoId) throw new Error('ID do estabelecimento não fornecido');

      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());
      const date7dAgo = subDays(new Date(), 7);
      const date30dAgo = subDays(new Date(), 30);

      // Buscar todos os eventos de analytics do mês
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

      // Buscar eventos dos últimos 7 e 30 dias para comparação
      const { data: analytics30d } = await supabase
        .from('estabelecimento_analytics')
        .select('tipo_evento, data_evento')
        .eq('estabelecimento_id', estabelecimentoId)
        .gte('data_evento', date30dAgo.toISOString());

      // Calcular métricas de cupons
      const cuponsEmitidos = analytics?.filter(a => a.tipo_evento === 'cupom_emitido').length || 0;
      const cuponsUsados = cupons?.filter(c => c.usado).length || 0;
      const taxaConversao = cuponsEmitidos > 0 ? (cuponsUsados / cuponsEmitidos) * 100 : 0;

      // Calcular métricas de engajamento
      const visualizacoesPerfil = analytics?.filter(a => 
        a.tipo_evento === 'visualizacao_perfil' || a.tipo_evento === 'page_view'
      ).length || 0;
      
      const cliquesBeneficio = analytics?.filter(a => a.tipo_evento === 'benefit_click').length || 0;
      const cliquesWhatsApp = analytics?.filter(a => a.tipo_evento === 'whatsapp_click').length || 0;
      const cliquesTelefone = analytics?.filter(a => a.tipo_evento === 'phone_click').length || 0;
      const cliquesInstagram = analytics?.filter(a => a.tipo_evento === 'instagram_click').length || 0;
      const cliquesSite = analytics?.filter(a => a.tipo_evento === 'site_click').length || 0;
      const cliquesNavegacao = analytics?.filter(a => a.tipo_evento === 'directions_click').length || 0;
      const compartilhamentos = analytics?.filter(a => a.tipo_evento === 'share').length || 0;
      const favoritosAdicionados = analytics?.filter(a => a.tipo_evento === 'favorite_add').length || 0;

      // Taxas de conversão do funil
      const taxaViewToBenefit = visualizacoesPerfil > 0 
        ? (cliquesBeneficio / visualizacoesPerfil) * 100 
        : 0;
      const taxaBenefitToWhatsApp = cliquesBeneficio > 0 
        ? (cliquesWhatsApp / cliquesBeneficio) * 100 
        : 0;

      // Métricas temporais (7d e 30d)
      const views7d = analytics30d?.filter(a => 
        (a.tipo_evento === 'page_view' || a.tipo_evento === 'visualizacao_perfil') &&
        new Date(a.data_evento) >= date7dAgo
      ).length || 0;
      
      const views30d = analytics30d?.filter(a => 
        a.tipo_evento === 'page_view' || a.tipo_evento === 'visualizacao_perfil'
      ).length || 0;
      
      const benefitClicks7d = analytics30d?.filter(a => 
        a.tipo_evento === 'benefit_click' &&
        new Date(a.data_evento) >= date7dAgo
      ).length || 0;
      
      const benefitClicks30d = analytics30d?.filter(a => 
        a.tipo_evento === 'benefit_click'
      ).length || 0;

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

      // Agrupar engajamento por dia
      const engajamentoMap = new Map<string, { views: number; clicks: number }>();
      analytics?.forEach(event => {
        const date = format(parseISO(event.data_evento), 'dd/MM');
        const current = engajamentoMap.get(date) || { views: 0, clicks: 0 };
        
        if (event.tipo_evento === 'page_view' || event.tipo_evento === 'visualizacao_perfil') {
          current.views += 1;
        }
        if (event.tipo_evento === 'benefit_click') {
          current.clicks += 1;
        }
        engajamentoMap.set(date, current);
      });

      const engajamentoPorDia = Array.from(engajamentoMap.entries()).map(([date, data]) => ({
        date,
        views: data.views,
        clicks: data.clicks
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
        cuponsUsados,
        taxaConversao,
        visualizacoesPerfil,
        cliquesBeneficio,
        cliquesWhatsApp,
        cliquesTelefone,
        cliquesInstagram,
        cliquesSite,
        cliquesNavegacao,
        compartilhamentos,
        favoritosAdicionados,
        taxaViewToBenefit,
        taxaBenefitToWhatsApp,
        views7d,
        views30d,
        benefitClicks7d,
        benefitClicks30d,
        cupomsPorDia,
        cupomsPorHorario,
        cupomsPorMes,
        engajamentoPorDia
      } as AnalyticsData;
    },
    enabled: !!estabelecimentoId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
