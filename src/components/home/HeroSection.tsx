// =============================================================================
// HEROSECTION.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial - Nível Airbnb/Stripe
// =============================================================================

import { memo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const BRAND_GRADIENT = "bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5B21B6]";
const BRAND_PRIMARY = "#240046";

// =============================================================================
// TYPES
// =============================================================================

interface HeroSectionProps {
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  onSearch?: (query: string) => void;
}

// =============================================================================
// SEARCH CARD - Premium Design
// =============================================================================

interface SearchCardProps {
  selectedCity: string;
  searchQuery: string;
  onCityClick: () => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

const SearchCard = memo(
  ({ selectedCity, searchQuery, onCityClick, onSearchChange, onSearchSubmit }: SearchCardProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        onSearchSubmit();
      },
      [onSearchSubmit],
    );

    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          "w-full max-w-xl mx-auto",
          "bg-white",
          "rounded-2xl",
          "shadow-xl shadow-black/15",
          "overflow-hidden",
          "ring-1 ring-black/5",
        )}
      >
        {/* Campo: Cidade */}
        <button
          type="button"
          onClick={onCityClick}
          className={cn(
            "w-full px-4 sm:px-5 py-3.5 sm:py-4 text-left",
            "border-b border-gray-100",
            "hover:bg-gray-50/80 active:bg-gray-100",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:bg-gray-50",
            "group",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 sm:w-11 sm:h-11 rounded-xl",
                "bg-gradient-to-br from-violet-100 to-fuchsia-100",
                "flex items-center justify-center flex-shrink-0",
                "group-hover:from-violet-200 group-hover:to-fuchsia-200",
                "transition-colors duration-150",
              )}
            >
              <MapPin className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Onde</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 truncate mt-0.5">
                {selectedCity || "Escolha uma cidade"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>

        {/* Campo: Busca */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 sm:w-11 sm:h-11 rounded-xl",
                "bg-gradient-to-br from-violet-100 to-fuchsia-100",
                "flex items-center justify-center flex-shrink-0",
              )}
            >
              <Search className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <label
                htmlFor="search-input"
                className="text-[11px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider block"
              >
                O que busca
              </label>
              <input
                ref={inputRef}
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Restaurantes, bares, academias..."
                className={cn(
                  "w-full text-sm sm:text-base font-medium text-gray-900",
                  "placeholder:text-gray-400",
                  "bg-transparent border-none outline-none",
                  "mt-0.5",
                )}
              />
            </div>
          </div>
        </div>

        {/* Botão: Buscar */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <button
            type="submit"
            className={cn(
              "w-full",
              "h-12 sm:h-[52px]", // 48px mobile, 52px desktop - acima do mínimo 44px
              "rounded-xl",
              "bg-[#240046] hover:bg-[#3C096C]",
              "text-white font-semibold text-sm sm:text-base",
              "transition-all duration-200",
              "shadow-lg shadow-[#240046]/25",
              "hover:shadow-xl hover:shadow-[#240046]/30",
              "active:scale-[0.98]",
              "flex items-center justify-center gap-2",
            )}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            Buscar benefícios
          </button>
        </div>
      </form>
    );
  },
);
SearchCard.displayName = "SearchCard";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const HeroSection = memo(function HeroSection({ selectedCity = "", onCityChange, onSearch }: HeroSectionProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCityClick = useCallback(() => {
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

  return (
    <section
      id="search-section"
      className={cn(
        "relative w-full",
        "flex flex-col justify-end",
        "px-4 sm:px-6 lg:px-8",
        // Altura responsiva: compacto no mobile, mais espaço no desktop
        "pt-16 pb-4", // Mobile
        "sm:pt-20 sm:pb-5", // Tablet
        "lg:pt-28 lg:pb-8", // Desktop
        BRAND_GRADIENT,
        "overflow-hidden",
      )}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-1/3 -right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-1/3 -left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Headline */}
        <header className="text-center mb-4 sm:mb-5 lg:mb-8">
          <h1
            className={cn(
              "font-bold text-white leading-tight",
              // Tamanhos responsivos com boa hierarquia
              "text-lg", // Mobile: 18px
              "sm:text-xl", // Tablet: 20px
              "lg:text-3xl", // Desktop: 30px
              "xl:text-4xl", // Large: 36px
            )}
          >
            {/* Mobile: texto curto | Desktop: texto completo */}
            <span className="sm:hidden">
              Encontre <span className="text-violet-300">benefícios exclusivos</span>
            </span>
            <span className="hidden sm:inline">
              Seu aniversário merece{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
                benefícios exclusivos
              </span>
            </span>
          </h1>

          {/* Subtítulo - apenas tablet+ */}
          <p className={cn("text-white/70", "text-sm lg:text-base", "max-w-md mx-auto", "mt-2", "hidden sm:block")}>
            Descubra restaurantes, bares e muito mais com vantagens especiais para você
          </p>
        </header>

        {/* Search Card */}
        <SearchCard
          selectedCity={selectedCity}
          searchQuery={searchQuery}
          onCityClick={handleCityClick}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
