// LocationSection.tsx - Clean Design com Lazy Map
// Mapa só carrega ao clicar ou entrar no viewport

import { useState, useRef, useEffect } from "react";
import { MapPin, Copy, Check, Navigation, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [showMap, setShowMap] = useState(false);
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { logradouro, numero, bairro, cidade, estado, cep, latitude, longitude } = establishment;

  // Endereço formatado
  const enderecoLinha1 = [logradouro, numero].filter(Boolean).join(", ");
  const enderecoLinha2 = [bairro, cidade, estado].filter(Boolean).join(" - ");
  const enderecoCompleto = [enderecoLinha1, enderecoLinha2, cep].filter(Boolean).join("\n");

  // Copiar endereço
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(enderecoCompleto.replace(/\n/g, ", "));
      setCopied(true);
      toast.success("Endereço copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  // Lazy load do mapa (intersection observer)
  useEffect(() => {
    if (!sectionRef.current || showMap) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Delay para não impactar scroll
          setTimeout(() => setShowMap(true), 500);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [showMap]);

  // URL do mapa
  const mapUrl =
    latitude && longitude
      ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(
          [logradouro, numero, bairro, cidade, estado].filter(Boolean).join(", "),
        )}&z=16&output=embed`;

  // Botões de navegação
  const navButtons = [
    { id: "maps", name: "Maps", onClick: onOpenMaps, color: "text-green-600" },
    { id: "waze", name: "Waze", onClick: onOpenWaze, color: "text-cyan-500" },
    { id: "uber", name: "Uber", onClick: onOpenUber, color: "text-black" },
    { id: "99", name: "99", onClick: onOpen99, color: "text-yellow-500" },
  ];

  return (
    <section ref={sectionRef} className="mx-4 sm:mx-6 mt-8" aria-labelledby="location-heading">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header + Endereço */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn("w-10 h-10 rounded-xl shrink-0", "bg-[#240046]", "flex items-center justify-center")}
                >
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 id="location-heading" className="text-lg font-semibold text-gray-900">
                  Como chegar
                </h2>
              </div>

              {/* Botão copiar */}
              <button
                onClick={handleCopy}
                aria-label="Copiar endereço"
                className={cn(
                  "flex items-center gap-1.5",
                  "px-3 py-1.5 rounded-lg",
                  "text-sm font-medium",
                  copied ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  "transition-colors",
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>

            {/* Endereço */}
            <div className="text-gray-600 text-sm space-y-0.5">
              {enderecoLinha1 && <p className="font-medium text-gray-900">{enderecoLinha1}</p>}
              {enderecoLinha2 && <p>{enderecoLinha2}</p>}
              {cep && <p className="text-gray-500">CEP: {cep}</p>}
            </div>
          </div>

          {/* Mapa - Lazy Load */}
          <div className="relative w-full h-[180px] bg-gray-100">
            {showMap ? (
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização no mapa"
              />
            ) : (
              <button
                onClick={() => setShowMap(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#240046]" />
                </div>
                <span className="text-sm font-medium text-gray-600">Carregar mapa</span>
              </button>
            )}

            {/* Botão abrir no Maps */}
            {showMap && (
              <button
                onClick={onOpenMaps}
                className={cn(
                  "absolute top-3 left-3",
                  "flex items-center gap-1.5",
                  "px-3 py-2 rounded-lg",
                  "bg-white shadow-md",
                  "text-sm font-medium text-gray-700",
                  "hover:shadow-lg transition-shadow",
                )}
              >
                <ExternalLink className="w-4 h-4" />
                Abrir no mapa
              </button>
            )}
          </div>

          {/* Botões de navegação */}
          <div className="p-4 border-t border-gray-100">
            <div className="grid grid-cols-4 gap-2">
              {navButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.onClick}
                  className={cn(
                    "flex flex-col items-center gap-1.5",
                    "py-3 rounded-xl",
                    "bg-gray-50 hover:bg-gray-100",
                    "active:scale-[0.97] transition-all",
                  )}
                >
                  <Navigation className={cn("w-5 h-5", btn.color)} />
                  <span className="text-xs font-medium text-gray-700">{btn.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
