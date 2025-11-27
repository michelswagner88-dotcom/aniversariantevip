import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCidadesAutocomplete } from '@/hooks/useCidadesAutocomplete';

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
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { cidades, isLoading } = useCidadesAutocomplete(inputValue);

  // Calcular posição do dropdown
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

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

  // Atualizar posição ao abrir
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-white placeholder:text-slate-300 text-base pr-7"
      />
      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
      
      {isOpen && inputValue.length >= 3 && dropdownPosition && (
        <div 
          className="fixed bg-slate-900 border border-white/10 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {isLoading ? (
            <div className="p-3 text-slate-400 text-sm">Buscando cidades...</div>
          ) : cidades.length > 0 ? (
            cidades.map((cidade, index) => (
              <button
                key={index}
                onClick={() => {
                  const cityValue = `${cidade.nome}, ${cidade.estado}`;
                  onSelect(cidade.nome, cidade.estado);
                  setInputValue(cityValue);
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 hover:bg-white/10 transition-colors text-white text-sm border-b border-white/5 last:border-0 flex justify-between items-center"
              >
                <span>
                  {cidade.nome}, {cidade.estado}
                </span>
                {cidade.disponivel && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    ✓ Disponível
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="p-3 text-slate-400 text-sm">Nenhuma cidade encontrada</div>
          )}
        </div>
      )}
      
      {inputValue.length > 0 && inputValue.length < 3 && isOpen && dropdownPosition && (
        <div 
          className="fixed bg-slate-900 border border-white/10 rounded-lg shadow-xl z-[9999] p-3"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <p className="text-slate-400 text-sm">Digite pelo menos 3 letras...</p>
        </div>
      )}
    </div>
  );
};
