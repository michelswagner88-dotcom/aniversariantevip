import { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { calcularCentro } from '@/lib/geoUtils';

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
  showClusters?: boolean;
}

const mapContainerStyle = {
  width: '100%',
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Dark mode styles para o mapa
const darkModeStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b5cf6' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

export const MapaEstabelecimentos = ({
  estabelecimentos,
  userLocation,
  onMarkerClick,
  height = '500px',
  showClusters = true,
}: MapaEstabelecimentosProps) => {
  const [selectedPlace, setSelectedPlace] = useState<Estabelecimento | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Filtrar estabelecimentos com coordenadas válidas
  const estabelecimentosValidos = estabelecimentos.filter(
    (e) => e.latitude && e.longitude
  );

  // Calcular centro do mapa
  const center = userLocation || calcularCentro(
    estabelecimentosValidos.map((e) => ({
      lat: e.latitude,
      lng: e.longitude,
    }))
  );

  const handleMarkerClick = (est: Estabelecimento) => {
    setSelectedPlace(est);
    if (onMarkerClick) {
      onMarkerClick(est);
    }
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full bg-destructive/10 text-destructive p-4 rounded-lg" style={{ height }}>
        <p className="font-semibold">Erro: Chave do Google Maps não configurada</p>
        <p className="text-sm">Configure VITE_GOOGLE_MAPS_API_KEY no arquivo .env</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height }}
        center={center}
        zoom={userLocation ? 13 : 12}
        onLoad={setMap}
        options={{
          styles: darkModeStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Marker do usuário */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 3,
            }}
            title="Você está aqui"
          />
        )}

        {/* Markers dos estabelecimentos */}
        {showClusters ? (
          <MarkerClusterer>
            {(clusterer) => (
              <>
                {estabelecimentosValidos.map((est) => (
                  <Marker
                    key={est.id}
                    position={{ lat: est.latitude, lng: est.longitude }}
                    clusterer={clusterer}
                    onClick={() => handleMarkerClick(est)}
                    icon={{
                      url: `data:image/svg+xml,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#8b5cf6" stroke="#fff" stroke-width="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3" fill="#fff"/>
                        </svg>
                      `)}`,
                      scaledSize: new google.maps.Size(40, 40),
                    }}
                    title={est.nome_fantasia}
                  />
                ))}
              </>
            )}
          </MarkerClusterer>
        ) : (
          <>
            {estabelecimentosValidos.map((est) => (
              <Marker
                key={est.id}
                position={{ lat: est.latitude, lng: est.longitude }}
                onClick={() => handleMarkerClick(est)}
                icon={{
                  url: `data:image/svg+xml,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#8b5cf6" stroke="#fff" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3" fill="#fff"/>
                    </svg>
                  `)}`,
                  scaledSize: new google.maps.Size(40, 40),
                }}
                title={est.nome_fantasia}
              />
            ))}
          </>
        )}

        {/* InfoWindow */}
        {selectedPlace && (
          <InfoWindow
            position={{
              lat: selectedPlace.latitude,
              lng: selectedPlace.longitude,
            }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-2 min-w-[200px]">
              {selectedPlace.logo_url && (
                <img
                  src={selectedPlace.logo_url}
                  alt={selectedPlace.nome_fantasia}
                  className="w-full h-24 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-bold text-gray-900">{selectedPlace.nome_fantasia}</h3>
              {selectedPlace.categoria && selectedPlace.categoria.length > 0 && (
                <p className="text-sm text-gray-600">{selectedPlace.categoria[0]}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {selectedPlace.bairro}, {selectedPlace.cidade}
              </p>
              {selectedPlace.distancia !== undefined && (
                <p className="text-sm text-violet-600 mt-1 font-medium">
                  {selectedPlace.distancia < 1
                    ? `${Math.round(selectedPlace.distancia * 1000)}m`
                    : `${selectedPlace.distancia.toFixed(1)}km`}
                </p>
              )}
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setSelectedPlace(null);
                  if (onMarkerClick) {
                    onMarkerClick(selectedPlace);
                  }
                }}
              >
                Ver Benefício
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};
