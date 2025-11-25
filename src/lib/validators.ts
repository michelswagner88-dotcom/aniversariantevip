/**
 * Validadores robustos para documentos brasileiros (CPF e CNPJ)
 * Implementam o cálculo oficial de Módulo 11 da Receita Federal
 */

/**
 * Remove caracteres não numéricos de uma string
 */
const cleanDocument = (doc: string): string => {
  return doc.replace(/\D/g, '');
};

/**
 * Verifica se todos os dígitos são iguais (sequências inválidas)
 */
const hasAllEqualDigits = (doc: string): boolean => {
  return doc.split('').every(digit => digit === doc[0]);
};

/**
 * Calcula dígito verificador usando Módulo 11
 */
const calculateVerifierDigit = (digits: number[], weights: number[]): number => {
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

/**
 * Valida CPF usando o algoritmo oficial de Módulo 11
 * @param cpf - CPF com ou sem formatação
 * @returns true se CPF é válido, false caso contrário
 */
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cleanDocument(cpf);
  
  // CPF deve ter exatamente 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Rejeita sequências de dígitos iguais (111.111.111-11, etc)
  if (hasAllEqualDigits(cleanCPF)) {
    return false;
  }
  
  // Extrai os 9 primeiros dígitos
  const digits = cleanCPF.substring(0, 9).split('').map(Number);
  
  // Calcula primeiro dígito verificador
  const weights1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit1 = calculateVerifierDigit(digits, weights1);
  
  // Calcula segundo dígito verificador
  const weights2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit2 = calculateVerifierDigit([...digits, digit1], weights2);
  
  // Verifica se os dígitos calculados coincidem com os informados
  const providedDigits = cleanCPF.substring(9);
  const calculatedDigits = `${digit1}${digit2}`;
  
  return providedDigits === calculatedDigits;
};

/**
 * Valida CNPJ usando o algoritmo oficial de Módulo 11
 * @param cnpj - CNPJ com ou sem formatação
 * @returns true se CNPJ é válido, false caso contrário
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cleanDocument(cnpj);
  
  // CNPJ deve ter exatamente 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }
  
  // Rejeita sequências de dígitos iguais
  if (hasAllEqualDigits(cleanCNPJ)) {
    return false;
  }
  
  // Extrai os 12 primeiros dígitos
  const digits = cleanCNPJ.substring(0, 12).split('').map(Number);
  
  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit1 = calculateVerifierDigit(digits, weights1);
  
  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit2 = calculateVerifierDigit([...digits, digit1], weights2);
  
  // Verifica se os dígitos calculados coincidem com os informados
  const providedDigits = cleanCNPJ.substring(12);
  const calculatedDigits = `${digit1}${digit2}`;
  
  return providedDigits === calculatedDigits;
};

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export const formatCPF = (cpf: string): string => {
  const clean = cleanDocument(cpf);
  if (clean.length <= 11) {
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return clean.substring(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Formata CNPJ para o padrão 00.000.000/0000-00
 */
export const formatCNPJ = (cnpj: string): string => {
  const clean = cleanDocument(cnpj);
  if (clean.length <= 14) {
    return clean
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  return clean.substring(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

/**
 * Tipo para resposta da BrasilAPI de CNPJ
 */
export interface BrasilAPICNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  data_inicio_atividade: string;
  data_situacao_cadastral: string;
  tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string;
  situacao_cadastral: string;
  situacao_especial: string;
  data_situacao_especial: string;
}

/**
 * Interface para dados em cache
 */
interface CachedCNPJData {
  data: BrasilAPICNPJResponse;
  timestamp: number;
}

/**
 * Tempo de validade do cache (7 dias em milissegundos)
 */
const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000;

/**
 * Salva dados de CNPJ no cache local
 */
const saveCNPJToCache = (cnpj: string, data: BrasilAPICNPJResponse): void => {
  try {
    const cacheKey = `cnpj_cache_${cnpj}`;
    const cachedData: CachedCNPJData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cachedData));
  } catch (error) {
    console.warn('Erro ao salvar CNPJ no cache:', error);
  }
};

/**
 * Recupera dados de CNPJ do cache local
 * @returns Dados do cache ou null se não existir ou estiver expirado
 */
const getCNPJFromCache = (cnpj: string): BrasilAPICNPJResponse | null => {
  try {
    const cacheKey = `cnpj_cache_${cnpj}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const cachedData: CachedCNPJData = JSON.parse(cached);
    const isExpired = Date.now() - cachedData.timestamp > CACHE_EXPIRY_TIME;
    
    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return cachedData.data;
  } catch (error) {
    console.warn('Erro ao recuperar CNPJ do cache:', error);
    return null;
  }
};

/**
 * Consulta CNPJ na BrasilAPI com cache local
 * @param cnpj - CNPJ limpo (apenas números)
 * @returns Dados da empresa ou null se não encontrado
 */
export const fetchCNPJData = async (cnpj: string): Promise<BrasilAPICNPJResponse | null> => {
  const cleanCNPJ = cleanDocument(cnpj);
  
  if (!validateCNPJ(cleanCNPJ)) {
    throw new Error('CNPJ inválido. Verifique os dígitos verificadores.');
  }
  
  // Verifica cache primeiro
  const cachedData = getCNPJFromCache(cleanCNPJ);
  if (cachedData) {
    console.log('CNPJ encontrado no cache local');
    return cachedData;
  }
  
  // Se não estiver no cache, busca na API
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado na Receita Federal ou Inativo.');
      }
      throw new Error('Erro ao consultar CNPJ. Tente novamente.');
    }
    
    const data: BrasilAPICNPJResponse = await response.json();
    
    // Verifica se a empresa está ativa
    if (data.situacao_cadastral !== 'ATIVA') {
      throw new Error(`Empresa com situação cadastral: ${data.situacao_cadastral}. Apenas empresas ativas podem se cadastrar.`);
    }
    
    // Salva no cache
    saveCNPJToCache(cleanCNPJ, data);
    
    return data;
  } catch (error: any) {
    console.error('Erro ao buscar CNPJ:', error);
    throw error;
  }
};

/**
 * Verifica se um CPF já existe no banco de dados
 */
export const checkCPFExists = async (cpf: string, supabase: any): Promise<boolean> => {
  const cleanCPF = cleanDocument(cpf);
  const { data } = await supabase
    .from('aniversariantes')
    .select('id')
    .eq('cpf', cleanCPF)
    .single();
  
  return !!data;
};

/**
 * Verifica se um CNPJ já existe no banco de dados
 */
export const checkCNPJExists = async (cnpj: string, supabase: any): Promise<boolean> => {
  const cleanCNPJ = cleanDocument(cnpj);
  const { data } = await supabase
    .from('estabelecimentos')
    .select('id')
    .eq('cnpj', cleanCNPJ)
    .single();
  
  return !!data;
};
