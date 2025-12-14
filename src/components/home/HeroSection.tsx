import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Search, MapPin, Mic, MicOff, Gift, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCidadesAutocomplete } from "@/hooks/useCidadesAutocomplete";
import { cn } from "@/lib/utils";

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

interface SpeechRecognitionEvent {
  results: { [key: number]: { [key: number]: { transcript: string } } };
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  abort: () => void;
}

const PLACEHOLDERS = [
  "Digite o nome de um restaurante...",
  "Busque por um bar ou pub...",
  "Encontre sua academia...",
  "Procure um salão de beleza...",
  "Busque uma loja...",
  "Digite o nome do estabelecimento...",
];

const PLACEHOLDER_INTERVAL = 3500;
const SEARCH_DEBOUNCE = 300;

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

const useClickOutside = (refs: React.RefObject<HTMLElement>[], callback: () => void) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isOutside = refs.every((ref) => ref.current && !ref.current.contains(target));
      if (isOutside) callback();
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [refs, callback]);
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition() as SpeechRecognitionInstance;
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [onResult]);

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  return { isListening, isSupported, toggle };
};

const useEstabelecimentosSearch = (cidade?: string, estado?: string) => {
  const [results, setResults] = useState<EstabelecimentoSugestao[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(
    async (termo: string) => {
      if (!termo || termo.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      try {
        let query = supabase
          .from("estabelecimentos")
          .select("id, nome_fantasia, categoria, cidade, estado, slug")
          .eq("ativo", true)
          .ilike("nome_fantasia", `%${termo}%`)
          .limit(8);

        if (cidade && estado) {
          query = query.ilike("cidade", cidade).ilike("estado", estado);
        }

        const { data, error } = await query;

        if (error) {
          console.error("[HeroSection] Erro ao buscar:", error);
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
            .limit(5);

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
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [cidade, estado],
  );

  return { results, isSearching, search };
};

export const HeroSection = memo(({ cidade, estado, onCidadeSelect, onBuscaChange, onBuscar }: HeroSectionProps) => {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [busca, setBusca] = useState("");
  const [showEstabelecimentoDropdown, setShowEstabelecimentoDropdown] = useState(false);
  const [editandoCidade, setEditandoCidade] = useState(false);
  const [cidadeInput, setCidadeInput] = useState("");
  const [showCidadeDropdown, setShowCidadeDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const cidadeContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cidadeInputRef = useRef<HTMLInputElement>(null);

  const debouncedBusca = useDebounce(busca, SEARCH_DEBOUNCE);
  const { cidades: cidadesSugestoes, isLoading: isLoadingCidades } = useCidadesAutocomplete(cidadeInput);
  const {
    results: buscaEstabelecimentos,
    isSearching,
    search: buscarEstabelecimentos,
  } = useEstabelecimentosSearch(cidade, estado);

  const handleSpeechResult = useCallback((transcript: string) => {
    setBusca(transcript);
  }, []);

  const { isListening, isSupported: micSupported, toggle: toggleMic } = useSpeechRecognition(handleSpeechResult);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, PLACEHOLDER_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (debouncedBusca.length >= 2) {
      buscarEstabelecimentos(debouncedBusca);
      setShowEstabelecimentoDropdown(true);
    } else {
      setShowEstabelecimentoDropdown(false);
    }
  }, [debouncedBusca, buscarEstabelecimentos]);

  const closeEstabelecimentoDropdown = useCallback(() => {
    setShowEstabelecimentoDropdown(false);
  }, []);

  const closeCidadeDropdown = useCallback(() => {
    setShowCidadeDropdown(false);
    setEditandoCidade(false);
  }, []);

  useClickOutside([searchContainerRef], closeEstabelecimentoDropdown);
  useClickOutside([cidadeContainerRef], closeCidadeDropdown);

  const handleBuscaSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

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
      if (navigator.vibrate) navigator.vibrate(10);
      navigate(`/estabelecimento/${estabelecimento.slug}`);
      setShowEstabelecimentoDropdown(false);
      setBusca("");
    },
    [navigate],
  );

  const handleCidadeClick = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    setEditandoCidade(true);
    setCidadeInput("");
    setShowCidadeDropdown(true);
    setTimeout(() => cidadeInputRef.current?.focus(), 50);
  }, []);

  const handleCidadeSelect = useCallback(
    (novaCidade: string, novoEstado: string) => {
      if (navigator.vibrate) navigator.vibrate(10);
      onCidadeSelect(novaCidade, novoEstado);
      setEditandoCidade(false);
      setShowCidadeDropdown(false);
      setCidadeInput("");
    },
    [onCidadeSelect],
  );

  const handleCidadeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCidadeInput(e.target.value);
    setShowCidadeDropdown(true);
  }, []);

  const handleCloseCidadeEdit = useCallback(() => {
    setEditandoCidade(false);
    setShowCidadeDropdown(false);
  }, []);

  const handleMicClick = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    toggleMic();
  }, [toggleMic]);

  const handleBadgeClick = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    navigate("/cadastro");
  }, [navigate]);

  const handleBuscaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
  }, []);

  const handleBuscaFocus = useCallback(() => {
    if (busca.length >= 2) setShowEstabelecimentoDropdown(true);
  }, [busca]);

  const handleSearchBrasil = useCallback(() => {
    onCidadeSelect("", "");
    buscarEstabelecimentos(busca);
  }, [onCidadeSelect, buscarEstabelecimentos, busca]);

  const cidadeDisplay = useMemo(() => {
    return cidade && estado ? `${cidade}, ${estado}` : "Selecionar";
  }, [cidade, estado]);

  return (
    <section
      className="relative min-h-[420px] sm:min-h-[450px] md:min-h-[500px] flex items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-8 sm:pb-12 px-3 sm:px-4 bg-[#240046]"
      aria-labelledby="hero-title"
    >
      <div className="relative z-10 container mx-auto px-2 sm:px-4 text-center">
        <button
          onClick={handleBadgeClick}
          aria-label="Fazer cadastro gratuito"
          className={cn(
            "inline-flex items-center gap-2 bg-[#3C096C] border border-white/40 rounded-full px-4 sm:px-5 py-2.5 mb-5 sm:mb-6 min-h-[44px]",
            "shadow-lg shadow-black/20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#240046]",
            !reducedMotion && "transition-all hover:bg-[#5B21B6] hover:border-white/60 hover:scale-105 active:scale-95",
            !reducedMotion && "animate-in fade-in slide-in-from-bottom-4 duration-500",
          )}
        >
          <Gift className="w-4 h-4 text-white" aria-hidden="true" />
          <span className="text-xs sm:text-sm text-white font-semibold whitespace-nowrap">
            Cadastro gratuito para aniversariantes
          </span>
        </button>

        <h1
          id="hero-title"
          className={cn(
            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight",
            !reducedMotion && "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100",
          )}
        >
          Seu aniversário merece
          <br />
          <span className="text-gradient-animated">benefícios exclusivos</span>
        </h1>

        <p
          className={cn(
            "text-sm sm:text-base text-white/80 mb-6 sm:mb-8 max-w-xl mx-auto px-4",
            !reducedMotion && "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200",
          )}
        >
          Descubra restaurantes, bares, lojas e muito mais para você aproveitar
        </p>

        <div
          className={cn(
            "max-w-3xl mx-auto",
            !reducedMotion && "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300",
          )}
        >
          <form
            onSubmit={handleBuscaSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 bg-white rounded-2xl sm:rounded-full p-2 shadow-2xl shadow-black/20"
            role="search"
          >
            <div ref={cidadeContainerRef} className="relative">
              {editandoCidade ? (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 sm:border-r border-[#240046]/10 min-w-[140px] sm:min-w-[180px] min-h-[44px]">
                  <MapPin className="w-5 h-5 text-[#240046] flex-shrink-0" aria-hidden="true" />
                  <label htmlFor="cidade-input" className="sr-only">
                    Digite o nome da cidade
                  </label>
                  <input
                    id="cidade-input"
                    ref={cidadeInputRef}
                    type="text"
                    value={cidadeInput}
                    onChange={handleCidadeInputChange}
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
                    "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 sm:border-r border-[#240046]/10 rounded-xl sm:rounded-l-full min-w-[140px] sm:min-w-[180px] min-h-[44px] text-left",
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

              {showCidadeDropdown && editandoCidade && (
                <div
                  className={cn(
                    "absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#240046]/10 overflow-hidden z-50 min-w-[200px] max-w-[calc(100vw-2rem)]",
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
                        <li
                          key={`${c.cidade}-${c.estado}-${i}`}
                          onClick={() => handleCidadeSelect(c.cidade, c.estado)}
                          role="option"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleCidadeSelect(c.cidade, c.estado);
                            }
                          }}
                          className={cn(
                            "px-4 py-3 cursor-pointer flex items-center justify-between gap-2 border-b border-[#240046]/5 last:border-0 min-h-[44px]",
                            !reducedMotion && "transition-colors hover:bg-[#240046]/5",
                          )}
                        >
                          <span className="text-[#240046] font-medium text-sm">
                            {c.cidade}, {c.estado}
                          </span>
                          <span className="text-[#240046]/50 text-xs">
                            {c.total} {c.total === 1 ? "lugar" : "lugares"}
                          </span>
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

            <div
              ref={searchContainerRef}
              className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 relative min-h-[44px]"
            >
              <Search className="w-5 h-5 text-[#240046] flex-shrink-0" aria-hidden="true" />
              <label htmlFor="busca-input" className="sr-only">
                Buscar estabelecimento por nome
              </label>
              <input
                id="busca-input"
                ref={searchInputRef}
                type="text"
                value={busca}
                onChange={handleBuscaChange}
                onFocus={handleBuscaFocus}
                placeholder={PLACEHOLDERS[currentPlaceholder]}
                autoComplete="off"
                className="flex-1 bg-transparent text-[#240046] placeholder-[#240046]/60 outline-none text-sm sm:text-base min-w-0"
              />

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

              {showEstabelecimentoDropdown && (busca.length >= 2 || isSearching) && (
                <div
                  className={cn(
                    "absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#240046]/10 overflow-hidden z-50 max-w-[calc(100vw-2rem)]",
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
                        <li
                          key={est.id}
                          onClick={() => handleEstabelecimentoClick(est)}
                          role="option"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleEstabelecimentoClick(est);
                            }
                          }}
                          className={cn(
                            "px-4 py-3 cursor-pointer border-b border-[#240046]/5 last:border-0 min-h-[44px]",
                            !reducedMotion && "transition-colors hover:bg-[#240046]/5",
                          )}
                        >
                          <p className="text-[#240046] font-semibold text-sm">{est.nome_fantasia}</p>
                          <p className="text-[#240046]/60 text-xs">
                            {Array.isArray(est.categoria) ? est.categoria[0] : est.categoria} • {est.cidade},{" "}
                            {est.estado}
                            {est.foraDaCidade && <span className="ml-2 text-amber-600">(outra cidade)</span>}
                          </p>
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

            <button
              type="submit"
              aria-label="Buscar estabelecimentos"
              className={cn(
                "bg-gradient-to-r from-[#240046] to-[#3C096C] text-white font-semibold px-5 sm:px-8 py-3 rounded-xl sm:rounded-full",
                "shadow-lg shadow-[#240046]/30",
                "flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
                !reducedMotion &&
                  "transition-all duration-300 hover:shadow-xl hover:shadow-[#240046]/40 hover:scale-105 active:scale-95",
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
