import { useState, useRef, useCallback, useEffect, memo, useId } from "react";
import { Search, MapPin, X, Clock } from "lucide-react";
import { CityCombobox } from "@/components/CityCombobox";
import { cn } from "@/lib/utils";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { VoiceSearchModal } from "@/components/VoiceSearchModal";
import { parseVoiceSearch } from "@/utils/voiceSearchParser";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AirbnbSearchBarProps {
  cidade: string;
  estado: string;
  busca: string;
  onBuscaChange: (termo: string) => void;
  onCidadeSelect: (cidade: string, estado: string) => void;
  onCategoriaChange?: (categoria: string | null) => void;
  onUseLocation?: () => void;
  isLoading?: boolean;
  showRecentSearches?: boolean;
}

const RECENT_SEARCHES_KEY = "aniversariantevip_recent_searches";
const MAX_RECENT_SEARCHES = 5;

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

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const useRecentSearches = () => {
  const [searches, setSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addSearch = useCallback((term: string) => {
    if (!term.trim()) return;

    setSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  }, []);

  return { searches, addSearch, clearSearches };
};

export const AirbnbSearchBar = memo(
  ({
    cidade,
    estado,
    busca,
    onBuscaChange,
    onCidadeSelect,
    onCategoriaChange,
    onUseLocation,
    isLoading = false,
    showRecentSearches = true,
  }: AirbnbSearchBarProps) => {
    const [buscaInterna, setBuscaInterna] = useState(busca);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [showRecent, setShowRecent] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();
    const inputId = useId();
    const { searches, addSearch } = useRecentSearches();

    const debouncedBusca = useDebounce(buscaInterna, 300);

    useEffect(() => {
      if (debouncedBusca !== busca && debouncedBusca.length >= 2) {
        onBuscaChange(debouncedBusca);
      }
    }, [debouncedBusca, busca, onBuscaChange]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setShowRecent(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleVoiceResult = useCallback(
      (transcriptResult: string) => {
        setTimeout(() => setShowVoiceModal(false), 600);

        const parsed = parseVoiceSearch(transcriptResult);

        if (parsed.searchText) {
          setBuscaInterna(parsed.searchText);
          onBuscaChange(parsed.searchText);
          addSearch(parsed.searchText);
        }

        if (parsed.categoria && onCategoriaChange) {
          onCategoriaChange(parsed.categoria);
        }

        if (parsed.usarLocalizacao && onUseLocation) {
          onUseLocation();
        }
      },
      [onBuscaChange, onCategoriaChange, onUseLocation, addSearch],
    );

    const {
      isListening,
      isSupported,
      transcript,
      error: voiceError,
      startListening,
      stopListening,
      resetTranscript,
    } = useVoiceSearch(handleVoiceResult, { language: "pt-BR" });

    const handleVoiceClick = useCallback(() => {
      if (navigator.vibrate) navigator.vibrate(10);

      if (isListening) {
        stopListening();
        setShowVoiceModal(false);
      } else {
        resetTranscript();
        setShowVoiceModal(true);
        startListening();
      }
    }, [isListening, stopListening, resetTranscript, startListening]);

    const handleRetry = useCallback(() => {
      resetTranscript();
      startListening();
    }, [resetTranscript, startListening]);

    const handleBuscaSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

        if (buscaInterna.trim()) {
          onBuscaChange(buscaInterna);
          addSearch(buscaInterna);
          setShowRecent(false);
          inputRef.current?.blur();
        }
      },
      [buscaInterna, onBuscaChange, addSearch],
    );

    const handleCidadeSelect = useCallback(
      (novaCidade: string, novoEstado: string) => {
        if (navigator.vibrate) navigator.vibrate(10);
        onCidadeSelect(novaCidade, novoEstado);
        setDialogOpen(false);
      },
      [onCidadeSelect],
    );

    const handleClear = useCallback(() => {
      setBuscaInterna("");
      onBuscaChange("");
      inputRef.current?.focus();
    }, [onBuscaChange]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setBuscaInterna(e.target.value);
    }, []);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      if (showRecentSearches && searches.length > 0 && !buscaInterna) {
        setShowRecent(true);
      }
    }, [showRecentSearches, searches.length, buscaInterna]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const handleRecentClick = useCallback(
      (term: string) => {
        if (navigator.vibrate) navigator.vibrate(10);
        setBuscaInterna(term);
        onBuscaChange(term);
        setShowRecent(false);
        inputRef.current?.blur();
      },
      [onBuscaChange],
    );

    const handleCloseVoiceModal = useCallback(() => {
      setShowVoiceModal(false);
      stopListening();
    }, [stopListening]);

    const cidadeDisplay = cidade ? `${cidade}, ${estado}` : "Qualquer lugar";

    return (
      <div className="w-full max-w-3xl mx-auto p-1" ref={containerRef}>
        <div
          role="search"
          className={cn(
            "flex items-center rounded-full",
            "bg-secondary/80 backdrop-blur-sm",
            "border border-border/50",
            "shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)]",
            !reducedMotion && "transition-all duration-200",
            !reducedMotion &&
              "hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),0_8px_24px_rgba(0,0,0,0.1)]",
            isFocused &&
              "border-primary ring-[3px] ring-primary/15 shadow-[0_0_0_3px_rgba(139,92,246,0.15),0_4px_16px_rgba(139,92,246,0.1)]",
          )}
        >
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button
                aria-label={`Localização atual: ${cidadeDisplay}. Clique para alterar`}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3.5 border-r border-border/50 rounded-l-full min-w-[160px] sm:min-w-[180px]",
                  !reducedMotion && "transition-colors hover:bg-accent/50",
                )}
              >
                <MapPin
                  className={cn(
                    "w-5 h-5 shrink-0",
                    !reducedMotion && "transition-colors",
                    isFocused ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Onde</p>
                  <p className="text-sm font-medium text-foreground truncate">{cidadeDisplay}</p>
                </div>
              </button>
            </DialogTrigger>

            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Escolha uma cidade</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <CityCombobox onSelect={handleCidadeSelect} placeholder="Digite o nome da cidade..." />
              </div>
            </DialogContent>
          </Dialog>

          <form onSubmit={handleBuscaSubmit} className="flex-1 flex items-center gap-2 min-w-0">
            <Search
              className={cn(
                "w-5 h-5 ml-4 shrink-0",
                !reducedMotion && "transition-colors",
                isFocused ? "text-primary" : "text-muted-foreground",
              )}
              aria-hidden="true"
            />

            <label htmlFor={inputId} className="sr-only">
              Buscar estabelecimentos
            </label>
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              placeholder="Buscar restaurante, bar, academia..."
              value={buscaInterna}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="flex-1 bg-transparent py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none min-w-0"
            />

            {buscaInterna && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Limpar busca"
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground shrink-0",
                  !reducedMotion && "transition-all hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}

            <VoiceSearchButton isListening={isListening} isSupported={isSupported} onClick={handleVoiceClick} />

            <div className="w-px h-6 bg-border/50 shrink-0" aria-hidden="true" />

            <button
              type="submit"
              aria-label="Buscar"
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 mr-1.5 rounded-full",
                "bg-gradient-to-r from-violet-600 to-fuchsia-600",
                "shadow-lg shadow-violet-500/25",
                "disabled:opacity-70 disabled:cursor-not-allowed",
                !reducedMotion &&
                  "transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:scale-105 active:scale-95",
              )}
            >
              {isLoading ? (
                <div
                  className={cn(
                    "w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full",
                    !reducedMotion && "animate-spin",
                  )}
                />
              ) : (
                <Search className="w-[18px] h-[18px] text-white" aria-hidden="true" />
              )}
            </button>
          </form>
        </div>

        {showRecent && searches.length > 0 && (
          <div
            className={cn(
              "absolute left-0 right-0 mt-2 mx-4 sm:mx-auto max-w-3xl",
              "bg-card border border-border rounded-xl shadow-lg",
              "overflow-hidden z-50",
              !reducedMotion && "animate-in fade-in slide-in-from-top-2 duration-200",
            )}
          >
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Buscas recentes
              </p>
              {searches.map((term, index) => (
                <button
                  key={`${term}-${index}`}
                  onClick={() => handleRecentClick(term)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                    !reducedMotion && "transition-colors hover:bg-accent",
                  )}
                >
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="text-sm text-foreground truncate">{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <VoiceSearchModal
          isOpen={showVoiceModal}
          isListening={isListening}
          transcript={transcript}
          error={voiceError}
          onClose={handleCloseVoiceModal}
          onRetry={handleRetry}
        />
      </div>
    );
  },
);

AirbnbSearchBar.displayName = "AirbnbSearchBar";
