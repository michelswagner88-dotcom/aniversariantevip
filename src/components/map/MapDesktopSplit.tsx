import React, { Suspense, useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Establishment } from './AirbnbMapLayout';

const CATEGORY_ICONS: Record<string, string> = {
  'Restaurante': '🍽️',
  'Bar': '🍺',
  'Academia': '💪',
  'Salão de Beleza': '💇',
  'Barbearia': '✂️',
  'Cafeteria': '☕',
  'Casa Noturna': '🎉',
  'Confeitaria': '🍰',
  'Entretenimento': '🎬',
  'Hospedagem': '🏨',
  'Loja': '🛍️',
  'Serviços': '🔧',
  'Sorveteria': '🍦',
  'Outros Comércios': '🏪',
};

const getCategoryIcon = (categories: string[]): string => {
  if (!categories || categories.length === 0) return '📍';
  return CATEGORY_ICONS[categories[0]] || '📍';
};

interface MapDesktopSplitProps {
  establishments: Establishment[];
  onEstablishmentClick: (establishment: Establishment) => void;
  userLocation?: { lat: number; lng: number } | null;
  hoveredId: string | null;
  onPinClick: (id: string) => void;
  onPinHover: (id: string | null) => void;
  listHeader?: React.ReactNode;
  children: React.ReactNode;
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onCardHover: (id: string | null) => void;
}

