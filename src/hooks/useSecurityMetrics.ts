import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export interface SecurityMetrics {
  failedLogins24h: number;
  pendingRegistrations: number;
  rateLimitsHit: number;
  suspiciousActivities: SecurityLog[];
  topBlockedIPs: { ip: string; count: number }[];
  securityTimeline: { date: string; events: number }[];
}

export interface SecurityLog {
  id: string;
  event_type: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
}

export const useSecurityMetrics = () => {
  return useQuery({
    queryKey: ['security-metrics'],
    queryFn: async (): Promise<SecurityMetrics> => {
      const yesterday = subDays(new Date(), 1).toISOString();
      
      // Buscar tentativas de login falhas nas últimas 24h
      const { count: failedLogins24h } = await supabase
        .from('security_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'login_failed')
        .gte('created_at', yesterday);

      // Buscar usuários com cadastro pendente (cadastro_completo = false)
      const { count: pendingAniversariantes } = await supabase
        .from('aniversariantes')
        .select('*', { count: 'exact', head: true })
        .eq('cadastro_completo', false);

      const { count: pendingEstabelecimentos } = await supabase
        .from('estabelecimentos')
        .select('*', { count: 'exact', head: true })
        .eq('cadastro_completo', false);

      const pendingRegistrations = (pendingAniversariantes || 0) + (pendingEstabelecimentos || 0);

      // Buscar rate limits atingidos hoje
      const today = new Date().toISOString().split('T')[0];
      const { count: rateLimitsHit } = await supabase
        .from('security_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'rate_limit_hit')
        .gte('created_at', today);

      // Buscar atividades suspeitas (severity = critical)
      const { data: suspiciousActivitiesRaw } = await supabase
        .from('security_logs')
        .select('*')
        .eq('severity', 'critical')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const suspiciousActivities = (suspiciousActivitiesRaw || []) as SecurityLog[];

      // Top IPs com mais tentativas falhas
      const { data: failedLoginsByIP } = await supabase
        .from('security_logs')
        .select('ip_address')
        .eq('event_type', 'login_failed')
        .gte('created_at', yesterday)
        .not('ip_address', 'is', null);

      const ipCounts = (failedLoginsByIP || []).reduce((acc, log) => {
        const ip = log.ip_address!;
        acc[ip] = (acc[ip] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topBlockedIPs = Object.entries(ipCounts)
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Timeline de eventos (últimos 7 dias)
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data: timelineData } = await supabase
        .from('security_logs')
        .select('created_at')
        .gte('created_at', sevenDaysAgo);

      const timeline = (timelineData || []).reduce((acc, log) => {
        const date = log.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const securityTimeline = Object.entries(timeline)
        .map(([date, events]) => ({ date, events }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        failedLogins24h: failedLogins24h || 0,
        pendingRegistrations,
        rateLimitsHit: rateLimitsHit || 0,
        suspiciousActivities: suspiciousActivities || [],
        topBlockedIPs,
        securityTimeline,
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};
