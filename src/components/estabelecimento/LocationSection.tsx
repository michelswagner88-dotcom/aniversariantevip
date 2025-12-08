// LocationSection.tsx - Seção de Localização Premium

import { MapPin, Navigation } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LocationSectionProps {
  establishment: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    latitude?: number;
    longitude?: number;
  };
  onOpenMaps: () => void;
  onOpenWaze: () => void;
  onOpenUber: () => void;
  onOpen99: () => void;
}

// Ícones SVG originais dos apps
const GoogleMapsIcon = () => (
  <svg viewBox="0 0 92.3 132.3" className="w-6 h-6">
    <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
    <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.1-21.8-18.5z"/>
    <path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"/>
    <path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.1c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.5-13.5 6.5"/>
    <path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 97.9c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.1"/>
  </svg>
);

const WazeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="#33ccff" d="M12 2C6.486 2 2 6.262 2 11.5c0 2.545 1.088 4.988 3 6.772V22l4.5-2.25c.75.188 1.5.25 2.5.25 5.514 0 10-4.262 10-9.5S17.514 2 12 2zm-3 11c-.828 0-1.5-.672-1.5-1.5S8.172 10 9 10s1.5.672 1.5 1.5S9.828 13 9 13zm6 0c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5S15.828 13 15 13z"/>
  </svg>
);

const UberIcon = () => (
  <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
    <span className="text-white text-[8px] font-bold tracking-tight">Uber</span>
  </div>
);

const App99Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" fill="#FFDD00"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000">99</text>
  </svg>
);

const LocationSection = ({ 
  establishment,
  onOpenMaps,
  onOpenWaze,
  onOpenUber,
  onOpen99
}: LocationSectionProps) => {
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Lazy load do mapa
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const hasValidCoordinates = establishment.latitude && establishment.longitude && 
    establishment.latitude !== 0 && establishment.longitude !== 0;

  const navigationApps = [
    { 
      name: 'Maps', 
      Icon: GoogleMapsIcon,
      color: 'from-blue-500/20 to-green-500/20',
      hoverColor: 'hover:from-blue-500/30 hover:to-green-500/30',
      borderColor: 'border-blue-500/20',
      hoverBorder: 'hover:border-blue-400/40',
      glowColor: 'hover:shadow-blue-500/30',
      onClick: onOpenMaps 
    },
    { 
      name: 'Waze', 
      Icon: WazeIcon,
      color: 'from-cyan-500/20 to-cyan-600/20',
      hoverColor: 'hover:from-cyan-500/30 hover:to-cyan-600/30',
      borderColor: 'border-cyan-500/20',
      hoverBorder: 'hover:border-cyan-400/40',
      glowColor: 'hover:shadow-cyan-500/30',
      onClick: onOpenWaze 
    },
    { 
      name: 'Uber', 
      Icon: UberIcon,
      color: 'from-gray-500/20 to-gray-600/20',
      hoverColor: 'hover:from-gray-500/30 hover:to-gray-600/30',
      borderColor: 'border-gray-500/20',
      hoverBorder: 'hover:border-gray-400/40',
      glowColor: 'hover:shadow-gray-500/30',
      onClick: onOpenUber 
    },
    { 
      name: '99', 
      Icon: App99Icon,
      color: 'from-yellow-500/20 to-yellow-600/20',
      hoverColor: 'hover:from-yellow-500/30 hover:to-yellow-600/30',
      borderColor: 'border-yellow-500/20',
      hoverBorder: 'hover:border-yellow-400/40',
      glowColor: 'hover:shadow-yellow-500/30',
      onClick: onOpen99
    },
  ];

  const formatAddress = () => {
    const parts = [
      establishment.logradouro,
      establishment.numero,
    ].filter(Boolean).join(', ');
    
    return parts || 'Endereço não informado';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5 }}
      className="mx-4 mt-6"
    >
      <div 
        className="
          relative
          bg-gradient-to-br from-white/[0.04] to-white/[0.01]
          backdrop-blur-sm
          rounded-2xl
          overflow-hidden
          border border-white/[0.08]
          transition-all duration-300
          hover:border-violet-500/20
          hover:shadow-xl hover:shadow-violet-500/5
          group
        "
      >
        {/* Header com endereço */}
        <div className="p-5 pb-4">
          <div className="flex items-start gap-3 mb-3">
            <div 
              className="
                w-10 h-10 
                bg-gradient-to-br from-pink-500/20 to-red-500/20 
                rounded-xl 
                flex items-center justify-center
                border border-white/10
                flex-shrink-0
                transition-all duration-300
                group-hover:border-pink-500/30
                group-hover:shadow-lg group-hover:shadow-pink-500/10
              "
            >
              <MapPin className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">Como Chegar</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {formatAddress()}
                {establishment.bairro && <><br />{establishment.bairro}</>}
                {(establishment.cidade || establishment.estado) && (
                  <><br />{[establishment.cidade, establishment.estado].filter(Boolean).join(' - ')}</>
                )}
                {establishment.cep && <><br />CEP: {establishment.cep}</>}
              </p>
            </div>
          </div>
        </div>
        
        {/* Mapa com lazy load e bordas premium */}
        <div ref={mapRef} className="px-4">
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
            {mapVisible && hasValidCoordinates ? (
              <div className="w-full h-44 bg-slate-800">
                <iframe
                  src={`https://www.google.com/maps?q=${establishment.latitude},${establishment.longitude}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : mapVisible && !hasValidCoordinates ? (
              <div className="w-full h-44 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Mapa indisponível</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-44 img-skeleton rounded-xl" />
            )}
          </div>
        </div>
        
        {/* Botões de navegação premium */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {navigationApps.map((app, index) => (
            <motion.button
              key={app.name}
              onClick={app.onClick}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className={`
                flex flex-col items-center justify-center
                bg-gradient-to-br ${app.color}
                ${app.hoverColor}
                rounded-xl
                p-3
                border ${app.borderColor}
                ${app.hoverBorder}
                transition-all duration-300 ease-out
                shadow-lg ${app.glowColor}
                group/btn
              `}
            >
              <div className="w-7 h-7 mb-1 flex items-center justify-center transition-transform group-hover/btn:scale-110">
                <app.Icon />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{app.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LocationSection;