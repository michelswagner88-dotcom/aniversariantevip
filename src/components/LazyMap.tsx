import { useState } from "react";
import { MapPin, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

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

// Ícone do Waze em SVG inline
const WazeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
    <circle cx="12" cy="12" r="10" fill="#33CCFF" />
    <circle cx="8.5" cy="10" r="1.5" fill="#000" />
    <circle cx="15.5" cy="10" r="1.5" fill="#000" />
    <path
      d="M8 14.5C8 14.5 9.5 17 12 17C14.5 17 16 14.5 16 14.5"
      stroke="#000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Ícone do Uber em SVG inline
const UberIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <rect width="24" height="24" rx="4" fill="#000" />
    <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">
      Uber
    </text>
  </svg>
);

// Ícone do Google Maps
const GoogleMapsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path
      fill="#4285F4"
      d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 7.5 14.5 8.5 14.5s8.5-9.25 8.5-14.5C20.5 3.81 16.69 0 12 0z"
    />
    <path fill="#34A853" d="M12 0v11l8.5 3.5C20.5 9.25 16.69 0 12 0z" />
    <path fill="#FBBC04" d="M3.5 8.5c0 5.25 7.5 14.5 8.5 14.5V11L3.5 8.5z" />
    <path fill="#EA4335" d="M12 11V0C7.31 0 3.5 3.81 3.5 8.5L12 11z" />
    <circle fill="#fff" cx="12" cy="8.5" r="3" />
  </svg>
);

const LazyMap: React.FC<LazyMapProps> = ({
  endereco,
  latitude,
  longitude,
  nomeEstabelecimento,
  bairro,
  cep,
  cidade,
  estado,
  className = "",
}) => {
  const [zoomLevel, setZoomLevel] = useState(16);
  const [staticMapError, setStaticMapError] = useState(false);

  // Validar coordenadas - deve ser número válido dentro do Brasil
  const temCoordenadasValidas = (lat: any, lng: any): boolean => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) return false;
    if (latNum === 0 || lngNum === 0) return false;

    // Brasil: Lat -34 a +6, Lng -75 a -30
    if (latNum < -34 || latNum > 6) return false;
    if (lngNum < -75 || lngNum > -30) return false;

    return true;
  };

  // Verificar se tem coordenadas EXATAS válidas
  const hasCoordinates = temCoordenadasValidas(latitude, longitude);

  // URL do Google Maps para abrir externamente
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nomeEstabelecimento + " " + endereco)}`;

  // URL do mapa estático
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const staticMapUrl =
    hasCoordinates && googleMapsApiKey
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoomLevel}&size=600x300&scale=2&markers=color:red%7C${latitude},${longitude}&key=${googleMapsApiKey}`
      : null;

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 1, 10));

  // Handlers para navegação
  const openGoogleMaps = () => {
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  const openWaze = () => {
    const wazeUrl = hasCoordinates
      ? `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`;
    window.open(wazeUrl, "_blank", "noopener,noreferrer");
  };

  const openUber = () => {
    const uberUrl = hasCoordinates
      ? `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${encodeURIComponent(nomeEstabelecimento)}`
      : `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(endereco)}`;
    window.open(uberUrl, "_blank", "noopener,noreferrer");
  };

  const open99 = () => {
    const url99 = hasCoordinates
      ? `https://99app.com/deep-link?action=destination&lat=${latitude}&lng=${longitude}`
      : `https://99app.com`;
    window.open(url99, "_blank", "noopener,noreferrer");
  };

  // Montar endereço formatado
  const enderecoFormatado = endereco && endereco.trim() ? endereco : null;
  const cidadeEstado = [cidade, estado].filter(Boolean).join(" - ");
  const temLocalizacao = enderecoFormatado || bairro || cidadeEstado;

  return (
    <div
      className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden ${className}`}
    >
      {/* Header com endereço */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30">
            <MapPin className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Como Chegar</h4>
            {enderecoFormatado && <p className="text-white/80 text-sm mt-1">{enderecoFormatado}</p>}
            {bairro && <p className="text-white/70 text-sm mt-0.5">{bairro}</p>}
            {cidadeEstado && <p className="text-white/60 text-xs mt-0.5">{cidadeEstado}</p>}
            {cep && <p className="text-white/60 text-xs mt-0.5">CEP: {cep}</p>}
            {!temLocalizacao && <p className="text-white/50 text-sm mt-1 italic">Endereço não informado</p>}
          </div>
        </div>
      </div>

      {/* Área do mapa estático */}
      <div className="relative h-48 bg-white rounded-lg overflow-hidden mx-4 mb-2 border border-slate-200">
        <div className="relative w-full h-full">
          {staticMapUrl && !staticMapError ? (
            <img
              src={staticMapUrl}
              alt={`Mapa de ${nomeEstabelecimento}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setStaticMapError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <MapPin className="w-10 h-10 text-red-500" fill="#ef4444" />
                <span className="text-gray-600 text-sm">Localização</span>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Zoom */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
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
          whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="py-3 flex flex-col items-center gap-1.5 transition-colors"
        >
          <GoogleMapsIcon />
          <span className="text-xs text-white/80">Maps</span>
        </motion.button>

        <motion.button
          onClick={openWaze}
          whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="py-3 flex flex-col items-center gap-1.5 transition-colors"
        >
          <WazeIcon />
          <span className="text-xs text-white/80">Waze</span>
        </motion.button>

        <motion.button
          onClick={openUber}
          whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="py-3 flex flex-col items-center gap-1.5 transition-colors"
        >
          <UberIcon />
          <span className="text-xs text-white/80">Uber</span>
        </motion.button>

        <motion.button
          onClick={open99}
          whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="py-3 flex flex-col items-center gap-1.5 transition-colors"
        >
          <div className="w-6 h-6 bg-[#FFDE00] rounded flex items-center justify-center">
            <span className="text-black text-[10px] font-bold">99</span>
          </div>
          <span className="text-xs text-white/80">99</span>
        </motion.button>
      </div>
    </div>
  );
};

export default LazyMap;
