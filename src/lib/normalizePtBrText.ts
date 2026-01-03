// =============================================================================
// NORMALIZE PT-BR TEXT - Padronização de texto em português brasileiro
// Função determinística, sem API externa
// =============================================================================

/**
 * Dicionário de correções comuns em português brasileiro
 * Foco em palavras frequentes no contexto de benefícios/estabelecimentos
 */
const DICIONARIO_CORRECOES: Record<string, string> = {
  // Acentuação comum
  beneficio: "benefício",
  beneficios: "benefícios",
  aniversario: "aniversário",
  aniversarios: "aniversários",
  gratis: "grátis",
  valido: "válido",
  valida: "válida",
  validos: "válidos",
  validas: "válidas",
  consumacao: "consumação",
  promocao: "promoção",
  promocoes: "promoções",
  excecao: "exceção",
  excecoes: "exceções",
  restricao: "restrição",
  restricoes: "restrições",
  reserva: "reserva",
  minimo: "mínimo",
  minima: "mínima",
  maximo: "máximo",
  maxima: "máxima",
  unico: "único",
  unica: "única",
  horario: "horário",
  horarios: "horários",
  sabado: "sábado",
  sabados: "sábados",
  domingo: "domingo",
  feriado: "feriado",
  feriados: "feriados",
  necessario: "necessário",
  necessaria: "necessária",
  obrigatorio: "obrigatório",
  obrigatoria: "obrigatória",
  disponivel: "disponível",
  disponiveis: "disponíveis",
  tambem: "também",
  so: "só",
  ate: "até",
  apos: "após",
  tres: "três",
  numero: "número",
  numeros: "números",
  incluido: "incluído",
  incluida: "incluída",
  nao: "não",
  entao: "então",
  sera: "será",
  serao: "serão",
  esta: "está",
  estao: "estão",
  voce: "você",
  ja: "já",
  ha: "há",
  proximo: "próximo",
  proxima: "próxima",
  proximos: "próximos",
  proximas: "próximas",
  mes: "mês",
  meses: "meses",
  dia: "dia",
  dias: "dias",
  semana: "semana",
  semanas: "semanas",
  pessoa: "pessoa",
  pessoas: "pessoas",
  bebida: "bebida",
  bebidas: "bebidas",
  refeicao: "refeição",
  refeicoes: "refeições",
  sobremesa: "sobremesa",
  sobremesas: "sobremesas",
  cortesia: "cortesia",
  cortesias: "cortesias",
  desconto: "desconto",
  descontos: "descontos",
  cupom: "cupom",
  cupons: "cupons",
  voucher: "voucher",
  vouchers: "vouchers",

  // Expressões comuns
  "semana do aniversario": "semana do aniversário",
  "mes do aniversario": "mês do aniversário",
  "dia do aniversario": "dia do aniversário",
  "nao acumulativo": "não acumulativo",
  "nao cumulativo": "não cumulativo",
  "consumacao minima": "consumação mínima",
  "reserva previa": "reserva prévia",
  "documento com foto": "documento com foto",
  "rg ou cnh": "RG ou CNH",
  "segunda a sexta": "segunda a sexta",
  "seg a sex": "segunda a sexta",
  "sabado e domingo": "sábado e domingo",
  "sab e dom": "sábado e domingo",
};

/**
 * Corrige pontuação e espaçamento
 */
function corrigirPontuacao(text: string): string {
  let result = text;

  // Remover espaço antes de pontuação
  result = result.replace(/\s+([.,;:!?])/g, "$1");

  // Adicionar espaço após pontuação (se não houver)
  result = result.replace(/([.,;:!?])([^\s\d])/g, "$1 $2");

  // Remover espaços múltiplos
  result = result.replace(/\s{2,}/g, " ");

  // Remover espaço antes de parêntese fechando
  result = result.replace(/\s+\)/g, ")");

  // Remover espaço após parêntese abrindo
  result = result.replace(/\(\s+/g, "(");

  // Corrigir % (ex: "10 %" -> "10%")
  result = result.replace(/(\d)\s+%/g, "$1%");

  // Corrigir R$ (ex: "R$ 50" -> "R$50" ou manter "R$ 50")
  result = result.replace(/R\$\s*(\d)/g, "R$ $1");

  return result;
}

/**
 * Capitaliza início de frases
 */
function capitalizarFrases(text: string): string {
  // Capitaliza primeira letra do texto
  let result = text.charAt(0).toUpperCase() + text.slice(1);

  // Capitaliza após ponto final, exclamação, interrogação
  result = result.replace(/([.!?])\s+([a-záàâãéèêíïóôõöúç])/gi, (match, punct, letter) => {
    return punct + " " + letter.toUpperCase();
  });

  return result;
}

/**
 * Aplica dicionário de correções
 */
function aplicarDicionario(text: string): string {
  let result = text;

  // Ordenar por tamanho (maior primeiro) para evitar substituições parciais
  const entries = Object.entries(DICIONARIO_CORRECOES).sort((a, b) => b[0].length - a[0].length);

  for (const [errado, correto] of entries) {
    // Criar regex case-insensitive com word boundaries
    const regex = new RegExp(`\\b${errado}\\b`, "gi");
    result = result.replace(regex, (match) => {
      // Preservar capitalização original
      if (match === match.toUpperCase()) {
        return correto.toUpperCase();
      }
      if (match[0] === match[0].toUpperCase()) {
        return correto.charAt(0).toUpperCase() + correto.slice(1);
      }
      return correto;
    });
  }

  return result;
}

/**
 * Normaliza quebras de linha
 */
function normalizarQuebrasLinha(text: string): string {
  // Substituir múltiplas quebras por uma única
  let result = text.replace(/\n{3,}/g, "\n\n");

  // Remover espaços em branco no início/fim de cada linha
  result = result
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  return result;
}

/**
 * Função principal de normalização de texto PT-BR
 *
 * @param text - Texto a ser normalizado
 * @returns Texto normalizado
 *
 * @example
 * normalizePtBrText("beneficio gratis no dia do aniversario")
 * // => "Benefício grátis no dia do aniversário"
 */
export function normalizePtBrText(text: string): string {
  if (!text || typeof text !== "string") {
    return text || "";
  }

  let result = text;

  // 1. Trim geral
  result = result.trim();

  // 2. Normalizar quebras de linha
  result = normalizarQuebrasLinha(result);

  // 3. Aplicar dicionário de correções
  result = aplicarDicionario(result);

  // 4. Corrigir pontuação e espaçamento
  result = corrigirPontuacao(result);

  // 5. Capitalizar início de frases
  result = capitalizarFrases(result);

  // 6. Trim final
  result = result.trim();

  return result;
}

/**
 * Verifica se o texto foi alterado após normalização
 */
export function hasChanges(original: string, normalized: string): boolean {
  return original !== normalized;
}

/**
 * Retorna as diferenças entre original e normalizado (para debug)
 */
export function getDiff(
  original: string,
  normalized: string,
): { original: string; normalized: string; changed: boolean } {
  return {
    original,
    normalized,
    changed: original !== normalized,
  };
}

export default normalizePtBrText;
