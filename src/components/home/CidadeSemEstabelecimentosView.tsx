import { memo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, MapPin, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS
// =============================================================================

const ANIMATION_BASE_DELAY = 350;
const ANIMATION_STEP_DELAY = 50;
const HAPTIC_LIGHT = 10;

const DEFAULT_CIDADES_SUGERIDAS: CidadeSugerida[] = [
  { cidade: "Brasília", estado: "DF" },
  { cidade: "São Paulo", estado: "SP" },
  { cidade: "Rio de Janeiro", estado: "RJ" },
];

// =============================================================================
// TYPES
// =============================================================================

interface CidadeSugerida {
  cidade: string;
  estado: string;
}

interface CidadeSemEstabelecimentosViewProps {
  cidade: string;
  estado: string;
  onMudarCidade: () => void;
  cidadesSugeridas?: CidadeSugerida[];
  navigateTo?: "home" | "explorar";
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

const haptic = (pattern: number = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export const CidadeSemEstabelecimentosView = memo(
  ({
    cidade,
    estado,
    onMudarCidade,
    cidadesSugeridas = DEFAULT_CIDADES_SUGERIDAS,
    navigateTo = "explorar",
  }: CidadeSemEstabelecimentosViewProps) => {
    const navigate = useNavigate();
    const reducedMotion = useReducedMotion();

    const handleMudarCidade = useCallback(() => {
      haptic();
      onMudarCidade();
    }, [onMudarCidade]);

    const handleIndicarEstabelecimento = useCallback(() => {
      haptic();
      navigate("/seja-parceiro");
    }, [navigate]);

    const handleCidadeClick = useCallback(
      (cidadeSugerida: CidadeSugerida) => {
        haptic();
        const basePath = navigateTo === "home" ? "/" : "/explorar";
        const params = new URLSearchParams({
          cidade: cidadeSugerida.cidade,
          estado: cidadeSugerida.estado,
        });
        navigate(`${basePath}?${params.toString()}`);
      },
      [navigate, navigateTo],
    );

    const handleCidadeKeyDown = useCallback(
      (e: React.KeyboardEvent, cidadeSugerida: CidadeSugerida) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCidadeClick(cidadeSugerida);
        }
      },
      [handleCidadeClick],
    );

    return (
      <div
        className={cn(
          "min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-white",
          !reducedMotion && "animate-in fade-in duration-500",
        )}
        role="main"
        aria-labelledby="empty-state-title"
      >
        {/* Location Badge */}
        <div className="flex items-center gap-2 text-[#7C3AED] mb-6">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span className="font-medium">
            {cidade}, {estado}
          </span>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "w-20 h-20 rounded-full",
            "bg-violet-100",
            "flex items-center justify-center mb-6",
            !reducedMotion && "animate-in zoom-in duration-500 delay-100",
          )}
          aria-hidden="true"
        >
          <Rocket className="w-10 h-10 text-[#7C3AED]" />
        </div>

        {/* Title */}
        <h1
          id="empty-state-title"
          className={cn(
            "text-2xl md:text-3xl font-bold text-[#240046] text-center mb-3",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-150",
          )}
        >
          Estamos chegando em {cidade}!
        </h1>

        {/* Description */}
        <p
          className={cn(
            "text-[#7C3AED] text-center max-w-md mb-8",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-200",
          )}
        >
          Ainda não temos parceiros cadastrados na sua cidade, mas estamos expandindo rapidamente.
        </p>

        {/* Actions */}
        <div
          className={cn(
            "flex flex-col sm:flex-row gap-3 mb-12",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-[250ms]",
          )}
        >
          <Button
            onClick={handleMudarCidade}
            className={cn(
              "bg-[#7C3AED] hover:bg-[#6D28D9] text-white",
              "shadow-lg shadow-violet-500/25",
              !reducedMotion && "transition-all hover:scale-105 active:scale-95",
            )}
          >
            <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
            Buscar outra cidade
          </Button>

          <Button
            onClick={handleIndicarEstabelecimento}
            variant="outline"
            className={cn(
              "border-[#7C3AED] text-[#7C3AED] hover:bg-violet-50",
              !reducedMotion && "transition-all hover:scale-105 active:scale-95",
            )}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Indicar estabelecimento
          </Button>
        </div>

        {/* Suggested Cities */}
        <div
          className={cn(
            "w-full max-w-lg",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-300",
          )}
        >
          <h2 className="text-sm font-medium text-[#7C3AED] uppercase tracking-wider mb-4 text-center">
            Explore outras cidades
          </h2>

          <ul className="space-y-3" aria-label="Cidades sugeridas">
            {cidadesSugeridas.map((item, index) => (
              <li key={`${item.cidade}-${item.estado}`}>
                <button
                  onClick={() => handleCidadeClick(item)}
                  onKeyDown={(e) => handleCidadeKeyDown(e, item)}
                  aria-label={`Explorar ${item.cidade}, ${item.estado}`}
                  style={{
                    animationDelay: reducedMotion ? "0ms" : `${ANIMATION_BASE_DELAY + index * ANIMATION_STEP_DELAY}ms`,
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3",
                    "bg-violet-50 border border-violet-200 rounded-xl",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2",
                    !reducedMotion && [
                      "transition-all duration-200",
                      "hover:bg-violet-100 hover:border-[#7C3AED]/30 hover:scale-[1.02]",
                      "active:scale-[0.98]",
                      "animate-in fade-in slide-in-from-bottom-2 duration-300",
                      "[animation-fill-mode:both]",
                    ],
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#7C3AED]" aria-hidden="true" />
                    <span className="text-[#240046] font-medium">
                      {item.cidade}, {item.estado}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);

CidadeSemEstabelecimentosView.displayName = "CidadeSemEstabelecimentosView";
