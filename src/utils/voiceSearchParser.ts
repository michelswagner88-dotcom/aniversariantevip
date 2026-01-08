/**
 * Parser inteligente para busca por voz
 * Analisa o texto falado e extrai categoria, subcategoria, bairro e intenção de localização
 */

interface ParsedVoiceSearch {
  searchText: string;
  categoria: string | null;
  subcategoria: string | null;
  bairro: string | null;
  usarLocalizacao: boolean;
}

// Mapeamento de palavras-chave para categorias (usando valores do banco)
const KEYWORDS_CATEGORIAS: Record<string, string[]> = {
  'Gastronomia': ['restaurante', 'restaurantes', 'comer', 'comida', 'almoço', 'jantar', 'refeição', 'café', 'cafeteria', 'cafeterias', 'cappuccino', 'lanche da tarde', 'sorvete', 'sorvetes', 'sorveteria', 'açaí', 'gelato', 'picolé', 'bolo', 'bolos', 'doce', 'doces', 'confeitaria', 'torta', 'brigadeiro'],
  'Bares': ['bar', 'bares', 'beber', 'cerveja', 'drink', 'drinks', 'chopp', 'boteco'],
  'Beleza & Estética': ['academia', 'academias', 'treino', 'treinar', 'musculação', 'exercício', 'malhar', 'salão', 'salões', 'cabelo', 'corte', 'manicure', 'unha', 'beleza', 'cabeleireiro', 'barbearia', 'barbearias', 'barba', 'barbeiro', 'massagem', 'spa', 'estética', 'tatuagem'],
  'Baladas': ['balada', 'baladas', 'noturna', 'festa', 'dançar', 'club', 'boate'],
  'Hotéis': ['hotel', 'hotéis', 'pousada', 'hostel', 'hospedagem', 'dormir'],
  'Lojas': ['loja', 'lojas', 'comprar', 'roupa', 'roupas', 'presente', 'presentes', 'shopping'],
};

// Mapeamento de palavras-chave para subcategorias/especialidades
const KEYWORDS_SUBCATEGORIAS: Record<string, { categoria: string; keywords: string[] }> = {
  // Gastronomia - Restaurantes
  'Pizzaria': { categoria: 'Gastronomia', keywords: ['pizza', 'pizzaria', 'pizzas'] },
  'Japonesa': { categoria: 'Gastronomia', keywords: ['sushi', 'japonês', 'japonesa', 'japa', 'temaki', 'sashimi'] },
  'Churrascaria': { categoria: 'Gastronomia', keywords: ['churrasco', 'churrascaria', 'carne', 'carnes', 'rodízio de carne'] },
  'Hamburgueria': { categoria: 'Gastronomia', keywords: ['hambúrguer', 'hamburger', 'burger', 'lanche', 'lanches'] },
  'Italiana': { categoria: 'Gastronomia', keywords: ['italiana', 'italiano', 'massa', 'massas', 'lasanha', 'macarrão'] },
  'Mexicana': { categoria: 'Gastronomia', keywords: ['mexicano', 'mexicana', 'taco', 'tacos', 'burrito', 'nachos'] },
  'Árabe': { categoria: 'Gastronomia', keywords: ['árabe', 'arabe', 'esfiha', 'esfirra', 'kebab', 'quibe'] },
  'Vegetariana': { categoria: 'Gastronomia', keywords: ['vegetariano', 'vegetariana', 'vegano', 'vegana', 'vegan'] },
  'Frutos do Mar': { categoria: 'Gastronomia', keywords: ['frutos do mar', 'peixe', 'camarão', 'lagosta', 'marisco'] },
  'Self-Service': { categoria: 'Gastronomia', keywords: ['self-service', 'self service', 'buffet', 'por quilo', 'kg'] },
  // Gastronomia - Cafés
  'Cafeteria': { categoria: 'Gastronomia', keywords: ['café especial', 'cappuccino', 'latte', 'cafeteria'] },
  'Confeitaria': { categoria: 'Gastronomia', keywords: ['bolo', 'bolos', 'confeitaria', 'torta', 'brigadeiro', 'doce', 'doces'] },
  // Gastronomia - Sorvetes
  'Sorvete Artesanal': { categoria: 'Gastronomia', keywords: ['sorvete artesanal', 'sorvete caseiro'] },
  'Açaí e Frozen': { categoria: 'Gastronomia', keywords: ['açaí', 'frozen', 'frozen yogurt'] },
  'Paletas e Picolés': { categoria: 'Gastronomia', keywords: ['paleta', 'paletas', 'picolé', 'picolés'] },
  // Bares
  'Cervejaria': { categoria: 'Bares', keywords: ['cervejaria', 'cerveja artesanal', 'chopp artesanal'] },
  'Coquetelaria': { categoria: 'Bares', keywords: ['coquetel', 'coquetéis', 'drinks', 'coquetelaria', 'mixologia'] },
  'Música ao Vivo': { categoria: 'Bares', keywords: ['música ao vivo', 'show', 'banda', 'ao vivo'] },
  'Pub': { categoria: 'Bares', keywords: ['pub', 'irish pub', 'english pub'] },
  'Wine Bar': { categoria: 'Bares', keywords: ['wine bar', 'vinho', 'vinhos', 'vinícola'] },
  // Beleza & Estética
  'CrossFit': { categoria: 'Beleza & Estética', keywords: ['crossfit', 'cross fit', 'cross'] },
  'Yoga': { categoria: 'Beleza & Estética', keywords: ['yoga', 'ioga'] },
  'Pilates': { categoria: 'Beleza & Estética', keywords: ['pilates'] },
  'Funcional': { categoria: 'Beleza & Estética', keywords: ['funcional', 'treino funcional'] },
  'Natação': { categoria: 'Beleza & Estética', keywords: ['natação', 'nadar', 'piscina'] },
  'Luta': { categoria: 'Beleza & Estética', keywords: ['luta', 'jiu-jitsu', 'muay thai', 'boxe', 'mma'] },
};

