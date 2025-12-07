// Placeholders por categoria - imagens gratuitas do Unsplash
const FOTOS_CATEGORIA: Record<string, string> = {
  'restaurante': '/images/placeholders/restaurante.jpg',
  'academia': '/images/placeholders/academia.jpg',
  'barbearia': '/images/placeholders/barbearia.jpg',
  'bar': '/images/placeholders/bar.jpg',
  'salão de beleza': '/images/placeholders/salao.jpg',
  'salao de beleza': '/images/placeholders/salao.jpg',
  'salão': '/images/placeholders/salao.jpg',
  'salao': '/images/placeholders/salao.jpg',
  'hospedagem': '/images/placeholders/hospedagem.jpg',
  'hotel': '/images/placeholders/hospedagem.jpg',
  'pousada': '/images/placeholders/hospedagem.jpg',
  'cafeteria': '/images/placeholders/cafeteria.jpg',
  'café': '/images/placeholders/cafeteria.jpg',
  'cafe': '/images/placeholders/cafeteria.jpg',
  'padaria': '/images/placeholders/confeitaria.jpg',
  'confeitaria': '/images/placeholders/confeitaria.jpg',
  'pizzaria': '/images/placeholders/pizzaria.jpg',
  'sorveteria': '/images/placeholders/sorveteria.jpg',
  'loja': '/images/placeholders/loja.jpg',
  'loja de presentes': '/images/placeholders/loja.jpg',
  'moda e acessórios': '/images/placeholders/loja.jpg',
  'saúde e suplementos': '/images/placeholders/saude.jpg',
  'saude e suplementos': '/images/placeholders/saude.jpg',
  'saúde': '/images/placeholders/saude.jpg',
  'saude': '/images/placeholders/saude.jpg',
  'entretenimento': '/images/placeholders/entretenimento.jpg',
  'casa noturna': '/images/placeholders/bar.jpg',
  'serviços': '/images/placeholders/servicos.jpg',
  'servicos': '/images/placeholders/servicos.jpg',
  'outros comércios': '/images/placeholders/estabelecimento.jpg',
  'outros comercios': '/images/placeholders/estabelecimento.jpg',
  'default': '/images/placeholders/estabelecimento.jpg',
};

interface EstabelecimentoFoto {
  logo_url?: string | null;
  galeria_fotos?: string[] | null;
  categoria?: string[] | null;
}

/**
 * Retorna a melhor foto disponível para o estabelecimento
 * Ordem de prioridade:
 * 1. logo_url (foto do Google já salva)
 * 2. Primeira foto da galeria
 * 3. Placeholder da categoria
 */
export const getFotoEstabelecimento = (estabelecimento: EstabelecimentoFoto): string => {
  // 1º - Logo URL (já buscada e salva)
  if (estabelecimento.logo_url && estabelecimento.logo_url.trim() !== '') {
    return estabelecimento.logo_url;
  }

  // 2º - Galeria de fotos
  if (estabelecimento.galeria_fotos && estabelecimento.galeria_fotos.length > 0) {
    const primeiraFoto = estabelecimento.galeria_fotos[0];
    if (primeiraFoto && primeiraFoto.trim() !== '') {
      return primeiraFoto;
    }
  }

  // 3º - Placeholder da categoria (GRATUITO)
  return getPlaceholderCategoria(estabelecimento.categoria);
};

/**
 * Retorna o placeholder apropriado para a categoria
 */
export const getPlaceholderCategoria = (categoria?: string[] | null): string => {
  if (!categoria || categoria.length === 0) {
    return FOTOS_CATEGORIA['default'];
  }

  const categoriaLower = categoria[0].toLowerCase();

  // Buscar match exato ou parcial
  const categoriaMatch = Object.keys(FOTOS_CATEGORIA).find(
    cat => categoriaLower.includes(cat) || cat.includes(categoriaLower)
  );

  return FOTOS_CATEGORIA[categoriaMatch || 'default'];
};

/**
 * Retorna todas as fotos disponíveis para galeria
 */
export const getGaleriaEstabelecimento = (estabelecimento: EstabelecimentoFoto): string[] => {
  const fotos: string[] = [];

  // Adicionar logo como primeira foto
  if (estabelecimento.logo_url && estabelecimento.logo_url.trim() !== '') {
    fotos.push(estabelecimento.logo_url);
  }

  // Adicionar galeria
  if (estabelecimento.galeria_fotos && estabelecimento.galeria_fotos.length > 0) {
    const fotosValidas = estabelecimento.galeria_fotos.filter(
      foto => foto && foto.trim() !== ''
    );
    fotos.push(...fotosValidas);
  }

  // Se não tem nenhuma, usar placeholder
  if (fotos.length === 0) {
    fotos.push(getFotoEstabelecimento(estabelecimento));
  }

  // Remover duplicatas
  return [...new Set(fotos)];
};

/**
 * Verifica se o estabelecimento tem foto real (não placeholder)
 */
export const temFotoReal = (estabelecimento: EstabelecimentoFoto): boolean => {
  if (estabelecimento.logo_url && estabelecimento.logo_url.trim() !== '') {
    return true;
  }
  if (estabelecimento.galeria_fotos && estabelecimento.galeria_fotos.length > 0) {
    return estabelecimento.galeria_fotos.some(foto => foto && foto.trim() !== '');
  }
  return false;
};
