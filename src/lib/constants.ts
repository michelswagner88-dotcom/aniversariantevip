// Constantes do sistema Aniversariante VIP

export const CATEGORIAS_ESTABELECIMENTO = [
  { value: "bares", label: "Bares" },
  { value: "cafeterias", label: "Cafeterias" },
  { value: "casas_noturnas", label: "Casas noturnas" },
  { value: "confeitarias", label: "Confeitarias" },
  { value: "entretenimento", label: "Entretenimento" },
  { value: "farmacias", label: "Farmácias" },
  { value: "hoteis_pousadas", label: "Hotéis / pousadas" },
  { value: "lojas", label: "Lojas" },
  { value: "restaurantes", label: "Restaurantes" },
  { value: "servicos", label: "Serviços" },
  { value: "sorveterias", label: "Sorveterias" },
] as const;

export const PERIODOS_VALIDADE = [
  { value: "dia_aniversario", label: "Dia do aniversário" },
  { value: "semana_aniversario", label: "Semana do aniversário" },
  { value: "mes_aniversario", label: "Mês do aniversário" },
] as const;

export const CONTATOS = {
  email: "contato@aniversariantevip.com.br",
  telefoneProprietario: "(48) 99999-0000", // Atualizar com o número real
  telefonePai: "(48) 99999-0001", // Atualizar com o número real
  instagram: "https://instagram.com/aniversariantevip",
  whatsapp: "(48) 99999-0000", // Atualizar com o número real
} as const;
