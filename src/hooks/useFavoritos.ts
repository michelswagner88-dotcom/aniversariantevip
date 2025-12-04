import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFavoritos = (userId: string | null) => {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadFavoritos = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("favoritos")
        .select("estabelecimento_id")
        .eq("usuario_id", userId);

      if (error) throw error;
      setFavoritos(data?.map((f) => f.estabelecimento_id) || []);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadFavoritos();
    } else {
      setFavoritos([]);
    }
  }, [userId, loadFavoritos]);

  // REALTIME: Escutar mudanças nos favoritos do usuário
  useEffect(() => {
    if (!userId) return;
    
    console.log('[useFavoritos] Configurando realtime listener...');
    
    const channel = supabase
      .channel(`favoritos-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favoritos',
          filter: `usuario_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] Favorito mudou:', payload.eventType);
          
          // Atualizar lista local baseado no evento
          if (payload.eventType === 'INSERT' && payload.new) {
            const newFav = payload.new as { estabelecimento_id: string };
            setFavoritos(prev => [...prev, newFav.estabelecimento_id]);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldFav = payload.old as { estabelecimento_id: string };
            setFavoritos(prev => prev.filter(id => id !== oldFav.estabelecimento_id));
          } else {
            // Fallback: recarregar tudo
            loadFavoritos();
          }
          
          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ['favoritos'] });
          queryClient.invalidateQueries({ queryKey: ['meus-favoritos'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Favoritos subscription:', status);
      });

    return () => {
      console.log('[Realtime] Removendo favoritos listener...');
      supabase.removeChannel(channel);
    };
  }, [userId, loadFavoritos, queryClient]);

  const toggleFavorito = async (estabelecimentoId: string) => {
    if (!userId) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar estabelecimentos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const isFav = favoritos.includes(estabelecimentoId);

      if (isFav) {
        // Remove favorito
        const { error } = await supabase
          .from("favoritos")
          .delete()
          .eq("usuario_id", userId)
          .eq("estabelecimento_id", estabelecimentoId);

        if (error) throw error;
        // Realtime irá atualizar automaticamente
        toast({
          title: "Removido dos favoritos",
          description: "Estabelecimento removido da sua lista",
        });
      } else {
        // Adiciona favorito
        const { error } = await supabase
          .from("favoritos")
          .insert({
            usuario_id: userId,
            estabelecimento_id: estabelecimentoId,
          });

        if (error) throw error;
        // Realtime irá atualizar automaticamente
        toast({
          title: "Adicionado aos favoritos",
          description: "Estabelecimento salvo na sua lista",
        });
      }
    } catch (error: any) {
      console.error("Erro ao favoritar:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar favoritos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFavorito = (estabelecimentoId: string) => {
    return favoritos.includes(estabelecimentoId);
  };

  return {
    favoritos,
    toggleFavorito,
    isFavorito,
    loading,
    refetch: loadFavoritos,
  };
};
