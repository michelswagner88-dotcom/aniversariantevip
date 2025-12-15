import { useState, useRef, useCallback, useEffect, memo, useId } from "react";
import { Search, MapPin, X, Clock } from "lucide-react";
import { CityCombobox } from "@/components/CityCombobox";
import { cn } from "@/lib/utils";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { VoiceSearchModal } from "@/components/VoiceSearchModal";
import { parseVoiceSearch } from "@/utils/voiceSearchParser";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// =============================================================================
// CONSTANTS
// =============================================================================

const RECENT_SEARCHES_KEY = "aniversariantevip_recent_searches";
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 300;
const VOICE_LANGUAGE = "pt-BR";

// =============================================================================
// TYPES
// =============================================================================

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
    const trimmed = term.trim();
    if (!trimmed) return;

    setSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Storage full or disabled
      }
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return { searches, addSearch, clearSearches };
};

const useHaptic = () => {
  return useCallback((pattern: number | number[] = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);
};

// =============================================================================
// COMPONENT
// =============================================================================

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
    const dropdownRef = useRef<HTMLDivElement>(null);

    const reducedMotion = useReducedMotion();
    const haptic = useHaptic();
    const inputId = useId();
    const listboxId = useId();

    const { searches, addSearch } = useRecentSearches();
    const debouncedBusca = useDebounce(buscaInterna, DEBOUNCE_DELAY);

    // Sync debounced value with parent
    useEffect(() => {
      // Dispara mesmo se vazio (para limpar busca)
      if (debouncedBusca !== busca) {
        // Só dispara busca real se >= 2 chars ou se estiver limpando
        if (debouncedBusca.length >= 2 || debouncedBusca === "") {
          onBuscaChange(debouncedBusca);
        }
      }
    }, [debouncedBusca, busca, onBuscaChange]);

    // Sync external busca prop
    useEffect(() => {
      if (busca !== buscaInterna && busca !== debouncedBusca) {
        setBuscaInterna(busca);
      }
    }, [busca]);

    // Click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
        const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);

        if (isOutsideContainer && isOutsideDropdown) {
          setShowRecent(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && showRecent) {
          setShowRecent(false);
          inputRef.current?.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [showRecent]);

    // Voice search result handler
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
    } = useVoiceSearch(handleVoiceResult, { language: VOICE_LANGUAGE });

    // Handlers
    const handleVoiceClick = useCallback(() => {
      haptic(10);

      if (isListening) {
        stopListening();
        setShowVoiceModal(false);
      } else {
        resetTranscript();
        setShowVoiceModal(true);
        startListening();
      }
    }, [isListening, stopListening, resetTranscript, startListening, haptic]);

    const handleRetry = useCallback(() => {
      resetTranscript();
      startListening();
    }, [resetTranscript, startListening]);

    const handleBuscaSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        haptic([10, 30, 10]);

        const trimmed = buscaInterna.trim();
        if (trimmed) {
          onBuscaChange(trimmed);
          addSearch(trimmed);
          setShowRecent(false);
          inputRef.current?.blur();
        }
      },
      [buscaInterna, onBuscaChange, addSearch, haptic],
    );

    const handleCidadeSelect = useCallback(
      (novaCidade: string, novoEstado: string) => {
        haptic(10);
        onCidadeSelect(novaCidade, novoEstado);
        setDialogOpen(false);
      },
      [onCidadeSelect, haptic],
    );

    const handleClear = useCallback(() => {
      setBuscaInterna("");
      onBuscaChange("");
      inputRef.current?.focus();
    }, [onBuscaChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBuscaInterna(value);

        // Show recent searches when input is empty
        if (!value && searches.length > 0) {
          setShowRecent(true);
        } else {
          setShowRecent(false);
        }
      },
      [searches.length],
    );

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      if (showRecentSearches && searches.length > 0 && !buscaInterna) {
        setShowRecent(true);
      }
    }, [showRecentSearches, searches.length, buscaInterna]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      // Delay to allow click on dropdown items
      setTimeout(() => {
        if (!dropdownRef.current?.contains(document.activeElement)) {
          // Keep dropdown logic in mousedown handler
        }
      }, 100);
    }, []);

    const handleRecentClick = useCallback(
      (term: string) => {
        haptic(10);
        setBuscaInterna(term);
        onBuscaChange(term);
        setShowRecent(false);
        inputRef.current?.blur();
      },
      [onBuscaChange, haptic],
    );

    const handleCloseVoiceModal = useCallback(() => {
      setShowVoiceModal(false);
      stopListening();
    }, [stopListening]);

    // Derived values
    const cidadeDisplay = cidade ? `${cidade}, ${estado}` : "Qualquer lugar";
    const hasRecentSearches = showRecentSearches && searches.length > 0;

    return (
      <div className="relative w-full max-w-3xl mx-auto" ref={containerRef}>
        {/* Search Bar */}
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
          {/* Location Selector */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label={`Localização atual: ${cidadeDisplay}. Clique para alterar`}
                aria-expanded={dialogOpen}
                aria-haspopup="dialog"
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3.5",
                  "border-r border-border/50 rounded-l-full",
                  "min-w-[160px] sm:min-w-[180px]",
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

          {/* Search Form */}
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
              role="combobox"
              aria-expanded={showRecent}
              aria-controls={listboxId}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              className={cn(
                "flex-1 min-w-0",
                "bg-transparent py-3.5",
                "text-[15px] text-foreground",
                "placeholder:text-muted-foreground/70",
                "focus:outline-none",
              )}
            />

            {/* Clear Button */}
            {buscaInterna && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Limpar busca"
                className={cn(
                  "flex items-center justify-center",
                  "w-7 h-7 rounded-full shrink-0",
                  "bg-muted text-muted-foreground",
                  !reducedMotion && "transition-all hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}

            {/* Voice Search */}
            <VoiceSearchButton isListening={isListening} isSupported={isSupported} onClick={handleVoiceClick} />

            {/* Divider */}
            <div className="w-px h-6 bg-border/50 shrink-0" aria-hidden="true" />

            {/* Submit Button */}
            <button
              type="submit"
              aria-label="Buscar"
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center",
                "w-10 h-10 sm:w-11 sm:h-11 mr-1.5 rounded-full",
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
                    "w-[18px] h-[18px]",
                    "border-2 border-white/30 border-t-white rounded-full",
                    !reducedMotion && "animate-spin",
                  )}
                  aria-hidden="true"
                />
              ) : (
                <Search className="w-[18px] h-[18px] text-white" aria-hidden="true" />
              )}
            </button>
          </form>
        </div>

        {/* Recent Searches Dropdown */}
        {showRecent && hasRecentSearches && (
          <div
            ref={dropdownRef}
            id={listboxId}
            role="listbox"
            aria-label="Buscas recentes"
            className={cn(
              "absolute left-0 right-0 mt-2 z-50",
              "bg-card border border-border rounded-xl shadow-lg",
              "overflow-hidden",
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
                  type="button"
                  role="option"
                  onClick={() => handleRecentClick(term)}
                  className={cn(
                    "w-full flex items-center gap-3",
                    "px-3 py-2.5 rounded-lg text-left",
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

        {/* Voice Search Modal */}
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