// Frases que indicam uso de localização
const LOCATION_KEYWORDS = [
  'perto de mim',
  'perto',
  'próximo',
  'próxima',
  'aqui perto',
  'na minha região',
  'mais perto',
  'por perto',
  'perto daqui',
  'próximo daqui',
];

export const parseVoiceSearch = (transcript: string): ParsedVoiceSearch => {
  const text = transcript.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const originalText = transcript.trim();
  
  let categoria: string | null = null;
  let subcategoria: string | null = null;
  let bairro: string | null = null;
  let usarLocalizacao = false;
  let searchText = originalText;

  // 1. Detectar se quer usar localização
  for (const keyword of LOCATION_KEYWORDS) {
    const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (text.includes(normalizedKeyword)) {
      usarLocalizacao = true;
      searchText = searchText.replace(new RegExp(keyword, 'gi'), '').trim();
      break;
    }
  }

  // 2. Detectar subcategoria primeiro (mais específico)
  for (const [subLabel, config] of Object.entries(KEYWORDS_SUBCATEGORIAS)) {
    for (const keyword of config.keywords) {
      const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (text.includes(normalizedKeyword)) {
        subcategoria = subLabel;
        categoria = config.categoria;
        searchText = searchText.replace(new RegExp(keyword, 'gi'), '').trim();
        break;
      }
    }
    if (subcategoria) break;
  }

  // 3. Se não achou subcategoria, tentar categoria
  if (!categoria) {
    for (const [catLabel, keywords] of Object.entries(KEYWORDS_CATEGORIAS)) {
      for (const keyword of keywords) {
        const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (text.includes(normalizedKeyword)) {
          categoria = catLabel;
          searchText = searchText.replace(new RegExp(keyword, 'gi'), '').trim();
          break;
        }
      }
      if (categoria) break;
    }
  }

  // 4. Detectar bairro (palavras após "no/na/em/do/da")
  const bairroMatch = text.match(/(?:no|na|em|do|da)\s+([a-z\s]+?)(?:\s|$)/i);
  if (bairroMatch) {
    const possibleBairro = bairroMatch[1].trim();
    // Verificar se não é uma categoria/subcategoria conhecida
    const allKeywords = [
      ...Object.values(KEYWORDS_CATEGORIAS).flat(),
      ...Object.values(KEYWORDS_SUBCATEGORIAS).flatMap(s => s.keywords)
    ];
    const normalizedKeywords = allKeywords.map(k => k.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    
    const isNotCategory = !normalizedKeywords.some(k => possibleBairro.includes(k));
    if (isNotCategory && possibleBairro.length > 2) {
      // Capitalizar bairro
      bairro = possibleBairro
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      searchText = searchText.replace(bairroMatch[0], '').trim();
    }
  }

  // 5. Limpar texto de busca
  searchText = searchText
    .replace(/\s+/g, ' ')
    .replace(/^(um|uma|o|a|os|as|uns|umas)\s+/i, '')
    .replace(/[.,!?]/g, '')
    .trim();

  console.log('[VoiceParser] Resultado:', {
    original: transcript,
    parsed: { searchText, categoria, subcategoria, bairro, usarLocalizacao }
  });

  return {
    searchText,
    categoria,
    subcategoria,
    bairro,
    usarLocalizacao,
  };
};
