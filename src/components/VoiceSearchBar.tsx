import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, MapPin, Mic, Loader2, LocateFixed, X } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCepLookup } from '../hooks/useCepLookup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizarCidade } from '@/lib/utils';

const VoiceSearchBar = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [searchParams] = useSearchParams();
  const isOnExplorar = routeLocation.pathname === '/explorar';
  
  const { isListening, transcript, startListening, hasSupport } = useSpeechRecognition();
  const { 
    location: geoLocation, 
    loading: geoLoading, 
    error: geoError,
    currentStep, 
    requestLocation
  } = useGeolocation();
  const { fetchCep, formatCep, loading: cepLoading } = useCepLookup();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [locationText, setLocationText] = useState("");
  const [showCepDialog, setShowCepDialog] = useState(false);
  const [cepInput, setCepInput] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar com valores da URL se estiver na página Explorar
  useEffect(() => {
    if (isOnExplorar) {
      const cidadeParam = searchParams.get('cidade');
      const qParam = searchParams.get('q');
      if (cidadeParam && !locationText) {
        setLocationText(cidadeParam);
      }
      if (qParam && !searchQuery) {
        setSearchQuery(qParam);
      }
    }
  }, [isOnExplorar, searchParams]);

  // Atualiza o texto de localização quando detectada
  useEffect(() => {
    if (geoLocation) {
      const newLocation = `${geoLocation.cidade}, ${geoLocation.estado}`;
      setLocationText(newLocation);
      // Se estiver na página Explorar, atualizar URL
      if (isOnExplorar) {
        updateExplorarUrl(newLocation, searchQuery);
      }
    }
  }, [geoLocation]);

  // Atualiza o input e processa busca por voz quando detecta texto
  useEffect(() => {
    if (transcript && !isListening) {
      setSearchQuery(transcript);
      handleVoiceSearch(transcript);
    }
  }, [transcript, isListening]);

  const handleDetectLocation = async () => {
    try {
      await requestLocation();
    } catch (error) {
      // Se falhar, abre o diálogo de CEP
      setShowCepDialog(true);
    }
  };

  const handleCepSubmit = async () => {
    const data = await fetchCep(cepInput);
    if (data) {
      const newLocation = `${data.localidade}, ${data.uf}`;
      handleLocationChange(newLocation);
      setShowCepDialog(false);
      setCepInput("");
    }
  };

  const clearLocation = () => {
    setLocationText("");
    localStorage.removeItem('user_location');
    // Atualizar URL se estiver na página Explorar
    if (isOnExplorar) {
      updateExplorarUrl('', searchQuery);
    }
  };

  // Função para atualizar URL em tempo real na página Explorar
  const updateExplorarUrl = useCallback((cidade: string, query: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (cidade.trim()) {
      const [cidadeNome] = cidade.split(',');
      params.set('cidade', cidadeNome.trim());
    } else {
      params.delete('cidade');
    }
    
    if (query.trim()) {
      params.set('q', query.trim().toLowerCase());
    } else {
      params.delete('q');
    }
    
    navigate(`/explorar?${params.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  // Busca em tempo real com debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (isOnExplorar) {
      // Cancelar debounce anterior
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      // Atualizar URL após 300ms de inatividade
      debounceRef.current = setTimeout(() => {
        updateExplorarUrl(locationText, value);
      }, 300);
    }
  };

  // Atualizar cidade em tempo real
  const handleLocationChange = (value: string) => {
    setLocationText(value);
    
    if (isOnExplorar) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        updateExplorarUrl(value, searchQuery);
      }, 300);
    }
  };

  const handleVoiceSearch = async (texto: string) => {
    const textoLower = texto.toLowerCase().trim();
    
    // Detectar comandos de proximidade
    const comandosProximidade = [
      'perto de mim',
      'próximo',
      'proximo',
      'aqui perto',
      'por aqui',
      'na minha região',
      'na região',
      'ao redor'
    ];
    
    const isComandoProximidade = comandosProximidade.some(cmd => textoLower.includes(cmd));
    
    if (isComandoProximidade) {
      // Se não tem localização, solicitar
      if (!geoLocation && !locationText) {
        toast.info('Detectando sua localização...');
        try {
          await requestLocation();
          // Aguardar um momento para a localização ser detectada
          setTimeout(() => {
            handleVoiceSearch(texto); // Reprocessar após obter localização
          }, 2000);
          return;
        } catch (error) {
          toast.error('Não conseguimos detectar sua localização. Por favor, digite a cidade.');
          setShowCepDialog(true);
          return;
        }
      }
    }
    
    // Mapeamento de categorias com sinônimos
    const categoriasMap: Record<string, string> = {
      'restaurante': 'Restaurante',
      'restaurantes': 'Restaurante',
      'comida': 'Restaurante',
      'bar': 'Bar',
      'bares': 'Bar',
      'pub': 'Bar',
      'cervejaria': 'Bar',
      'academia': 'Academia',
      'academias': 'Academia',
      'ginásio': 'Academia',
      'barbearia': 'Barbearia',
      'barbearias': 'Barbearia',
      'barbeiro': 'Barbearia',
      'salão': 'Salão de Beleza',
      'salao': 'Salão de Beleza',
      'cabeleireiro': 'Salão de Beleza',
      'café': 'Cafeteria',
      'cafe': 'Cafeteria',
      'cafeteria': 'Cafeteria',
      'balada': 'Casa Noturna',
      'boate': 'Casa Noturna',
      'casa noturna': 'Casa Noturna',
      'confeitaria': 'Confeitaria',
      'doçaria': 'Confeitaria',
      'hotel': 'Hospedagem',
      'pousada': 'Hospedagem',
      'hospedagem': 'Hospedagem',
      'loja': 'Outros Comércios',
      'comércio': 'Outros Comércios',
    };

    // Detectar categoria
    let categoriaEncontrada: string | null = null;
    for (const [key, value] of Object.entries(categoriasMap)) {
      if (textoLower.includes(key)) {
        categoriaEncontrada = value;
        break;
      }
    }

    // Detectar cidade comum
    const cidadesComuns = [
      'florianópolis', 'florianopolis', 'floripa',
      'curitiba',
      'porto alegre', 'porto-alegre',
      'são paulo', 'sao paulo', 'sp',
      'rio de janeiro', 'rio',
      'joinville',
      'blumenau',
      'balneário camboriú', 'balneario camboriu', 'bc',
      'chapecó', 'chapeco',
      'criciúma', 'criciuma'
    ];

    let cidadeEncontrada: string | null = null;
    for (const cidade of cidadesComuns) {
      if (textoLower.includes(cidade)) {
        cidadeEncontrada = normalizarCidade(cidade);
        break;
      }
    }

    // Se não encontrou cidade, usar a cidade atual
    if (!cidadeEncontrada && locationText) {
      const [cidade] = locationText.split(',');
      cidadeEncontrada = cidade.trim();
    }

    // Se não encontrou categoria, tentar buscar estabelecimento por nome
    if (!categoriaEncontrada) {
      try {
        const { data: estabelecimentos } = await supabase
          .from('public_estabelecimentos')
          .select('slug, nome_fantasia, cidade, estado')
          .eq('ativo', true)
          .ilike('nome_fantasia', `%${textoLower}%`)
          .limit(5);

        if (estabelecimentos && estabelecimentos.length > 0) {
          const est = estabelecimentos[0];
          toast.success(`Encontrado: ${est.nome_fantasia}`);
          navigate(`/${est.estado?.toLowerCase()}/${est.cidade?.toLowerCase().replace(/\s+/g, '-')}/${est.slug}`);
          return;
        }
      } catch (error) {
        console.error('Erro ao buscar estabelecimento:', error);
      }
    }

    // Montar URL de navegação
    const params = new URLSearchParams();
    
    // Se é comando de proximidade, usar cidade atual ou geolocalização
    if (isComandoProximidade) {
      if (geoLocation?.cidade) {
        params.set('cidade', geoLocation.cidade);
        cidadeEncontrada = geoLocation.cidade;
      } else if (locationText) {
        const [cidade] = locationText.split(',');
        params.set('cidade', cidade.trim());
        cidadeEncontrada = cidade.trim();
      }
      
      if (categoriaEncontrada) {
        params.set('categoria', categoriaEncontrada);
        toast.success(`Buscando ${categoriaEncontrada} perto de você em ${cidadeEncontrada || 'sua região'}`);
      } else {
        toast.success(`Buscando estabelecimentos perto de você em ${cidadeEncontrada || 'sua região'}`);
      }
    } else {
      // Fluxo normal
      if (categoriaEncontrada) {
        params.set('categoria', categoriaEncontrada);
        toast.success(`Buscando ${categoriaEncontrada}${cidadeEncontrada ? ` em ${cidadeEncontrada}` : ''}`);
      }
      if (cidadeEncontrada) {
        params.set('cidade', cidadeEncontrada);
      }
      if (!categoriaEncontrada && !cidadeEncontrada) {
        // Busca genérica
        params.set('q', textoLower);
        toast.info('Buscando por: ' + texto);
      }
    }

    navigate(`/explorar?${params.toString()}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleVoiceSearch(searchQuery);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 md:px-0 z-50">
      
      {/* Efeito de 'Ouvindo' (Backdrop) */}
      {isListening && (
        <div className="absolute -inset-4 rounded-3xl bg-violet-600/20 blur-2xl animate-pulse z-0"></div>
      )}

      <div className={`relative flex flex-col md:flex-row items-center gap-2 rounded-3xl border p-2 backdrop-blur-xl transition-all duration-300 ${
        isListening 
          ? 'border-violet-500 bg-slate-900/90 shadow-[0_0_30px_rgba(139,92,246,0.3)]' 
          : 'border-white/10 bg-white/5 shadow-2xl'
      }`}>
        
        {/* Input 1: Localização */}
        <div className="flex h-14 w-full flex-1 items-center gap-3 rounded-2xl bg-white/5 px-4 transition-colors focus-within:bg-white/10 md:bg-transparent md:focus-within:bg-transparent">
          <MapPin className="text-violet-400" size={20} />
          <input 
            type="text" 
            value={locationText}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="Digite a cidade" 
            className="w-full bg-transparent text-white placeholder-slate-400 outline-none"
          />
          {locationText && (
            <button onClick={clearLocation} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          )}
          <button 
            onClick={handleDetectLocation}
            disabled={geoLoading}
            className="group flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-white/10"
            title="Detectar minha localização"
          >
            {geoLoading ? (
              <Loader2 size={20} className="animate-spin text-violet-400" />
            ) : (
              <LocateFixed size={20} className="text-slate-400 group-hover:text-violet-400" />
            )}
          </button>
        </div>

        {/* Divisor Desktop */}
        <div className="hidden h-8 w-[1px] bg-white/10 md:block"></div>

        {/* Input 2: Busca + Microfone */}
        <div className="flex h-14 w-full flex-[1.5] items-center gap-3 rounded-2xl bg-white/5 px-4 transition-colors focus-within:bg-white/10 md:bg-transparent md:focus-within:bg-transparent">
          <Search className={isListening ? "text-violet-400 animate-pulse" : "text-slate-400"} size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={isListening ? "Pode falar, estou ouvindo..." : "Buscar restaurante, loja..."}
            className={`w-full bg-transparent outline-none transition-all ${
              isListening ? "text-violet-300 placeholder-violet-300/70" : "text-white placeholder-slate-400"
            }`}
          />
          
          {/* Botão do Microfone */}
          {hasSupport && (
            <button 
              onClick={startListening}
              className={`group relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 scale-105' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-violet-400'
              }`}
              title="Pesquisar por voz"
            >
              {isListening ? (
                <>
                  <span className="absolute inset-0 animate-ping rounded-lg bg-red-500/30"></span>
                  <Loader2 size={20} className="animate-spin relative z-10" />
                  <span className="text-[9px] font-medium relative z-10">Ouvindo</span>
                </>
              ) : (
                <>
                  <Mic size={20} />
                  <span className="text-[9px] font-medium">Voz</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Botão de Buscar Principal */}
        <button 
          onClick={handleSearch}
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 font-bold text-white shadow-lg shadow-violet-500/20 transition-transform active:scale-95 md:w-auto md:px-8"
        >
          Buscar
        </button>

      </div>
      
      {/* Feedback Visual de Texto Falado */}
      {isListening && (
        <div className="absolute -bottom-12 left-0 right-0 text-center">
          <span className="inline-block rounded-full bg-slate-900/80 px-4 py-1 text-xs font-medium text-violet-300 backdrop-blur-md border border-violet-500/30">
            🎤 Ouvindo... Fale agora
          </span>
        </div>
      )}

      {/* Diálogo de CEP */}
      <Dialog open={showCepDialog} onOpenChange={setShowCepDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Informe seu CEP</DialogTitle>
            <DialogDescription className="text-slate-400">
              Não conseguimos detectar sua localização automaticamente. Por favor, digite seu CEP para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              type="text"
              value={cepInput}
              onChange={(e) => setCepInput(formatCep(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCepDialog(false)} 
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCepSubmit}
                disabled={cepLoading}
                className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600"
              >
                {cepLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceSearchBar;
