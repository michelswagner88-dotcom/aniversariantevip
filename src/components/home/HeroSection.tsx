import { useState, useEffect, useRef, useCallback, useMemo, memo, useId } from "react";
import { Search, MapPin, Mic, MicOff, Gift, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCidadesAutocomplete } from "@/hooks/useCidadesAutocomplete";
import { cn } from "@/lib/utils";

// =============================================================================
// WEB SPEECH API TYPES
// =============================================================================

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PLACEHOLDERS = [
  "Digite o nome de um restaurante...",
  "Busque por um bar ou pub...",
  "Encontre sua academia...",
  "Procure um salão de beleza...",
  "Busque uma loja...",
  "Digite o nome do estabelecimento...",
];

const PLACEHOLDER_INTERVAL_MS = 3500;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_CHARS = 2;
const SEARCH_LIMIT = 8;
const SEARCH_LIMIT_BRASIL = 5;
const HAPTIC_LIGHT = 10;
const HAPTIC_MEDIUM: number[] = [10, 30, 10];

// =============================================================================
// TYPES
// =============================================================================

interface HeroSectionProps {
  cidade?: string;
  estado?: string;
  onCidadeSelect: (cidade: string, estado: string) => void;
  onBuscaChange: (termo: string) => void;
  onBuscar: () => void;
}

interface EstabelecimentoSugestao {
  id: string;
  nome_fantasia: string;
  categoria: string[] | string;
  cidade: string;
  estado: string;
  slug: string;
  foraDaCidade?: boolean;
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

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const useClickOutside = (ref: React.RefObject<HTMLElement | null>, callback: () => void) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
};

const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setTranscript("");
  }, []);

  return { isListening, isSupported, transcript, toggle, reset };
};

