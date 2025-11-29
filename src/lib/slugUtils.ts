/**
 * Gera slug a partir de um texto
 */
export const generateSlug = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífen do início e fim
};

/**
 * Gera URL amigável completa do estabelecimento
 */
export const getEstabelecimentoUrl = (estabelecimento: {
  estado?: string | null;
  cidade?: string | null;
  slug?: string | null;
  id?: string;
}): string => {
  const { estado, cidade, slug, id } = estabelecimento;
  
  if (estado && cidade && slug) {
    const estadoSlug = estado.toLowerCase();
    const cidadeSlug = generateSlug(cidade);
    return `/${estadoSlug}/${cidadeSlug}/${slug}`;
  }
  
  // Fallback para URL antiga se não tiver slug
  return `/estabelecimento/${id}`;
};

/**
 * Extrai parâmetros da URL amigável
 */
export const parseEstabelecimentoUrl = (
  estado: string,
  cidade: string,
  slug: string
) => ({
  estado: estado.toUpperCase(),
  cidade,
  slug,
});
