import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Estabelecimento {
  id: string;
  nome_fantasia: string;
  categoria: string[] | null;
  latitude: number;
  longitude: number;
  endereco_formatado?: string;
  logo_url?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  distancia?: number;
}

interface MapaEstabelecimentosProps {
  estabelecimentos: Estabelecimento[];
  userLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (estabelecimento: Estabelecimento) => void;
  height?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Estilo clean/Airbnb - fundo claro, minimalista
const airbnbMapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9c9c9' }] },
];

export const MapaEstabelecimentos = ({
  estabelecimentos,
  userLocation,
  onMarkerClick,
  height = '500px',
}: MapaEstabelecimentosProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Filtrar estabelecimentos com coordenadas válidas
  const estabelecimentosValidos = estabelecimentos.filter(
    (e) => e.latitude && e.longitude
  );

  // Calcular centro do mapa
  const calcularCentro = (coords: Array<{ lat: number; lng: number }>) => {
    if (!coords.length) return { lat: -27.5969, lng: -48.5495 }; // Florianópolis default
    
    const total = coords.reduce(
      (acc, coord) => ({
        lat: acc.lat + coord.lat,
        lng: acc.lng + coord.lng,
      }),
      { lat: 0, lng: 0 }
    );
    
    return {
      lat: total.lat / coords.length,
      lng: total.lng / coords.length,
    };
  };

  const center = userLocation || calcularCentro(
    estabelecimentosValidos.map((e) => ({
      lat: e.latitude,
      lng: e.longitude,
    }))
  );

  // Verificar API key
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl" style={{ height }}>
        <div className="text-center p-6">
          <p className="text-red-600 font-semibold mb-2">Erro: Google Maps não configurado</p>
          <p className="text-sm text-gray-600">Configure VITE_GOOGLE_MAPS_API_KEY no arquivo .env</p>
        </div>
      </div>
    );
  }

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) return;

    // Verificar se o Google Maps está carregado
    if (!window.google) {
      setError('Google Maps não carregou. Recarregue a página.');
      setLoading(false);
      return;
    }

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom: userLocation ? 14 : 12,
        styles: airbnbMapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao inicializar mapa:', err);
      setError('Erro ao carregar o mapa');
      setLoading(false);
    }
  }, [center, userLocation]);

  // Adicionar marcadores
  useEffect(() => {
    if (!map || !estabelecimentosValidos.length) return;

    // Limpar marcadores antigos
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    estabelecimentosValidos.forEach((est) => {
      const position = { lat: Number(est.latitude), lng: Number(est.longitude) };
      bounds.extend(position);

      // Marcador customizado estilo Airbnb - círculo roxo simples
      const marker = new google.maps.Marker({
        position,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#8b5cf6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 4,
        },
        title: est.nome_fantasia,
      });

      // InfoWindow estilo clean premium
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="
            padding: 16px;
            min-width: 240px;
            max-width: 280px;
            font-family: 'Inter', system-ui, sans-serif;
          ">
            <div style="
              display: flex;
              align-items: flex-start;
              gap: 12px;
              margin-bottom: 12px;
            ">
              ${est.logo_url ? `
                <img 
                  src="${est.logo_url}" 
                  alt="${est.nome_fantasia}"
                  style="
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    object-fit: cover;
                    flex-shrink: 0;
                  "
                />
              ` : `
                <div style="
                  width: 56px;
                  height: 56px;
                  border-radius: 12px;
                  background: linear-gradient(135deg, #8b5cf6, #d946ef);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: 700;
                  font-size: 20px;
                  flex-shrink: 0;
                ">
                  ${est.nome_fantasia?.charAt(0) || '?'}
                </div>
              `}
              <div style="flex: 1; min-width: 0;">
                <h3 style="
                  margin: 0 0 4px 0;
                  font-size: 15px;
                  font-weight: 600;
                  color: #1a1a1a;
                  line-height: 1.3;
                  overflow: hidden;
                  text-overflow: ellipsis;
                ">
                  ${est.nome_fantasia || 'Estabelecimento'}
                </h3>
                <p style="
                  margin: 0;
                  font-size: 13px;
                  color: #666;
                ">
                  ${est.categoria?.[0] || ''}
                </p>
                ${est.distancia !== undefined ? `
                  <p style="
                    margin: 6px 0 0 0;
                    font-size: 12px;
                    color: #8b5cf6;
                    font-weight: 500;
                  ">
                    📍 ${est.distancia < 1 
                      ? `${Math.round(est.distancia * 1000)}m` 
                      : `${est.distancia.toFixed(1)}km`}
                  </p>
                ` : ''}
              </div>
            </div>
            
            ${est.bairro || est.cidade ? `
              <p style="
                margin: 0 0 12px 0;
                font-size: 12px;
                color: #999;
                line-height: 1.4;
              ">
                ${est.bairro ? est.bairro + ', ' : ''}${est.cidade || ''}
              </p>
            ` : ''}
            
            <button
              onclick="window.location.href='/estabelecimento/${est.id}'"
              style="
                width: 100%;
                padding: 10px 16px;
                background: linear-gradient(135deg, #8b5cf6, #d946ef);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
              "
              onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(139,92,246,0.3)'"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'"
            >
              Ver Benefícios
            </button>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Fechar outras infoWindows
        markersRef.current.forEach(m => {
          const iw = (m as any).infoWindow;
          if (iw) iw.close();
        });
        
        infoWindow.open(map, marker);
        
        if (onMarkerClick) {
          onMarkerClick(est);
        }
      });

      (marker as any).infoWindow = infoWindow;
      markersRef.current.push(marker);
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (estabelecimentosValidos.length > 1) {
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [map, estabelecimentosValidos, onMarkerClick]);

  // Marcador da localização do usuário
  useEffect(() => {
    if (!map || !userLocation) return;

    const userMarker = new google.maps.Marker({
      position: userLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'Você está aqui',
      zIndex: 9999,
    });

    return () => {
      userMarker.setMap(null);
    };
  }, [map, userLocation]);

  // Loading state
  if (loading) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 rounded-xl"
        style={{ height }}
      >
        <div className="text-center p-6 max-w-sm">
          <p className="text-red-600 font-semibold mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200"
      style={{ minHeight: '400px', height }}
    />
  );
};