const useEstabelecimentosSearch = (cidade?: string, estado?: string) => {
  const [results, setResults] = useState<EstabelecimentoSugestao[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (termo: string) => {
      if (!termo || termo.length < SEARCH_MIN_CHARS) {
        setResults([]);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        let query = supabase
          .from("estabelecimentos")
          .select("id, nome_fantasia, categoria, cidade, estado, slug")
          .eq("ativo", true)
          .ilike("nome_fantasia", `%${termo}%`)
          .limit(SEARCH_LIMIT);

        if (cidade && estado) {
          query = query.ilike("cidade", cidade).ilike("estado", estado);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          console.error("[HeroSection] Erro ao buscar:", supabaseError);
          setError("Erro ao buscar estabelecimentos");
          setResults([]);
          return;
        }

        if (data && data.length > 0) {
          setResults(data);
        } else if (cidade && estado) {
          const { data: dataBrasil } = await supabase
            .from("estabelecimentos")
            .select("id, nome_fantasia, categoria, cidade, estado, slug")
            .eq("ativo", true)
            .ilike("nome_fantasia", `%${termo}%`)
            .limit(SEARCH_LIMIT_BRASIL);

          if (dataBrasil && dataBrasil.length > 0) {
            setResults(dataBrasil.map((e) => ({ ...e, foraDaCidade: true })));
          } else {
            setResults([]);
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("[HeroSection] Erro:", err);
        setError("Erro ao buscar estabelecimentos");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [cidade, estado],
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isSearching, error, search, clear };
};

// =============================================================================
// UTILS
// =============================================================================

const haptic = (pattern: number | number[] = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export const HeroSection = memo(({ cidade, estado, onCidadeSelect, onBuscaChange, onBuscar }: HeroSectionProps) => {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const heroTitleId = useId();
  const buscaInputId = useId();
  const cidadeInputId = useId();

  // State
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [busca, setBusca] = useState("");
  const [showEstabelecimentoDropdown, setShowEstabelecimentoDropdown] = useState(false);
  const [editandoCidade, setEditandoCidade] = useState(false);
  const [cidadeInput, setCidadeInput] = useState("");
  const [showCidadeDropdown, setShowCidadeDropdown] = useState(false);

  // Refs
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const cidadeContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cidadeInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const debouncedBusca = useDebounce(busca, SEARCH_DEBOUNCE_MS);
  const { cidades: cidadesSugestoes, isLoading: isLoadingCidades } = useCidadesAutocomplete(cidadeInput);
  const {
    results: buscaEstabelecimentos,
    isSearching,
    search: buscarEstabelecimentos,
    clear: clearBusca,
  } = useEstabelecimentosSearch(cidade, estado);
  const {
    isListening,
    isSupported: micSupported,
    transcript,
    toggle: toggleMic,
    reset: resetMic,
  } = useSpeechRecognition();

  // Sync speech transcript to busca
  useEffect(() => {
    if (transcript) {
      setBusca(transcript);
    }
  }, [transcript]);

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, PLACEHOLDER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Search on debounced busca change
  useEffect(() => {
    if (debouncedBusca.length >= SEARCH_MIN_CHARS) {
      buscarEstabelecimentos(debouncedBusca);
      setShowEstabelecimentoDropdown(true);
    } else {
      setShowEstabelecimentoDropdown(false);
      clearBusca();
    }
  }, [debouncedBusca, buscarEstabelecimentos, clearBusca]);

  // Click outside handlers
  const closeEstabelecimentoDropdown = useCallback(() => {
    setShowEstabelecimentoDropdown(false);
  }, []);

  const closeCidadeDropdown = useCallback(() => {
    setShowCidadeDropdown(false);
    setEditandoCidade(false);
  }, []);

  useClickOutside(searchContainerRef, closeEstabelecimentoDropdown);
  useClickOutside(cidadeContainerRef, closeCidadeDropdown);

  // Handlers
  const handleBuscaSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      haptic(HAPTIC_MEDIUM);

      if (buscaEstabelecimentos.length === 1) {
        navigate(`/estabelecimento/${buscaEstabelecimentos[0].slug}`);
        return;
      }

      onBuscaChange(busca);
      onBuscar();
      setShowEstabelecimentoDropdown(false);
    },
    [busca, buscaEstabelecimentos, navigate, onBuscaChange, onBuscar],
  );

  const handleEstabelecimentoClick = useCallback(
    (estabelecimento: EstabelecimentoSugestao) => {
      haptic();
      navigate(`/estabelecimento/${estabelecimento.slug}`);
      setShowEstabelecimentoDropdown(false);
      setBusca("");
      resetMic();
    },
    [navigate, resetMic],
  );

  const handleCidadeClick = useCallback(() => {
    haptic();
    setEditandoCidade(true);
    setCidadeInput("");
    setShowCidadeDropdown(true);
    requestAnimationFrame(() => {
      cidadeInputRef.current?.focus();
    });
  }, []);

  const handleCidadeSelect = useCallback(
    (novaCidade: string, novoEstado: string) => {
      haptic();
      onCidadeSelect(novaCidade, novoEstado);
      setEditandoCidade(false);
      setShowCidadeDropdown(false);
      setCidadeInput("");
    },
    [onCidadeSelect],
  );

  const handleCloseCidadeEdit = useCallback(() => {
    setEditandoCidade(false);
    setShowCidadeDropdown(false);
  }, []);

  const handleMicClick = useCallback(() => {
    haptic();
    toggleMic();
  }, [toggleMic]);

  const handleBadgeClick = useCallback(() => {
    haptic();
    navigate("/cadastro");
  }, [navigate]);

  const handleSearchBrasil = useCallback(() => {
    onCidadeSelect("", "");
    buscarEstabelecimentos(busca);
  }, [onCidadeSelect, buscarEstabelecimentos, busca]);

  // Derived values
  const cidadeDisplay = useMemo(() => {
    return cidade && estado ? `${cidade}, ${estado}` : "Selecionar";
  }, [cidade, estado]);

  return (
    <section
      className={cn(
        "relative min-h-[420px] sm:min-h-[450px] md:min-h-[500px]",
        "flex items-center justify-center overflow-hidden",
        "pt-24 sm:pt-28 pb-8 sm:pb-12 px-3 sm:px-4",
        "bg-gradient-to-br from-[#240046] to-[#3C096C]",
      )}
      aria-labelledby={heroTitleId}
    >
      <div className="relative z-10 container mx-auto px-2 sm:px-4 text-center">
        {/* Badge */}
        <button
          onClick={handleBadgeClick}
          aria-label="Fazer cadastro gratuito"
          className={cn(
            "inline-flex items-center gap-2",
            "bg-[#3C096C]/50 border border-white/40 rounded-full",
            "px-4 sm:px-5 py-2.5 mb-5 sm:mb-6 min-h-[44px]",
            "shadow-lg shadow-black/20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#240046]",
            !reducedMotion && [
              "transition-all",
              "hover:bg-[#5B21B6] hover:border-white/60 hover:scale-105",
              "active:scale-95",
              "animate-in fade-in slide-in-from-bottom-4 duration-500",
            ],
          )}
        >
          <Gift className="w-4 h-4 text-white" aria-hidden="true" />
          <span className="text-xs sm:text-sm text-white font-semibold whitespace-nowrap">
            Cadastro gratuito para aniversariantes
          </span>
        </button>

        {/* Title */}
        <h1
          id={heroTitleId}
          className={cn(
            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight",
            !reducedMotion && "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100",
          )}
        >
          Seu aniversário merece
          <br />
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            benefícios exclusivos
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={cn(
            "text-sm sm:text-base text-white/80 mb-6 sm:mb-8 max-w-xl mx-auto px-4",
            !reducedMotion && "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200",
          )}
        >
          Descubra restaurantes, bares, lojas e muito mais para você aproveitar
        </p>

        {/* Search Form */}
        <div
          className={cn(
            "max-w-3xl mx-auto",
            !reducedMotion && "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300",
          )}
        >
          <form
            onSubmit={handleBuscaSubmit}
            className={cn(
              "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0",
              "bg-white rounded-2xl sm:rounded-full p-2",
              "shadow-2xl shadow-black/20",
            )}
            role="search"
          >
            {/* City Selector */}
            <div ref={cidadeContainerRef} className="relative">
              {editandoCidade ? (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3",
                    "sm:border-r border-[#240046]/10",
                    "min-w-[140px] sm:min-w-[180px] min-h-[44px]",
                  )}
                >
                  <MapPin className="w-5 h-5 text-[#240046] flex-shrink-0" aria-hidden="true" />
                  <label htmlFor={cidadeInputId} className="sr-only">
                    Digite o nome da cidade
                  </label>
                  <input
                    id={cidadeInputId}
                    ref={cidadeInputRef}
                    type="text"
                    value={cidadeInput}
                    onChange={(e) => {
                      setCidadeInput(e.target.value);
                      setShowCidadeDropdown(true);
                    }}
                    placeholder="Digite a cidade..."
                    autoComplete="off"
                    className="flex-1 bg-transparent text-[#240046] placeholder-[#240046]/60 outline-none text-sm min-w-0"
                  />
                  <button
                    type="button"
                    onClick={handleCloseCidadeEdit}
                    aria-label="Fechar seleção de cidade"
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full",
                      !reducedMotion && "transition-colors hover:bg-[#240046]/10",
                    )}
                  >
                    <X className="w-4 h-4 text-[#240046]/60" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCidadeClick}
                  aria-label={`Cidade selecionada: ${cidadeDisplay}. Clique para alterar`}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3",
                    "sm:border-r border-[#240046]/10",
                    "rounded-xl sm:rounded-l-full",
                    "min-w-[140px] sm:min-w-[180px] min-h-[44px] text-left",
                    !reducedMotion && "transition-colors hover:bg-[#240046]/5",
                  )}
                >
                  <MapPin className="w-5 h-5 text-[#240046] flex-shrink-0" aria-hidden="true" />
                  <div className="text-left">
                    <p className="text-xs text-[#240046]/70 uppercase tracking-wide font-medium">Onde</p>
                    <p className="text-[#240046] font-semibold text-sm sm:text-base truncate max-w-[100px] sm:max-w-[140px]">
                      {cidadeDisplay}
                    </p>
                  </div>
                </button>
              )}

              {/* City Dropdown */}
              {showCidadeDropdown && editandoCidade && (
                <div
                  className={cn(
                    "absolute top-full left-0 right-0 mt-2 z-50",
                    "bg-white rounded-xl shadow-xl border border-[#240046]/10 overflow-hidden",
                    "min-w-[200px] max-w-[calc(100vw-2rem)]",
                    !reducedMotion && "animate-in fade-in slide-in-from-top-2 duration-200",
                  )}
                >
                  {isLoadingCidades ? (
                    <div className="p-4 text-center text-[#240046]/60">
                      <Loader2 className={cn("w-5 h-5 mx-auto", !reducedMotion && "animate-spin")} aria-hidden="true" />
                      <span className="sr-only">Carregando cidades...</span>
                    </div>
                  ) : cidadesSugestoes.length > 0 ? (
                    <ul className="max-h-[200px] overflow-y-auto" role="listbox" aria-label="Cidades disponíveis">
                      {cidadesSugestoes.map((c, i) => (
                        <li key={`${c.cidade}-${c.estado}-${i}`}>
                          <button
                            type="button"
                            onClick={() => handleCidadeSelect(c.cidade, c.estado)}
                            role="option"
                            className={cn(
                              "w-full px-4 py-3 text-left",
                              "flex items-center justify-between gap-2",
                              "border-b border-[#240046]/5 last:border-0 min-h-[44px]",
                              !reducedMotion && "transition-colors hover:bg-[#240046]/5",
                            )}
                          >
                            <span className="text-[#240046] font-medium text-sm">
                              {c.cidade}, {c.estado}
                            </span>
                            <span className="text-[#240046]/50 text-xs">
                              {c.total} {c.total === 1 ? "lugar" : "lugares"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : cidadeInput.length >= 2 ? (
                    <div className="p-4 text-center text-[#240046]/60 text-sm">Nenhuma cidade encontrada</div>
                  ) : (
                    <div className="p-4 text-center text-[#240046]/60 text-sm">Digite para buscar cidades</div>
                  )}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div
              ref={searchContainerRef}
              className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 relative min-h-[44px]"
            >
              <Search className="w-5 h-5 text-[#240046] flex-shrink-0" aria-hidden="true" />
              <label htmlFor={buscaInputId} className="sr-only">
                Buscar estabelecimento por nome
              </label>
              <input
                id={buscaInputId}
                ref={searchInputRef}
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onFocus={() => {
                  if (busca.length >= SEARCH_MIN_CHARS) {
                    setShowEstabelecimentoDropdown(true);
                  }
                }}
                placeholder={PLACEHOLDERS[currentPlaceholder]}
                autoComplete="off"
                className="flex-1 bg-transparent text-[#240046] placeholder-[#240046]/60 outline-none text-sm sm:text-base min-w-0"
              />

              {/* Voice Search */}
              {micSupported && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  aria-label={isListening ? "Parar gravação de voz" : "Iniciar busca por voz"}
                  aria-pressed={isListening}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full",
                    !reducedMotion && "transition-colors",
                    isListening
                      ? cn("bg-red-100 text-red-600", !reducedMotion && "animate-pulse")
                      : "hover:bg-[#240046]/10 text-[#240046]",
                  )}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Mic className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              )}

              {/* Establishments Dropdown */}
              {showEstabelecimentoDropdown && (busca.length >= SEARCH_MIN_CHARS || isSearching) && (
                <div
                  className={cn(
                    "absolute top-full left-0 right-0 mt-2 z-50",
                    "bg-white rounded-xl shadow-xl border border-[#240046]/10 overflow-hidden",
                    "max-w-[calc(100vw-2rem)]",
                    !reducedMotion && "animate-in fade-in slide-in-from-top-2 duration-200",
                  )}
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-[#240046]/60">
                      <Loader2
                        className={cn("w-5 h-5 mx-auto mb-2", !reducedMotion && "animate-spin")}
                        aria-hidden="true"
                      />
                      <span className="text-sm">Buscando...</span>
                    </div>
                  ) : buscaEstabelecimentos.length > 0 ? (
                    <ul
                      className="max-h-[280px] overflow-y-auto"
                      role="listbox"
                      aria-label="Estabelecimentos encontrados"
                    >
                      {buscaEstabelecimentos.map((est) => (
                        <li key={est.id}>
                          <button
                            type="button"
                            onClick={() => handleEstabelecimentoClick(est)}
                            role="option"
                            className={cn(
                              "w-full px-4 py-3 text-left",
                              "border-b border-[#240046]/5 last:border-0 min-h-[44px]",
                              !reducedMotion && "transition-colors hover:bg-[#240046]/5",
                            )}
                          >
                            <p className="text-[#240046] font-semibold text-sm">{est.nome_fantasia}</p>
                            <p className="text-[#240046]/60 text-xs">
                              {Array.isArray(est.categoria) ? est.categoria[0] : est.categoria} • {est.cidade},{" "}
                              {est.estado}
                              {est.foraDaCidade && <span className="ml-2 text-amber-600">(outra cidade)</span>}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-[#240046]/60 text-sm mb-2">
                        Nenhum "{busca}" encontrado{cidade ? ` em ${cidade}` : ""}
                      </p>
                      {cidade && (
                        <button
                          type="button"
                          onClick={handleSearchBrasil}
                          className={cn(
                            "text-[#240046] text-sm font-medium min-h-[44px] px-4",
                            !reducedMotion && "hover:underline",
                          )}
                        >
                          Buscar em todo Brasil
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              aria-label="Buscar estabelecimentos"
              className={cn(
                "bg-gradient-to-r from-[#240046] to-[#3C096C]",
                "text-white font-semibold px-5 sm:px-8 py-3",
                "rounded-xl sm:rounded-full",
                "shadow-lg shadow-[#240046]/30",
                "flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
                !reducedMotion && [
                  "transition-all duration-300",
                  "hover:shadow-xl hover:shadow-[#240046]/40 hover:scale-105",
                  "active:scale-95",
                ],
              )}
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              <span>Buscar</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