// Componente interno que renderiza os markers
const MapMarkers: React.FC<{
  establishments: Establishment[];
  selectedId: string | null;
  hoveredId: string | null;
  onMarkerClick: (id: string) => void;
  onMarkerHover: (id: string | null) => void;
  userLocation?: { lat: number; lng: number } | null;
}> = ({ establishments, selectedId, hoveredId, onMarkerClick, onMarkerHover, userLocation }) => {
  const map = useMap();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  // Fit bounds para mostrar todos os estabelecimentos
  useEffect(() => {
    if (!map || establishments.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    
    establishments.forEach(est => {
      if (est.latitude && est.longitude) {
        bounds.extend({ lat: est.latitude, lng: est.longitude });
      }
    });

    if (userLocation) {
      bounds.extend(userLocation);
    }

    map.fitBounds(bounds, 50);
  }, [map, establishments, userLocation]);

  // Setup clustering
  useEffect(() => {
    if (!map) return;

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    clustererRef.current = new MarkerClusterer({
      map,
      markers: markersRef.current,
      renderer: {
        render: ({ count, position }) => {
          const color = count > 10 ? '#ec4899' : count > 5 ? '#a855f7' : '#8b5cf6';
          return new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.9,
              strokeWeight: 3,
              strokeColor: '#ffffff',
              scale: Math.min(15 + count * 1.5, 35),
            },
            label: {
              text: String(count),
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
            },
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          });
        },
      },
    });

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, [map, establishments]);

  return (
    <>
      {/* User Location Marker */}
      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div className="relative">
            <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div className="w-full h-full bg-blue-500/30 rounded-full animate-ping" />
            </div>
            <div className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div className="w-full h-full bg-blue-500/20 rounded-full" />
            </div>
            <div className="relative w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          </div>
        </AdvancedMarker>
      )}

      {/* Establishment Markers */}
      {establishments.map(establishment => {
        if (!establishment.latitude || !establishment.longitude) return null;

        const isSelected = selectedId === establishment.id;
        const isHovered = hoveredId === establishment.id;
        const icon = getCategoryIcon(establishment.categoria);

        return (
          <AdvancedMarker
            key={establishment.id}
            position={{ lat: establishment.latitude, lng: establishment.longitude }}
            onClick={() => onMarkerClick(establishment.id)}
            ref={(marker) => {
              if (marker && !markersRef.current.includes(marker)) {
                markersRef.current.push(marker);
              }
            }}
          >
            <div 
              className={`
                relative cursor-pointer transition-all duration-200
                ${isSelected || isHovered ? 'z-50 scale-110' : 'z-10 hover:scale-105 hover:z-40'}
              `}
              onMouseEnter={() => onMarkerHover(establishment.id)}
              onMouseLeave={() => onMarkerHover(null)}
            >
              {/* Balão com nome */}
              <div 
                className={`
                  px-3 py-2 rounded-xl shadow-lg
                  flex items-center gap-2 whitespace-nowrap
                  transition-all duration-200
                  ${isSelected || isHovered 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' 
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                  }
                `}
                style={{
                  boxShadow: isSelected || isHovered 
                    ? '0 4px 20px rgba(139, 92, 246, 0.5)' 
                    : '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                <span className="text-base">{icon}</span>
                <span className="text-sm font-semibold max-w-[140px] truncate">
                  {establishment.nome_fantasia || 'Estabelecimento'}
                </span>
              </div>
              
              {/* Seta apontando para baixo */}
              <div 
                className={`
                  absolute left-1/2 -translate-x-1/2 -bottom-2
                  w-0 h-0 
                  border-l-[8px] border-l-transparent
                  border-r-[8px] border-r-transparent
                  border-t-[8px]
                  transition-colors duration-200
                  ${isSelected || isHovered 
                    ? 'border-t-fuchsia-600' 
                    : 'border-t-white'
                  }
                `}
              />
              
              {/* Glow effect */}
              {(isSelected || isHovered) && (
                <div className="absolute inset-0 -z-10 animate-pulse">
                  <div className="w-full h-full rounded-xl blur-xl bg-violet-500/30" />
                </div>
              )}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export const MapDesktopSplit: React.FC<MapDesktopSplitProps> = ({
  establishments,
  onEstablishmentClick,
  userLocation,
  hoveredId,
  onPinClick,
  onPinHover,
  listHeader,
  children,
  cardRefs,
  onCardHover,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const defaultCenter = userLocation || { lat: -27.5954, lng: -48.5480 };

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    onPinClick(id);
  };

  const handleRecenterToUser = () => {
    if (userLocation && mapInstance) {
      mapInstance.setCenter(userLocation);
      mapInstance.setZoom(15);
    }
  };

  // Renderiza children diretamente - o parent vai passar os handlers
  const enhancedChildren = children;

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px]">
      {/* Lista (esquerda) - 55% */}
      <div className="w-[55%] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {listHeader}
        {enhancedChildren}
      </div>

      {/* Mapa (direita) - 45% */}
      <div className="w-[45%] sticky top-0 h-full rounded-2xl overflow-hidden border border-white/10">
        {/* Loading */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <p className="text-sm text-slate-400">Carregando mapa...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {mapError && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900 p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-slate-400">{mapError}</p>
            </div>
          </div>
        )}

        {/* Recenter Button */}
        {userLocation && mapLoaded && (
          <Button
            onClick={handleRecenterToUser}
            variant="ghost"
            className="absolute top-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md border border-white/10 hover:bg-slate-800/90 hover:scale-110 active:scale-95 transition-all duration-200"
            size="icon"
            title="Centralizar na minha localização"
          >
            <Navigation className="w-5 h-5 text-blue-400" />
          </Button>
        )}

        {/* Map */}
        {!mapError && (
          <Suspense fallback={null}>
            <APIProvider 
              apiKey={apiKey}
              onLoad={() => setMapLoaded(true)}
              onError={() => setMapError('Não foi possível carregar o mapa.')}
            >
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={13}
                mapId="aniversariante-vip-map-split"
                gestureHandling="greedy"
                disableDefaultUI={false}
                zoomControl={true}
                fullscreenControl={false}
                streetViewControl={false}
                mapTypeControl={false}
                className="w-full h-full"
                onCameraChanged={(ev) => {
                  if (!mapInstance) {
                    setMapInstance(ev.map);
                  }
                }}
              >
                <MapMarkers
                  establishments={establishments}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  onMarkerClick={handleMarkerClick}
                  onMarkerHover={onPinHover}
                  userLocation={userLocation}
                />
              </Map>
            </APIProvider>
          </Suspense>
        )}
      </div>
    </div>
  );
};
