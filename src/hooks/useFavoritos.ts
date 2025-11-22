import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFavoritos = (userId: string | null) => {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadFavoritos();
    } else {
      setFavoritos([]);
    }
  }, [userId]);

  const loadFavoritos = async () => {
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
  };

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
      const isFavorito = favoritos.includes(estabelecimentoId);

      if (isFavorito) {
        // Remove favorito
        const { error } = await supabase
          .from("favoritos")
          .delete()
          .eq("usuario_id", userId)
          .eq("estabelecimento_id", estabelecimentoId);

        if (error) throw error;
        setFavoritos(favoritos.filter((id) => id !== estabelecimentoId));
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
        setFavoritos([...favoritos, estabelecimentoId]);
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
  };
};
