import { useState, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { CityCombobox } from '@/components/CityCombobox';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AirbnbSearchBarProps {
  cidade: string;
  estado: string;
  busca: string;
  onBuscaChange: (termo: string) => void;
  onCidadeSelect: (cidade: string, estado: string) => void;
}

export const AirbnbSearchBar = ({
  cidade,
  estado,
  busca,
  onBuscaChange,
  onCidadeSelect
}: AirbnbSearchBarProps) => {
  const [buscaInterna, setBuscaInterna] = useState(busca);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscaChange(buscaInterna);
  };

  const handleCidadeSelect = (novaCidade: string, novoEstado: string) => {
    onCidadeSelect(novaCidade, novoEstado);
    setDialogOpen(false);
  };

  const handleClear = () => {
    setBuscaInterna('');
    onBuscaChange('');
    inputRef.current?.focus();
  };

  const cidadeDisplay = cidade ? `${cidade}, ${estado}` : 'Qualquer lugar';
  
  return (
    <div className="w-full max-w-3xl mx-auto p-1">
      {/* Search bar pill style Airbnb Premium */}
      <div 
        className={cn(
          // Base styles
          "flex items-center rounded-full transition-all duration-200",
          "bg-secondary/80 backdrop-blur-sm",
          "border border-border/50",
          // Shadow
          "shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)]",
          // Hover
          "hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),0_8px_24px_rgba(0,0,0,0.1)]",
          // Focus state
          isFocused && "border-primary ring-[3px] ring-primary/15 shadow-[0_0_0_3px_rgba(139,92,246,0.15),0_4px_16px_rgba(139,92,246,0.1)]"
        )}
      >
        
        {/* Botão de Localização */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2.5 px-5 py-3.5 border-r border-border/50 hover:bg-accent/50 rounded-l-full transition-colors min-w-[160px] sm:min-w-[180px]">
              <MapPin className={cn(
                "w-5 h-5 transition-colors shrink-0",
                isFocused ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-left min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Onde</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {cidadeDisplay}
                </p>
              </div>
            </button>
          </DialogTrigger>
          
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Escolha uma cidade</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <CityCombobox
                onSelect={handleCidadeSelect}
                placeholder="Digite o nome da cidade..."
              />
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Campo de busca */}
        <form onSubmit={handleBuscaSubmit} className="flex-1 flex items-center gap-2 min-w-0">
          {/* Ícone de busca */}
          <Search className={cn(
            "w-5 h-5 ml-4 shrink-0 transition-colors",
            isFocused ? "text-primary" : "text-muted-foreground"
          )} />
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar restaurante, bar, academia..."
            value={buscaInterna}
            onChange={(e) => setBuscaInterna(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none min-w-0"
          />
          
          {/* Botão limpar */}
          {buscaInterna && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all shrink-0"
            >
              <X size={14} />
            </button>
          )}
          
          {/* Divisor */}
          <div className="w-px h-6 bg-border/50 shrink-0" />
          
          {/* Botão de busca */}
          <button
            type="submit"
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 mr-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25"
          >
            <Search className="w-[18px] h-[18px] text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
