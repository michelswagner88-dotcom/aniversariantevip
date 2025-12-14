import { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Map, X } from "lucide-react";
import { MapaEstabelecimentos } from "@/components/MapaEstabelecimentos";
import { cn } from "@/lib/utils";

interface Estabelecimento {
  id: string;
  nome_fantasia?: string;
  latitude?: number | null;
  longitude?: number | null;
  categoria?: string | string[];
  [key: string]: any;
}

interface MapFABProps {
  estabelecimentos: Estabelecimento[];
  className?: string;
}

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
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

export const MapFAB = memo(({ estabelecimentos, className }: MapFABProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useFocusTrap(isMapOpen, modalRef);

  const estabelecimentosComCoordenadas = useMemo(() => {
    return estabelecimentos.filter((est) => est.latitude && est.longitude && est.latitude !== 0);
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
    if (navigator.vibrate) navigator.vibrate(10);
    setIsMapOpen(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    setIsMapOpen(false);
  }, []);

  const count = estabelecimentosComCoordenadas.length;

  if (count === 0) return null;

  return (
    <>
      <button
        onClick={handleOpenMap}
        aria-label={`Mostrar mapa com ${count} estabelecimentos`}
        aria-haspopup="dialog"
        className={cn(
          "fixed bottom-24 left-1/2 -translate-x-1/2 z-40",
          "flex items-center gap-2 px-5 py-3 min-h-[44px]",
          "bg-slate-900 dark:bg-white text-white dark:text-slate-900",
          "rounded-full shadow-lg font-medium text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
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
          aria-label="Mapa de estabelecimentos"
          className={cn(
            "fixed inset-0 z-50 bg-white dark:bg-slate-950",
            !reducedMotion && "animate-in fade-in duration-200",
          )}
        >
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-white dark:from-slate-950 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="map-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                  Mapa
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {count} {count === 1 ? "lugar" : "lugares"}
                </p>
              </div>
              <button
                onClick={handleCloseMap}
                aria-label="Fechar mapa"
                className={cn(
                  "flex items-center justify-center w-10 h-10 min-w-[44px] min-h-[44px]",
                  "bg-white dark:bg-slate-800 rounded-full shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  !reducedMotion && "transition-shadow hover:shadow-lg",
                )}
              >
                <X className="w-5 h-5 text-slate-900 dark:text-white" aria-hidden="true" />
              </button>
            </div>
          </div>

          <MapaEstabelecimentos estabelecimentos={estabelecimentosComCoordenadas as any[]} height="100vh" />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleCloseMap}
              aria-label="Fechar mapa e mostrar lista"
              className={cn(
                "flex items-center gap-2 px-6 py-3 min-h-[44px]",
                "bg-slate-900 dark:bg-white text-white dark:text-slate-900",
                "rounded-full shadow-lg font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
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
