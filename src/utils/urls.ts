/**
 * Utilitário de URLs padronizadas para navegação no site
 */

// Normalizar texto para URL (remove acentos, espaços, etc)
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Espaços viram hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
};

// Gerar URL para página de explorar
export const getExplorarUrl = (params: {
  cidade?: string;
  estado?: string;
  categoria?: string;
  subcategoria?: string;
  q?: string;
}): string => {
  const searchParams = new URLSearchParams();
  
  if (params.cidade) {
    searchParams.set('cidade', params.cidade);
  }
  if (params.estado) {
    searchParams.set('estado', params.estado);
  }
  if (params.categoria && params.categoria !== 'Todos' && params.categoria !== 'todas' && params.categoria !== '') {
    searchParams.set('categoria', params.categoria);
  }
  if (params.subcategoria) {
    searchParams.set('subcategoria', params.subcategoria);
  }
  if (params.q) {
    searchParams.set('q', params.q);
  }
  
  const queryString = searchParams.toString();
  return queryString ? `/explorar?${queryString}` : '/explorar';
};

// Gerar URL para página de estabelecimento
export const getEstabelecimentoUrl = (slug: string): string => {
  return `/estabelecimento/${slug}`;
};

// Gerar URL para categoria em cidade específica
export const getCategoriaUrl = (categoria: string, cidade?: string, estado?: string): string => {
  return getExplorarUrl({ cidade, estado, categoria });
};

// Parse URL params de volta para objeto
export const parseExplorarParams = (searchParams: URLSearchParams) => {
  return {
    cidade: searchParams.get('cidade') || '',
    estado: searchParams.get('estado') || '',
    categoria: searchParams.get('categoria') || '',
    subcategoria: searchParams.get('subcategoria') || '',
    q: searchParams.get('q') || '',
  };
};
