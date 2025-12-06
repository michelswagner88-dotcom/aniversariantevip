import { useState } from 'react';
import { MapPin, Navigation, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CityCombobox } from '@/components/CityCombobox';

interface SemCidadeViewProps {
  onCidadeSelect: (cidade: string, estado: string) => void;
}

// Cidades populares com estabelecimentos
const CIDADES_POPULARES = [
  { cidade: 'Brasília', estado: 'DF' },
  { cidade: 'São Paulo', estado: 'SP' },
  { cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cidade: 'Belo Horizonte', estado: 'MG' },
  { cidade: 'Curitiba', estado: 'PR' },
  { cidade: 'Florianópolis', estado: 'SC' },
];

export const SemCidadeView = ({ onCidadeSelect }: SemCidadeViewProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  
  const handleUsarLocalizacao = async () => {
    setIsDetecting(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&addressdetails=1`,
        { headers: { 'User-Agent': 'AniversarianteVIP/1.0' } }
      );
      
      const data = await response.json();
      const cidade = data.address.city || data.address.town || data.address.village;
      const estado = data.address.state;
      
      if (cidade && estado) {
        // Normalizar estado
        const estadosBR: Record<string, string> = {
          'Distrito Federal': 'DF', 'São Paulo': 'SP', 'Rio de Janeiro': 'RJ',
          'Minas Gerais': 'MG', 'Paraná': 'PR', 'Santa Catarina': 'SC',
          'Rio Grande do Sul': 'RS', 'Bahia': 'BA', 'Goiás': 'GO'
        };
        const estadoNormalizado = estado.length === 2 ? estado.toUpperCase() : (estadosBR[estado] || estado);
        onCidadeSelect(cidade, estadoNormalizado);
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    } finally {
      setIsDetecting(false);
    }
  };
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Ícone principal */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center">
          <span className="text-5xl">🎂</span>
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>
      </div>
      
      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
        Onde você quer comemorar?
      </h1>
      
      <p className="text-slate-400 text-center max-w-md mb-8">
        Descubra estabelecimentos com benefícios exclusivos para aniversariantes na sua cidade
      </p>
      
      {/* Campo de busca de cidade */}
      <div className="w-full max-w-md mb-6">
        <CityCombobox
          onSelect={(cidade, estado) => {
            if (cidade && estado) {
              onCidadeSelect(cidade, estado);
            }
          }}
          placeholder="Digite o nome da sua cidade..."
          className="w-full"
        />
      </div>
      
      {/* Botão de usar localização */}
      <Button
        onClick={handleUsarLocalizacao}
        disabled={isDetecting}
        variant="outline"
        className="mb-12 border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
      >
        <Navigation className="w-4 h-4 mr-2" />
        {isDetecting ? 'Detectando...' : 'Usar minha localização'}
      </Button>
      
      {/* Cidades populares */}
      <div className="w-full max-w-2xl">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 text-center">
          Cidades populares
        </h2>
        
        <div className="flex flex-wrap justify-center gap-3">
          {CIDADES_POPULARES.map((item) => (
            <button
              key={`${item.cidade}-${item.estado}`}
              onClick={() => onCidadeSelect(item.cidade, item.estado)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 rounded-xl transition-all"
            >
              <MapPin className="w-4 h-4 text-violet-400" />
              <span className="text-white font-medium">{item.cidade}</span>
              <span className="text-xs text-slate-500">{item.estado}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
