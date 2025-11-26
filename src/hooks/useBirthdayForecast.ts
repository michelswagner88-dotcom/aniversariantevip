import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BirthdayForecast {
  next_7_days: number;
  next_30_days: number;
  trend: string;
  status: 'hot' | 'cold' | 'stable' | 'error' | 'unknown';
  previous_7_days: number;
  cidade: string;
  estado: string;
  updated_at: string;
  error?: string;
}

interface UseBirthdayForecastOptions {
  cidade?: string;
  estado?: string;
  enabled?: boolean;
}

export const useBirthdayForecast = (options: UseBirthdayForecastOptions = {}) => {
  const { cidade, estado, enabled = true } = options;

  return useQuery<BirthdayForecast>({
    queryKey: ['birthday-forecast', cidade, estado],
    queryFn: async () => {
      if (!cidade || !estado) {
        throw new Error('Cidade e estado são obrigatórios');
      }

      const { data, error } = await supabase.rpc('get_birthday_forecast', {
        p_cidade: cidade,
        p_estado: estado,
      });

      if (error) {
        console.error('Error fetching birthday forecast:', error);
        throw error;
      }

      return data as unknown as BirthdayForecast;
    },
    enabled: enabled && !!cidade && !!estado,
    staleTime: 60 * 60 * 1000, // 1 hora (dados de aniversários não mudam muito rápido)
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
    refetchOnWindowFocus: false,
  });
};
