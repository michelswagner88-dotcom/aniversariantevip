// =============================================================================
// HEROSECTION.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Nível Airbnb
// =============================================================================
// FEATURES:
// ✅ Mobile-first: hero compacto para mostrar conteúdo mais cedo
// ✅ Desktop: mantém proporções elegantes
// ✅ Busca estilo Airbnb (pill única)
// ✅ Sem bordas grossas - sombras suaves
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
// SEARCH BAR COMPONENT (Airbnb Style - Compacto)
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
          "bg-white rounded-2xl",
          "shadow-lg shadow-black/10",
          "transition-shadow duration-300",
          "hover:shadow-xl hover:shadow-black/15",
          "overflow-hidden",
        )}
      >
        {/* Cidade */}
        <button
          type="button"
          onClick={() => {
            hapticFeedback(5);
            onCityClick();
          }}
          className={cn(
            "w-full px-4 py-3 sm:px-5 sm:py-4 text-left",
            "border-b border-gray-100",
            "hover:bg-gray-50 transition-colors",
            "focus-visible:outline-none focus-visible:bg-gray-50",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide">Onde</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {selectedCity || "Escolha uma cidade"}
              </p>
            </div>
          </div>
        </button>

        {/* Busca */}
        <div className="px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide">O que busca</p>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Restaurantes, bares, academias..."
                  className={cn(
                    "w-full text-sm sm:text-base font-medium text-gray-900",
                    "placeholder:text-gray-400 placeholder:font-normal",
                    "bg-transparent border-none outline-none",
                    "py-0.5 sm:py-1",
                  )}
                />
                {/* Clear button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Voice Search */}
            {onVoiceSearch && (
              <button
                type="button"
                onClick={() => {
                  hapticFeedback(10);
                  onVoiceSearch();
                }}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full",
                  "bg-gray-100 hover:bg-gray-200",
                  "flex items-center justify-center",
                  "transition-colors",
                  "flex-shrink-0",
                )}
                aria-label="Busca por voz"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <Button
            type="submit"
            className={cn(
              "w-full h-10 sm:h-12 rounded-xl",
              "bg-[#240046] hover:bg-[#3C096C]",
              "text-white font-semibold text-sm sm:text-base",
              "transition-all duration-200",
              "shadow-md shadow-[#240046]/30",
              !reducedMotion && "active:scale-[0.98]",
            )}
          >
            <Search className="w-4 h-4 mr-2" />
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
      // Navegar para página de resultados
      const params = new URLSearchParams();
      if (selectedCity) params.set("cidade", selectedCity);
      if (searchQuery) params.set("q", searchQuery);
      navigate(`/?${params.toString()}`);
    }
  }, [searchQuery, selectedCity, navigate, onSearch]);

  const handleVoiceSearch = useCallback(() => {
    // TODO: Implementar busca por voz
    console.log("Voice search triggered");
  }, []);

  return (
    <section
      id="search-section"
      className={cn(
        "relative w-full",
        // MOBILE: mais compacto | DESKTOP: mais espaço
        "min-h-0 sm:min-h-[30vh] lg:min-h-[35vh]",
        "flex flex-col justify-center",
        "px-4 sm:px-6 lg:px-8",
        // MOBILE: padding reduzido | DESKTOP: padding normal
        "pt-20 pb-4 sm:pt-20 sm:pb-6 lg:pt-24 lg:pb-8",
        "bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5B21B6]",
        "overflow-hidden",
      )}
    >
      {/* Background decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Headline - COMPACTA no mobile */}
        <div className="text-center mb-4 sm:mb-6">
          <h1
            className={cn(
              // MOBILE: menor | DESKTOP: maior
              "text-lg sm:text-xl lg:text-3xl",
              "font-display font-bold",
              "text-white",
              "leading-tight",
              "mb-1 sm:mb-2",
            )}
          >
            Seu aniversário merece{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
              benefícios exclusivos
            </span>
          </h1>
          {/* Subtítulo - ESCONDIDO no mobile pequeno, visível no resto */}
          <p
            className={cn(
              "text-xs sm:text-sm lg:text-base",
              "text-white/70",
              "max-w-lg mx-auto",
              "hidden xs:block", // Esconde em telas muito pequenas
            )}
          >
            Descubra restaurantes, bares e muito mais com vantagens especiais
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
