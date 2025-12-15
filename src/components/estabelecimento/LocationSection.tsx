// LocationSection.tsx - Localização Premium 2025
// Tendências: Mapa integrado, Botões de navegação com logos

import { motion } from "framer-motion";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

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

const LocationSection = ({ establishment, onOpenMaps, onOpenWaze, onOpenUber, onOpen99 }: LocationSectionProps) => {
  const { logradouro, numero, bairro, cidade, estado, cep, latitude, longitude } = establishment;

  // Montar endereço formatado
  const endereco = [logradouro && numero ? `${logradouro}, ${numero}` : logradouro, bairro].filter(Boolean).join(" - ");

  const cidadeEstado = [cidade, estado].filter(Boolean).join(" - ");

  // URL do mapa estático (usando embed do Google Maps)
  const mapUrl =
    latitude && longitude
      ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent([logradouro, numero, bairro, cidade, estado].filter(Boolean).join(", "))}&z=16&output=embed`;

  const navigationApps = [
    {
      id: "maps",
      name: "Maps",
      icon: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg",
      fallbackIcon: MapPin,
      onClick: onOpenMaps,
      color: "hover:border-green-500",
    },
    {
      id: "waze",
      name: "Waze",
      icon: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Waze_app_icon_2022.svg",
      fallbackIcon: Navigation,
      onClick: onOpenWaze,
      color: "hover:border-cyan-500",
    },
    {
      id: "uber",
      name: "Uber",
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
      fallbackIcon: Navigation,
      onClick: onOpenUber,
      color: "hover:border-black",
    },
    {
      id: "99",
      name: "99",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/99_logo.svg/1200px-99_logo.svg.png",
      fallbackIcon: Navigation,
      onClick: onOpen99,
      color: "hover:border-yellow-500",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mx-4 sm:mx-6 mt-8 sm:mt-10"
      aria-labelledby="location-heading"
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="
          overflow-hidden
          bg-white
          rounded-3xl
          border border-[#EBEBEB]
          shadow-sm
        "
        >
          {/* Header e Endereço */}
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="
                w-10 h-10 rounded-xl
                bg-gradient-to-br from-[#240046] to-[#3C096C]
                flex items-center justify-center
              "
              >
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 id="location-heading" className="text-xl font-semibold text-[#222222]">
                Como chegar
              </h2>
            </div>

            {/* Endereço */}
            <div className="space-y-1 mb-6">
              {endereco && <p className="text-[#222222] font-medium">{endereco}</p>}
              {cidadeEstado && <p className="text-[#717171]">{cidadeEstado}</p>}
              {cep && <p className="text-[#717171] text-sm">CEP: {cep}</p>}
            </div>

            {/* Mapa */}
            <div
              className="
              relative
              w-full h-[200px] sm:h-[250px]
              rounded-2xl overflow-hidden
              bg-[#F7F7F7]
              mb-6
            "
            >
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização no mapa"
                className="grayscale-[20%]"
              />

              {/* Botão ver mapa ampliado */}
              <button
                onClick={onOpenMaps}
                className="
                  absolute top-3 left-3
                  px-4 py-2 rounded-full
                  bg-white shadow-lg
                  text-sm font-medium text-[#240046]
                  flex items-center gap-2
                  hover:shadow-xl
                  transition-shadow
                "
              >
                <ExternalLink className="w-4 h-4" />
                Ver mapa ampliado
              </button>
            </div>

            {/* Botões de navegação */}
            <div className="grid grid-cols-4 gap-3">
              {navigationApps.map((app, index) => (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={app.onClick}
                  aria-label={`Navegar com ${app.name}`}
                  className={cn(
                    "flex flex-col items-center gap-2",
                    "p-4 rounded-2xl",
                    "bg-white border-2 border-[#EBEBEB]",
                    "hover:shadow-lg",
                    "transition-all duration-300",
                    app.color,
                  )}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback para ícone lucide
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<svg class="w-6 h-6 text-[#717171]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
                        }
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#484848]">{app.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default LocationSection;
