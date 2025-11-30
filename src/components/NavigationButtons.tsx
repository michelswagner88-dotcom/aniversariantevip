import { Car, Navigation, Map as MapIcon } from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { calcularDistancia } from '@/lib/geoUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NavigationButtonsProps {
  establishmentId: string;
  establishmentName: string;
  address: string;
  latitude: number;
  longitude: number;
  cidade?: string;
  estado?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
}

type AppName = 'uber' | '99' | 'waze' | 'maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const NavigationButtons = ({
  establishmentId,
  establishmentName,
  address,
  latitude,
  longitude,
  cidade,
  estado,
  bairro,
  rua,
  numero,
  complemento,
  cep,
}: NavigationButtonsProps) => {
  const { location: userLocation } = useUserLocation();
  
  // Fire-and-forget: registra o clique sem bloquear o usuário
  const trackNavigation = async (appName: AppName) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Não espera resposta - fire and forget
      supabase.from('navigation_logs').insert({
        establishment_id: establishmentId,
        app_name: appName,
        user_id: session?.user?.id || null,
      }).then(({ error }) => {
        if (error) {
          console.warn('Falha ao registrar navegação (silencioso):', error);
        }
      });
    } catch (error) {
      // Erro silencioso - não impacta o usuário
      console.warn('Erro ao rastrear navegação:', error);
    }
  };

  const handleNavigation = (appName: AppName, url: string) => {
    // 1. Registra o clique (não espera)
    trackNavigation(appName);
    
    // 2. Abre o link IMEDIATAMENTE
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Deep Links otimizados
  const getDeepLinks = () => {
    const encodedName = encodeURIComponent(establishmentName);
    const lat = latitude.toString();
    const lng = longitude.toString();

    return {
      uber: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodedName}`,
      '99': `https://99app.com/`,
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      maps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    };
  };

  const links = getDeepLinks();

  // Formatar endereço completo
  const enderecoCompleto = [
    rua && numero ? `${rua}, ${numero}` : null,
    complemento,
    bairro,
    cidade && estado ? `${cidade}/${estado}` : null,
  ].filter(Boolean).join(' - ');

  // Calcular distância do usuário
  const distancia = userLocation ? calcularDistancia(
    userLocation.lat,
    userLocation.lng,
    latitude,
    longitude
  ) : null;

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MapIcon className="w-5 h-5 text-violet-400" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mapa */}
        {GOOGLE_MAPS_API_KEY && (
          <div className="rounded-lg overflow-hidden">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '250px' }}
                center={{ lat: latitude, lng: longitude }}
                zoom={15}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                <Marker position={{ lat: latitude, lng: longitude }} />
              </GoogleMap>
            </LoadScript>
          </div>
        )}

        {/* Endereço */}
        <div className="space-y-1">
          <p className="text-slate-300 text-sm leading-relaxed">
            {enderecoCompleto || address}
          </p>
          {cep && (
            <p className="text-slate-500 text-xs">
              CEP: {cep}
            </p>
          )}
        </div>

        {/* Distância do usuário */}
        {distancia !== null && (
          <div className="flex items-center gap-2 text-sm text-slate-400 pt-2 border-t border-white/10">
            <Navigation className="w-4 h-4" />
            <span>
              {distancia < 1
                ? `${Math.round(distancia * 1000)}m de você`
                : `${distancia.toFixed(1)}km de você`
              }
            </span>
          </div>
        )}

        {/* Botões de navegação */}
        <div className="space-y-3 pt-2">
          <p className="text-sm text-slate-400">Ir com:</p>
          
          {/* Grid 2x2 otimizado para mobile */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Maps */}
            <button
              onClick={() => handleNavigation('maps', links.maps)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-emerald-600/20 border border-emerald-600/30 hover:bg-emerald-600/30 transition-all active:scale-95 group"
            >
              <MapIcon className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-emerald-400">Maps</span>
            </button>

            {/* Waze */}
            <button
              onClick={() => handleNavigation('waze', links.waze)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all active:scale-95 group"
            >
              <Navigation className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-cyan-400">Waze</span>
            </button>

            {/* Uber */}
            <button
              onClick={() => handleNavigation('uber', links.uber)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-950 border border-white/20 hover:border-white/40 transition-all active:scale-95 group"
            >
              <Car className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-white">Uber</span>
            </button>

            {/* 99 */}
            <button
              onClick={() => handleNavigation('99', links['99'])}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-amber-400/20 border border-amber-400/30 hover:bg-amber-400/30 transition-all active:scale-95 group"
            >
              <Car className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-amber-400">99</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
