import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Tipos
interface CidadeDetectada {
  cidade: string | null;
  estado: string | null;
  origem: "cache" | "gps" | "ip" | "perfil" | "manual" | null;
}

interface UseCidadeInteligenteReturn {
  cidade: string | null;
  estado: string | null;
  origem: CidadeDetectada["origem"];
  isLoading: boolean;
  isDetecting: boolean;
  error: string | null;
  temEstabelecimentos: boolean | null;
  quantidadeEstabelecimentos: number;
  // Novos campos para fallback de capital
  usouFallbackCapital: boolean;
  cidadeOriginal: string | null; // Cidade detectada antes do fallback
  setCidadeManual: (cidade: string, estado: string) => void;
  limparCidade: () => void;
  redetectar: () => void;
}

// Constantes
const STORAGE_KEY = "aniversariante_cidade_selecionada";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
const GPS_TIMEOUT = 10000; // 10 segundos
const IP_API_TIMEOUT = 5000; // 5 segundos
const SAFETY_TIMEOUT = 15000; // 15 segundos - timeout de segurança

// Estados brasileiros válidos para validação de localização
const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// Mapeamento de capitais por estado
const CAPITAIS_BR: Record<string, string> = {
  AC: "Rio Branco",
  AL: "Maceió",
  AP: "Macapá",
  AM: "Manaus",
  BA: "Salvador",
  CE: "Fortaleza",
  DF: "Brasília",
  ES: "Vitória",
  GO: "Goiânia",
  MA: "São Luís",
  MT: "Cuiabá",
  MS: "Campo Grande",
  MG: "Belo Horizonte",
  PA: "Belém",
  PB: "João Pessoa",
  PR: "Curitiba",
  PE: "Recife",
  PI: "Teresina",
  RJ: "Rio de Janeiro",
  RN: "Natal",
  RS: "Porto Alegre",
  RO: "Porto Velho",
  RR: "Boa Vista",
  SC: "Florianópolis",
  SP: "São Paulo",
  SE: "Aracaju",
  TO: "Palmas",
};

// Obter capital do estado
const getCapitalDoEstado = (estado: string): string | null => {
  const estadoNormalizado = estado.length === 2 ? estado.toUpperCase() : normalizarEstado(estado);
  return CAPITAIS_BR[estadoNormalizado] || null;
};

// Função para verificar se é localização brasileira
const isBrazilianLocation = (estado: string): boolean => {
  if (!estado) return false;
  const normalizado = estado.length === 2 ? estado.toUpperCase() : normalizarEstado(estado);
  return ESTADOS_BR.includes(normalizado.toUpperCase());
};

// APIs de IP (fallback chain) - incluindo validação de país
const IP_APIS = [
  {
    name: "ipapi.co",
    url: "https://ipapi.co/json/",
    extract: (data: any) => ({
      cidade: data.city,
      estado: data.region_code,
      pais: data.country_code, // BR, US, etc
    }),
  },
  {
    name: "ipwho.is",
    url: "https://ipwho.is/",
    extract: (data: any) => ({
      cidade: data.city,
      estado: data.region,
      pais: data.country_code,
    }),
  },
  {
    name: "ipapi.is",
    url: "https://api.ipapi.is/",
    extract: (data: any) => ({
      cidade: data.location?.city,
      estado: data.location?.state,
      pais: data.location?.country_code,
    }),
  },
];

// Função para converter sigla do estado brasileiro
const normalizarEstado = (estado: string): string => {
  const estadosBR: Record<string, string> = {
    Acre: "AC",
    Alagoas: "AL",
    Amapá: "AP",
    Amazonas: "AM",
    Bahia: "BA",
    Ceará: "CE",
    "Distrito Federal": "DF",
    "Espírito Santo": "ES",
    Goiás: "GO",
    Maranhão: "MA",
    "Mato Grosso": "MT",
    "Mato Grosso do Sul": "MS",
    "Minas Gerais": "MG",
    Pará: "PA",
    Paraíba: "PB",
    Paraná: "PR",
    Pernambuco: "PE",
    Piauí: "PI",
    "Rio de Janeiro": "RJ",
    "Rio Grande do Norte": "RN",
    "Rio Grande do Sul": "RS",
    Rondônia: "RO",
    Roraima: "RR",
    "Santa Catarina": "SC",
    "São Paulo": "SP",
    Sergipe: "SE",
    Tocantins: "TO",
  };

  if (estado.length === 2) return estado.toUpperCase();
  return estadosBR[estado] || estado;
};

