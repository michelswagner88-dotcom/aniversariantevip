import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FlashPromo {
  id: string;
  estabelecimento_id: string;
  title: string;
  description: string;
  cidade: string;
  estado: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PAUSED';
  created_at: string;
  expires_at: string;
  views_count: number;
  claims_count: number;
  estabelecimentos?: {
    nome_fantasia: string | null;
    logo_url: string | null;
    categoria: string[] | null;
  };
}

interface UseFlashPromosOptions {
  cidade?: string;
  estado?: string;
  enabled?: boolean;
}

export const useFlashPromos = (options: UseFlashPromosOptions = {}) => {
  const { cidade, estado, enabled = true } = options;

  return useQuery({
    queryKey: ['flash-promos', cidade, estado],
    queryFn: async () => {
      let query = supabase
        .from('flash_promos')
        .select(`
          *,
          estabelecimentos(nome_fantasia, logo_url, categoria)
        `)
        .eq('status', 'ACTIVE')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

      if (cidade) {
        query = query.eq('cidade', cidade);
      }
      
      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []) as FlashPromo[];
    },
    enabled,
    staleTime: 30 * 1000, // 30 segundos (promos mudam rápido)
    gcTime: 60 * 1000, // 1 minuto
  });
};