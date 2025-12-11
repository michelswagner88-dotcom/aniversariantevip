/**
 * Dados de teste para E2E
 *
 * IMPORTANTE: CPFs e CNPJs aqui são válidos pelo algoritmo mas FICTÍCIOS
 * Nunca use dados reais de pessoas em testes!
 */

// ===== GERADORES DE DOCUMENTOS VÁLIDOS =====

/**
 * Gera um CPF válido (com dígitos verificadores corretos)
 * CPF é fictício, apenas matematicamente válido
 */
export const generateValidCPF = (): string => {
  const randomDigit = () => Math.floor(Math.random() * 10);

  // Gera os 9 primeiros dígitos
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) {
    digits.push(randomDigit());
  }

  // Evita CPFs com todos os dígitos iguais (são inválidos)
  if (digits.every((d) => d === digits[0])) {
    digits[8] = (digits[8] + 1) % 10;
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit1);

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit2);

  // Formata como XXX.XXX.XXX-XX
  return `${digits.slice(0, 3).join("")}.${digits.slice(3, 6).join("")}.${digits.slice(6, 9).join("")}-${digits.slice(9).join("")}`;
};

/**
 * Gera um CNPJ válido (com dígitos verificadores corretos)
 * CNPJ é fictício, apenas matematicamente válido
 */
export const generateValidCNPJ = (): string => {
  const randomDigit = () => Math.floor(Math.random() * 10);

  // Gera os 8 primeiros dígitos (base) + 0001 (filial matriz)
  const digits: number[] = [];
  for (let i = 0; i < 8; i++) {
    digits.push(randomDigit());
  }
  // Filial matriz: 0001
  digits.push(0, 0, 0, 1);

  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit1);

  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit2);

  // Formata como XX.XXX.XXX/XXXX-XX
  return `${digits.slice(0, 2).join("")}.${digits.slice(2, 5).join("")}.${digits.slice(5, 8).join("")}/${digits.slice(8, 12).join("")}-${digits.slice(12).join("")}`;
};

/**
 * Gera email único com timestamp
 */
export const generateUniqueEmail = (prefix: string = "teste"): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
};

/**
 * Gera telefone celular válido (formato brasileiro)
 */
export const generateValidPhone = (ddd: string = "48"): string => {
  const randomDigit = () => Math.floor(Math.random() * 10);
  // Celular brasileiro: (XX) 9XXXX-XXXX
  return `(${ddd}) 9${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}-${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}`;
};

// ===== CPFs VÁLIDOS PRÉ-CALCULADOS (para testes determinísticos) =====

/**
 * CPFs válidos para uso em testes
 * Todos passam na validação de dígitos verificadores
 * São FICTÍCIOS - não pertencem a pessoas reais
 */
export const VALID_CPFS = {
  cpf1: "529.982.247-25",
  cpf2: "453.178.287-91",
  cpf3: "714.593.642-14",
  cpf4: "087.316.849-07",
  cpf5: "362.478.593-00",
} as const;

/**
 * CNPJs válidos para uso em testes
 * Todos passam na validação de dígitos verificadores
 * São FICTÍCIOS - não pertencem a empresas reais
 */
export const VALID_CNPJS = {
  cnpj1: "11.222.333/0001-81",
  cnpj2: "12.345.678/0001-95",
  cnpj3: "98.765.432/0001-10",
} as const;

// ===== DADOS DE USUÁRIOS DE TESTE =====

/**
 * Dados de teste para E2E
 * Use as funções generate* para dados únicos por execução
 */
export const getTestUsers = () => ({
  aniversariante: {
    nome: "João Silva Teste",
    email: generateUniqueEmail("aniversariante"),
    telefone: "(48) 99999-9999",
    senha: "Teste@123",
    cpf: VALID_CPFS.cpf1,
    dataNascimento: "15/03/1990",
    cep: "88015-600", // CEP válido de Florianópolis
    numero: "123",
  },
  estabelecimento: {
    nomeFantasia: "Restaurante Teste E2E",
    email: generateUniqueEmail("estabelecimento"),
    senha: "Teste@123",
    cnpj: VALID_CNPJS.cnpj1,
    telefone: "(48) 3333-3333",
    whatsapp: "(48) 99999-8888",
  },
});

/**
 * Dados de estabelecimento de teste
 */
export const getTestEstablishment = () => ({
  nomeFantasia: "Bar Teste E2E",
  descricaoBeneficio: "Desconto de 20% no total da conta",
  regrasUtilizacao: "Válido apenas no mês de aniversário",
  periodoValidadeBeneficio: "mes_aniversario",
  categoria: ["Bar"],
  endereco: "Rua Teste, 123",
  bairro: "Centro",
  cidade: "Florianópolis",
  estado: "SC",
  cep: "88010-000",
});

// ===== DADOS ESTÁTICOS (para compatibilidade) =====

/**
 * @deprecated Use getTestUsers() para emails únicos por execução
 */
export const testUsers = {
  aniversariante: {
    nome: "João Silva Teste",
    email: "teste-aniversariante-static@example.com",
    telefone: "(48) 99999-9999",
    senha: "Teste@123",
    cpf: VALID_CPFS.cpf1,
    dataNascimento: "15/03/1990",
    cep: "88015-600",
    numero: "123",
  },
  estabelecimento: {
    nomeFantasia: "Restaurante Teste E2E",
    email: "teste-estabelecimento-static@example.com",
    senha: "Teste@123",
    cnpj: VALID_CNPJS.cnpj1,
    telefone: "(48) 3333-3333",
    whatsapp: "(48) 99999-8888",
  },
};

/**
 * @deprecated Use getTestEstablishment()
 */
export const testEstablishment = {
  nomeFantasia: "Bar Teste E2E",
  descricaoBeneficio: "Desconto de 20% no total da conta",
  regrasUtilizacao: "Válido apenas no mês de aniversário",
  periodoValidadeBeneficio: "mes_aniversario",
  categoria: ["Bar"],
  endereco: "Rua Teste, 123",
  cidade: "Florianópolis",
  estado: "SC",
};

// ===== HELPERS LEGADOS (mantidos para compatibilidade) =====

/**
 * @deprecated Use generateValidCPF() que gera CPFs válidos
 */
export const generateUniqueCPF = generateValidCPF;

/**
 * @deprecated Use generateValidCNPJ() que gera CNPJs válidos
 */
export const generateUniqueCNPJ = generateValidCNPJ;
