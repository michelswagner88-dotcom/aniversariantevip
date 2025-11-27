import { useState, useEffect } from 'react';

interface Cidade {
  nome: string;
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

export const useCidadesAutocomplete = (searchTerm: string) => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        
        // Filtrar pelo termo digitado (case insensitive)
        const searchLower = searchTerm.toLowerCase();
        const filtradas = data
          .filter((cidade: any) => 
            cidade.nome.toLowerCase().startsWith(searchLower)
          )
          .slice(0, 10) // Limitar a 10 resultados
          .map((cidade: any) => ({
            nome: cidade.nome,
            estado: cidade.microrregiao.mesorregiao.UF.sigla,
          }));
        
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
  }, [searchTerm]);

  return { cidades, isLoading };
};
