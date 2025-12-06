import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCidadesAutocomplete } from '@/hooks/useCidadesAutocomplete';
import { sanitizarInput } from '@/lib/sanitize';

interface CityComboboxProps {
  value?: string;
  onSelect: (cidade: string, estado: string) => void;
  placeholder?: string;
  className?: string;
}

interface Cidade {
  nome: string;
  estado: string;
  disponivel?: boolean;
}

export const CityCombobox: React.FC<CityComboboxProps> = ({
  value,
  onSelect,
  placeholder = "Digite a cidade",
  className = "",
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Sanitizar input antes de buscar
  const sanitizedInput = sanitizarInput(inputValue, 50);
  const { cidades, isLoading } = useCidadesAutocomplete(sanitizedInput);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atualizar inputValue quando value mudar externamente
  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  const handleSelect = (cidade: Cidade) => {
    const cityValue = `${cidade.nome}, ${cidade.estado}`;
    onSelect(cidade.nome, cidade.estado);
    setInputValue(cityValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (inputValue.length >= 3) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-white placeholder:text-slate-300 text-base pr-7"
      />
      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
      
      {/* Dropdown de sugestões - Background sólido, z-index alto */}
      {isOpen && inputValue.length >= 3 && (
        <div 
          className="absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl max-h-72 overflow-y-auto border border-border/50 backdrop-blur-none"
          style={{ 
            zIndex: 99999,
            backgroundColor: 'hsl(222.2 84% 4.9%)', // slate-950 sólido
          }}
        >
          {isLoading ? (
            <div className="p-4 text-muted-foreground text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Buscando cidades...
            </div>
          ) : cidades.length > 0 ? (
            <ul className="py-2">
              {cidades.map((cidade, index) => (
                <li key={`${cidade.nome}-${cidade.estado}-${index}`}>
                  <button
                    onClick={() => handleSelect(cidade)}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-foreground text-sm flex justify-between items-center gap-3"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground">📍</span>
                      <span className="font-medium truncate">{cidade.nome}</span>
                      <span className="text-muted-foreground text-xs font-semibold bg-white/10 px-2 py-0.5 rounded">
                        {cidade.estado}
                      </span>
                    </span>
                    {cidade.disponivel && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        ✓ Disponível
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-muted-foreground text-sm text-center">
              <span className="text-2xl block mb-2">🔍</span>
              Nenhuma cidade brasileira encontrada
            </div>
          )}
        </div>
      )}
      
      {/* Mensagem quando digitou menos de 3 caracteres */}
      {inputValue.length > 0 && inputValue.length < 3 && isOpen && (
        <div 
          className="absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl border border-border/50 p-4"
          style={{ 
            zIndex: 99999,
            backgroundColor: 'hsl(222.2 84% 4.9%)',
          }}
        >
          <p className="text-muted-foreground text-sm text-center">
            Digite pelo menos 3 letras para buscar...
          </p>
        </div>
      )}
    </div>
  );
};
