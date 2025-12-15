import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { cn } from "@/lib/utils";
import { Establishment } from "./AirbnbMapLayout";

// =============================================================================
// CONSTANTS
// =============================================================================

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const DEFAULT_CENTER = { lat: -27.5954, lng: -48.548 }; // Florianópolis
const DEFAULT_ZOOM = 13;
const BOUNDS_PADDING = 50;

const CATEGORY_ICONS: Record<string, string> = {
  Restaurante: "🍽️",
  Bar: "🍺",
  Academia: "💪",
  "Salão de Beleza": "💇",
  Barbearia: "✂️",
  Cafeteria: "☕",
  "Casa Noturna": "🎉",
  Confeitaria: "🍰",
  Entretenimento: "🎬",
  Hospedagem: "🏨",
  Loja: "🛍️",
  Serviços: "🔧",
  Sorveteria: "🍦",
  "Outros Comércios": "🏪",
};

// =============================================================================
// TYPES
// =============================================================================

interface MapDesktopSplitProps {
  establishments: Establishment[];
  onEstablishmentClick: (establishment: Establishment) => void;
  userLocation?: { lat: number; lng: number } | null;
  hoveredId: string | null;
  onPinClick: (id: string) => void;
  onPinHover: (id: string | null) => void;
  listHeader?: React.ReactNode;
  children: React.ReactNode;
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onCardHover: (id: string | null) => void;
}

interface MapMarkersProps {
  establishments: Establishment[];
  selectedId: string | null;
  hoveredId: string | null;
  onMarkerClick: (id: string) => void;
  onMarkerHover: (id: string | null) => void;
  userLocation?: { lat: number; lng: number } | null;
}

// =============================================================================
// HOOKS
// =============================================================================

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
// UTILS
// =============================================================================

const getCategoryIcon = (categories: string[]): string => {
  if (!categories || categories.length === 0) return "📍";
  return CATEGORY_ICONS[categories[0]] || "📍";
};

// =============================================================================
// MAP MARKERS COMPONENT
// =============================================================================

