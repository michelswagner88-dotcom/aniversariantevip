import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { cidades, isLoading } = useCidadesAutocomplete(inputValue);

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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
        />
        {inputValue && (
          <X 
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors shrink-0" 
            onClick={() => {
              setInputValue('');
              setIsOpen(false);
            }}
          />
        )}
      </div>
      
      {isOpen && inputValue.length >= 3 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
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
      
      {inputValue.length > 0 && inputValue.length < 3 && isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 p-3">
          <p className="text-slate-400 text-sm">Digite pelo menos 3 letras...</p>
        </div>
      )}
    </div>
  );
};
