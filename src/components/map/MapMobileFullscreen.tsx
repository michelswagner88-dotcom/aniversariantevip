import React, { Suspense, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { X, Navigation, Loader2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Establishment } from './AirbnbMapLayout';
import { useEffect, useRef } from 'react';

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

interface MapMobileFullscreenProps {
  establishments: Establishment[];
  onEstablishmentClick: (establishment: Establishment) => void;
  userLocation?: { lat: number; lng: number } | null;
  onClose: () => void;
}

// Bottom Sheet para detalhes do estabelecimento
const BottomSheet: React.FC<{
  establishment: Establishment;
  onClose: () => void;
  onViewDetails: () => void;
}> = ({ establishment, onClose, onViewDetails }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-in-bottom touch-pan-y">
        <Card className="rounded-t-3xl border-t border-white/10 bg-slate-900/95 backdrop-blur-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Drag Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" />
          
          <div className="flex gap-4">
            {/* Image */}
            {establishment.logo_url && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img 
                  src={establishment.logo_url} 
                  alt={establishment.nome_fantasia}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">
                {establishment.nome_fantasia}
              </h3>
              <p className="text-sm text-slate-400 mb-2 line-clamp-1">
                {establishment.cidade}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                  {establishment.categoria[0]}
                </span>
              </div>
              <Button 
                onClick={onViewDetails}
                className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/20"
              >
                Ver Benefício 🎁
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

// Componente interno que renderiza os markers
const MapMarkers: React.FC<{
  establishments: Establishment[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  onMapReady?: (map: google.maps.Map) => void;
}> = ({ establishments, selectedId, onMarkerClick, userLocation, onMapReady }) => {
  const map = useMap();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  // Notificar quando o mapa estiver pronto
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  // Centralizar no usuário quando a localização for obtida
  useEffect(() => {
    if (!map || !userLocation) return;
    map.setCenter(userLocation);
    map.setZoom(14);
  }, [map, userLocation]);

  // Fit bounds
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
                ${isSelected ? 'z-50 scale-110' : 'z-10 hover:scale-105 hover:z-40'}
              `}
            >
              <div className="absolute inset-0 -m-4" />
              
              <div 
                className={`
                  px-3 py-2 rounded-xl shadow-lg
                  flex items-center gap-2 whitespace-nowrap
                  transition-all duration-200
                  ${isSelected 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' 
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                  }
                `}
                style={{
                  boxShadow: isSelected 
                    ? '0 4px 20px rgba(139, 92, 246, 0.5)' 
                    : '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                <span className="text-base">{icon}</span>
                <span className="text-sm font-semibold max-w-[140px] truncate">
                  {establishment.nome_fantasia || 'Estabelecimento'}
                </span>
              </div>
              
              <div 
                className={`
                  absolute left-1/2 -translate-x-1/2 -bottom-2
                  w-0 h-0 
                  border-l-[8px] border-l-transparent
                  border-r-[8px] border-r-transparent
                  border-t-[8px]
                  transition-colors duration-200
                  ${isSelected 
                    ? 'border-t-fuchsia-600' 
                    : 'border-t-white'
                  }
                `}
              />
              
              {isSelected && (
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

export const MapMobileFullscreen: React.FC<MapMobileFullscreenProps> = ({
  establishments,
  onEstablishmentClick,
  userLocation,
  onClose,
}) => {
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const defaultCenter = userLocation || { lat: -27.5954, lng: -48.5480 };
  const selectedEstablishment = establishments.find(e => e.id === selectedEstablishmentId);

  const handleMarkerClick = (id: string) => {
    setSelectedEstablishmentId(id);
  };

  const handleViewDetails = () => {
    if (selectedEstablishment) {
      onEstablishmentClick(selectedEstablishment);
    }
  };

  const handleCloseBottomSheet = () => {
    setSelectedEstablishmentId(null);
  };

  const handleRecenterToUser = () => {
    if (userLocation && mapInstance) {
      mapInstance.setCenter(userLocation);
      mapInstance.setZoom(15);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 animate-fade-in">
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        className="absolute top-4 left-4 z-50 bg-slate-900/90 backdrop-blur-md border border-white/10 hover:bg-slate-800/90 hover:scale-110 active:scale-95 transition-all duration-200"
        size="icon"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Recenter Button */}
      {userLocation && (
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

      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            <p className="text-sm text-slate-400">Carregando mapa...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950 p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-slate-400 mb-4">{mapError}</p>
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
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
              mapId="aniversariante-vip-map-mobile"
              gestureHandling="greedy"
              disableDefaultUI={false}
              zoomControl={true}
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              className="w-full h-full"
            >
              <MapMarkers
                establishments={establishments}
                selectedId={selectedEstablishmentId}
                onMarkerClick={handleMarkerClick}
                userLocation={userLocation}
                onMapReady={setMapInstance}
              />
            </Map>
          </APIProvider>
        </Suspense>
      )}

      {/* Show List Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
        <Button
          onClick={onClose}
          className="shadow-2xl px-6 py-6 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 hover:bg-slate-800/90 hover:scale-105 active:scale-95 flex items-center gap-2 transition-all duration-200"
        >
          <List className="w-5 h-5" />
          <span className="font-semibold">Mostrar Lista</span>
        </Button>
      </div>

      {/* Bottom Sheet */}
      {selectedEstablishment && (
        <BottomSheet
          establishment={selectedEstablishment}
          onClose={handleCloseBottomSheet}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};
