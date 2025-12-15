import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapDesktopSplit } from "./MapDesktopSplit";
import { MapMobileFullscreen } from "./MapMobileFullscreen";

// ============================================================
// TIPOS
// ============================================================

export interface Establishment {
  id: string;
  nome_fantasia: string;
  categoria: string[];
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  descricao_beneficio: string;
  cidade: string;
  estado: string;
  slug: string | null;
}

interface AirbnbMapLayoutProps {
  establishments: Establishment[];
  onEstablishmentClick: (establishment: Establishment) => void;
  userLocation?: { lat: number; lng: number } | null;
  children: React.ReactNode;
  showMap?: boolean;
  listHeader?: React.ReactNode;
  className?: string;
}

// ============================================================
// CONTEXT
// ============================================================

interface MapCardContextValue {
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  hoveredId: string | null;
  highlightedId: string | null;
  setHoveredId: (id: string | null) => void;
}

export const MapCardContext = React.createContext<MapCardContextValue | null>(null);

export const useMapCardContext = () => {
  const context = React.useContext(MapCardContext);
  if (!context) {
    // Retorna valores padrão se usado fora do provider (fallback seguro)
    return {
      cardRefs: { current: {} },
      hoveredId: null,
      highlightedId: null,
      setHoveredId: () => {},
    };
  }
  return context;
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const AirbnbMapLayout: React.FC<AirbnbMapLayoutProps> = ({
  establishments,
  onEstablishmentClick,
  userLocation,
  children,
  showMap = true,
  listHeader,
  className,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filtrar estabelecimentos com coordenadas válidas
  const validEstablishments = useMemo(
    () =>
      establishments.filter(
        (est) => est.latitude !== null && est.longitude !== null && est.latitude !== 0 && est.longitude !== 0,
      ),
    [establishments],
  );

  // Limpar highlight após timeout
  useEffect(() => {
    if (!highlightedId) return;

    const timer = setTimeout(() => {
      setHighlightedId(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [highlightedId]);

  // Scroll para card quando clicar no pin
  const scrollToCard = useCallback((id: string) => {
    const cardElement = cardRefs.current[id];
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedId(id);
    }
  }, []);

  // Handler quando clicar no pin do mapa
  const handlePinClick = useCallback(
    (id: string) => {
      scrollToCard(id);
      setHoveredId(id);
    },
    [scrollToCard],
  );

  // Verificar se API key está disponível
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidEstablishments = validEstablishments.length > 0;
  const isMapAvailable = showMap && !!apiKey && hasValidEstablishments;

  // Context value
  const contextValue = useMemo<MapCardContextValue>(
    () => ({
      cardRefs,
      hoveredId,
      highlightedId,
      setHoveredId,
    }),
    [hoveredId, highlightedId],
  );

  return (
    <MapCardContext.Provider value={contextValue}>
      <div className={cn("relative", className)}>
        {/* DESKTOP: Split View (≥1024px) */}
        {isMapAvailable && (
          <div className="hidden lg:block">
            <MapDesktopSplit
              establishments={validEstablishments}
              onEstablishmentClick={onEstablishmentClick}
              userLocation={userLocation}
              hoveredId={hoveredId}
              onPinClick={handlePinClick}
              onPinHover={setHoveredId}
              listHeader={listHeader}
              cardRefs={cardRefs}
              onCardHover={setHoveredId}
            >
              {children}
            </MapDesktopSplit>
          </div>
        )}

        {/* Desktop fallback quando não pode mostrar mapa */}
        {!isMapAvailable && (
          <div className="hidden lg:block">
            {listHeader}
            {children}
          </div>
        )}

        {/* MOBILE/TABLET: Lista + FAB (< 1024px) */}
        <div className="lg:hidden">
          {listHeader}
          {children}

          {/* FAB para abrir mapa */}
          {isMapAvailable && (
            <Button
              onClick={() => setIsMapOpen(true)}
              aria-label="Abrir mapa com estabelecimentos"
              className={cn(
                "fixed bottom-20 left-1/2 z-30",
                "-translate-x-1/2",
                "flex items-center gap-2",
                "px-5 py-3 rounded-full",
                "bg-slate-900/95 backdrop-blur-md",
                "border border-white/10",
                "shadow-2xl shadow-black/50",
                "hover:bg-slate-800 hover:scale-105",
                "active:scale-95",
                "transition-all duration-200",
              )}
            >
              <MapPin className="w-5 h-5 text-violet-400" />
              <span className="font-semibold text-white">Ver Mapa</span>
            </Button>
          )}

          {/* Mapa fullscreen mobile */}
          {isMapAvailable && isMapOpen && (
            <MapMobileFullscreen
              establishments={validEstablishments}
              onEstablishmentClick={onEstablishmentClick}
              userLocation={userLocation}
              onClose={() => setIsMapOpen(false)}
            />
          )}
        </div>
      </div>
    </MapCardContext.Provider>
  );
};
