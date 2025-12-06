import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Tipos
interface CidadeDetectada {
  cidade: string | null;
  estado: string | null;
  origem: 'cache' | 'gps' | 'ip' | 'perfil' | 'manual' | null;
}

interface UseCidadeInteligenteReturn {
  cidade: string | null;
  estado: string | null;
  origem: CidadeDetectada['origem'];
  isLoading: boolean;
  isDetecting: boolean;
  error: string | null;
  temEstabelecimentos: boolean | null;
  quantidadeEstabelecimentos: number;
  setCidadeManual: (cidade: string, estado: string) => void;
  limparCidade: () => void;
  redetectar: () => void;
}

// Constantes
const STORAGE_KEY = 'aniversariante_cidade_selecionada';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
const GPS_TIMEOUT = 10000; // 10 segundos
const IP_API_TIMEOUT = 5000; // 5 segundos

// APIs de IP (fallback chain)
const IP_APIS = [
  {
    name: 'ipapi.co',
    url: 'https://ipapi.co/json/',
    extract: (data: any) => ({ cidade: data.city, estado: data.region_code })
  },
  {
    name: 'ip-api.com', 
    url: 'http://ip-api.com/json/?fields=city,region',
    extract: (data: any) => ({ cidade: data.city, estado: data.region })
  }
];

// Função para converter sigla do estado brasileiro
const normalizarEstado = (estado: string): string => {
  const estadosBR: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
    'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
    'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
  };
  
  if (estado.length === 2) return estado.toUpperCase();
  return estadosBR[estado] || estado;
};

// Função para reverse geocoding (coordenadas → cidade)
const reverseGeocode = async (lat: number, lng: number): Promise<CidadeDetectada | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'User-Agent': 'AniversarianteVIP/1.0' } }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const address = data.address;
    
    const cidade = address.city || address.town || address.village || address.municipality;
    const estado = normalizarEstado(address.state || '');
    
    if (cidade && estado) {
      return { cidade, estado, origem: 'gps' };
    }
    
    return null;
  } catch (error) {
    console.error('[Geo] Erro no reverse geocoding:', error);
    return null;
  }
};

// Função para detectar por IP
const detectarPorIP = async (): Promise<CidadeDetectada | null> => {
  for (const api of IP_APIS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), IP_API_TIMEOUT);
      
      const response = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const { cidade, estado } = api.extract(data);
      
      if (cidade && estado) {
        console.log(`[Geo] Cidade detectada via ${api.name}:`, cidade, estado);
        return { 
          cidade, 
          estado: normalizarEstado(estado), 
          origem: 'ip' 
        };
      }
    } catch (error) {
      console.warn(`[Geo] Falha na API ${api.name}:`, error);
      continue;
    }
  }
  
  return null;
};

