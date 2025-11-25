import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

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
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-in-bottom">
        <Card className="rounded-t-3xl border-t border-white/10 bg-slate-900/95 backdrop-blur-xl p-6 shadow-2xl">
          {/* Drag Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
          
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
                className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90"
              >
                Ver Benefício
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
}> = ({ establishments, selectedId, onMarkerClick, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || establishments.length === 0) return;

    // Fit bounds to show all establishments
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

  return (
    <>
      {/* User Location Marker */}
      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
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
          >
            <div className="relative cursor-pointer group">
              {/* Touch-friendly padding */}
              <div className="absolute inset-0 -m-3" />
              
              <Pin
                background={getCategoryColor(establishment.categoria)}
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={selectedId === establishment.id ? 1.3 : 1.1}
              />
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

  const selectedEstablishment = establishments.find(e => e.id === selectedEstablishmentId);

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

  return (
    <>
      {/* FAB - Floating Action Button */}
      <Button
        onClick={() => setIsMapOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 shadow-2xl px-6 py-6 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 hover:bg-slate-800/90 flex items-center gap-2"
      >
        <MapPin className="w-5 h-5" />
        <span className="font-semibold">Mapa</span>
      </Button>

      {/* Full Screen Map */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 animate-fade-in">
          {/* Close Button */}
          <Button
            onClick={() => setIsMapOpen(false)}
            variant="ghost"
            className="absolute top-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md border border-white/10 hover:bg-slate-800/90"
            size="icon"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Map */}
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={13}
              mapId="aniversariante-vip-map"
              gestureHandling="greedy"
              disableDefaultUI={false}
              zoomControl={true}
              fullscreenControl={false}
              streetViewControl={false}
              className="w-full h-full"
            >
              <MapContent
                establishments={establishments}
                selectedId={selectedEstablishmentId}
                onMarkerClick={handleMarkerClick}
                userLocation={userLocation}
              />
            </Map>
          </APIProvider>

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
