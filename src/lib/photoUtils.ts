/**
 * Utilitários para seleção e validação de fotos de estabelecimentos
 */

// Tipos de foto do Google Places
export type PhotoType = 'COVER' | 'INTERIOR' | 'EXTERIOR' | 'FOOD' | 'DRINK' | 'MENU' | 'OTHER';

export interface GooglePhoto {
  url: string;
  width: number;
  height: number;
  type?: PhotoType;
  attributions?: string[];
}

// Placeholders por categoria (URLs de imagens geradas)
export const PLACEHOLDERS_POR_CATEGORIA: Record<string, string> = {
  'restaurante': '/images/placeholders/restaurante.jpg',
  'bar': '/images/placeholders/bar.jpg',
  'academia': '/images/placeholders/academia.jpg',
  'salao de beleza': '/images/placeholders/salao.jpg',
  'salao': '/images/placeholders/salao.jpg',
  'cafeteria': '/images/placeholders/cafeteria.jpg',
  'pizzaria': '/images/placeholders/pizzaria.jpg',
  'barbearia': '/images/placeholders/barbearia.jpg',
  'sorveteria': '/images/placeholders/sorveteria.jpg',
  'confeitaria': '/images/placeholders/confeitaria.jpg',
  'casa noturna': '/images/placeholders/bar.jpg',
  'hospedagem': '/images/placeholders/hospedagem.jpg',
  'loja': '/images/placeholders/loja.jpg',
  'loja de presentes': '/images/placeholders/loja.jpg',
  'moda e acessorios': '/images/placeholders/loja.jpg',
  'entretenimento': '/images/placeholders/entretenimento.jpg',
  'saude e suplementos': '/images/placeholders/saude.jpg',
  'servicos': '/images/placeholders/servicos.jpg',
  'outros comercios': '/images/placeholders/estabelecimento.jpg',
  'default': '/images/placeholders/estabelecimento.jpg'
};

/**
 * Valida se uma URL de foto é válida (não é logo, ícone, etc)
 */
export function validarUrlFoto(url: string | null | undefined): boolean {
  if (!url) return false;
  
  const urlLower = url.toLowerCase();
  
  // Ignorar URLs que parecem ser logos ou ícones
  const blacklist = [
    'logo', 
    'icon', 
    'favicon', 
    'map', 
    'streetview', 
    'screenshot', 
    'qr',
    'placeholder',
    'avatar',
    'profile',
    'thumbnail'
  ];
  
  return !blacklist.some(term => urlLower.includes(term));
}

/**
 * Seleciona a melhor foto de um array de fotos do Google Places
 */
export function selecionarMelhorFoto(fotos: GooglePhoto[]): string | null {
  if (!fotos || fotos.length === 0) return null;

  // Filtrar fotos inválidas
  const fotosValidas = fotos.filter(foto => {
    // Tamanho mínimo
    if (foto.width < 400 || foto.height < 300) return false;
    
    // Proporção aceitável (entre 1:1 e 16:9)
    const ratio = foto.width / foto.height;
    if (ratio < 0.8 || ratio > 2.0) return false;
    
    // Ignorar fotos muito quadradas pequenas (provavelmente logos)
    if (foto.width < 500 && foto.height < 500 && ratio > 0.9 && ratio < 1.1) return false;
    
    // Validar URL
    if (!validarUrlFoto(foto.url)) return false;
    
    return true;
  });

  if (fotosValidas.length === 0) return null;

  // Priorizar por tipo
  const prioridade: PhotoType[] = ['COVER', 'EXTERIOR', 'INTERIOR', 'FOOD', 'DRINK', 'OTHER'];
  
  for (const tipo of prioridade) {
    const fotoTipo = fotosValidas.find(f => f.type === tipo);
    if (fotoTipo) return fotoTipo.url;
  }

  // Se não tem tipo, pegar a maior (provavelmente melhor qualidade)
  const maiorFoto = fotosValidas.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
  return maiorFoto.url;
}

/**
 * Normaliza uma categoria para usar como chave no mapa de placeholders
 */
function normalizarCategoria(categoria: string): string {
  return categoria
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

/**
 * Obtém o placeholder correto para uma categoria
 */
export function getPlaceholderPorCategoria(categoria: string | string[] | null | undefined): string {
  if (!categoria) return PLACEHOLDERS_POR_CATEGORIA['default'];
  
  const cat = Array.isArray(categoria) ? categoria[0] : categoria;
  if (!cat) return PLACEHOLDERS_POR_CATEGORIA['default'];
  
  const categoriaKey = normalizarCategoria(cat);
  
  return PLACEHOLDERS_POR_CATEGORIA[categoriaKey] || PLACEHOLDERS_POR_CATEGORIA['default'];
}

/**
 * Obtém a melhor foto para um estabelecimento com fallback inteligente
 */
export function getFotoEstabelecimento(
  fotoUpload: string | null | undefined,
  fotoGoogle: string | null | undefined,
  galeriaFotos: string[] | null | undefined,
  categoria: string | string[] | null | undefined
): string {
  // 1. Prioridade: foto que o estabelecimento fez upload (logo_url)
  if (fotoUpload && validarUrlFoto(fotoUpload)) {
    return fotoUpload;
  }
  
  // 2. Primeira foto da galeria (se válida)
  if (galeriaFotos && galeriaFotos.length > 0) {
    const primeiraFotoValida = galeriaFotos.find(foto => validarUrlFoto(foto));
    if (primeiraFotoValida) {
      return primeiraFotoValida;
    }
  }
  
  // 3. Foto do Google (se válida)
  if (fotoGoogle && validarUrlFoto(fotoGoogle)) {
    return fotoGoogle;
  }
  
  // 4. Fallback: placeholder da categoria
  return getPlaceholderPorCategoria(categoria);
}

/**
 * Verifica se uma foto é válida (não é placeholder)
 */
export function isFotoReal(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Verificar se é um placeholder
  const placeholders = Object.values(PLACEHOLDERS_POR_CATEGORIA);
  if (placeholders.some(p => url.includes(p) || p.includes(url))) {
    return false;
  }
  
  return validarUrlFoto(url);
}
