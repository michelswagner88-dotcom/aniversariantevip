/**
 * Traduz erros técnicos do banco de dados para mensagens amigáveis em português
 * @param error - Objeto de erro ou string de erro
 * @returns Mensagem amigável em português
 */
export const getFriendlyErrorMessage = (error: any): string => {
  // Converte o erro para string para facilitar a análise
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || error?.error_description || error?.error || JSON.stringify(error);
  
  const errorLower = errorMessage.toLowerCase();

  // CPF Duplicado
  if (errorLower.includes('aniversariantes_cpf_key') || 
      (errorLower.includes('duplicate key') && errorLower.includes('cpf'))) {
    return 'Este CPF já está cadastrado. Se for você, tente fazer login.';
  }

  // CNPJ Duplicado
  if (errorLower.includes('estabelecimentos_cnpj_key') || 
      errorLower.includes('establishments_cnpj_key') ||
      (errorLower.includes('duplicate key') && errorLower.includes('cnpj'))) {
    return 'Este CNPJ já possui um cadastro. Entre em contato com o suporte se precisar de ajuda.';
  }

  // E-mail Duplicado
  if (errorLower.includes('users_email_key') || 
      errorLower.includes('user already registered') ||
      errorLower.includes('email already') ||
      errorLower.includes('duplicate key') && errorLower.includes('email')) {
    return 'Este e-mail já está em uso. Tente recuperar sua senha.';
  }

  // Credenciais Inválidas (Login)
  if (errorLower.includes('invalid login credentials') ||
      errorLower.includes('invalid credentials') ||
      errorLower.includes('email not confirmed')) {
    return 'E-mail ou senha incorretos. Verifique e tente novamente.';
  }

  // Erro de Validação de Constraint
  if (errorLower.includes('violates check constraint') ||
      errorLower.includes('check constraint')) {
    return 'Algum dado inserido não é válido. Verifique os campos.';
  }

  // Erro de Foreign Key (relacionamento)
  if (errorLower.includes('foreign key constraint') ||
      errorLower.includes('violates foreign key')) {
    return 'Erro de relacionamento de dados. Entre em contato com o suporte.';
  }

  // Erro de Sessão/Autenticação
  if (errorLower.includes('session') && errorLower.includes('expired')) {
    return 'Sua sessão expirou. Faça login novamente.';
  }

  // Erro de Rede
  if (errorLower.includes('network') || 
      errorLower.includes('fetch failed') ||
      errorLower.includes('failed to fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Erro de Timeout
  if (errorLower.includes('timeout')) {
    return 'A operação demorou muito. Tente novamente.';
  }

  // Erro de Permissão
  if (errorLower.includes('permission denied') ||
      errorLower.includes('not authorized') ||
      errorLower.includes('insufficient permissions')) {
    return 'Você não tem permissão para realizar esta ação.';
  }

  // Erro de Token/JWT
  if (errorLower.includes('jwt') || 
      errorLower.includes('token') && errorLower.includes('invalid')) {
    return 'Sessão inválida. Faça login novamente.';
  }

  // Erro de Row Level Security
  if (errorLower.includes('row level security') ||
      errorLower.includes('policy') && errorLower.includes('violated')) {
    return 'Acesso negado. Você não tem permissão para acessar este recurso.';
  }

  // Senha muito curta
  if (errorLower.includes('password') && 
      (errorLower.includes('short') || errorLower.includes('at least'))) {
    return 'Senha deve ter pelo menos 6 caracteres.';
  }

  // Email inválido
  if (errorLower.includes('email') && errorLower.includes('invalid')) {
    return 'E-mail inválido. Verifique o formato.';
  }

  // Limite de taxa (rate limit)
  if (errorLower.includes('rate limit') || 
      errorLower.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }

  // Fallback: Erro genérico (nunca mostra erro técnico)
  console.error('Erro não mapeado:', errorMessage);
  return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
};

/**
 * Utilitário para extrair código de erro HTTP se disponível
 */
export const getErrorCode = (error: any): number | null => {
  if (error?.status) return error.status;
  if (error?.response?.status) return error.response.status;
  if (error?.code && typeof error.code === 'number') return error.code;
  return null;
};

/**
 * Verifica se é um erro de rede
 */
export const isNetworkError = (error: any): boolean => {
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || '';
  return errorMessage.toLowerCase().includes('network') || 
         errorMessage.toLowerCase().includes('fetch failed');
};