// Função para verificar se cidade tem estabelecimentos
const verificarEstabelecimentos = async (cidade: string, estado: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('estabelecimentos')
      .select('*', { count: 'exact', head: true })
      .ilike('cidade', cidade)
      .ilike('estado', estado)
      .eq('ativo', true);
    
    if (error) {
      console.error('[Geo] Erro ao verificar estabelecimentos:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('[Geo] Erro ao verificar estabelecimentos:', error);
    return 0;
  }
};

// Função para buscar cidade do perfil do usuário logado
const buscarCidadeDoPerfil = async (): Promise<CidadeDetectada | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) return null;
    
    const { data: aniversariante } = await supabase
      .from('aniversariantes')
      .select('cidade, estado')
      .eq('id', session.user.id)
      .single();
    
    if (aniversariante?.cidade && aniversariante?.estado) {
      console.log('[Geo] Cidade do perfil:', aniversariante.cidade);
      return {
        cidade: aniversariante.cidade,
        estado: aniversariante.estado,
        origem: 'perfil'
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Hook principal
export const useCidadeInteligente = (): UseCidadeInteligenteReturn => {
  const [cidadeData, setCidadeData] = useState<CidadeDetectada>({
    cidade: null,
    estado: null,
    origem: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantidadeEstabelecimentos, setQuantidadeEstabelecimentos] = useState(0);
  const [temEstabelecimentos, setTemEstabelecimentos] = useState<boolean | null>(null);

  // Salvar no localStorage
  const salvarCache = useCallback((cidade: string, estado: string, origem: CidadeDetectada['origem']) => {
    const cache = {
      cidade,
      estado,
      origem,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }, []);

  // Carregar do localStorage
  const carregarCache = useCallback((): CidadeDetectada | null => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      return {
        cidade: data.cidade,
        estado: data.estado,
        origem: 'cache'
      };
    } catch {
      return null;
    }
  }, []);

  // Detectar cidade (lógica principal)
  const detectarCidade = useCallback(async () => {
    setIsDetecting(true);
    setError(null);
    
    console.log('[Geo] Iniciando detecção de cidade...');
    
    // 1. Verificar cache primeiro (instantâneo)
    const cached = carregarCache();
    if (cached && cached.cidade && cached.estado) {
      console.log('[Geo] Cidade encontrada no cache:', cached.cidade);
      setCidadeData({ cidade: cached.cidade, estado: cached.estado, origem: 'cache' });
      
      const qtd = await verificarEstabelecimentos(cached.cidade, cached.estado);
      setQuantidadeEstabelecimentos(qtd);
      setTemEstabelecimentos(qtd > 0);
      setIsLoading(false);
      setIsDetecting(false);
      return;
    }
    
    // 2. Verificar perfil do usuário logado
    const perfilCidade = await buscarCidadeDoPerfil();
    if (perfilCidade && perfilCidade.cidade && perfilCidade.estado) {
      console.log('[Geo] Cidade encontrada no perfil:', perfilCidade.cidade);
      setCidadeData(perfilCidade);
      salvarCache(perfilCidade.cidade, perfilCidade.estado, 'perfil');
      
      const qtd = await verificarEstabelecimentos(perfilCidade.cidade, perfilCidade.estado);
      setQuantidadeEstabelecimentos(qtd);
      setTemEstabelecimentos(qtd > 0);
      setIsLoading(false);
      setIsDetecting(false);
      return;
    }
    
    // 3. Tentar GPS (mais preciso)
    if ('geolocation' in navigator) {
      try {
        console.log('[Geo] Tentando GPS...');
        
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: GPS_TIMEOUT,
            maximumAge: 300000
          });
        });
        
        const { latitude, longitude } = position.coords;
        console.log('[Geo] GPS obtido:', latitude, longitude);
        
        const cidadeGPS = await reverseGeocode(latitude, longitude);
        
        if (cidadeGPS && cidadeGPS.cidade && cidadeGPS.estado) {
          console.log('[Geo] Cidade via GPS:', cidadeGPS.cidade);
          setCidadeData(cidadeGPS);
          salvarCache(cidadeGPS.cidade, cidadeGPS.estado, 'gps');
          
          const qtd = await verificarEstabelecimentos(cidadeGPS.cidade, cidadeGPS.estado);
          setQuantidadeEstabelecimentos(qtd);
          setTemEstabelecimentos(qtd > 0);
          setIsLoading(false);
          setIsDetecting(false);
          return;
        }
      } catch (gpsError: any) {
        console.log('[Geo] GPS não disponível ou negado:', gpsError.message);
      }
    }
    
    // 4. Fallback: Detectar por IP
    console.log('[Geo] Tentando detecção por IP...');
    const cidadeIP = await detectarPorIP();
    
    if (cidadeIP && cidadeIP.cidade && cidadeIP.estado) {
      setCidadeData(cidadeIP);
      salvarCache(cidadeIP.cidade, cidadeIP.estado, 'ip');
      
      const qtd = await verificarEstabelecimentos(cidadeIP.cidade, cidadeIP.estado);
      setQuantidadeEstabelecimentos(qtd);
      setTemEstabelecimentos(qtd > 0);
      setIsLoading(false);
      setIsDetecting(false);
      return;
    }
    
    // 5. Nenhum método funcionou
    console.log('[Geo] Nenhum método de detecção funcionou');
    setError('Não foi possível detectar sua localização');
    setCidadeData({ cidade: null, estado: null, origem: null });
    setTemEstabelecimentos(null);
    setIsLoading(false);
    setIsDetecting(false);
  }, [carregarCache, salvarCache]);

  // Definir cidade manualmente
  const setCidadeManual = useCallback(async (cidade: string, estado: string) => {
    console.log('[Geo] Cidade definida manualmente:', cidade, estado);
    
    setCidadeData({ cidade, estado, origem: 'manual' });
    salvarCache(cidade, estado, 'manual');
    
    const qtd = await verificarEstabelecimentos(cidade, estado);
    setQuantidadeEstabelecimentos(qtd);
    setTemEstabelecimentos(qtd > 0);
  }, [salvarCache]);

  // Limpar cidade (forçar nova seleção)
  const limparCidade = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCidadeData({ cidade: null, estado: null, origem: null });
    setTemEstabelecimentos(null);
    setQuantidadeEstabelecimentos(0);
  }, []);

  // Redetectar cidade
  const redetectar = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    detectarCidade();
  }, [detectarCidade]);

  // Detectar ao montar
  useEffect(() => {
    detectarCidade();
  }, [detectarCidade]);

  return {
    cidade: cidadeData.cidade,
    estado: cidadeData.estado,
    origem: cidadeData.origem,
    isLoading,
    isDetecting,
    error,
    temEstabelecimentos,
    quantidadeEstabelecimentos,
    setCidadeManual,
    limparCidade,
    redetectar
  };
};

export default useCidadeInteligente;
