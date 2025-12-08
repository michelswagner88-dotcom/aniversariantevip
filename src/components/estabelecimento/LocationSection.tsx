// LocationSection.tsx - Seção de Localização Premium

import { MapPin, Navigation, Car } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
      icon: '🗺️',
      color: 'from-blue-500/20 to-green-500/20',
      borderColor: 'border-blue-500/20',
      onClick: onOpenMaps 
    },
    { 
      name: 'Waze', 
      icon: '🚗',
      color: 'from-cyan-500/20 to-cyan-600/20',
      borderColor: 'border-cyan-500/20',
      onClick: onOpenWaze 
    },
    { 
      name: 'Uber', 
      icon: '🚙',
      color: 'from-gray-500/20 to-gray-600/20',
      borderColor: 'border-gray-500/20',
      onClick: onOpenUber 
    },
    { 
      name: '99', 
      icon: '🚕',
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/20',
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
    <div 
      className="
        mx-4 mt-6
        animate-fade-in-up stagger-6
      "
    >
      <div 
        className="
          relative
          bg-gradient-to-br from-white/[0.03] to-white/[0.01]
          backdrop-blur-sm
          rounded-2xl
          overflow-hidden
          border border-white/[0.06]
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
        
        {/* Mapa com lazy load */}
        <div ref={mapRef} className="px-4">
          <div className="rounded-xl overflow-hidden border border-white/10">
            {mapVisible && hasValidCoordinates ? (
              // Componente do mapa real
              <div className="w-full h-40 bg-slate-800">
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
              // Fallback quando não tem coordenadas
              <div className="w-full h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Mapa indisponível</p>
                </div>
              </div>
            ) : (
              // Skeleton do mapa
              <div className="w-full h-40 img-skeleton rounded-xl" />
            )}
          </div>
        </div>
        
        {/* Botões de navegação */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {navigationApps.map((app) => (
            <button
              key={app.name}
              onClick={app.onClick}
              className={`
                flex flex-col items-center justify-center
                bg-gradient-to-br ${app.color}
                rounded-xl
                p-3
                border ${app.borderColor}
                transition-all duration-300 ease-out
                hover:scale-105
                active:scale-95
                group
              `}
            >
              <div className="w-7 h-7 mb-1 flex items-center justify-center text-xl transition-transform group-hover:scale-110">
                {app.icon}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
