import { memo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// HOOKS
// =============================================================================

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
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
// SKELETON COMPONENT
// =============================================================================

interface EstablishmentCardSkeletonProps {
  fullWidth?: boolean;
}

export const EstablishmentCardSkeleton = memo(({ fullWidth = false }: EstablishmentCardSkeletonProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        fullWidth ? "w-full" : "flex-shrink-0 w-[160px] sm:w-[220px]",
        "rounded-2xl overflow-hidden bg-card/50 border border-border/50"
      )}
      role="status"
      aria-label="Carregando"
    >
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {!reducedMotion && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ animation: "shimmer 1.5s infinite" }}
          />
        )}
        
        {/* Category badge skeleton */}
        <div className="absolute top-3 left-3">
          <div className="h-7 w-20 rounded-lg bg-white/10" />
        </div>
        
        {/* Favorite button skeleton */}
        <div className="absolute top-2 right-2 w-11 h-11 rounded-full bg-black/20" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <div className="h-5 bg-muted rounded w-[85%]" />
        
        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <div className="h-4 bg-muted rounded w-[60%]" />
        </div>
        
        {/* Benefit */}
        <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-muted rounded w-[40%]" />
            <div className="h-4 bg-muted rounded w-[70%]" />
          </div>
        </div>
      </div>

      <span className="sr-only">Carregando...</span>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
});

EstablishmentCardSkeleton.displayName = "EstablishmentCardSkeleton";

export default EstablishmentCardSkeleton;
