/**
 * Sanitiza input de usuário removendo caracteres perigosos e palavras-chave SQL
 * Versão para Edge Functions (Deno)
 * @param input - String a ser sanitizada
 * @param maxLength - Tamanho máximo permitido (padrão: 100)
 * @returns String sanitizada
 */
export const sanitizarInput = (input: string, maxLength: number = 100): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/['"`;\\]/g, '')      // Remove aspas, ponto-vírgula, barras
    .replace(/--/g, '')             // Remove comentários SQL
    .replace(/\/\*/g, '')           // Remove início de comentário bloco
    .replace(/\*\//g, '')           // Remove fim de comentário bloco
    .replace(/xp_/gi, '')           // Remove comandos xp_
    .replace(/(UNION|SELECT|DROP|DELETE|UPDATE|INSERT|EXEC|ALTER|CREATE|TRUNCATE|SCRIPT|JAVASCRIPT|ONERROR|ONLOAD)/gi, '') // Remove comandos SQL e XSS
    .slice(0, maxLength);           // Limita tamanho máximo
};

/**
 * Sanitiza email removendo caracteres perigosos mas mantendo formato válido
 */
export const sanitizarEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/['"`;\\]/g, '')
    .slice(0, 255);
};

/**
 * Sanitiza código de cupom (apenas letras, números e hífens)
 */
export const sanitizarCodigoCupom = (codigo: string): string => {
  if (!codigo || typeof codigo !== 'string') return '';
  
  return codigo
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\-]/g, '') // Apenas letras, números e hífen
    .slice(0, 20);
};
