import { memo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface HomeLoadingStateProps {
  message?: string;
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
// COMPONENT
// =============================================================================

export const HomeLoadingState = memo(({ message = "Detectando sua localização..." }: HomeLoadingStateProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Spinner */}
      <div className="relative mb-8">
        <div
          className={cn(
            "w-20 h-20 rounded-full",
            "border-4 border-[#240046]/20 border-t-[#240046]",
            !reducedMotion && "animate-spin",
          )}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl" aria-hidden="true">
            📍
          </span>
        </div>
      </div>

      {/* Message */}
      <p className={cn("text-slate-400 text-center", !reducedMotion && "animate-pulse")}>{message}</p>
    </div>
  );
});

HomeLoadingState.displayName = "HomeLoadingState";
