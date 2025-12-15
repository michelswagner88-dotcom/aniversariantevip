// Utilitários para geração automática de bio por categoria

interface DadosEstabelecimento {
  nome_fantasia?: string | null;
  categoria?: string[] | null;
  bairro?: string | null;
  cidade?: string | null;
}

/**
 * Gera uma bio automática premium baseada na categoria do estabelecimento
 * Copywriting de alta qualidade para cada segmento
 */
export const gerarBioAutomatica = (dados: DadosEstabelecimento): string => {
  const { nome_fantasia, categoria, bairro, cidade } = dados;
  
  const nome = nome_fantasia || 'Estabelecimento';
  const categoriaPrincipal = categoria?.[0] || 'Outros';
  const localizacao = bairro || cidade || 'sua região';
  
  // Bio premium por categoria
  const biosPorCategoria: Record<string, string> = {
    'Academia': `${nome} é referência em fitness em ${localizacao}. No seu aniversário, treine com benefícios exclusivos VIP!`,
    
    'Bar': `O point obrigatório em ${localizacao} para celebrar. ${nome} oferece vantagens especiais para aniversariantes!`,
    
    'Barbearia': `Estilo e atitude em ${localizacao}. ${nome} cuida do seu visual com benefícios exclusivos no seu aniversário!`,
    
    'Cafeteria': `Café especial e ambiente acolhedor em ${localizacao}. ${nome} celebra seu aniversário com você!`,
    
    'Casa Noturna': `A noite é sua em ${localizacao}! ${nome} oferece entrada VIP e benefícios exclusivos para aniversariantes!`,
    
    'Confeitaria': `Doces momentos em ${localizacao}. ${nome} torna seu aniversário ainda mais especial!`,
    
    'Entretenimento': `Diversão garantida em ${localizacao}! ${nome} tem surpresas especiais para aniversariantes!`,
    
    'Hospedagem': `Conforto e exclusividade em ${localizacao}. ${nome} celebra seu aniversário com você!`,
    
    'Loja': `${nome} em ${localizacao} tem ofertas imperdíveis para aniversariantes. Presenteie-se!`,
    
    'Restaurante': `Experiência gastronômica de referência em ${localizacao}. ${nome} celebra seu aniversário com sabor!`,
    
    'Salão de Beleza': `Beleza e bem-estar em ${localizacao}. ${nome} cuida de você com benefícios exclusivos no seu aniversário!`,
    
    'Saúde e Suplementos': `Saúde e qualidade de vida em ${localizacao}. ${nome} oferece vantagens especiais para aniversariantes!`,
    
    'Serviços': `${nome} em ${localizacao} oferece atendimento VIP para aniversariantes. Aproveite!`,
    
    'Sorveteria': `Sabores refrescantes em ${localizacao}! ${nome} adoça seu aniversário com benefícios exclusivos!`,
    
    'Outros': `${nome} em ${localizacao} tem benefícios exclusivos para aniversariantes. Venha celebrar!`,
  };
  
  return biosPorCategoria[categoriaPrincipal] || biosPorCategoria['Outros'];
};

interface BeneficioSeparado {
  titulo: string;
  validade: string;
  detalhes: string;
}

/**
 * Separa um texto de benefício legado em título, validade e detalhes
 */
export const separarBeneficio = (beneficioCompleto?: string | null): BeneficioSeparado => {
  if (!beneficioCompleto) {
    return {
      titulo: 'Benefício exclusivo para aniversariantes',
      validade: 'dia_aniversario',
      detalhes: 'Consulte as regras no estabelecimento.',
    };
  }
  
  // Tentar extrair título (primeira linha ou até primeiro ponto)
  const linhas = beneficioCompleto.split('\n').filter(l => l.trim());
  const primeiraLinha = linhas[0] || beneficioCompleto;
  
  // Título: pegar até 150 caracteres ou primeiro ponto
  const pontoIndex = primeiraLinha.indexOf('.');
  let titulo = pontoIndex > 0 && pontoIndex < 150 
    ? primeiraLinha.substring(0, pontoIndex) 
    : primeiraLinha.substring(0, 150);
  
  // Detectar validade no texto
  let validade = 'dia_aniversario';
  const textoLower = beneficioCompleto.toLowerCase();
  
  if (textoLower.includes('mês') || textoLower.includes('mes do aniversário') || textoLower.includes('mês inteiro')) {
    validade = 'mes_aniversario';
  } else if (textoLower.includes('semana') || textoLower.includes('7 dias')) {
    validade = 'semana_aniversario';
  }
  
  // Detalhes: resto do texto
  const detalhes = linhas.slice(1).join('\n').trim() || 'Consulte as regras no estabelecimento.';
  
  return {
    titulo: titulo.trim(),
    validade,
    detalhes,
  };
};

/**
 * Converte o valor de validade para texto amigável
 */
export const getValidadeTexto = (validade?: string | null): string => {
  switch (validade) {
    case 'dia_aniversario':
      return 'No dia do aniversário';
    case 'semana_aniversario':
      return 'Na semana do aniversário';
    case 'mes_aniversario':
      return 'No mês do aniversário';
    default:
      return 'No dia do aniversário';
  }
};