// Função para reverse geocoding (coordenadas → cidade)
const reverseGeocode = async (lat: number, lng: number): Promise<CidadeDetectada | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "User-Agent": "AniversarianteVIP/1.0" } },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address;

    // Validar país primeiro
    const pais = address.country_code?.toUpperCase();
    if (pais && pais !== "BR") {
      console.log("[Geo] GPS retornou país estrangeiro:", pais);
      return null;
    }

    const cidade = address.city || address.town || address.village || address.municipality;
    const estado = normalizarEstado(address.state || "");

    // VALIDAÇÃO: Só retornar se for localização brasileira
    if (cidade && estado && isBrazilianLocation(estado)) {
      return { cidade, estado, origem: "gps" };
    }

    console.log("[Geo] Localização GPS não-brasileira ignorada:", cidade, estado);
    return null;
  } catch (error) {
    console.error("[Geo] Erro no reverse geocoding:", error);
    return null;
  }
};

// Função para detectar por IP - COM VALIDAÇÃO DE PAÍS INTERNA
const detectarPorIP = async (): Promise<CidadeDetectada | null> => {
  for (const api of IP_APIS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), IP_API_TIMEOUT);

      const response = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const { cidade, estado, pais } = api.extract(data);

      // VALIDAÇÃO CRÍTICA: Verificar país ANTES de retornar
      if (pais && pais.toUpperCase() !== "BR") {
        console.log(`[Geo] ${api.name} retornou país estrangeiro:`, pais, "- ignorando");
        continue; // Tentar próxima API
      }

      if (cidade && estado) {
        const estadoNormalizado = normalizarEstado(estado);

        // VALIDAÇÃO DUPLA: Verificar se estado é brasileiro
        if (!isBrazilianLocation(estadoNormalizado)) {
          console.log(`[Geo] ${api.name} retornou estado não-brasileiro:`, estado, "- ignorando");
          continue;
        }

        console.log(`[Geo] Cidade brasileira detectada via ${api.name}:`, cidade, estadoNormalizado);
        return {
          cidade,
          estado: estadoNormalizado,
          origem: "ip",
        };
      }
    } catch (error) {
      console.warn(`[Geo] Falha na API ${api.name}:`, error);
      continue;
    }
  }

  // Nenhuma API retornou localização brasileira válida
  console.log("[Geo] Nenhuma API retornou localização brasileira válida");
  return null;
};

// Função para verificar se cidade tem estabelecimentos
const verificarEstabelecimentos = async (cidade: string, estado: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("estabelecimentos")
      .select("*", { count: "exact", head: true })
      .ilike("cidade", cidade)
      .ilike("estado", estado)
      .eq("ativo", true);

    if (error) {
      console.error("[Geo] Erro ao verificar estabelecimentos:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[Geo] Erro ao verificar estabelecimentos:", error);
    return 0;
  }
};

// Função para encontrar melhor cidade (cidade do usuário ou capital do estado)
const encontrarMelhorCidade = async (
  cidadeOriginal: string,
  estado: string,
): Promise<{ cidade: string; estado: string; usouFallback: boolean; qtdEstabelecimentos: number }> => {
  const estadoNormalizado = estado.length === 2 ? estado.toUpperCase() : normalizarEstado(estado);
  const capital = getCapitalDoEstado(estadoNormalizado);

  // 1. Tentar cidade original primeiro
  const qtdOriginal = await verificarEstabelecimentos(cidadeOriginal, estadoNormalizado);

  if (qtdOriginal > 0) {
    console.log(`[Geo] Cidade ${cidadeOriginal} tem ${qtdOriginal} estabelecimentos`);
    return {
      cidade: cidadeOriginal,
      estado: estadoNormalizado,
      usouFallback: false,
      qtdEstabelecimentos: qtdOriginal,
    };
  }

  // 2. Não tem na cidade - usar capital do estado (SEMPRE terá estabelecimentos)
  if (capital) {
    // Se a cidade original JÁ É a capital, retorna ela mesmo (sem fallback)
    if (capital.toLowerCase() === cidadeOriginal.toLowerCase()) {
      console.log(`[Geo] Cidade ${cidadeOriginal} é a capital, sem estabelecimentos ainda`);
      return {
        cidade: cidadeOriginal,
        estado: estadoNormalizado,
        usouFallback: false,
        qtdEstabelecimentos: 0,
      };
    }

    const qtdCapital = await verificarEstabelecimentos(capital, estadoNormalizado);
    console.log(`[Geo] Fallback para capital ${capital} com ${qtdCapital} estabelecimentos`);

    return {
      cidade: capital,
      estado: estadoNormalizado,
      usouFallback: true,
      qtdEstabelecimentos: qtdCapital,
    };
  }

  // 3. Sem capital mapeada (não deveria acontecer) - retorna cidade original
  return {
    cidade: cidadeOriginal,
    estado: estadoNormalizado,
    usouFallback: false,
    qtdEstabelecimentos: 0,
  };
};

