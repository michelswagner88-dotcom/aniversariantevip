import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { CityCombobox } from '@/components/CityCombobox';
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
  
  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscaChange(buscaInterna);
  };

  const handleCidadeSelect = (novaCidade: string, novoEstado: string) => {
    onCidadeSelect(novaCidade, novoEstado);
    setDialogOpen(false);
  };

  const cidadeDisplay = cidade ? `${cidade}, ${estado}` : 'Qualquer lugar';
  
  return (
    <div className="w-full">
      {/* Search bar pill style Airbnb */}
      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md transition-all focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
        
        {/* Botão de Localização */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-6 py-4 border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-l-full transition-colors min-w-[180px]">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div className="text-left">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Onde</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                  {cidadeDisplay}
                </p>
              </div>
            </button>
          </DialogTrigger>
          
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Escolha uma cidade</DialogTitle>
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
        <form onSubmit={handleBuscaSubmit} className="flex-1 flex items-center">
          <input
            type="text"
            placeholder="Buscar restaurante, bar, academia..."
            value={buscaInterna}
            onChange={(e) => setBuscaInterna(e.target.value)}
            className="flex-1 bg-transparent px-4 py-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          
          {/* Botão de busca */}
          <button
            type="submit"
            className="flex items-center justify-center w-10 h-10 mr-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-full transition-all"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};