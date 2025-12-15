import { memo, useState, useCallback, useEffect } from "react";
import { MapPin, Navigation, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CityCombobox } from "@/components/CityCombobox";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS
// =============================================================================

const HAPTIC_LIGHT = 10;
const HAPTIC_MEDIUM: number[] = [10, 50, 10];
const GEOLOCATION_TIMEOUT = 10000;
const GEOLOCATION_MAX_AGE = 300000;
const ANIMATION_BASE_DELAY = 400;
const ANIMATION_STEP_DELAY = 50;
const NOMINATIM_USER_AGENT = "AniversarianteVIP/1.0";

const DEFAULT_CIDADES_POPULARES: CidadePopular[] = [
  { cidade: "Brasília", estado: "DF" },
  { cidade: "São Paulo", estado: "SP" },
  { cidade: "Rio de Janeiro", estado: "RJ" },
  { cidade: "Belo Horizonte", estado: "MG" },
  { cidade: "Curitiba", estado: "PR" },
  { cidade: "Florianópolis", estado: "SC" },
];

const ESTADOS_BR: Record<string, string> = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

// =============================================================================
// TYPES
// =============================================================================

interface SemCidadeViewProps {
  onCidadeSelect: (cidade: string, estado: string) => void;
  cidadesPopulares?: CidadePopular[];
}

