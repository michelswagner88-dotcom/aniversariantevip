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
    slug: string | null;
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
      const now = new Date().toISOString();
      
      let query = supabase
        .from('flash_promos')
        .select(`
          *,
          estabelecimentos(nome_fantasia, logo_url, categoria, slug, estado, cidade)
        `)
        .eq('status', 'ACTIVE')
        .gt('expires_at', now)
        .order('expires_at', { ascending: true });

      if (cidade) {
        query = query.eq('cidade', cidade);
      }
      
      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filtro adicional no frontend como safety check
      const activeDeals = (data || []).filter(deal => {
        const expiresAt = new Date(deal.expires_at);
        return expiresAt > new Date() && deal.status === 'ACTIVE';
      });
      
      return activeDeals as FlashPromo[];
    },
    enabled,
    staleTime: 10 * 1000, // 10 segundos para dados mais frescos
    gcTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refetch a cada 30s automaticamente
  });
};