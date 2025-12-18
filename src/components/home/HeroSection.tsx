// =============================================================================
// HEROSECTION.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Nível Airbnb
// =============================================================================
// FEATURES:
// ✅ ULTRA COMPACTO no mobile - mostra conteúdo mais cedo
// ✅ SearchBar inline e minimalista
// ✅ Headline em 1 linha no mobile
// ✅ Desktop mantém proporções elegantes
// =============================================================================

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

interface HeroSectionProps {
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  onSearch?: (query: string) => void;
}

// =============================================================================
// HOOKS
// =============================================================================

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

const hapticFeedback = (pattern: number | number[] = 10) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// COMPACT SEARCH BAR (Mobile-First)
// =============================================================================

interface SearchBarProps {
  selectedCity: string;
  searchQuery: string;
  onCityClick: () => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onVoiceSearch?: () => void;
}

const SearchBar = memo(
  ({ selectedCity, searchQuery, onCityClick, onSearchChange, onSearchSubmit, onVoiceSearch }: SearchBarProps) => {
    const reducedMotion = useReducedMotion();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        hapticFeedback(10);
        onSearchSubmit();
      },
      [onSearchSubmit],
    );

    const handleClear = useCallback(() => {
      onSearchChange("");
      inputRef.current?.focus();
    }, [onSearchChange]);

    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          "w-full max-w-2xl mx-auto",
          "bg-white rounded-xl sm:rounded-2xl",
          "shadow-lg shadow-black/10",
          "overflow-hidden",
        )}
      >
        {/* Cidade - COMPACTO */}
        <button
          type="button"
          onClick={() => {
            hapticFeedback(5);
            onCityClick();
          }}
          className={cn(
            "w-full px-4 py-2.5 sm:py-3 text-left",
            "border-b border-gray-100",
            "hover:bg-gray-50 transition-colors",
            "focus-visible:outline-none focus-visible:bg-gray-50",
          )}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide leading-none">Onde</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 truncate mt-0.5">
                {selectedCity || "Escolha uma cidade"}
              </p>
            </div>
          </div>
        </button>

        {/* Busca - COMPACTO */}
        <div className="px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Search className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide leading-none">O que busca</p>
              <div className="relative mt-0.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Restaurantes, bares..."
                  className={cn(
                    "w-full text-sm sm:text-base font-medium text-gray-900",
                    "placeholder:text-gray-400 placeholder:font-normal",
                    "bg-transparent border-none outline-none",
                    "py-0",
                  )}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Voice Search - menor */}
            {onVoiceSearch && (
              <button
                type="button"
                onClick={() => {
                  hapticFeedback(10);
                  onVoiceSearch();
                }}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-full",
                  "bg-gray-100 hover:bg-gray-200",
                  "flex items-center justify-center",
                  "transition-colors",
                  "flex-shrink-0",
                )}
                aria-label="Busca por voz"
              >
                <Mic className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Submit Button - COMPACTO */}
        <div className="px-4 pb-3 sm:pb-4">
          <Button
            type="submit"
            className={cn(
              "w-full h-9 sm:h-10 rounded-lg sm:rounded-xl",
              "bg-[#240046] hover:bg-[#3C096C]",
              "text-white font-semibold text-sm",
              "transition-all duration-200",
              "shadow-md shadow-[#240046]/30",
            )}
          >
            <Search className="w-4 h-4 mr-1.5" />
            Buscar
          </Button>
        </div>
      </form>
    );
  },
);
SearchBar.displayName = "SearchBar";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const HeroSection = memo(function HeroSection({ selectedCity = "", onCityChange, onSearch }: HeroSectionProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityModalOpen, setCityModalOpen] = useState(false);

  const handleCityClick = useCallback(() => {
    setCityModalOpen(true);
    // TODO: Abrir modal/dialog de seleção de cidade
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      const params = new URLSearchParams();
      if (selectedCity) params.set("cidade", selectedCity);
      if (searchQuery) params.set("q", searchQuery);
      navigate(`/?${params.toString()}`);
    }
  }, [searchQuery, selectedCity, navigate, onSearch]);

  const handleVoiceSearch = useCallback(() => {
    console.log("Voice search triggered");
  }, []);

  return (
    <section
      id="search-section"
      className={cn(
        "relative w-full",
        "flex flex-col justify-end", // Alinha conteúdo embaixo
        "px-4 sm:px-6 lg:px-8",
        // MOBILE: ultra compacto | DESKTOP: mais espaço
        "pt-16 pb-3", // Mobile: 64px top (header) + 12px bottom
        "sm:pt-20 sm:pb-4",
        "lg:pt-24 lg:pb-6",
        "bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5B21B6]",
        "overflow-hidden",
      )}
    >
      {/* Background decorativo sutil - menor no mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Headline - ULTRA COMPACTA no mobile */}
        <div className="text-center mb-3 sm:mb-4 lg:mb-6">
          <h1
            className={cn(
              // MOBILE: 1 linha, menor | DESKTOP: maior
              "text-base sm:text-lg lg:text-2xl xl:text-3xl",
              "font-display font-bold",
              "text-white",
              "leading-tight",
            )}
          >
            <span className="hidden sm:inline">Seu aniversário merece </span>
            <span className="sm:hidden">Encontre </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
              benefícios exclusivos
            </span>
          </h1>
          {/* Subtítulo - SÓ desktop */}
          <p className={cn("text-sm lg:text-base", "text-white/70", "max-w-lg mx-auto", "mt-1", "hidden sm:block")}>
            Restaurantes, bares e muito mais com vantagens especiais
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          selectedCity={selectedCity}
          searchQuery={searchQuery}
          onCityClick={handleCityClick}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onVoiceSearch={handleVoiceSearch}
        />
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
