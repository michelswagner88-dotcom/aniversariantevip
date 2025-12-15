import React, { useState, useRef, useCallback, useMemo, useEffect, memo } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapDesktopSplit } from "./MapDesktopSplit";
import { MapMobileFullscreen } from "./MapMobileFullscreen";

// =============================================================================
// CONSTANTS
// =============================================================================

const HIGHLIGHT_TIMEOUT_MS = 2000;

// SEGURANÇA: Esta key é exposta no frontend (normal para Maps JS API)
// Certifique-se de ter restrições de domínio configuradas no Google Cloud Console
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// =============================================================================
// TYPES
// =============================================================================

// TODO: Mover para @/types/establishment.ts e importar
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

interface MapCardContextValue {
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  hoveredId: string | null;
  highlightedId: string | null;
  setHoveredId: (id: string | null) => void;
}

// =============================================================================
// HOOKS
// =============================================================================

// TODO: Extrair para @/hooks/useReducedMotion.ts
const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

// =============================================================================
// CONTEXT
// =============================================================================

const FALLBACK_CARD_REFS = { current: {} };
const FALLBACK_SET_HOVERED = () => {};

const fallbackContextValue: MapCardContextValue = {
  cardRefs: FALLBACK_CARD_REFS,
  hoveredId: null,
  highlightedId: null,
  setHoveredId: FALLBACK_SET_HOVERED,
};

export const MapCardContext = React.createContext<MapCardContextValue>(fallbackContextValue);

export const useMapCardContext = () => React.useContext(MapCardContext);

// =============================================================================
// UTILS
// =============================================================================

const haptic = (pattern: number = 10): void => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export const AirbnbMapLayout = memo(function AirbnbMapLayout({
  establishments,
  onEstablishmentClick,
  userLocation,
  children,
  showMap = true,
  listHeader,
  className,
}: AirbnbMapLayoutProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const reducedMotion = useReducedMotion();

  // Filter establishments with valid coordinates
  const validEstablishments = useMemo(
    () =>
      establishments.filter(
        (est) => est.latitude !== null && est.longitude !== null && est.latitude !== 0 && est.longitude !== 0,
      ),
    [establishments],
  );

  // Limpa refs antigas quando establishments mudam
  useEffect(() => {
    const validIds = new Set(establishments.map((est) => est.id));
    const currentRefs = cardRefs.current;

    Object.keys(currentRefs).forEach((id) => {
      if (!validIds.has(id)) {
        delete currentRefs[id];
      }
    });
  }, [establishments]);

  // Clear highlight after timeout
  useEffect(() => {
    if (!highlightedId) return;

    const timer = setTimeout(() => {
      setHighlightedId(null);
    }, HIGHLIGHT_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [highlightedId]);

  // Scroll to card when clicking pin
  const scrollToCard = useCallback(
    (id: string) => {
      const cardElement = cardRefs.current[id];
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center",
        });
        setHighlightedId(id);
      }
    },
    [reducedMotion],
  );

  // Handler for pin click
  const handlePinClick = useCallback(
    (id: string) => {
      scrollToCard(id);
      setHoveredId(id);
    },
    [scrollToCard],
  );

  // Handler for FAB click
  const handleOpenMap = useCallback(() => {
    haptic();
    setIsMapOpen(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    setIsMapOpen(false);
  }, []);

  // Check if map is available
  const hasValidEstablishments = validEstablishments.length > 0;
  const isMapAvailable = showMap && !!GOOGLE_MAPS_API_KEY && hasValidEstablishments;

  // Context value (memoized)
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

        {/* Desktop fallback when map is not available */}
        {!isMapAvailable && (
          <div className="hidden lg:block">
            {listHeader}
            {children}
          </div>
        )}

        {/* MOBILE/TABLET: List + FAB (< 1024px) */}
        <div className="lg:hidden">
          {listHeader}
          {children}

          {/* FAB to open map */}
          {isMapAvailable && (
            <Button
              onClick={handleOpenMap}
              aria-label={`Abrir mapa com ${validEstablishments.length} estabelecimentos`}
              className={cn(
                "fixed bottom-20 left-1/2 z-30",
                "-translate-x-1/2",
                "flex items-center gap-2",
                "px-5 py-3 rounded-full min-h-[44px]",
                "bg-[#240046]/95 backdrop-blur-md",
                "border border-white/10",
                "shadow-2xl shadow-black/50",
                !reducedMotion && [
                  "transition-all duration-200",
                  "hover:bg-[#3C096C] hover:scale-105",
                  "active:scale-95",
                ],
              )}
            >
              <MapPin className="w-5 h-5 text-violet-400" aria-hidden="true" />
              <span className="font-semibold text-white">Ver Mapa</span>
            </Button>
          )}

          {/* Fullscreen mobile map */}
          {isMapAvailable && isMapOpen && (
            <MapMobileFullscreen
              establishments={validEstablishments}
              onEstablishmentClick={onEstablishmentClick}
              userLocation={userLocation}
              onClose={handleCloseMap}
            />
          )}
        </div>
      </div>
    </MapCardContext.Provider>
  );
});
