// utils/sectionTitles.ts
// Sistema de títulos com storytelling e variações criativas

interface TitleConfig {
  titulo: string;
  subtitulo?: string;
}

interface TitleVariation {
  titulos: string[];
  subtitulos: string[];
}

type TitleGenerator = (cidade?: string, count?: number) => TitleConfig;

// Função para pegar variação aleatória baseada no dia (consistente por sessão)
const getVariationIndex = (key: string, max: number): number => {
  const today = new Date().toDateString();
  const seed = `${key}-${today}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
};

// Variações criativas por categoria
const TITLE_VARIATIONS: Record<string, TitleVariation> = {
  'todos': {
    titulos: [
      'Destaques pra você',
      'Lugares incríveis te esperam',
      'Onde você vai comemorar?',
      'Os melhores benefícios',
      'Celebre do seu jeito'
    ],
    subtitulos: [
      'Escolha seu favorito',
      'Benefícios exclusivos',
      'Lugares que você vai amar',
      'Experiências únicas',
      'Feito pra você'
    ]
  },
  'restaurante': {
    titulos: [
      'Restaurantes para comemorar',
      'Onde a festa acontece',
      'Sabores que celebram você',
      'Mesa reservada pra você',
      'Gastronomia de aniversário'
    ],
    subtitulos: [
      'Celebre com quem você ama',
      'Experiências gastronômicas',
      'Do casual ao sofisticado',
      'Sabores inesquecíveis',
      'Seu dia, sua escolha'
    ]
  },
  'bar': {
    titulos: [
      'Bares para brindar',
      'O brinde é por sua conta',
      'Drinks no seu dia',
      'Happy hour de aniversário',
      'Onde o brinde é especial'
    ],
    subtitulos: [
      'Drinks e bons momentos',
      'Celebre com estilo',
      'A noite é sua',
      'Levante o copo',
      'Cheers pro niver!'
    ]
  },
  'pizzaria': {
    titulos: [
      'Pizzarias irresistíveis',
      'Pizza de aniversário',
      'Fatias de felicidade',
      'Rodízio pro niver',
      'Massa de celebração'
    ],
    subtitulos: [
      'Sabor que conquista',
      'Do forno pra festa',
      'Cada fatia é especial',
      'Pizza é sempre boa ideia',
      'Celebre com muito queijo'
    ]
  },
  'cafeteria': {
    titulos: [
      'Cafeterias aconchegantes',
      'Café com carinho',
      'Momentos doces',
      'Pausa especial de niver',
      'Aroma de celebração'
    ],
    subtitulos: [
      'Momentos especiais te esperam',
      'Aquele café diferente',
      'Doçura que você merece',
      'Café e boas vibes',
      'Um mimo pra você'
    ]
  },
  'academia': {
    titulos: [
      'Academias parceiras',
      'Treino de aniversário',
      'Comece o novo ciclo',
      'Força pra mais um ano',
      'Presente pro seu corpo'
    ],
    subtitulos: [
      'Cuide de você',
      'Novo ano, nova energia',
      'Celebre com saúde',
      'Endorfina garantida',
      'O melhor presente: saúde'
    ]
  },
  'salao': {
    titulos: [
      'Salões de beleza',
      'Visual de aniversariante',
      'Brilhe no seu dia',
      'Renovação completa',
      'Seu dia de estrela'
    ],
    subtitulos: [
      'Renove o visual',
      'Você merece esse cuidado',
      'Beleza que celebra',
      'Autoestima lá em cima',
      'Preparada pra festa'
    ]
  },
  'barbearia': {
    titulos: [
      'Barbearias estilosas',
      'Corte de aniversariante',
      'Estilo pro seu dia',
      'Barba e cabelo em dia',
      'Visual renovado'
    ],
    subtitulos: [
      'Estilo e cuidado',
      'Preparado pra festa',
      'Tradição e modernidade',
      'O melhor corte da cidade',
      'Autoestima em alta'
    ]
  },
  'spa': {
    titulos: [
      'Spas para relaxar',
      'Presente de relaxamento',
      'Day spa de niver',
      'Você merece descansar',
      'Renovação total'
    ],
    subtitulos: [
      'Você merece esse mimo',
      'Relaxe e celebre',
      'Paz e tranquilidade',
      'Energia renovada',
      'Momento só seu'
    ]
  },
  'casa-noturna': {
    titulos: [
      'Noites inesquecíveis',
      'Baladas de aniversário',
      'A festa é sua',
      'Onde a magia acontece',
      'Noite épica garantida'
    ],
    subtitulos: [
      'Diversão garantida',
      'A pista te espera',
      'Celebre dançando',
      'Leve a galera toda',
      'Uma noite pra lembrar'
    ]
  },
  'confeitaria': {
    titulos: [
      'Confeitarias irresistíveis',
      'Doces de aniversário',
      'Açúcar e celebração',
      'Bolos que encantam',
      'Sobremesas especiais'
    ],
    subtitulos: [
      'Doces momentos',
      'Celebre com açúcar',
      'O doce do seu dia',
      'Delícias pra você',
      'Sobremesa garantida'
    ]
  },
  'hospedagem': {
    titulos: [
      'Hotéis e pousadas',
      'Estadias de presente',
      'Niver fora de casa',
      'Experiência de hospedagem',
      'Seu refúgio especial'
    ],
    subtitulos: [
      'Estadias especiais',
      'Descanso merecido',
      'Viaje no seu niver',
      'Conforto garantido',
      'Uma experiência única'
    ]
  },
  'entretenimento': {
    titulos: [
      'Diversão garantida',
      'Experiências únicas',
      'Aventuras de niver',
      'Momentos memoráveis',
      'Entretenimento especial'
    ],
    subtitulos: [
      'Diversão pra todos',
      'Celebre brincando',
      'Experiências incríveis',
      'Alegria garantida',
      'Pura diversão'
    ]
  },
  'loja': {
    titulos: [
      'Lojas parceiras',
      'Presente de niver',
      'Se presenteie',
      'Compras de aniversário',
      'Descontos especiais'
    ],
    subtitulos: [
      'Pra você ou pra presentear',
      'Você merece um mimo',
      'Escolha o seu presente',
      'Economia garantida',
      'Compre com vantagem'
    ]
  },
  'sorveteria': {
    titulos: [
      'Sorveterias refrescantes',
      'Doce gelado de niver',
      'Refresque a celebração',
      'Sorvete no seu dia',
      'Delícias geladas'
    ],
    subtitulos: [
      'Doçura pra qualquer momento',
      'Refresque-se com estilo',
      'Gelado e especial',
      'O sabor da festa',
      'Sempre cai bem'
    ]
  },
  'servicos': {
    titulos: [
      'Serviços especiais',
      'Experiências exclusivas',
      'Benefícios únicos',
      'Serviços de niver',
      'Vantagens especiais'
    ],
    subtitulos: [
      'Benefícios exclusivos',
      'Praticidade pra você',
      'Feito pro seu dia',
      'Aproveite as vantagens',
      'Serviços diferenciados'
    ]
  }
};

// Títulos com cidade incluída
const getCityTitle = (base: string, cidade: string): string => {
  const variations = [
    `${base} em ${cidade}`,
    `${cidade}: ${base}`,
    `Os melhores de ${cidade}`,
    `${base} - ${cidade}`,
  ];
  return variations[getVariationIndex(cidade, variations.length)];
};

// Subtítulos com contagem
const getCountSubtitle = (count: number, cidade?: string): string => {
  const variations = cidade ? [
    `${count} lugares te esperando em ${cidade}`,
    `${count} opções incríveis em ${cidade}`,
    `Explore ${count} benefícios em ${cidade}`,
    `${count} estabelecimentos prontos pra você`
  ] : [
    `${count} lugares com benefícios especiais`,
    `${count} opções te esperando`,
    `Explore ${count} parceiros`,
    `${count} benefícios pra você`
  ];
  return variations[getVariationIndex('count', variations.length)];
};

export const SECTION_TITLES: Record<string, TitleGenerator> = {
  // Gera títulos dinâmicos baseados nas variações
  ...Object.fromEntries(
    Object.entries(TITLE_VARIATIONS).map(([key, variations]) => [
      key,
      (cidade?: string, count?: number): TitleConfig => {
        const titleIndex = getVariationIndex(key + '-title', variations.titulos.length);
        const subtitleIndex = getVariationIndex(key + '-sub', variations.subtitulos.length);
        
        let titulo = variations.titulos[titleIndex];
        let subtitulo = variations.subtitulos[subtitleIndex];
        
        // Adiciona cidade se disponível
        if (cidade && key !== 'todos') {
          subtitulo = `Os melhores de ${cidade}`;
        } else if (cidade && key === 'todos') {
          titulo = getCityTitle('Destaques', cidade);
        }
        
        // Adiciona contagem se disponível
        if (count && count > 0) {
          subtitulo = getCountSubtitle(count, cidade);
        }
        
        return { titulo, subtitulo };
      }
    ])
  ),
  
  // Aliases
  'salao-de-beleza': (cidade, count) => SECTION_TITLES['salao'](cidade, count),
  'loja-de-presentes': (cidade, count) => SECTION_TITLES['loja'](cidade, count),
  'moda-e-acessorios': (cidade, count) => SECTION_TITLES['loja'](cidade, count),
  'saude-e-suplementos': (cidade, count) => ({
    titulo: 'Saúde e Bem-estar',
    subtitulo: cidade ? `Cuide de você em ${cidade}` : 'O melhor presente: sua saúde'
  }),
  'outros-comercios': () => ({
    titulo: 'Mais lugares incríveis',
    subtitulo: 'Benefícios esperando você'
  }),
  
  // === SEÇÕES ESPECIAIS ===
  
  'destaques': (cidade, count) => {
    const titulos = [
      'Em alta agora',
      'Os mais procurados',
      'Favoritos da galera',
      'Top escolhas',
      'Queridinhos da semana'
    ];
    const idx = getVariationIndex('destaques', titulos.length);
    return {
      titulo: cidade ? `${titulos[idx]} em ${cidade}` : titulos[idx],
      subtitulo: count ? `${count} lugares bombando` : 'Todo mundo está indo'
    };
  },
  
  'novos': () => {
    const titulos = ['Novos parceiros', 'Recém-chegados', 'Acabou de chegar', 'Novidades da semana'];
    const subtitulos = ['Seja dos primeiros', 'Experimente antes de todo mundo', 'Fresco na plataforma'];
    const tIdx = getVariationIndex('novos-t', titulos.length);
    const sIdx = getVariationIndex('novos-s', subtitulos.length);
    return { titulo: titulos[tIdx], subtitulo: subtitulos[sIdx] };
  },
  
  'populares': () => {
    const titulos = ['Os mais buscados', 'Favoritos absolutos', 'Campeões de acesso'];
    const subtitulos = ['Aprovado pela galera', 'Todo mundo vai', 'Não dá pra perder'];
    const tIdx = getVariationIndex('populares-t', titulos.length);
    const sIdx = getVariationIndex('populares-s', subtitulos.length);
    return { titulo: titulos[tIdx], subtitulo: subtitulos[sIdx] };
  },
  
  'perto': (cidade) => ({
    titulo: cidade ? `Pertinho de você em ${cidade}` : 'Pertinho de você',
    subtitulo: 'Benefícios a poucos passos'
  }),
  
  'promocao': () => ({
    titulo: 'Promoções relâmpago',
    subtitulo: 'Corra antes que acabe!'
  }),
  
  'romantico': () => ({
    titulo: 'Para um momento a dois',
    subtitulo: 'Celebre o amor junto'
  }),
  
  'grupo': () => ({
    titulo: 'Leve a galera toda',
    subtitulo: 'Perfeito pra comemorar em grupo'
  }),
  
  'familia': () => ({
    titulo: 'Diversão em família',
    subtitulo: 'Pra todas as idades'
  }),
  
  'pet-friendly': () => ({
    titulo: 'Seu pet é VIP também',
    subtitulo: 'Lugares que amam bichinhos'
  }),
  
  'super-beneficio': () => ({
    titulo: 'Super benefícios',
    subtitulo: 'As melhores ofertas do momento'
  }),
  
  'gratuito': () => ({
    titulo: '100% grátis',
    subtitulo: 'Celebre sem gastar nada'
  })
};

// Função para normalizar chave de categoria
const normalizeKey = (categoria: string): string => {
  return categoria
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
};

// Função para obter título
export const getSectionTitle = (
  categoria: string,
  cidade?: string,
  count?: number
): TitleConfig => {
  const key = normalizeKey(categoria);
  const generator = SECTION_TITLES[key] || SECTION_TITLES['todos'];
  return generator(cidade, count);
};

// Função para obter apenas o título
export const getCategoryTitle = (categoria: string, cidade?: string): string => {
  return getSectionTitle(categoria, cidade).titulo;
};

// Função para obter apenas o subtítulo
export const getCategorySubtitle = (categoria: string, cidade?: string): string | undefined => {
  return getSectionTitle(categoria, cidade).subtitulo;
};
