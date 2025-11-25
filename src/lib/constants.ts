// Constantes do sistema Aniversariante VIP

export const CATEGORIAS_ESTABELECIMENTO = [
  { value: "academia", label: "Academia", icon: "🏋️" },
  { value: "bar", label: "Bar", icon: "🍺" },
  { value: "barbearia", label: "Barbearia", icon: "✂️" },
  { value: "cafeteria", label: "Cafeteria", icon: "☕" },
  { value: "casa_noturna", label: "Casa Noturna", icon: "🎉" },
  { value: "confeitaria", label: "Confeitaria", icon: "🧁" },
  { value: "entretenimento", label: "Entretenimento", icon: "🎬" },
  { value: "hospedagem", label: "Hospedagem", icon: "🏨" },
  { value: "loja_presentes", label: "Loja de Presentes", icon: "🎁" },
  { value: "moda_acessorios", label: "Moda e Acessórios", icon: "👗" },
  { value: "restaurante", label: "Restaurante", icon: "🍽️" },
  { value: "salao_beleza", label: "Salão de Beleza", icon: "💅" },
  { value: "saude_suplementos", label: "Saúde e Suplementos", icon: "💪" },
  { value: "outros_comercios", label: "Outros Comércios", icon: "🏪" },
  { value: "servicos", label: "Serviços", icon: "🔧" },
] as const;

export const PERIODOS_VALIDADE = [
  { value: "dia_aniversario", label: "Dia do aniversário" },
  { value: "semana_aniversario", label: "Semana do aniversário" },
  { value: "mes_aniversario", label: "Mês do aniversário" },
] as const;

export const ESTADOS_CIDADES = {
  "AC": ["Rio Branco"],
  "AP": ["Macapá"],
  "AM": ["Manaus"],
  "PA": ["Belém"],
  "RO": ["Porto Velho"],
  "RR": ["Boa Vista"],
  "TO": ["Palmas"],
  "AL": ["Maceió"],
  "BA": ["Salvador"],
  "CE": ["Fortaleza"],
  "MA": ["São Luís"],
  "PB": ["João Pessoa"],
  "PE": ["Recife"],
  "PI": ["Teresina"],
  "RN": ["Natal"],
  "SE": ["Aracaju"],
  "GO": ["Goiânia"],
  "MT": ["Cuiabá"],
  "MS": ["Campo Grande"],
  "DF": ["Brasília"],
  "ES": ["Vitória"],
  "MG": ["Belo Horizonte"],
  "RJ": ["Rio de Janeiro"],
  "SP": ["São Paulo"],
  "PR": ["Curitiba"],
  "RS": ["Porto Alegre"],
  "SC": ["Balneário Camboriú", "Biguaçu", "Chapecó", "Criciúma", "Florianópolis", "Joinville", "Palhoça", "São José"],
} as const;

export const ESTADOS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;

export const CONTATOS = {
  email: "contato@aniversariantevip.com.br",
  telefoneProprietario: "(48) 99999-0000", // Atualizar com o número real
  telefonePai: "(48) 99999-0001", // Atualizar com o número real
  instagram: "https://instagram.com/aniversariantevip",
  whatsapp: "(48) 99999-0000", // Atualizar com o número real
} as const;
