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
  
  console.log('🔗 getEstabelecimentoUrl chamado:', { estado, cidade, slug, id });
  
  if (estado && cidade && slug) {
    const estadoSlug = estado.toLowerCase();
    const cidadeSlug = generateSlug(cidade);
    const url = `/${estadoSlug}/${cidadeSlug}/${slug}`;
    console.log('✅ URL amigável gerada:', url);
    return url;
  }
  
  // Fallback para URL antiga se não tiver slug
  const fallbackUrl = `/estabelecimento/${id}`;
  console.log('⚠️ Usando fallback URL (sem slug):', fallbackUrl);
  return fallbackUrl;
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
