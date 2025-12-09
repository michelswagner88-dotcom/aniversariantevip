import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryClient";
import { Tables } from "@/integrations/supabase/types";
import { sanitizarInput } from "@/lib/sanitize";

type Estabelecimento = Tables<"estabelecimentos">;

interface EstabelecimentoFilters {
  cidade?: string;
  estado?: string;
  categoria?: string[];
  search?: string;
  showAll?: boolean;
  enabled?: boolean;
}

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let realtimeSubscribers = 0;

export const useEstabelecimentos = (filters: EstabelecimentoFilters = {}) => {
  const queryClient = useQueryClient();
  const hasSetupRealtime = useRef(false);

  const query = useQuery({
    queryKey: queryKeys.estabelecimentos.list(filters),
    queryFn: async () => {
      console.log("[useEstabelecimentos] Executando query com filtros:", filters);

      let q = supabase
        .from("public_estabelecimentos")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (filters.cidade && filters.estado && !filters.showAll) {
        const cidadeSanitizada = sanitizarInput(filters.cidade, 100);
        const estadoSanitizado = sanitizarInput(filters.estado, 2);
        console.log("[useEstabelecimentos] Filtrando por cidade:", cidadeSanitizada, estadoSanitizado);
        q = q.ilike("cidade", `%${cidadeSanitizada}%`);
        q = q.ilike("estado", estadoSanitizado);
      }

      if (filters.categoria && filters.categoria.length > 0) {
        const categoriasSanitizadas = filters.categoria.map((c) => sanitizarInput(c, 50));
        q = q.overlaps("categoria", categoriasSanitizadas);
      }

      if (filters.search) {
        const searchSanitizado = sanitizarInput(filters.search, 100);
        q = q.or(`nome_fantasia.ilike.%${searchSanitizado}%,razao_social.ilike.%${searchSanitizado}%`);
      }

      const { data, error } = await q;

      console.log("[useEstabelecimentos] Resultado:", {
        count: data?.length || 0,
        error: error?.message,
        primeiroItem: data?.[0]?.nome_fantasia,
      });

      if (error) {
        console.error("[useEstabelecimentos] Erro na query:", error);
        throw error;
      }

      return (data || []) as Estabelecimento[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: filters.enabled !== false,
    placeholderData: [],
  });

  useEffect(() => {
    if (hasSetupRealtime.current) return;
    hasSetupRealtime.current = true;

    realtimeSubscribers++;
    console.log("[Realtime] Subscribers:", realtimeSubscribers);

    if (!realtimeChannel) {
      console.log("[Realtime] Criando channel único...");

      realtimeChannel = supabase
        .channel("estabelecimentos-realtime-singleton")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "estabelecimentos",
          },
          (payload) => {
            console.log("[Realtime] Mudança detectada:", payload.eventType);
            queryClient.invalidateQueries({
              queryKey: ["estabelecimentos"],
              refetchType: "none",
            });
          },
        )
        .subscribe((status) => {
          console.log("[Realtime] Status:", status);
        });
    }

    return () => {
      realtimeSubscribers--;
      console.log("[Realtime] Subscribers restantes:", realtimeSubscribers);

      if (realtimeSubscribers === 0 && realtimeChannel) {
        console.log("[Realtime] Removendo channel...");
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };
  }, [queryClient]);

  return query;
};

export const useEstabelecimento = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.estabelecimentos.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("ID não fornecido");

      const { data, error } = await supabase
        .from("public_estabelecimentos")
        .select("*")
        .eq("id", id)
        .eq("ativo", true)
        .single();

      if (error) throw error;
      return data as Estabelecimento;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useTrackView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estabelecimentoId, userId }: { estabelecimentoId: string; userId?: string }) => {
      const { error } = await supabase.from("estabelecimento_analytics").insert({
        estabelecimento_id: estabelecimentoId,
        tipo_evento: "view",
        user_id: userId,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.establishment(variables.estabelecimentoId),
      });
    },
  });
};
