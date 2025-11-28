import { useMemo } from 'react';
import { calcularDistancia } from '@/lib/geoUtils';

/**
 * Hook para filtrar e ordenar estabelecimentos por proximidade
 * @param estabelecimentos Lista de estabelecimentos
 * @param userLocation Localização do usuário
 * @param raioKm Raio de filtragem ('all' ou número em km)
 * @param ordenacao Tipo de ordenação
 * @returns Estabelecimentos filtrados e ordenados com distância calculada
 */
export const useEstabelecimentosProximos = (
  estabelecimentos: any[] | undefined,
  userLocation: { lat: number; lng: number } | null,
  raioKm: string,
  ordenacao: string
) => {
  return useMemo(() => {
    if (!estabelecimentos) return [];

    // Calcular distância para cada estabelecimento
    let resultado = estabelecimentos.map(est => {
      const distancia = userLocation && est.latitude && est.longitude
        ? calcularDistancia(userLocation.lat, userLocation.lng, Number(est.latitude), Number(est.longitude))
        : null;
      
      return { ...est, distancia };
    });

    // Filtrar por raio
    if (raioKm !== 'all' && userLocation) {
      const raio = parseFloat(raioKm);
      resultado = resultado.filter(est => est.distancia !== null && est.distancia <= raio);
    }

    // Ordenar
    switch (ordenacao) {
      case 'distancia':
        resultado.sort((a, b) => {
          if (a.distancia === null) return 1;
          if (b.distancia === null) return -1;
          return a.distancia - b.distancia;
        });
        break;
      case 'nome':
        resultado.sort((a, b) => (a.nome_fantasia || '').localeCompare(b.nome_fantasia || ''));
        break;
      case 'avaliacao':
        resultado.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'recentes':
        resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return resultado;
  }, [estabelecimentos, userLocation, raioKm, ordenacao]);
};
