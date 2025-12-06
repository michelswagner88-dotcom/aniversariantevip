import { Rocket, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CidadeSemEstabelecimentosViewProps {
  cidade: string;
  estado: string;
  onMudarCidade: () => void;
}

// Cidades próximas com estabelecimentos (simplificado)
const CIDADES_SUGERIDAS = [
  { cidade: 'Brasília', estado: 'DF' },
  { cidade: 'São Paulo', estado: 'SP' },
  { cidade: 'Rio de Janeiro', estado: 'RJ' },
];

export const CidadeSemEstabelecimentosView = ({
  cidade,
  estado,
  onMudarCidade
}: CidadeSemEstabelecimentosViewProps) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Cidade atual */}
      <div className="flex items-center gap-2 text-slate-400 mb-6">
        <MapPin className="w-4 h-4" />
        <span>{cidade}, {estado}</span>
      </div>
      
      {/* Ícone */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center mb-6">
        <Rocket className="w-10 h-10 text-violet-400" />
      </div>
      
      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
        Estamos chegando em {cidade}!
      </h1>
      
      <p className="text-slate-400 text-center max-w-md mb-8">
        Ainda não temos parceiros cadastrados na sua cidade, mas estamos expandindo rapidamente.
      </p>
      
      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <Button
          onClick={onMudarCidade}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Buscar outra cidade
        </Button>
        
        <Link to="/seja-parceiro">
          <Button variant="outline" className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 w-full">
            <Plus className="w-4 h-4 mr-2" />
            Indicar estabelecimento
          </Button>
        </Link>
      </div>
      
      {/* Cidades sugeridas */}
      <div className="w-full max-w-lg">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 text-center">
          Explore outras cidades
        </h2>
        
        <div className="space-y-3">
          {CIDADES_SUGERIDAS.map((item) => (
            <button
              key={`${item.cidade}-${item.estado}`}
              onClick={() => {
                window.location.href = `/?cidade=${encodeURIComponent(item.cidade)}&estado=${item.estado}`;
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-violet-400" />
                <span className="text-white font-medium">{item.cidade}, {item.estado}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
