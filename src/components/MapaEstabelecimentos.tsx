import { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { calcularCentro, getCategoryIcon } from '@/lib/geoUtils';

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

  const handleComoChegar = (est: Estabelecimento) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${est.latitude},${est.longitude}`;
    window.open(url, '_blank');
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
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {/* Marker do usuário */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(40, 40),
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
                      url: getCategoryIcon(est.categoria),
                      scaledSize: new google.maps.Size(32, 32),
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
                  url: getCategoryIcon(est.categoria),
                  scaledSize: new google.maps.Size(32, 32),
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
            <div className="p-2 max-w-xs">
              {selectedPlace.logo_url && (
                <img
                  src={selectedPlace.logo_url}
                  alt={selectedPlace.nome_fantasia}
                  className="w-full h-24 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-bold text-lg mb-1">
                {selectedPlace.nome_fantasia}
              </h3>
              {selectedPlace.categoria && selectedPlace.categoria.length > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  {selectedPlace.categoria.join(', ')}
                </p>
              )}
              {selectedPlace.endereco_formatado && (
                <p className="text-sm text-gray-500 mb-2">
                  {selectedPlace.endereco_formatado}
                </p>
              )}
              {selectedPlace.distancia !== undefined && (
                <p className="text-sm text-gray-500 mb-2">
                  {selectedPlace.distancia < 1
                    ? `${Math.round(selectedPlace.distancia * 1000)}m de você`
                    : `${selectedPlace.distancia.toFixed(1)}km de você`}
                </p>
              )}
              <Button
                size="sm"
                onClick={() => handleComoChegar(selectedPlace)}
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Como Chegar
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};
