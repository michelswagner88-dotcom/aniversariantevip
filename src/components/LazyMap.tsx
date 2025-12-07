import { useState } from 'react';
import { MapPin, Plus, Minus } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState(15); // Zoom inicial mais distante
  const [staticMapError, setStaticMapError] = useState(false);
  
  // Verificar se tem coordenadas válidas
  const hasCoordinates = latitude && longitude && latitude !== 0 && longitude !== 0;
  
  // URL do Google Maps para abrir externamente
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
  
  // URL do mapa estático - usando Static Maps API
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const staticMapUrl = hasCoordinates && googleMapsApiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoomLevel}&size=600x300&scale=2&markers=color:red%7C${latitude},${longitude}&key=${googleMapsApiKey}`
    : null;
  
  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 1, 10));
  
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
      
      {/* Área do mapa estático */}
      <div className="relative h-48 bg-white rounded-lg overflow-hidden mx-4 mb-2 border border-slate-200">
        {/* Mapa estático clicável */}
        <div 
          className="relative w-full h-full cursor-pointer" 
          onClick={openGoogleMaps}
        >
          {/* Imagem estática do mapa se disponível e sem erro */}
          {staticMapUrl && !staticMapError ? (
            <img
              src={staticMapUrl}
              alt={`Mapa de ${nomeEstabelecimento}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setStaticMapError(true)}
            />
          ) : (
            /* Fallback visual clean */
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <MapPin className="w-10 h-10 text-red-500" fill="#ef4444" />
                <span className="text-gray-600 text-sm">Clique para abrir no Maps</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Botões de Zoom */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <motion.button
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50"
          >
            <Minus className="w-4 h-4 text-gray-700" />
          </motion.button>
        </div>
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