// Função para buscar cidade do perfil do usuário logado
const buscarCidadeDoPerfil = async (): Promise<CidadeDetectada | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return null;

    const { data: aniversariante } = await supabase
      .from("aniversariantes")
      .select("cidade, estado")
      .eq("id", session.user.id)
      .maybeSingle();

    if (aniversariante?.cidade && aniversariante?.estado) {
      console.log("[Geo] Cidade do perfil:", aniversariante.cidade);
      return {
        cidade: aniversariante.cidade,
        estado: aniversariante.estado,
        origem: "perfil",
      };
    }

    return null;
  } catch (error) {
    return null;
  }
};

// Função SÍNCRONA para carregar cache (instantâneo)
const getCachedCity = (): CidadeDetectada | null => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);

    // Verificar expiração do cache
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // VALIDAR: Verificar se a cidade em cache é brasileira
    if (data.estado && !isBrazilianLocation(data.estado)) {
      console.log("[Geo] Cidade estrangeira em cache removida:", data.cidade, data.estado);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      cidade: data.cidade,
      estado: data.estado,
      origem: "cache",
    };
  } catch {
    return null;
  }
};

// Salvar no cache
const saveToCache = (cidade: string, estado: string, origem: CidadeDetectada["origem"]) => {
  // VALIDAÇÃO: Só salvar se for brasileiro
  if (!isBrazilianLocation(estado)) {
    console.log("[Geo] Tentativa de salvar cidade estrangeira bloqueada:", cidade, estado);
    return;
  }

  const cache = {
    cidade,
    estado,
    origem,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
};

// Hook principal
export const useCidadeInteligente = (): UseCidadeInteligenteReturn => {
  const [cidadeData, setCidadeData] = useState<CidadeDetectada>({
    cidade: null,
    estado: null,
    origem: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantidadeEstabelecimentos, setQuantidadeEstabelecimentos] = useState(0);
  const [temEstabelecimentos, setTemEstabelecimentos] = useState<boolean | null>(null);

  // Novos estados para fallback de capital
  const [usouFallbackCapital, setUsouFallbackCapital] = useState(false);
  const [cidadeOriginal, setCidadeOriginal] = useState<string | null>(null);

  // Refs para controle de execução única
  const hasInitialized = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar cidade (lógica principal)
  const detectarCidadeAsync = useCallback(async () => {
    try {
      setIsDetecting(true);
      setError(null);
      setUsouFallbackCapital(false);
      setCidadeOriginal(null);

      // 1. Verificar perfil do usuário logado
      const perfilCidade = await buscarCidadeDoPerfil();
      if (perfilCidade && perfilCidade.cidade && perfilCidade.estado) {
        // Verificar se tem estabelecimentos ou fazer fallback
        const resultado = await encontrarMelhorCidade(perfilCidade.cidade, perfilCidade.estado);

        setCidadeOriginal(perfilCidade.cidade);
        setUsouFallbackCapital(resultado.usouFallback);
        setCidadeData({
          cidade: resultado.cidade,
          estado: resultado.estado,
          origem: "perfil",
        });
        saveToCache(resultado.cidade, resultado.estado, "perfil");
        setQuantidadeEstabelecimentos(resultado.qtdEstabelecimentos);
        setTemEstabelecimentos(resultado.qtdEstabelecimentos > 0);
        return;
      }

      // 2. Tentar GPS (mais preciso)
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: GPS_TIMEOUT,
              maximumAge: 300000,
            });
          });

          const { latitude, longitude } = position.coords;
          const cidadeGPS = await reverseGeocode(latitude, longitude);

          if (cidadeGPS && cidadeGPS.cidade && cidadeGPS.estado) {
            // Verificar se tem estabelecimentos ou fazer fallback para capital
            const resultado = await encontrarMelhorCidade(cidadeGPS.cidade, cidadeGPS.estado);

            setCidadeOriginal(cidadeGPS.cidade);
            setUsouFallbackCapital(resultado.usouFallback);
            setCidadeData({
              cidade: resultado.cidade,
              estado: resultado.estado,
              origem: "gps",
            });
            saveToCache(resultado.cidade, resultado.estado, "gps");
            setQuantidadeEstabelecimentos(resultado.qtdEstabelecimentos);
            setTemEstabelecimentos(resultado.qtdEstabelecimentos > 0);
            return;
          }
        } catch (gpsError: any) {
          // GPS não disponível ou negado - continuar para IP
        }
      }

      // 3. Fallback: Detectar por IP (já valida internamente se é BR)
      const cidadeIP = await detectarPorIP();

      if (cidadeIP && cidadeIP.cidade && cidadeIP.estado) {
        // Verificar se tem estabelecimentos ou fazer fallback para capital
        const resultado = await encontrarMelhorCidade(cidadeIP.cidade, cidadeIP.estado);

        setCidadeOriginal(cidadeIP.cidade);
        setUsouFallbackCapital(resultado.usouFallback);
        setCidadeData({
          cidade: resultado.cidade,
          estado: resultado.estado,
          origem: "ip",
        });
        saveToCache(resultado.cidade, resultado.estado, "ip");
        setQuantidadeEstabelecimentos(resultado.qtdEstabelecimentos);
        setTemEstabelecimentos(resultado.qtdEstabelecimentos > 0);
        return;
      }

      // 4. Nenhum método funcionou - fallback para São Paulo (maior cobertura)
      console.log("[Geo] Não foi possível detectar localização - usando São Paulo como padrão");

      const qtdSP = await verificarEstabelecimentos("São Paulo", "SP");

      setCidadeOriginal(null);
      setUsouFallbackCapital(true); // Indica que usou fallback
      setCidadeData({ cidade: "São Paulo", estado: "SP", origem: "ip" });
      saveToCache("São Paulo", "SP", "ip");
      setQuantidadeEstabelecimentos(qtdSP);
      setTemEstabelecimentos(qtdSP > 0);
    } catch (err) {
      console.error("[Geo] Erro na detecção:", err);
      setError("Erro ao detectar localização");
    } finally {
      setIsLoading(false);
      setIsDetecting(false);

      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    }
  }, []);

  // Definir cidade manualmente
  const setCidadeManual = useCallback(async (cidade: string, estado: string) => {
    // Verificar se tem estabelecimentos ou fazer fallback
    const resultado = await encontrarMelhorCidade(cidade, estado);

    setCidadeOriginal(cidade);
    setUsouFallbackCapital(resultado.usouFallback);
    setCidadeData({ cidade: resultado.cidade, estado: resultado.estado, origem: "manual" });
    saveToCache(resultado.cidade, resultado.estado, "manual");
    setQuantidadeEstabelecimentos(resultado.qtdEstabelecimentos);
    setTemEstabelecimentos(resultado.qtdEstabelecimentos > 0);
  }, []);

  // Limpar cidade
  const limparCidade = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCidadeData({ cidade: null, estado: null, origem: null });
    setTemEstabelecimentos(null);
    setQuantidadeEstabelecimentos(0);
    setUsouFallbackCapital(false);
    setCidadeOriginal(null);
  }, []);

  // Redetectar cidade
  const redetectar = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsLoading(true);
    hasInitialized.current = false;

    const cached = getCachedCity();
    if (cached && cached.cidade && cached.estado) {
      setCidadeData(cached);
      setIsLoading(false);
      verificarEstabelecimentos(cached.cidade, cached.estado).then((qtd) => {
        setQuantidadeEstabelecimentos(qtd);
        setTemEstabelecimentos(qtd > 0);
      });
    } else {
      detectarCidadeAsync();
    }
  }, [detectarCidadeAsync]);

  // Inicialização - executa APENAS uma vez
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Timeout de segurança
    safetyTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setIsDetecting(false);
    }, SAFETY_TIMEOUT);

    // 1. Tentar carregar do cache primeiro
    const cached = getCachedCity();

    if (cached && cached.cidade && cached.estado) {
      setCidadeData(cached);
      setIsLoading(false);

      verificarEstabelecimentos(cached.cidade, cached.estado).then((qtd) => {
        setQuantidadeEstabelecimentos(qtd);
        setTemEstabelecimentos(qtd > 0);
      });

      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }

      return;
    }

    // 2. Sem cache - fazer detecção assíncrona
    detectarCidadeAsync();

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, [detectarCidadeAsync]);

  return {
    cidade: cidadeData.cidade,
    estado: cidadeData.estado,
    origem: cidadeData.origem,
    isLoading,
    isDetecting,
    error,
    temEstabelecimentos,
    quantidadeEstabelecimentos,
    // Novos campos
    usouFallbackCapital,
    cidadeOriginal,
    // Funções
    setCidadeManual,
    limparCidade,
    redetectar,
  };
};

export default useCidadeInteligente;
