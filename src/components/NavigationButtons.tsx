import { useState } from 'react';
import { Car, Navigation, Map as MapIcon, MapPin, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { calcularDistancia } from '@/lib/geoUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
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

  // URL para embed do mapa (só carrega quando showMap = true)
  const embedMapUrl = GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=15`
    : null;

  return (
    <>
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapIcon className="w-5 h-5 text-violet-400" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview do mapa - carrega sob demanda */}
          <div 
            className="relative h-32 rounded-xl overflow-hidden cursor-pointer group bg-gradient-to-br from-slate-800 to-slate-900"
            onClick={() => setShowMap(true)}
          >
            {/* Marcador central animado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/50"
              >
                <MapPin className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            
            {/* Overlay com texto */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium flex items-center gap-2 transition-opacity bg-violet-500/80 px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4" />
                Ver no mapa
              </span>
            </div>
          </div>

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

      {/* Modal do mapa - carrega sob demanda */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Localização</h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Mapa embed - só carrega quando modal abre */}
              <div className="relative flex-1 min-h-[300px]">
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-400 text-sm">Carregando mapa...</span>
                    </div>
                  </div>
                )}
                
                {embedMapUrl ? (
                  <iframe
                    src={embedMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '300px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa de ${establishmentName}`}
                    onLoad={() => setMapLoaded(true)}
                    className={`transition-opacity duration-300 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <p>Mapa não disponível</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-700 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-400 truncate flex-1">
                  {enderecoCompleto || address}
                </p>
                <button
                  onClick={() => handleNavigation('maps', links.maps)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
                >
                  <Navigation className="w-4 h-4" />
                  Abrir no Maps
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
