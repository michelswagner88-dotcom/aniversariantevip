import React, { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { X, Navigation, Loader2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { cn } from "@/lib/utils";
import { Establishment } from "./AirbnbMapLayout";

// =============================================================================
// CONSTANTS
// =============================================================================

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const DEFAULT_CENTER = { lat: -27.5954, lng: -48.548 };
const DEFAULT_ZOOM = 13;
const USER_LOCATION_ZOOM = 14;
const RECENTER_ZOOM = 15;
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

interface MapMobileFullscreenProps {
  establishments: Establishment[];
  onEstablishmentClick: (establishment: Establishment) => void;
  userLocation?: { lat: number; lng: number } | null;
  onClose: () => void;
}

interface BottomSheetProps {
  establishment: Establishment;
  onClose: () => void;
  onViewDetails: () => void;
}

interface MapMarkersProps {
  establishments: Establishment[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  onMapReady?: (map: google.maps.Map) => void;
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

const haptic = (pattern: number = 10) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// BOTTOM SHEET COMPONENT
// =============================================================================

const BottomSheet = ({ establishment, onClose, onViewDetails }: BottomSheetProps) => {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleViewClick = useCallback(() => {
    haptic();
    onViewDetails();
  }, [onViewDetails]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40",
          !reducedMotion && "animate-in fade-in duration-200",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 touch-pan-y",
          !reducedMotion && "animate-in slide-in-from-bottom duration-300",
        )}
      >
        <Card className="rounded-t-3xl border-t border-white/10 bg-slate-900/95 backdrop-blur-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" aria-hidden="true" />

          <div className="flex gap-4">
            {establishment.logo_url && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={establishment.logo_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 id="bottom-sheet-title" className="text-lg font-bold text-white mb-1">
                {establishment.nome_fantasia}
              </h3>
              <p className="text-sm text-slate-400 mb-2 line-clamp-1">{establishment.cidade}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                  {establishment.categoria[0]}
                </span>
              </div>
              <Button
                onClick={handleViewClick}
                className={cn(
                  "w-full",
                  "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500",
                  "shadow-lg shadow-violet-500/20",
                  !reducedMotion && "transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95",
                )}
              >
                Ver Benefício 🎁
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

// =============================================================================
// MAP MARKERS COMPONENT
// =============================================================================

const MapMarkers = ({ establishments, selectedId, onMarkerClick, userLocation, onMapReady }: MapMarkersProps) => {
  const map = useMap();
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (!map || !userLocation) return;
    map.setCenter(userLocation);
    map.setZoom(USER_LOCATION_ZOOM);
  }, [map, userLocation]);

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

  useEffect(() => {
    markersRef.current = [];
  }, [establishments]);

  useEffect(() => {
    if (!map) return;

    clustererRef.current?.clearMarkers();

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

      {establishments.map((establishment) => {
        if (!establishment.latitude || !establishment.longitude) return null;

        const isSelected = selectedId === establishment.id;
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
                isSelected ? "z-50 scale-110" : "z-10",
                !reducedMotion && !isSelected && "hover:scale-105 hover:z-40",
              )}
            >
              <div className="absolute inset-0 -m-4" />

              <div
                className={cn(
                  "px-3 py-2 rounded-xl shadow-lg",
                  "flex items-center gap-2 whitespace-nowrap",
                  !reducedMotion && "transition-all duration-200",
                  isSelected
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-50",
                )}
                style={{
                  boxShadow: isSelected ? "0 4px 20px rgba(139, 92, 246, 0.5)" : "0 2px 10px rgba(0,0,0,0.15)",
                }}
              >
                <span className="text-base">{icon}</span>
                <span className="text-sm font-semibold max-w-[140px] truncate">
                  {establishment.nome_fantasia || "Estabelecimento"}
                </span>
              </div>

              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 -bottom-2",
                  "w-0 h-0",
                  "border-l-[8px] border-l-transparent",
                  "border-r-[8px] border-r-transparent",
                  "border-t-[8px]",
                  !reducedMotion && "transition-colors duration-200",
                  isSelected ? "border-t-fuchsia-600" : "border-t-white",
                )}
              />

              {isSelected && !reducedMotion && (
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

export const MapMobileFullscreen = ({
  establishments,
  onEstablishmentClick,
  userLocation,
  onClose,
}: MapMobileFullscreenProps) => {
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const defaultCenter = userLocation || DEFAULT_CENTER;
  const selectedEstablishment = establishments.find((e) => e.id === selectedEstablishmentId);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !selectedEstablishmentId) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, selectedEstablishmentId]);

  const handleMarkerClick = useCallback((id: string) => {
    haptic();
    setSelectedEstablishmentId(id);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedEstablishment) {
      onEstablishmentClick(selectedEstablishment);
    }
  }, [selectedEstablishment, onEstablishmentClick]);

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedEstablishmentId(null);
  }, []);

  const handleRecenterToUser = useCallback(() => {
    haptic();
    if (userLocation && mapInstance) {
      mapInstance.setCenter(userLocation);
      mapInstance.setZoom(RECENTER_ZOOM);
    }
  }, [userLocation, mapInstance]);

  const handleClose = useCallback(() => {
    haptic();
    onClose();
  }, [onClose]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  return (
    <div
      className={cn("fixed inset-0 z-50 bg-slate-950", !reducedMotion && "animate-in fade-in duration-200")}
      role="dialog"
      aria-modal="true"
      aria-label="Mapa de estabelecimentos"
    >
      <Button
        onClick={handleClose}
        variant="ghost"
        size="icon"
        aria-label="Fechar mapa"
        className={cn(
          "absolute top-4 left-4 z-50",
          "bg-slate-900/90 backdrop-blur-md",
          "border border-white/10",
          !reducedMotion && "transition-all duration-200 hover:bg-slate-800/90 hover:scale-110 active:scale-95",
        )}
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </Button>

      {userLocation && (
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

      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className={cn("w-8 h-8 text-violet-400", !reducedMotion && "animate-spin")} aria-hidden="true" />
            <p className="text-sm text-slate-400">Carregando mapa...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950 p-6" role="alert">
          <div className="text-center">
            <div className="text-6xl mb-4" aria-hidden="true">
              🗺️
            </div>
            <p className="text-slate-400 mb-4">{mapError}</p>
            <Button onClick={handleClose} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      )}

      {!mapError && (
        <Suspense fallback={null}>
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={DEFAULT_ZOOM}
              mapId="aniversariante-vip-map-mobile"
              gestureHandling="greedy"
              disableDefaultUI={false}
              zoomControl={true}
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              className="w-full h-full"
              onTilesLoaded={handleMapLoad}
            >
              <MapMarkers
                establishments={establishments}
                selectedId={selectedEstablishmentId}
                onMarkerClick={handleMarkerClick}
                userLocation={userLocation}
                onMapReady={setMapInstance}
              />
            </Map>
          </APIProvider>
        </Suspense>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
        <Button
          onClick={handleClose}
          aria-label="Fechar mapa e mostrar lista"
          className={cn(
            "shadow-2xl px-6 py-6 rounded-full",
            "bg-slate-900/90 backdrop-blur-md",
            "border border-white/10",
            "flex items-center gap-2",
            !reducedMotion && "transition-all duration-200 hover:bg-slate-800/90 hover:scale-105 active:scale-95",
          )}
        >
          <List className="w-5 h-5" aria-hidden="true" />
          <span className="font-semibold">Mostrar Lista</span>
        </Button>
      </div>

      {selectedEstablishment && (
        <BottomSheet
          establishment={selectedEstablishment}
          onClose={handleCloseBottomSheet}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};
