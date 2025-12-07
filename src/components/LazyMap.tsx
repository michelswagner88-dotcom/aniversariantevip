import { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface LazyMapProps {
  endereco: string;
  latitude?: number | null;
  longitude?: number | null;
  nomeEstabelecimento: string;
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  estado?: string | null;
  className?: string;
}

const LazyMap: React.FC<LazyMapProps> = ({
  endereco,
  latitude,
  longitude,
  nomeEstabelecimento,
  bairro,
  cep,
  cidade,
  estado,
  className = ''
}) => {
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [staticMapError, setStaticMapError] = useState(false);
  const [embedMapError, setEmbedMapError] = useState(false);
  
  // Verificar se tem coordenadas válidas
  const hasCoordinates = latitude && longitude && latitude !== 0 && longitude !== 0;
  
  // URL do Google Maps para abrir externamente
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
  
  // URL do mapa estático (preview) - usando Static Maps API
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const staticMapUrl = hasCoordinates && googleMapsApiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&scale=2&markers=color:0x8B5CF6%7C${latitude},${longitude}&key=${googleMapsApiKey}&style=feature:all|element:geometry|color:0x1e293b&style=feature:all|element:labels.text.fill|color:0x94a3b8&style=feature:water|element:geometry|color:0x0f172a`
    : null;
  
  // URL para embed do mapa interativo
  const embedMapUrl = hasCoordinates && googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${latitude},${longitude}&zoom=15`
    : googleMapsApiKey 
      ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(endereco)}`
      : null;
  
  // Handlers para navegação
  const openGoogleMaps = () => {
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };
  
  const openWaze = () => {
    const wazeUrl = hasCoordinates
      ? `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`;
    window.open(wazeUrl, '_blank', 'noopener,noreferrer');
  };
  
  const openUber = () => {
    const uberUrl = hasCoordinates
      ? `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${encodeURIComponent(nomeEstabelecimento)}`
      : `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(endereco)}`;
    window.open(uberUrl, '_blank', 'noopener,noreferrer');
  };
  
  const open99 = () => {
    const url99 = hasCoordinates
      ? `https://99app.com/deep-link?action=destination&lat=${latitude}&lng=${longitude}`
      : `https://99app.com`;
    window.open(url99, '_blank', 'noopener,noreferrer');
  };
  
  // Montar endereço formatado (sem null/undefined)
  const enderecoFormatado = endereco && endereco.trim() ? endereco : null;
  const cidadeEstado = [cidade, estado].filter(Boolean).join(' - ');
  const temLocalizacao = enderecoFormatado || bairro || cidadeEstado;

  return (
    <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden ${className}`}>
      {/* Header com endereço */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30">
            <MapPin className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Como Chegar</h4>
            {enderecoFormatado && (
              <p className="text-gray-400 text-sm mt-1">{enderecoFormatado}</p>
            )}
            {bairro && (
              <p className="text-gray-500 text-sm mt-0.5">{bairro}</p>
            )}
            {cidadeEstado && (
              <p className="text-gray-500 text-xs mt-0.5">{cidadeEstado}</p>
            )}
            {cep && (
              <p className="text-gray-500 text-xs mt-0.5">CEP: {cep}</p>
            )}
            {!temLocalizacao && (
              <p className="text-gray-500 text-sm mt-1 italic">Endereço não informado</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Área do mapa - sob demanda */}
      <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900">
        {!showMap ? (
          /* Preview / Placeholder com botão para carregar */
          <div className="relative w-full h-full cursor-pointer group" onClick={() => setShowMap(true)}>
            {/* Imagem estática do mapa se disponível e sem erro */}
            {staticMapUrl && !staticMapError ? (
              <img
                src={staticMapUrl}
                alt={`Mapa de ${nomeEstabelecimento}`}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                loading="lazy"
                onError={() => setStaticMapError(true)}
              />
            ) : (
              /* Fallback visual com gradiente Cosmic */
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 to-pink-900/30">
                <div 
                  className="absolute inset-0 opacity-30" 
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(139,92,246,0.15) 10px, rgba(139,92,246,0.15) 11px),
                                      repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(139,92,246,0.15) 10px, rgba(139,92,246,0.15) 11px)`
                  }} 
                />
              </div>
            )}
            
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
              <motion.span 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium flex items-center gap-2 transition-opacity bg-violet-500/80 px-4 py-2 rounded-full"
              >
                <MapPin className="w-4 h-4" />
                Ver no mapa
              </motion.span>
            </div>
          </div>
        ) : (
          /* Mapa interativo carregado sob demanda */
          <div className="w-full h-full relative">
            {/* Loading state */}
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400 text-xs">Carregando mapa...</span>
                </div>
              </div>
            )}
            
            {embedMapUrl && !embedMapError ? (
              <iframe
                src={embedMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa de ${nomeEstabelecimento}`}
                onLoad={() => setMapLoaded(true)}
                onError={() => setEmbedMapError(true)}
                className={mapLoaded ? 'opacity-100' : 'opacity-0'}
              />
            ) : (
              /* Fallback - botão para abrir Google Maps externamente */
              <div 
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-gradient-to-br from-violet-900/40 to-pink-900/30 hover:from-violet-900/50 hover:to-pink-900/40 transition-colors"
                onClick={openGoogleMaps}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/50 mb-2"
                >
                  <MapPin className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-white text-sm flex items-center gap-2 font-medium">
                  <ExternalLink className="w-4 h-4" />
                  Abrir no Google Maps
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Botões de navegação */}
      <div className="grid grid-cols-4 divide-x divide-slate-700/50">
        <motion.button
          onClick={openGoogleMaps}
          whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className="py-3 flex flex-col items-center gap-1.5 transition-colors"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/1024px-Google_Maps_icon_%282020%29.svg.png" 
            alt="Google Maps"
            loading="lazy"
            decoding="async"
            className="w-6 h-6"
          />
          <span className="text-xs text-gray-400">Maps</span>
        </motion.button>

        <motion.button
          onClick={openWaze}
          whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className="py-3 flex flex-col items-center gap-1.5 transition-colors"
        >
          <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">W</span>
          </div>
          <span className="text-xs text-gray-400">Waze</span>
        </motion.button>

        <motion.button
          onClick={openUber}
          whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className="py-3 flex flex-col items-center gap-1.5 transition-colors"
        >
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">Uber</span>
          </div>
          <span className="text-xs text-gray-400">Uber</span>
        </motion.button>

        <motion.button
          onClick={open99}
          whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className="py-3 flex flex-col items-center gap-1.5 transition-colors"
        >
          <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
            <span className="text-black text-[10px] font-bold">99</span>
          </div>
          <span className="text-xs text-gray-400">99</span>
        </motion.button>
      </div>
    </div>
  );
};

export default LazyMap;
