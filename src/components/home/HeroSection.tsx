// =============================================================================
// HEROSECTION.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Nível Airbnb
// =============================================================================
// FEATURES:
// ✅ Altura máxima 50vh (não domina a tela inteira)
// ✅ Busca compacta estilo Airbnb (pill única)
// ✅ Sem bordas grossas - sombras suaves
// ✅ Tipografia com respiro
// ✅ Mobile-first responsivo
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
// SEARCH BAR COMPONENT (Airbnb Style)
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
            "w-full px-5 py-4 text-left",
            "border-b border-gray-100",
            "hover:bg-gray-50 transition-colors",
            "focus-visible:outline-none focus-visible:bg-gray-50",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Onde</p>
              <p className="text-base font-semibold text-gray-900 truncate">{selectedCity || "Escolha uma cidade"}</p>
            </div>
          </div>
        </button>

        {/* Busca */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">O que busca</p>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Restaurantes, bares, academias..."
                  className={cn(
                    "w-full text-base font-medium text-gray-900",
                    "placeholder:text-gray-400 placeholder:font-normal",
                    "bg-transparent border-none outline-none",
                    "py-1",
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
                  "w-10 h-10 rounded-full",
                  "bg-gray-100 hover:bg-gray-200",
                  "flex items-center justify-center",
                  "transition-colors",
                  "flex-shrink-0",
                )}
                aria-label="Busca por voz"
              >
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-5 pb-5">
          <Button
            type="submit"
            className={cn(
              "w-full h-12 rounded-xl",
              "bg-[#240046] hover:bg-[#3C096C]",
              "text-white font-semibold",
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
        "min-h-[35vh] max-h-[45vh]",
        "flex flex-col justify-center",
        "px-4 sm:px-6 lg:px-8",
        "pt-16 pb-6",
        "bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5B21B6]",
        "overflow-hidden",
      )}
    >
      {/* Background decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Headline */}
        <div className="text-center mb-6">
          <h1
            className={cn(
              "text-xl sm:text-2xl lg:text-3xl",
              "font-display font-bold",
              "text-white",
              "leading-tight",
              "mb-2",
            )}
          >
            Seu aniversário merece{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
              benefícios exclusivos
            </span>
          </h1>
          <p className={cn("text-sm sm:text-base", "text-white/70", "max-w-lg mx-auto")}>
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
