import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sanitizarInput } from "@/lib/sanitize";

interface CidadeDisponivel {
  cidade: string;
  estado: string;
  total: number;
}

// Normalizar string removendo acentos
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const useCidadesAutocomplete = (searchTerm: string) => {
  const [cidadesFiltradas, setCidadesFiltradas] = useState<CidadeDisponivel[]>([]);

  // Buscar APENAS cidades que têm estabelecimentos cadastrados
  const { data: cidadesDisponiveis, isLoading: isLoadingCidades } = useQuery({
    queryKey: ["cidades-disponiveis-unicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estabelecimentos")
        .select("cidade, estado")
        .eq("ativo", true)
        .not("cidade", "is", null)
        .not("estado", "is", null);

      if (error) {
        console.error("[Cidades] Erro ao buscar:", error);
        return [];
      }

      // Agrupar e contar por cidade/estado
      const cidadesMap = new Map<string, CidadeDisponivel>();

      data?.forEach((e) => {
        if (e.cidade && e.estado) {
          const key = `${normalizeString(e.cidade)}-${e.estado.toLowerCase()}`;

          if (cidadesMap.has(key)) {
            cidadesMap.get(key)!.total++;
          } else {
            cidadesMap.set(key, {
              cidade: e.cidade,
              estado: e.estado.toUpperCase(),
              total: 1,
            });
          }
        }
      });

      // Converter para array e ordenar por total (mais estabelecimentos primeiro)
      const resultado = Array.from(cidadesMap.values()).sort((a, b) => b.total - a.total);

      console.log("[Cidades] Disponíveis:", resultado.length);
      return resultado;
    },
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
    gcTime: 30 * 60 * 1000,
  });

  // Filtrar cidades baseado no termo de busca
  useEffect(() => {
    if (!cidadesDisponiveis || cidadesDisponiveis.length === 0) {
      setCidadesFiltradas([]);
      return;
    }

    // Se não tem termo, mostrar top 5 por quantidade
    if (!searchTerm || searchTerm.length < 2) {
      setCidadesFiltradas(cidadesDisponiveis.slice(0, 5));
      return;
    }

    const searchSanitizado = sanitizarInput(searchTerm, 50);
    const searchNormalizado = normalizeString(searchSanitizado);

    // Filtrar: primeiro as que COMEÇAM, depois as que CONTÊM
    const queComecam: CidadeDisponivel[] = [];
    const queContem: CidadeDisponivel[] = [];

    cidadesDisponiveis.forEach((cidade) => {
      const cidadeNormalizada = normalizeString(cidade.cidade);

      if (cidadeNormalizada.startsWith(searchNormalizado)) {
        queComecam.push(cidade);
      } else if (cidadeNormalizada.includes(searchNormalizado)) {
        queContem.push(cidade);
      }
    });

    // Combinar e limitar a 8 resultados
    const resultado = [...queComecam, ...queContem].slice(0, 8);
    setCidadesFiltradas(resultado);
  }, [searchTerm, cidadesDisponiveis]);

  return {
    cidades: cidadesFiltradas,
    isLoading: isLoadingCidades,
    todasCidades: cidadesDisponiveis || [],
  };
};

// Hook separado para listar TODAS as cidades disponíveis (para dropdown)
export const useCidadesDisponiveis = () => {
  return useQuery({
    queryKey: ["cidades-disponiveis-todas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estabelecimentos")
        .select("cidade, estado")
        .eq("ativo", true)
        .not("cidade", "is", null)
        .not("estado", "is", null);

      if (error) {
        console.error("[Cidades] Erro:", error);
        return [];
      }

      // Agrupar e contar
      const cidadesMap = new Map<string, CidadeDisponivel>();

      data?.forEach((e) => {
        if (e.cidade && e.estado) {
          const key = `${normalizeString(e.cidade)}-${e.estado.toLowerCase()}`;

          if (cidadesMap.has(key)) {
            cidadesMap.get(key)!.total++;
          } else {
            cidadesMap.set(key, {
              cidade: e.cidade,
              estado: e.estado.toUpperCase(),
              total: 1,
            });
          }
        }
      });

      return Array.from(cidadesMap.values()).sort((a, b) => b.total - a.total);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
