/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param lat1 Latitude do ponto 1
 * @param lon1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lon2 Longitude do ponto 2
 * @returns Distância em quilômetros
 */
export const calcularDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Formata a distância para exibição amigável
 * @param distanciaKm Distância em quilômetros
 * @returns String formatada (ex: "500m" ou "2.5km")
 */
export const formatarDistancia = (distanciaKm: number): string => {
  if (distanciaKm < 1) {
    return `${Math.round(distanciaKm * 1000)}m`;
  }
  return `${distanciaKm.toFixed(1)}km`;
};

/**
 * Geocodifica um endereço usando Google Maps API
 * @param endereco Objeto com dados do endereço
 * @param apiKey Chave da API do Google Maps
 * @returns Coordenadas e endereço formatado
 */
export const geocodificarEndereco = async (
  endereco: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade: string;
    estado: string;
  },
  apiKey: string
): Promise<{
  latitude: number;
  longitude: number;
  endereco_formatado: string;
} | null> => {
  try {
    const enderecoCompleto = [
      endereco.rua,
      endereco.numero,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
      'Brasil',
    ]
      .filter(Boolean)
      .join(', ');

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        enderecoCompleto
      )}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.results?.[0]?.geometry?.location) {
      return {
        latitude: data.results[0].geometry.location.lat,
        longitude: data.results[0].geometry.location.lng,
        endereco_formatado: data.results[0].formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
};

/**
 * Calcula o centro geográfico de um conjunto de coordenadas
 * @param coordinates Array de coordenadas {lat, lng}
 * @returns Centro calculado
 */
export const calcularCentro = (
  coordinates: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } => {
  if (coordinates.length === 0) {
    // Centro do Brasil por padrão
    return { lat: -14.235, lng: -51.9253 };
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length,
  };
};

/**
 * Retorna ícone por categoria de estabelecimento
 * @param categoria Categoria do estabelecimento
 * @returns URL do ícone
 */
export const getCategoryIcon = (categoria: string[] | null): string => {
  if (!categoria || categoria.length === 0) {
    return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  }

  const primeiraCategoria = categoria[0].toLowerCase();
  
  const iconMap: Record<string, string> = {
    'restaurante': 'https://maps.google.com/mapfiles/ms/icons/restaurant.png',
    'bar': 'https://maps.google.com/mapfiles/ms/icons/bar.png',
    'cafeteria': 'https://maps.google.com/mapfiles/ms/icons/coffeehouse.png',
    'hotel': 'https://maps.google.com/mapfiles/ms/icons/lodging.png',
    'hospedagem': 'https://maps.google.com/mapfiles/ms/icons/lodging.png',
    'salão de beleza': 'https://maps.google.com/mapfiles/ms/icons/salon.png',
    'barbearia': 'https://maps.google.com/mapfiles/ms/icons/salon.png',
    'academia': 'https://maps.google.com/mapfiles/ms/icons/gym.png',
    'entretenimento': 'https://maps.google.com/mapfiles/ms/icons/movies.png',
    'shopping': 'https://maps.google.com/mapfiles/ms/icons/shopping.png',
  };

  return iconMap[primeiraCategoria] || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
};
