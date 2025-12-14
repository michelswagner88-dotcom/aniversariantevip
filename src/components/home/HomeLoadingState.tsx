import { memo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HomeLoadingStateProps {
  message?: string;
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

export const HomeLoadingState = memo(({ message = "Detectando sua localização..." }: HomeLoadingStateProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative mb-8">
        <div
          className={cn(
            "w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500",
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

      <p className={cn("text-slate-400 text-center", !reducedMotion && "animate-pulse")}>{message}</p>

      <span className="sr-only">{message}</span>
    </div>
  );
});

HomeLoadingState.displayName = "HomeLoadingState";
