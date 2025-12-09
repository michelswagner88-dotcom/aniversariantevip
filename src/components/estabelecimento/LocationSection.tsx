// LocationSection.tsx - Localização Clean

import { MapPin, Navigation } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

// Ícones dos apps
const GoogleMapsIcon = () => (
  <svg viewBox="0 0 92.3 132.3" className="w-5 h-5">
    <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z" />
    <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.1-21.8-18.5z" />
    <path
      fill="#4285f4"
      d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"
    />
    <path
      fill="#fbbc04"
      d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.1c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.5-13.5 6.5"
    />
    <path
      fill="#34a853"
      d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 97.9c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.1"
    />
  </svg>
);

const WazeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      fill="#33ccff"
      d="M12 2C6.486 2 2 6.262 2 11.5c0 2.545 1.088 4.988 3 6.772V22l4.5-2.25c.75.188 1.5.25 2.5.25 5.514 0 10-4.262 10-9.5S17.514 2 12 2zm-3 11c-.828 0-1.5-.672-1.5-1.5S8.172 10 9 10s1.5.672 1.5 1.5S9.828 13 9 13zm6 0c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5S15.828 13 15 13z"
    />
  </svg>
);

const UberIcon = () => (
  <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
    <span className="text-white text-[7px] font-bold">Uber</span>
  </div>
);

const App99Icon = () => (
  <div className="w-5 h-5 bg-[#FFDD00] rounded flex items-center justify-center">
    <span className="text-black text-[8px] font-bold">99</span>
  </div>
);

const LocationSection = ({ establishment, onOpenMaps, onOpenWaze, onOpenUber, onOpen99 }: LocationSectionProps) => {
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
      { rootMargin: "100px" },
    );

    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const hasValidCoordinates =
    establishment.latitude && establishment.longitude && establishment.latitude !== 0 && establishment.longitude !== 0;

  const formatAddress = () => {
    return [establishment.logradouro, establishment.numero].filter(Boolean).join(", ") || "Endereço não informado";
  };

  const navigationApps = [
    { name: "Maps", Icon: GoogleMapsIcon, onClick: onOpenMaps },
    { name: "Waze", Icon: WazeIcon, onClick: onOpenWaze },
    { name: "Uber", Icon: UberIcon, onClick: onOpenUber },
    { name: "99", Icon: App99Icon, onClick: onOpen99 },
  ];

  return (
    <div className="mx-4 sm:mx-6 mt-4 sm:mt-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden">
          {/* Header com endereço */}
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#240046]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#222222] mb-1">Como chegar</h3>
                <p className="text-[#717171] text-sm leading-relaxed">
                  {formatAddress()}
                  {establishment.bairro && (
                    <>
                      <br />
                      {establishment.bairro}
                    </>
                  )}
                  {(establishment.cidade || establishment.estado) && (
                    <>
                      <br />
                      {[establishment.cidade, establishment.estado].filter(Boolean).join(" - ")}
                    </>
                  )}
                  {establishment.cep && (
                    <>
                      <br />
                      CEP: {establishment.cep}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div ref={mapRef} className="px-4 sm:px-5">
            <div className="rounded-xl overflow-hidden border border-[#EBEBEB]">
              {mapVisible && hasValidCoordinates ? (
                <div className="w-full h-40 sm:h-44 bg-slate-100">
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
                <div className="w-full h-40 sm:h-44 bg-[#F7F7F7] flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-8 h-8 text-[#DDDDDD] mx-auto mb-2" />
                    <p className="text-sm text-[#717171]">Mapa indisponível</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-40 sm:h-44 bg-[#F7F7F7] animate-pulse" />
              )}
            </div>
          </div>

          {/* Botões de navegação - touch targets de 48px */}
          <div className="p-4 sm:p-5 grid grid-cols-4 gap-2">
            {navigationApps.map((app) => (
              <button
                key={app.name}
                onClick={app.onClick}
                className="
                  flex flex-col items-center justify-center
                  min-h-[56px]
                  py-2.5 sm:py-3 px-2
                  bg-[#F7F7F7]
                  hover:bg-[#EBEBEB]
                  rounded-xl
                  transition-colors duration-200
                  active:scale-[0.98]
                "
              >
                <div className="mb-1 sm:mb-1.5">
                  <app.Icon />
                </div>
                <span className="text-[11px] sm:text-xs text-[#717171] font-medium">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
