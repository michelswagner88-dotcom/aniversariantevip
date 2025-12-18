// =============================================================================
// SEARCHBAR.TSX - ANIVERSARIANTE VIP
// Design: Simples, funcional, sem over-engineering
// =============================================================================

import { memo, useState, useRef, useEffect } from "react";
import { MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface SearchBarProps {
  city: string;
  state: string;
  isLoading?: boolean;
  onCityChange: (city: string, state: string) => void;
}

// =============================================================================
// CITY MODAL
// =============================================================================

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  currentState: string;
  onSelect: (city: string, state: string) => void;
}

const CityModal = memo(({ isOpen, onClose, currentCity, currentState, onSelect }: CityModalProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ cidade: string; estado: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSuggestions([]);
    }
  }, [isOpen]);

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
    onSelect(cidade, estado);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Voltar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <span className="font-semibold text-gray-900">Alterar cidade</span>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 h-12">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cidade..."
            className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none"
          />
          {isSearching && (
            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Current */}
      {query.length < 2 && (
        <div className="px-4 mb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 px-1">Cidade atual</p>
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{currentCity}</p>
              <p className="text-sm text-gray-500">{currentState}</p>
            </div>
          </button>
        </div>
      )}

      {/* Results */}
      {suggestions.length > 0 && (
        <div className="px-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 px-1">Resultados</p>
          <div className="space-y-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s.cidade, s.estado)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-left"
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
        </div>
      )}

      {query.length >= 2 && suggestions.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma cidade encontrada</p>
        </div>
      )}
    </div>
  );
});
CityModal.displayName = "CityModal";

// =============================================================================
// MAIN
// =============================================================================

export const SearchBar = memo(function SearchBar({ city, state, isLoading, onCityChange }: SearchBarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelect = (newCity: string, newState: string) => {
    localStorage.setItem("aniversariantevip_city", newCity);
    localStorage.setItem("aniversariantevip_state", newState);
    onCityChange(newCity, newState);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        disabled={isLoading}
        className={cn(
          "w-full flex items-center gap-3",
          "h-12 px-4",
          "bg-white rounded-full",
          "shadow-sm",
          "text-left",
          "transition-shadow hover:shadow-md",
          isLoading && "opacity-70",
        )}
      >
        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 leading-none mb-0.5">ONDE</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {isLoading ? "Detectando..." : `${city}, ${state}`}
          </p>
        </div>
      </button>

      <CityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentCity={city}
        currentState={state}
        onSelect={handleSelect}
      />
    </>
  );
});

export default SearchBar;
