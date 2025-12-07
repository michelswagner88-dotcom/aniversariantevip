// Utilitários para geração automática de bio e separação de benefício

interface DadosEstabelecimento {
  categoria?: string[];
  bairro?: string | null;
  cidade?: string | null;
  descricao_beneficio?: string | null;
}

/**
 * Gera uma bio automática baseada nos dados do estabelecimento
 */
export const gerarBioAutomatica = (dados: DadosEstabelecimento): string => {
  const { categoria, bairro, cidade, descricao_beneficio } = dados;
  
  const categoriaPrincipal = categoria?.[0] || 'Estabelecimento';
  const localizacao = bairro || cidade || '';
  
  // Extrair diferenciais do benefício (se houver)
  const diferenciais: string[] = [];
  
  if (descricao_beneficio) {
    const beneficioLower = descricao_beneficio.toLowerCase();
    
    if (beneficioLower.includes('climatizado')) {
      diferenciais.push('Espaço climatizado');
    }
    if (beneficioLower.includes('estacionamento')) {
      diferenciais.push('Estacionamento próprio');
    }
    if (beneficioLower.includes('wifi') || beneficioLower.includes('wi-fi')) {
      diferenciais.push('Wi-Fi gratuito');
    }
    if (beneficioLower.includes('acessível') || beneficioLower.includes('acessibilidade')) {
      diferenciais.push('Acessibilidade garantida');
    }
  }
  
  // Montar bio
  let bio = `${categoriaPrincipal}`;
  
  if (localizacao) {
    bio += ` em ${localizacao}`;
  }
  
  if (diferenciais.length > 0) {
    bio += `. ${diferenciais.join('. ')}`;
  }
  
  bio += '. Confira nosso benefício exclusivo para aniversariantes!';
  
  return bio;
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
      return 'Dia do aniversário';
    case 'semana_aniversario':
      return 'Semana do aniversário';
    case 'mes_aniversario':
      return 'Mês do aniversário';
    default:
      return 'Dia do aniversário';
  }
};
