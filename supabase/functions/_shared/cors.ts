export const DOMINIOS_PERMITIDOS = [
  'https://aniversariantevip.com.br',
  'https://www.aniversariantevip.com.br',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080', // Lovable preview
];

export const validarOrigem = (request: Request): boolean => {
  const origin = request.headers.get('origin');
  
  // Se não tem origin (chamada direta/servidor), permitir
  if (!origin) return true;
  
  return DOMINIOS_PERMITIDOS.includes(origin);
};

export const getCorsHeaders = (request: Request): Record<string, string> => {
  const origin = request.headers.get('origin');
  
  // Se origem está na lista, retornar ela; senão, retornar o domínio principal
  const allowedOrigin = DOMINIOS_PERMITIDOS.includes(origin || '') 
    ? (origin || DOMINIOS_PERMITIDOS[0])
    : DOMINIOS_PERMITIDOS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
};
