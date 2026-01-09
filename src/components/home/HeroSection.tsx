// =============================================================================
// HEROSECTION.TSX - ANIVERSARIANTE VIP
// Design: Estilo Airbnb Mobile - Geolocalização automática
// =============================================================================

import { memo, useState, useRef, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface HeroSectionProps {
  selectedCity?: string;
  selectedState?: string;
  onCityChange?: (city: string, state: string) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CITY = "São Paulo";
const DEFAULT_STATE = "SP";

// =============================================================================
// HOOKS - Geolocalização automática
// =============================================================================

interface UseAutoLocationResult {
  city: string;
  state: string;
  isLoading: boolean;
  isUsingDefault: boolean;
}

const useAutoLocation = (
  initialCity?: string,
  initialState?: string,
  onCityChange?: (city: string, state: string) => void,
): UseAutoLocationResult => {
  const [city, setCity] = useState(initialCity || DEFAULT_CITY);
  const [state, setState] = useState(initialState || DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingDefault, setIsUsingDefault] = useState(!initialCity);
  const hasAsked = useRef(false);

  useEffect(() => {
    // Se já tem cidade definida, não pede localização
    if (initialCity && initialState) {
      setCity(initialCity);
      setState(initialState);
      setIsUsingDefault(false);
      return;
    }

    // Só pede uma vez
    if (hasAsked.current) return;
    hasAsked.current = true;

    // Verifica se já tem permissão salva
    const savedCity = localStorage.getItem("aniversariantevip_city");
    const savedState = localStorage.getItem("aniversariantevip_state");

    if (savedCity && savedState) {
      setCity(savedCity);
      setState(savedState);
      setIsUsingDefault(false);
      onCityChange?.(savedCity, savedState);
      return;
    }

    // Pede geolocalização
    if ("geolocation" in navigator) {
      setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Reverse geocoding com Nominatim (gratuito)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { "Accept-Language": "pt-BR" } },
            );

            const data = await response.json();
            const address = data.address;

            const detectedCity = address.city || address.town || address.municipality || DEFAULT_CITY;
            const detectedState = address.state_code || address["ISO3166-2-lvl4"]?.split("-")[1] || DEFAULT_STATE;

            setCity(detectedCity);
            setState(detectedState);
            setIsUsingDefault(false);

            // Salva no localStorage
            localStorage.setItem("aniversariantevip_city", detectedCity);
            localStorage.setItem("aniversariantevip_state", detectedState);

            onCityChange?.(detectedCity, detectedState);
          } catch (error) {
            console.error("Erro ao obter cidade:", error);
            // Mantém São Paulo como fallback
            onCityChange?.(DEFAULT_CITY, DEFAULT_STATE);
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          setIsLoading(false);
          // Usuário negou - usa São Paulo
          onCityChange?.(DEFAULT_CITY, DEFAULT_STATE);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000, // 10 minutos
        },
      );
    } else {
      // Navegador não suporta - usa São Paulo
      onCityChange?.(DEFAULT_CITY, DEFAULT_STATE);
    }
  }, [initialCity, initialState, onCityChange]);

  return { city, state, isLoading, isUsingDefault };
};

// =============================================================================
// CITY SEARCH BAR
// =============================================================================

interface CitySearchBarProps {
  city: string;
  state: string;
  isLoading: boolean;
  onCityChange?: (city: string, state: string) => void;
}

const CitySearchBar = memo(({ city, state, isLoading, onCityChange }: CitySearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ cidade: string; estado: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Buscar cidades da API IBGE
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`);
        const data = await response.json();

        const filtered = data
          .filter((m: any) => m.nome.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
          .map((m: any) => ({
            cidade: m.nome,
            estado: m.microrregiao.mesorregiao.UF.sigla,
          }));

        setSuggestions(filtered);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (cidade: string, estado: string) => {
    // Salva no localStorage
    localStorage.setItem("aniversariantevip_city", cidade);
    localStorage.setItem("aniversariantevip_state", estado);

    onCityChange?.(cidade, estado);
    setIsOpen(false);
    setQuery("");
    setSuggestions([]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      {/* Botão de busca - sempre mostra a cidade atual */}
      <button
        onClick={handleOpen}
        disabled={isLoading}
        className={cn(
          "w-full flex items-center gap-3",
          "bg-white rounded-full",
          "px-4 py-3.5",
          "shadow-lg shadow-black/10",
          "border border-gray-200",
          "hover:shadow-xl transition-shadow",
          "text-left",
          isLoading && "opacity-70",
        )}
      >
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Onde</p>
          <p className="text-sm font-bold text-gray-900 truncate">
            {isLoading ? "Detectando..." : `${city}, ${state}`}
          </p>
        </div>
      </button>

      {/* Modal de busca */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Header do modal */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl leading-none text-gray-500">&times;</span>
            </button>
            <span className="font-semibold text-gray-900">Alterar cidade</span>
          </div>

          {/* Campo de busca */}
          <div className="p-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3.5">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome da cidade..."
                className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none text-base"
              />
              {isSearching && (
                <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Cidade atual */}
          {query.length < 2 && (
            <div className="px-4 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 px-1">Cidade atual</p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{city}</p>
                  <p className="text-sm text-gray-500">{state}</p>
                </div>
              </button>
            </div>
          )}

          {/* Sugestões */}
          <div className="px-4">
            {suggestions.length > 0 && (
              <>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 px-1">Resultados</p>
                <div className="space-y-1">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(s.cidade, s.estado)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{s.cidade}</p>
                        <p className="text-sm text-gray-500">{s.estado}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {query.length >= 2 && suggestions.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma cidade encontrada</p>
                <p className="text-sm text-gray-400 mt-1">Tente outro nome</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});
CitySearchBar.displayName = "CitySearchBar";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const HeroSection = memo(function HeroSection({ selectedCity, selectedState, onCityChange }: HeroSectionProps) {
  const { city, state, isLoading } = useAutoLocation(selectedCity, selectedState, onCityChange);

  return (
    <section className="bg-[#240046] px-4 pb-4">
      <CitySearchBar city={city} state={state} isLoading={isLoading} onCityChange={onCityChange} />
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
