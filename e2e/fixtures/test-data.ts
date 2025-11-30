/**
 * Dados de teste para E2E
 */

export const testUsers = {
  aniversariante: {
    nome: 'João Silva Teste',
    email: `teste-aniversariante-${Date.now()}@example.com`,
    telefone: '(48) 99999-9999',
    senha: 'Teste@123',
    cpf: '123.456.789-09',
    dataNascimento: '15/03/1990',
    cep: '88015-100',
    numero: '123',
  },
  estabelecimento: {
    nomeFantasia: 'Restaurante Teste E2E',
    email: `teste-estabelecimento-${Date.now()}@example.com`,
    senha: 'Teste@123',
    cnpj: '12.345.678/0001-90',
    telefone: '(48) 3333-3333',
    whatsapp: '(48) 99999-8888',
  },
};

export const testEstablishment = {
  nomeFantasia: 'Bar Teste E2E',
  descricaoBeneficio: 'Desconto de 20% no total da conta',
  regrasUtilizacao: 'Válido apenas no mês de aniversário',
  periodoValidadeBeneficio: 'mes_aniversario',
  categoria: ['Bar'],
  endereco: 'Rua Teste, 123',
  cidade: 'Florianópolis',
  estado: 'SC',
};

export const testCoupon = {
  codigo: 'VIP-TEST123',
  dataEmissao: new Date().toISOString(),
  dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  usado: false,
};

/**
 * Helpers para geração de dados únicos
 */
export const generateUniqueEmail = (prefix: string = 'teste') => {
  return `${prefix}-${Date.now()}@example.com`;
};

export const generateUniqueCPF = () => {
  const random = () => Math.floor(Math.random() * 10);
  return `${random()}${random()}${random()}.${random()}${random()}${random()}.${random()}${random()}${random()}-${random()}${random()}`;
};

export const generateUniqueCNPJ = () => {
  const random = () => Math.floor(Math.random() * 10);
  return `${random()}${random()}.${random()}${random()}${random()}.${random()}${random()}${random()}/0001-${random()}${random()}`;
};