interface CidadePopular {
  cidade: string;
  estado: string;
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

const haptic = (pattern: number | number[] = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const normalizeEstado = (estado: string): string => {
  if (estado.length === 2) return estado.toUpperCase();
  return ESTADOS_BR[estado] || estado;
};

// =============================================================================
// COMPONENT
// =============================================================================

export const SemCidadeView = memo(
  ({ onCidadeSelect, cidadesPopulares = DEFAULT_CIDADES_POPULARES }: SemCidadeViewProps) => {
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const reducedMotion = useReducedMotion();

    const handleUsarLocalizacao = useCallback(async () => {
      haptic();
      setIsDetecting(true);
      setError(null);

      try {
        if (!navigator.geolocation) {
          throw new Error("Geolocalização não suportada neste navegador");
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: GEOLOCATION_TIMEOUT,
            maximumAge: GEOLOCATION_MAX_AGE,
          });
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&addressdetails=1`,
          {
            headers: { "User-Agent": NOMINATIM_USER_AGENT },
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar localização");
        }

        const data = await response.json();
        const cidade = data.address?.city || data.address?.town || data.address?.village;
        const estado = data.address?.state;

        if (cidade && estado) {
          const estadoNormalizado = normalizeEstado(estado);
          haptic(HAPTIC_MEDIUM);
          onCidadeSelect(cidade, estadoNormalizado);
        } else {
          throw new Error("Não foi possível identificar sua cidade");
        }
      } catch (err) {
        console.error("[SemCidadeView] Erro ao obter localização:", err);

        if (err instanceof GeolocationPositionError) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError("Permissão de localização negada. Por favor, permita o acesso nas configurações do navegador.");
              break;
            case err.POSITION_UNAVAILABLE:
              setError("Localização indisponível. Tente novamente ou selecione uma cidade manualmente.");
              break;
            case err.TIMEOUT:
              setError("Tempo esgotado ao buscar localização. Tente novamente.");
              break;
            default:
              setError("Erro ao obter localização. Tente selecionar uma cidade manualmente.");
          }
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erro ao obter localização. Tente selecionar uma cidade manualmente.");
        }
      } finally {
        setIsDetecting(false);
      }
    }, [onCidadeSelect]);

    const handleCidadeSelect = useCallback(
      (cidade: string | null, estado: string | null) => {
        if (cidade && estado) {
          haptic();
          onCidadeSelect(cidade, estado);
        }
      },
      [onCidadeSelect],
    );

    const handleCidadePopularClick = useCallback(
      (item: CidadePopular) => {
        haptic();
        onCidadeSelect(item.cidade, item.estado);
      },
      [onCidadeSelect],
    );

    return (
      <div
        className={cn(
          "min-h-[80vh] flex flex-col items-center justify-center px-4 py-12",
          !reducedMotion && "animate-in fade-in duration-500",
        )}
        role="main"
        aria-labelledby="sem-cidade-title"
      >
        {/* Icon */}
        <div className={cn("relative mb-8", !reducedMotion && "animate-in zoom-in duration-500 delay-100")}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center">
            <span className="text-5xl" aria-hidden="true">
              🎂
            </span>
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className={cn("w-6 h-6 text-yellow-400", !reducedMotion && "animate-pulse")} aria-hidden="true" />
          </div>
        </div>

        {/* Title */}
        <h1
          id="sem-cidade-title"
          className={cn(
            "text-2xl md:text-3xl font-bold text-white text-center mb-3",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-150",
          )}
        >
          Onde você quer comemorar?
        </h1>

        {/* Subtitle */}
        <p
          className={cn(
            "text-slate-400 text-center max-w-md mb-8",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-200",
          )}
        >
          Descubra estabelecimentos com benefícios exclusivos para aniversariantes na sua cidade
        </p>

        {/* City Combobox */}
        <div
          className={cn(
            "w-full max-w-md mb-6",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-[250ms]",
          )}
        >
          <CityCombobox onSelect={handleCidadeSelect} placeholder="Digite o nome da sua cidade..." className="w-full" />
        </div>

        {/* Geolocation Button */}
        <div
          className={cn(
            "flex flex-col items-center gap-3 mb-12",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-300",
          )}
        >
          <Button
            onClick={handleUsarLocalizacao}
            disabled={isDetecting}
            variant="outline"
            aria-label={isDetecting ? "Detectando localização..." : "Usar minha localização atual"}
            className={cn(
              "border-violet-500/50 text-violet-400 min-h-[44px]",
              !reducedMotion && "transition-all hover:bg-violet-500/10 hover:scale-105 active:scale-95",
            )}
          >
            {isDetecting ? (
              <>
                <Loader2 className={cn("w-4 h-4 mr-2", !reducedMotion && "animate-spin")} aria-hidden="true" />
                Detectando...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" aria-hidden="true" />
                Usar minha localização
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className={cn(
                "flex items-start gap-2 p-3 max-w-md text-sm",
                "text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg",
                !reducedMotion && "animate-in fade-in slide-in-from-top-2 duration-200",
              )}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Popular Cities */}
        <div
          className={cn(
            "w-full max-w-2xl",
            !reducedMotion && "animate-in slide-in-from-bottom-4 duration-500 delay-[350ms]",
          )}
        >
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 text-center">
            Cidades populares
          </h2>

          <ul className="flex flex-wrap justify-center gap-3" aria-label="Cidades populares">
            {cidadesPopulares.map((item, index) => (
              <li key={`${item.cidade}-${item.estado}`}>
                <button
                  onClick={() => handleCidadePopularClick(item)}
                  aria-label={`Selecionar ${item.cidade}, ${item.estado}`}
                  style={{
                    animationDelay: reducedMotion ? "0ms" : `${ANIMATION_BASE_DELAY + index * ANIMATION_STEP_DELAY}ms`,
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 min-h-[44px]",
                    "bg-white/5 border border-white/10 rounded-xl",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    !reducedMotion && [
                      "transition-all",
                      "hover:bg-white/10 hover:border-violet-500/30 hover:scale-105",
                      "active:scale-95",
                      "animate-in fade-in slide-in-from-bottom-2 duration-300",
                      "[animation-fill-mode:both]",
                    ],
                  )}
                >
                  <MapPin className="w-4 h-4 text-violet-400" aria-hidden="true" />
                  <span className="text-white font-medium">{item.cidade}</span>
                  <span className="text-xs text-slate-500">{item.estado}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);

SemCidadeView.displayName = "SemCidadeView";
