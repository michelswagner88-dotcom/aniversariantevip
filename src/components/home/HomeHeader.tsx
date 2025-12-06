import { useState } from 'react';
import { MapPin, Search, ChevronDown, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CityCombobox } from '@/components/CityCombobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HomeHeaderProps {
  cidade: string;
  estado: string;
  origem: 'cache' | 'gps' | 'ip' | 'perfil' | 'manual' | null;
  onMudarCidade: () => void;
  onCidadeSelect: (cidade: string, estado: string) => void;
  onBusca: (termo: string) => void;
  buscaAtual: string;
}

export const HomeHeader = ({
  cidade,
  estado,
  origem,
  onMudarCidade,
  onCidadeSelect,
  onBusca,
  buscaAtual
}: HomeHeaderProps) => {
  const [buscaInterna, setBuscaInterna] = useState(buscaAtual);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Ícone baseado na origem da detecção
  const origemIcon = {
    gps: '📍',
    ip: '🌐',
    cache: '💾',
    perfil: '👤',
    manual: '✏️'
  }[origem || 'manual'] || '📍';
  
  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBusca(buscaInterna);
  };
  
  const limparBusca = () => {
    setBuscaInterna('');
    onBusca('');
  };

  const handleCidadeSelect = (novaCidade: string, novoEstado: string) => {
    onCidadeSelect(novaCidade, novoEstado);
    setDialogOpen(false);
  };
  
  return (
    <div className="space-y-4 mb-6">
      {/* Linha 1: Cidade detectada */}
      <div className="flex items-center justify-between">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 text-left hover:bg-white/5 rounded-lg px-3 py-2 -ml-3 transition-colors">
              <span className="text-lg">{origemIcon}</span>
              <div>
                <p className="text-white font-semibold text-lg">
                  {cidade}, {estado}
                </p>
                <p className="text-xs text-slate-500">
                  {origem === 'gps' && 'Localização via GPS'}
                  {origem === 'ip' && 'Localização aproximada'}
                  {origem === 'cache' && 'Última localização'}
                  {origem === 'perfil' && 'Do seu perfil'}
                  {origem === 'manual' && 'Selecionado por você'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>
          </DialogTrigger>
          
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Mudar cidade</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <CityCombobox
                onSelect={handleCidadeSelect}
                placeholder="Digite o nome da cidade..."
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={onMudarCidade}
                className="text-violet-400 hover:text-violet-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Detectar novamente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Linha 2: Campo de busca */}
      <form onSubmit={handleBuscaSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar restaurante, bar, academia..."
          value={buscaInterna}
          onChange={(e) => setBuscaInterna(e.target.value)}
          className="w-full pl-12 pr-10 py-6 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
        />
        {buscaInterna && (
          <button
            type="button"
            onClick={limparBusca}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};
