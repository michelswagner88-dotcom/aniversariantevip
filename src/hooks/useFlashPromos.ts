import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['flash-promos', cidade, estado],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      let q = supabase
        .from('flash_promos')
        .select(`
          *,
          estabelecimentos!fk_flash_promos_estabelecimento(nome_fantasia, logo_url, categoria, slug, estado, cidade)
        `)
        .eq('status', 'ACTIVE')
        .gt('expires_at', now)
        .order('expires_at', { ascending: true });

      if (cidade) {
        q = q.eq('cidade', cidade);
      }
      
      if (estado) {
        q = q.eq('estado', estado);
      }

      const { data, error } = await q;

      if (error) throw error;
      
      // Filtro adicional no frontend como safety check
      const activeDeals = (data || []).filter(deal => {
        const expiresAt = new Date(deal.expires_at);
        return expiresAt > new Date() && deal.status === 'ACTIVE';
      });
      
      return activeDeals as FlashPromo[];
    },
    enabled,
    staleTime: 0, // Sempre fresh para realtime
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // REALTIME: Escutar mudanças nas promos
  useEffect(() => {
    if (!enabled) return;
    
    console.log('[useFlashPromos] Configurando realtime listener...');
    
    const channel = supabase
      .channel('flash-promos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flash_promos',
        },
        (payload) => {
          console.log('[Realtime] Flash promo mudou:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['flash-promos'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Flash promos subscription:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);

  return query;
};
