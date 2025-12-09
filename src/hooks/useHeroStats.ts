import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HeroStats {
  establishments: number;
  users: number;
  cities: number;
}

export const useHeroStats = () => {
  return useQuery({
    queryKey: ["hero-stats"],
    queryFn: async (): Promise<HeroStats> => {
      // Executar todas as queries em paralelo (mais rápido)
      const [establishmentResult, userResult, citiesResult] = await Promise.all([
        // Query 1: Count de estabelecimentos ativos
        supabase
          .from("estabelecimentos")
          .select("*", { count: "exact", head: true })
          .eq("ativo", true)
          .is("deleted_at", null),

        // Query 2: Count de aniversariantes
        supabase.from("aniversariantes").select("*", { count: "exact", head: true }).is("deleted_at", null),

        // Query 3: Cidades únicas (otimizado - só busca cidade, distinct no JS)
        // Limitamos a 1000 pra não sobrecarregar se tiver muitos registros
        supabase
          .from("estabelecimentos")
          .select("cidade")
          .eq("ativo", true)
          .is("deleted_at", null)
          .not("cidade", "is", null)
          .limit(5000), // Limite de segurança
      ]);

      // Contar cidades únicas
      const uniqueCities = new Set(citiesResult.data?.map((e) => e.cidade?.toLowerCase().trim()).filter(Boolean) || []);

      return {
        establishments: establishmentResult.count || 0,
        users: userResult.count || 0,
        cities: uniqueCities.size,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (dados mudam pouco)
    gcTime: 30 * 60 * 1000, // 30 minutos cache
    refetchOnWindowFocus: false, // Não refetch ao focar janela
  });
};
