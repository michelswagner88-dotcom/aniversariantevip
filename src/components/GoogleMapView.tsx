import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { MapPin, X, Navigation, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

interface Establishment {
  id: string;
  nome_fantasia: string;
  categoria: string[];
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  descricao_beneficio: string;
  cidade: string;
}

interface GoogleMapViewProps {
  establishments: Establishment[];
  onEstablishmentClick?: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  restaurantes: '#8B5CF6',
  bares_pubs: '#EC4899',
  cafeterias: '#F59E0B',
  entretenimento: '#10B981',
  hospedagem: '#3B82F6',
  default: '#6366F1'
};

const getCategoryColor = (categories: string[]): string => {
  if (!categories || categories.length === 0) return CATEGORY_COLORS.default;
  return CATEGORY_COLORS[categories[0]] || CATEGORY_COLORS.default;
};

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

const MapContent: React.FC<{
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

    // Centralizar no usuário com zoom apropriado
    map.setCenter(userLocation);
    map.setZoom(14);
  }, [map, userLocation]);

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
  }, [map, establishments]);

  // Setup clustering
  useEffect(() => {
    if (!map) return;

    // Limpar clusterer anterior
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    // Criar novo clusterer com estilos customizados
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
      {/* User Location Marker - Pulsante e Destacado */}
      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div className="relative">
            {/* Círculo Pulsante Externo */}
            <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div className="w-full h-full bg-blue-500/30 rounded-full animate-ping" />
            </div>
            {/* Círculo Externo */}
            <div className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div className="w-full h-full bg-blue-500/20 rounded-full" />
            </div>
            {/* Ponto Central */}
            <div className="relative w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          </div>
        </AdvancedMarker>
      )}

      {/* Establishment Markers */}
      {establishments.map(establishment => {
        if (!establishment.latitude || !establishment.longitude) return null;

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
            <div className="relative cursor-pointer group transform transition-transform duration-200 hover:scale-110 active:scale-95">
              {/* Touch-friendly padding */}
              <div className="absolute inset-0 -m-4" />
              
              <Pin
                background={getCategoryColor(establishment.categoria)}
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={selectedId === establishment.id ? 1.4 : 1.1}
              />
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div 
                  className="w-full h-full rounded-full blur-xl" 
                  style={{ backgroundColor: getCategoryColor(establishment.categoria) + '40' }}
                />
              </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  establishments,
  onEstablishmentClick,
  userLocation
}) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Verificar se a API key está configurada
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Filtrar estabelecimentos com coordenadas válidas
  const validEstablishments = establishments.filter(est => 
    est.latitude && 
    est.longitude && 
    est.latitude !== 0 && 
    est.longitude !== 0
  );

  const selectedEstablishment = validEstablishments.find(e => e.id === selectedEstablishmentId);

  const defaultCenter = userLocation || { lat: -27.5954, lng: -48.5480 }; // Florianópolis

  const handleMarkerClick = (id: string) => {
    setSelectedEstablishmentId(id);
  };

  const handleViewDetails = () => {
    if (selectedEstablishmentId && onEstablishmentClick) {
      onEstablishmentClick(selectedEstablishmentId);
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

  const handleOpenMap = () => {
    if (!apiKey) {
      toast.error('Google Maps não está configurado corretamente');
      return;
    }
    setIsMapOpen(true);
    setMapError(null);
    
    // Marcar como carregado e remover loading após delay
    setTimeout(() => {
      setMapLoaded(true);
    }, 800);
  };

  const handleMapError = () => {
    setMapError('Erro ao carregar o Google Maps. Verifique o console do navegador (F12) para detalhes.');
    setMapLoaded(true);
    toast.error('Não foi possível carregar o mapa');
  };

  // Mostrar erro crítico se não houver API key
  if (!apiKey) {
    return (
      <Card className="border-destructive bg-destructive/10 p-6 m-4">
        <div className="flex items-start gap-3">
          <div className="text-destructive text-2xl">⚠️</div>
          <div>
            <h3 className="text-lg font-bold text-destructive mb-2">
              Erro Crítico: Google Maps não configurado
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              A chave de API do Google Maps não está configurada no arquivo de ambiente.
            </p>
            <p className="text-xs text-muted-foreground font-mono bg-slate-900/50 p-2 rounded">
              Configure VITE_GOOGLE_MAPS_API_KEY no .env
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* FAB - Floating Action Button */}
      <Button
        onClick={handleOpenMap}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 shadow-2xl px-6 py-6 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 hover:bg-slate-800/90 hover:scale-105 active:scale-95 flex items-center gap-2 transition-all duration-200"
      >
        <MapPin className="w-5 h-5 text-violet-400" />
        <span className="font-semibold">Ver Mapa</span>
      </Button>

      {/* Full Screen Map - Lazy Loading */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 animate-fade-in">
          {/* Close Button */}
          <Button
            onClick={() => setIsMapOpen(false)}
            variant="ghost"
            className="absolute top-4 left-4 z-50 bg-slate-900/90 backdrop-blur-md border border-white/10 hover:bg-slate-800/90 hover:scale-110 active:scale-95 transition-all duration-200"
            size="icon"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Recenter Button - Só aparece se houver localização */}
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
              <Card className="border-destructive bg-destructive/10 p-6 max-w-md">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="text-6xl">🗺️</div>
                  <div>
                    <h3 className="text-lg font-bold text-destructive mb-2">
                      Não foi possível carregar o mapa
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {mapError}
                    </p>
                    <p className="text-xs text-muted-foreground bg-slate-900/50 p-3 rounded">
                      <strong>Para administradores:</strong><br />
                      Abra o Console do navegador (F12) para ver o código de erro específico do Google Maps
                      (Ex: RefererNotAllowed, InvalidKey, etc.)
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsMapOpen(false)}
                    variant="outline"
                  >
                    Fechar
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Map */}
          {!mapError && (
            <Suspense fallback={null}>
              <APIProvider 
                apiKey={apiKey}
                onLoad={() => setMapLoaded(true)}
                onError={handleMapError}
              >
                <Map
                  defaultCenter={defaultCenter}
                  defaultZoom={13}
                  mapId="aniversariante-vip-map"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  zoomControl={true}
                  fullscreenControl={false}
                  streetViewControl={false}
                  mapTypeControl={false}
                  className="w-full h-full"
                >
                  <MapContent
                    establishments={validEstablishments}
                    selectedId={selectedEstablishmentId}
                    onMarkerClick={handleMarkerClick}
                    userLocation={userLocation}
                    onMapReady={setMapInstance}
                  />
                </Map>
              </APIProvider>
            </Suspense>
          )}

          {/* Bottom Sheet */}
          {selectedEstablishment && (
            <BottomSheet
              establishment={selectedEstablishment}
              onClose={handleCloseBottomSheet}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      )}
    </>
  );
};
