import { memo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CidadeSugerida {
  cidade: string;
  estado: string;
}

interface CidadeSemEstabelecimentosViewProps {
  cidade: string;
  estado: string;
  onMudarCidade: () => void;
  cidadesSugeridas?: CidadeSugerida[];
}

const DEFAULT_CIDADES_SUGERIDAS: CidadeSugerida[] = [
  { cidade: "Brasília", estado: "DF" },
  { cidade: "São Paulo", estado: "SP" },
  { cidade: "Rio de Janeiro", estado: "RJ" },
];

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

export const CidadeSemEstabelecimentosView = memo(
  ({
    cidade,
    estado,
    onMudarCidade,
    cidadesSugeridas = DEFAULT_CIDADES_SUGERIDAS,
  }: CidadeSemEstabelecimentosViewProps) => {
    const navigate = useNavigate();
    const reducedMotion = useReducedMotion();

    const handleMudarCidade = useCallback(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      onMudarCidade();
    }, [onMudarCidade]);

    const handleIndicarEstabelecimento = useCallback(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      navigate("/seja-parceiro");
    }, [navigate]);

    const handleCidadeClick = useCallback(
      (cidadeSugerida: CidadeSugerida) => {
        if (navigator.vibrate) navigator.vibrate(10);
        navigate(`/?cidade=${encodeURIComponent(cidadeSugerida.cidade)}&estado=${cidadeSugerida.estado}`);
      },
      [navigate],
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
          "min-h-[80vh] flex flex-col items-center justify-center px-4 py-12",
          !reducedMotion && "animate-in fade-in duration-500",
        )}
        role="main"
        aria-labelledby="empty-state-title"
      >
        <div className="flex items-center gap-2 text-slate-400 mb-6">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span>
            {cidade}, {estado}
          </span>
        </div>

        <div
          className={cn(
            "w-20 h-20 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center mb-6",
            !reducedMotion && "animate-in zoom-in duration-500 delay-100",
          )}
          aria-hidden="true"
        >
          <Rocket className="w-10 h-10 text-violet-400" />
        </div>

        <h1
          id="empty-state-title"
          className={cn(
            "text-2xl md:text-3xl font-bold text-white text-center mb-3",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-150",
          )}
        >
          Estamos chegando em {cidade}!
        </h1>

        <p
          className={cn(
            "text-slate-400 text-center max-w-md mb-8",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-200",
          )}
        >
          Ainda não temos parceiros cadastrados na sua cidade, mas estamos expandindo rapidamente.
        </p>

        <div
          className={cn(
            "flex flex-col sm:flex-row gap-3 mb-12",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-250",
          )}
        >
          <Button
            onClick={handleMudarCidade}
            className={cn(
              "bg-gradient-to-r from-violet-600 to-fuchsia-600",
              !reducedMotion &&
                "transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:scale-105 active:scale-95",
            )}
          >
            <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
            Buscar outra cidade
          </Button>

          <Button
            onClick={handleIndicarEstabelecimento}
            variant="outline"
            className={cn(
              "border-violet-500/50 text-violet-400",
              !reducedMotion && "transition-all hover:bg-violet-500/10 hover:scale-105 active:scale-95",
            )}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Indicar estabelecimento
          </Button>
        </div>

        <div
          className={cn(
            "w-full max-w-lg",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-300",
          )}
        >
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 text-center">
            Explore outras cidades
          </h2>

          <div className="space-y-3" role="list" aria-label="Cidades sugeridas">
            {cidadesSugeridas.map((item, index) => (
              <button
                key={`${item.cidade}-${item.estado}`}
                onClick={() => handleCidadeClick(item)}
                onKeyDown={(e) => handleCidadeKeyDown(e, item)}
                role="listitem"
                aria-label={`Explorar ${item.cidade}, ${item.estado}`}
                style={{ animationDelay: reducedMotion ? "0ms" : `${350 + index * 50}ms` }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3",
                  "bg-white/5 border border-white/10 rounded-xl",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  !reducedMotion &&
                    "transition-all hover:bg-white/10 hover:border-violet-500/30 hover:scale-[1.02] active:scale-[0.98]",
                  !reducedMotion && "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both",
                )}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-violet-400" aria-hidden="true" />
                  <span className="text-white font-medium">
                    {item.cidade}, {item.estado}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

CidadeSemEstabelecimentosView.displayName = "CidadeSemEstabelecimentosView";
