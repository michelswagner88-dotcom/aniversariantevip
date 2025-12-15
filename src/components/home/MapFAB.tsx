import { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Map, X } from "lucide-react";
import { MapaEstabelecimentos } from "@/components/MapaEstabelecimentos";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS
// =============================================================================

const HAPTIC_LIGHT = 10;

// =============================================================================
// TYPES
// =============================================================================

// Tipo que MapaEstabelecimentos espera
interface EstabelecimentoMapa {
  id: string;
  nome_fantasia: string;
  categoria: string[] | null;
  latitude: number;
  longitude: number;
  endereco_formatado?: string;
  logo_url?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  distancia?: number;
}

// Tipo que pode vir da prop (mais flexível)
interface EstabelecimentoInput {
  id: string;
  nome_fantasia?: string;
  latitude?: number | null;
  longitude?: number | null;
  categoria?: string | string[] | null;
  descricao_beneficio?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  slug?: string;
  logo_url?: string;
  galeria_fotos?: string[];
}

interface MapFABProps {
  estabelecimentos: EstabelecimentoInput[];
  className?: string;
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

const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement | null>) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      return;
    }

    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive, containerRef]);
};

// =============================================================================
// UTILS
// =============================================================================

const haptic = (pattern: number = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export const MapFAB = memo(({ estabelecimentos, className }: MapFABProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useFocusTrap(isMapOpen, modalRef);

  // Filter and convert establishments with valid coordinates
  const estabelecimentosComCoordenadas = useMemo((): EstabelecimentoMapa[] => {
    return estabelecimentos
      .filter(
        (
          est,
        ): est is EstabelecimentoInput & {
          nome_fantasia: string;
          latitude: number;
          longitude: number;
        } =>
          typeof est.nome_fantasia === "string" &&
          est.nome_fantasia.length > 0 &&
          typeof est.latitude === "number" &&
          typeof est.longitude === "number" &&
          est.latitude !== 0 &&
          est.longitude !== 0,
      )
      .map((est) => ({
        id: est.id,
        nome_fantasia: est.nome_fantasia,
        latitude: est.latitude,
        longitude: est.longitude,
        categoria: Array.isArray(est.categoria) ? est.categoria : est.categoria ? [est.categoria] : null,
        logo_url: est.logo_url,
        cidade: est.cidade,
        estado: est.estado,
        bairro: est.bairro,
      }));
  }, [estabelecimentos]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMapOpen) {
        setIsMapOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMapOpen]);

  useEffect(() => {
    if (isMapOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMapOpen]);

  const handleOpenMap = useCallback(() => {
    haptic();
    setIsMapOpen(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    haptic();
    setIsMapOpen(false);
  }, []);

  const count = estabelecimentosComCoordenadas.length;

  if (count === 0) return null;

  return (
    <>
      <button
        onClick={handleOpenMap}
        aria-label={`Mostrar mapa com ${count} ${count === 1 ? "estabelecimento" : "estabelecimentos"}`}
        aria-haspopup="dialog"
        className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-40",
          "flex items-center gap-2 px-5 py-3 min-h-[44px]",
          "bg-[#240046] text-white",
          "rounded-full shadow-lg font-medium text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
          "md:hidden",
          !reducedMotion && "transition-all hover:shadow-xl hover:scale-105 active:scale-95",
          className,
        )}
      >
        <Map className="w-4 h-4" aria-hidden="true" />
        <span>Mostrar mapa</span>
      </button>

      {isMapOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="map-modal-title"
          className={cn("fixed inset-0 z-50 bg-white", !reducedMotion && "animate-in fade-in duration-200")}
        >
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-white via-white/90 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="map-modal-title" className="text-lg font-semibold text-[#240046]">
                  Mapa
                </h2>
                <p className="text-sm text-slate-500">
                  {count} {count === 1 ? "lugar" : "lugares"}
                </p>
              </div>
              <button
                onClick={handleCloseMap}
                aria-label="Fechar mapa"
                className={cn(
                  "flex items-center justify-center w-10 h-10 min-w-[44px] min-h-[44px]",
                  "bg-white rounded-full shadow-md border border-slate-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#240046]",
                  !reducedMotion && "transition-shadow hover:shadow-lg",
                )}
              >
                <X className="w-5 h-5 text-[#240046]" aria-hidden="true" />
              </button>
            </div>
          </div>

          <MapaEstabelecimentos estabelecimentos={estabelecimentosComCoordenadas} height="100vh" />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleCloseMap}
              aria-label="Fechar mapa e mostrar lista"
              className={cn(
                "flex items-center gap-2 px-6 py-3 min-h-[44px]",
                "bg-[#240046] text-white",
                "rounded-full shadow-lg font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
                !reducedMotion && "transition-transform hover:scale-105",
              )}
            >
              <span>Mostrar lista</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

MapFAB.displayName = "MapFAB";
