import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizarInput } from '@/lib/sanitize';

interface Cidade {
  nome: string;
  estado: string;
  disponivel?: boolean;
}

interface CidadeDisponivel {
  cidade: string;
  estado: string;
}

// Cache em memória
let cidadesCache: any[] | null = null;

const getCidadesBrasil = async (): Promise<any[]> => {
  // Verificar cache em memória primeiro
  if (cidadesCache) return cidadesCache;

  // Verificar localStorage (cache de 24h)
  const cachedData = localStorage.getItem('cidades_brasil');
  const cachedTimestamp = localStorage.getItem('cidades_brasil_timestamp');
  
  if (cachedData && cachedTimestamp) {
    const now = Date.now();
    const timestamp = parseInt(cachedTimestamp);
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (now - timestamp < dayInMs) {
      cidadesCache = JSON.parse(cachedData);
      return cidadesCache;
    }
  }

  // Buscar da API do IBGE
  const response = await fetch(
    'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome'
  );
  cidadesCache = await response.json();
  
  // Salvar no localStorage
  localStorage.setItem('cidades_brasil', JSON.stringify(cidadesCache));
  localStorage.setItem('cidades_brasil_timestamp', Date.now().toString());
  
  return cidadesCache;
};

// Normalizar string removendo acentos
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const useCidadesAutocomplete = (searchTerm: string) => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar cidades que têm estabelecimentos cadastrados
  const { data: cidadesDisponiveis } = useQuery({
    queryKey: ['cidades-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estabelecimentos')
        .select('cidade, estado')
        .not('cidade', 'is', null)
        .not('estado', 'is', null);
      
      if (error) {
        console.error('Erro ao buscar cidades disponíveis:', error);
        return [];
      }

      // Criar lista única normalizada
      const cidadesUnicas = new Map<string, CidadeDisponivel>();
      data?.forEach((e) => {
        if (e.cidade && e.estado) {
          const key = `${normalizeString(e.cidade)}-${e.estado.toLowerCase()}`;
          if (!cidadesUnicas.has(key)) {
            cidadesUnicas.set(key, {
              cidade: e.cidade,
              estado: e.estado,
            });
          }
        }
      });
      
      const result = Array.from(cidadesUnicas.values());
      console.log('Cidades disponíveis no banco:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  useEffect(() => {
    // Só buscar com 3+ caracteres
    if (searchTerm.length < 3) {
      setCidades([]);
      return;
    }

    const buscarCidades = async () => {
      setIsLoading(true);
      try {
        const data = await getCidadesBrasil();
        
        // Sanitizar e normalizar termo de busca
        const searchSanitizado = sanitizarInput(searchTerm, 50);
        const searchNormalizado = normalizeString(searchSanitizado);
        console.log('Buscando por:', searchSanitizado, '(normalizado:', searchNormalizado + ')');
        
        // Filtrar pelo termo digitado (case insensitive e sem acentos)
        // Primeiro: cidades que COMEÇAM com o termo
        // Segundo: cidades que CONTÊM o termo
        const cidadesQueComecam: any[] = [];
        const cidadesQueContem: any[] = [];
        
        data.forEach((cidade: any) => {
          const cidadeNormalizada = normalizeString(cidade.nome);
          if (cidadeNormalizada.startsWith(searchNormalizado)) {
            cidadesQueComecam.push(cidade);
          } else if (cidadeNormalizada.includes(searchNormalizado)) {
            cidadesQueContem.push(cidade);
          }
        });
        
        // Combinar: primeiro as que começam, depois as que contêm
        const todasFiltradas = [...cidadesQueComecam, ...cidadesQueContem]
          .slice(0, 10) // Limitar a 10 resultados
          .map((cidade: any) => {
            const estado = cidade.microrregiao.mesorregiao.UF.sigla;
            
            // Verificar se esta cidade tem estabelecimentos
            const disponivel = cidadesDisponiveis?.some((cd) => {
              const cidadeMatch = normalizeString(cd.cidade) === normalizeString(cidade.nome);
              const estadoMatch = cd.estado.toLowerCase() === estado.toLowerCase();
              return cidadeMatch && estadoMatch;
            }) || false;

            return {
              nome: cidade.nome,
              estado,
              disponivel,
            };
          });
        
        // Ordenar: cidades disponíveis primeiro, mantendo ordem de relevância
        const filtradas = todasFiltradas.sort((a, b) => {
          // Prioridade 1: disponíveis primeiro
          if (a.disponivel && !b.disponivel) return -1;
          if (!a.disponivel && b.disponivel) return 1;
          // Prioridade 2: manter ordem original (começam > contêm)
          return 0;
        });
        
        setCidades(filtradas);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        setCidades([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce de 300ms
    const timer = setTimeout(buscarCidades, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, cidadesDisponiveis]);

  return { cidades, isLoading };
};