const MapMarkers = ({
  establishments,
  selectedId,
  hoveredId,
  onMarkerClick,
  onMarkerHover,
  userLocation,
}: MapMarkersProps) => {
  const map = useMap();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const reducedMotion = useReducedMotion();

  // Fit bounds to show all establishments
  useEffect(() => {
    if (!map || establishments.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    establishments.forEach((est) => {
      if (est.latitude && est.longitude) {
        bounds.extend({ lat: est.latitude, lng: est.longitude });
      }
    });

    if (userLocation) {
      bounds.extend(userLocation);
    }

    map.fitBounds(bounds, BOUNDS_PADDING);
  }, [map, establishments, userLocation]);

  // Clear markers ref when establishments change
  useEffect(() => {
    markersRef.current = [];
  }, [establishments]);

  // Setup clustering
  useEffect(() => {
    if (!map) return;

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    clustererRef.current = new MarkerClusterer({
      map,
      markers: markersRef.current,
      renderer: {
        render: ({ count, position }) => {
          const color = count > 10 ? "#ec4899" : count > 5 ? "#a855f7" : "#8b5cf6";
          return new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.9,
              strokeWeight: 3,
              strokeColor: "#ffffff",
              scale: Math.min(15 + count * 1.5, 35),
            },
            label: {
              text: String(count),
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold",
            },
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          });
        },
      },
    });

    return () => {
      clustererRef.current?.clearMarkers();
    };
  }, [map, establishments]);

  return (
    <>
      {/* User Location Marker */}
      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div className="relative">
            <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div className={cn("w-full h-full bg-blue-500/30 rounded-full", !reducedMotion && "animate-ping")} />
            </div>
            <div className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div className="w-full h-full bg-blue-500/20 rounded-full" />
            </div>
            <div className="relative w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          </div>
        </AdvancedMarker>
      )}

      {/* Establishment Markers */}
      {establishments.map((establishment) => {
        if (!establishment.latitude || !establishment.longitude) return null;

        const isSelected = selectedId === establishment.id;
        const isHovered = hoveredId === establishment.id;
        const isHighlighted = isSelected || isHovered;
        const icon = getCategoryIcon(establishment.categoria);

        return (
          <AdvancedMarker
            key={establishment.id}
            position={{ lat: establishment.latitude, lng: establishment.longitude }}
            onClick={() => onMarkerClick(establishment.id)}
            ref={(marker) => {
              if (marker && !markersRef.current.includes(marker)) {
                markersRef.current.push(marker);
              }
            }}
          >
            <div
              className={cn(
                "relative cursor-pointer",
                !reducedMotion && "transition-all duration-200",
                isHighlighted ? "z-50 scale-110" : "z-10",
                !reducedMotion && !isHighlighted && "hover:scale-105 hover:z-40",
              )}
              onMouseEnter={() => onMarkerHover(establishment.id)}
              onMouseLeave={() => onMarkerHover(null)}
            >
              {/* Balloon with name */}
              <div
                className={cn(
                  "px-3 py-2 rounded-xl shadow-lg",
                  "flex items-center gap-2 whitespace-nowrap",
                  !reducedMotion && "transition-all duration-200",
                  isHighlighted
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-50",
                )}
                style={{
                  boxShadow: isHighlighted ? "0 4px 20px rgba(139, 92, 246, 0.5)" : "0 2px 10px rgba(0,0,0,0.15)",
                }}
              >
                <span className="text-base">{icon}</span>
                <span className="text-sm font-semibold max-w-[140px] truncate">
                  {establishment.nome_fantasia || "Estabelecimento"}
                </span>
              </div>

              {/* Arrow pointing down */}
              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 -bottom-2",
                  "w-0 h-0",
                  "border-l-[8px] border-l-transparent",
                  "border-r-[8px] border-r-transparent",
                  "border-t-[8px]",
                  !reducedMotion && "transition-colors duration-200",
                  isHighlighted ? "border-t-fuchsia-600" : "border-t-white",
                )}
              />

              {/* Glow effect */}
              {isHighlighted && !reducedMotion && (
                <div className="absolute inset-0 -z-10 animate-pulse">
                  <div className="w-full h-full rounded-xl blur-xl bg-violet-500/30" />
                </div>
              )}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MapDesktopSplit = ({
  establishments,
  onEstablishmentClick,
  userLocation,
  hoveredId,
  onPinClick,
  onPinHover,
  listHeader,
  children,
  cardRefs,
  onCardHover,
}: MapDesktopSplitProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const defaultCenter = userLocation || DEFAULT_CENTER;

  const handleMarkerClick = useCallback(
    (id: string) => {
      setSelectedId(id);
      onPinClick(id);
    },
    [onPinClick],
  );

  const handleRecenterToUser = useCallback(() => {
    if (userLocation && mapInstance) {
      mapInstance.setCenter(userLocation);
      mapInstance.setZoom(15);
    }
  }, [userLocation, mapInstance]);

  // Handle map load
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px]">
      {/* List (left) - 55% */}
      <div className="w-[55%] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {listHeader}
        {children}
      </div>

      {/* Map (right) - 45% */}
      <div className="w-[45%] sticky top-0 h-full rounded-2xl overflow-hidden border border-white/10">
        {/* Loading */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className={cn("w-8 h-8 text-violet-400", !reducedMotion && "animate-spin")} aria-hidden="true" />
              <p className="text-sm text-slate-400">Carregando mapa...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {mapError && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900 p-6">
            <div className="text-center" role="alert">
              <div className="text-6xl mb-4" aria-hidden="true">
                🗺️
              </div>
              <p className="text-slate-400">{mapError}</p>
            </div>
          </div>
        )}

        {/* Recenter Button */}
        {userLocation && mapLoaded && (
          <Button
            onClick={handleRecenterToUser}
            variant="ghost"
            size="icon"
            aria-label="Centralizar na minha localização"
            className={cn(
              "absolute top-4 right-4 z-50",
              "bg-slate-900/90 backdrop-blur-md",
              "border border-white/10",
              !reducedMotion && "transition-all duration-200 hover:bg-slate-800/90 hover:scale-110 active:scale-95",
            )}
          >
            <Navigation className="w-5 h-5 text-blue-400" aria-hidden="true" />
          </Button>
        )}

        {/* Map */}
        {!mapError && (
          <Suspense fallback={null}>
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={DEFAULT_ZOOM}
                mapId="aniversariante-vip-map-split"
                gestureHandling="greedy"
                disableDefaultUI={false}
                zoomControl={true}
                fullscreenControl={false}
                streetViewControl={false}
                mapTypeControl={false}
                className="w-full h-full"
                onTilesLoaded={handleMapLoad}
                onCameraChanged={(ev) => {
                  if (!mapInstance) {
                    setMapInstance(ev.map);
                  }
                }}
              >
                <MapMarkers
                  establishments={establishments}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  onMarkerClick={handleMarkerClick}
                  onMarkerHover={onPinHover}
                  userLocation={userLocation}
                />
              </Map>
            </APIProvider>
          </Suspense>
        )}
      </div>
    </div>
  );
};
