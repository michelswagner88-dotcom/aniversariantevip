// Sistema oficial de Categorias e Subcategorias - AniversarianteVIP

export interface Subcategoria {
  id: string;
  label: string;
  icon: string;
}

export interface Categoria {
  id: string;
  label: string;        // Singular (para cards, perfil, cadastro)
  plural: string;       // Plural (para filtros/pills)
  icon: string;
  subcategorias: Subcategoria[];
}

export const CATEGORIAS: Categoria[] = [
  {
    id: 'academia',
    label: 'Academia',
    plural: 'Academias',
    icon: '💪',
    subcategorias: [
      { id: 'musculacao', label: 'Musculação', icon: '🏋️' },
      { id: 'crossfit', label: 'CrossFit', icon: '🏃' },
      { id: 'funcional', label: 'Funcional', icon: '🔥' },
      { id: 'pilates', label: 'Pilates', icon: '🧘' },
      { id: 'yoga', label: 'Yoga', icon: '🧘‍♀️' },
      { id: 'natacao', label: 'Natação', icon: '🏊' },
      { id: 'artes-marciais', label: 'Artes Marciais', icon: '🥊' },
      { id: 'danca', label: 'Dança', icon: '💃' },
      { id: 'spinning', label: 'Spinning', icon: '🚴' },
      { id: 'hidroginastica', label: 'Hidroginástica', icon: '🏊‍♀️' },
      { id: 'personal-trainer', label: 'Personal Trainer', icon: '🏃‍♂️' },
      { id: 'outros-academia', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'bar',
    label: 'Bar',
    plural: 'Bares',
    icon: '🍻',
    subcategorias: [
      { id: 'cervejaria', label: 'Cervejaria', icon: '🍺' },
      { id: 'coquetelaria', label: 'Coquetelaria', icon: '🍸' },
      { id: 'wine-bar', label: 'Wine Bar', icon: '🍷' },
      { id: 'karaoke-bar', label: 'Karaokê', icon: '🎤' },
      { id: 'sports-bar', label: 'Sports Bar', icon: '⚽' },
      { id: 'boteco', label: 'Boteco', icon: '🍻' },
      { id: 'musica-ao-vivo', label: 'Música ao Vivo', icon: '🎵' },
      { id: 'rooftop', label: 'Rooftop', icon: '🌃' },
      { id: 'pub', label: 'Pub', icon: '🍺' },
      { id: 'petiscos', label: 'Petiscos', icon: '🥨' },
      { id: 'happy-hour', label: 'Happy Hour', icon: '🕐' },
      { id: 'outros-bar', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'barbearia',
    label: 'Barbearia',
    plural: 'Barbearias',
    icon: '💈',
    subcategorias: [
      { id: 'corte-masculino', label: 'Corte Masculino', icon: '✂️' },
      { id: 'barba', label: 'Barba', icon: '🧔' },
      { id: 'pigmentacao', label: 'Pigmentação', icon: '🎨' },
      { id: 'tratamentos-barb', label: 'Tratamentos', icon: '💆‍♂️' },
      { id: 'relaxamento', label: 'Relaxamento', icon: '🧴' },
      { id: 'hidratacao', label: 'Hidratação', icon: '💧' },
      { id: 'platinado', label: 'Platinado', icon: '⚪' },
      { id: 'outros-barbearia', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'cafeteria',
    label: 'Cafeteria',
    plural: 'Cafeterias',
    icon: '☕',
    subcategorias: [
      { id: 'cafe-especial', label: 'Café Especial', icon: '☕' },
      { id: 'brunch', label: 'Brunch', icon: '🥞' },
      { id: 'doces-cafe', label: 'Doces', icon: '🍰' },
      { id: 'salgados-cafe', label: 'Salgados', icon: '🥐' },
      { id: 'cafe-colonial', label: 'Café Colonial', icon: '🧁' },
      { id: 'chas', label: 'Chás', icon: '🍵' },
      { id: 'acai-cafe', label: 'Açaí', icon: '🫐' },
      { id: 'sucos', label: 'Sucos', icon: '🧃' },
      { id: 'lanches', label: 'Lanches', icon: '🥪' },
      { id: 'outros-cafeteria', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'casa-noturna',
    label: 'Casa Noturna',
    plural: 'Casas Noturnas',
    icon: '🎉',
    subcategorias: [
      { id: 'balada', label: 'Balada', icon: '🪩' },
      { id: 'shows-ao-vivo', label: 'Shows ao Vivo', icon: '🎤' },
      { id: 'eletronica', label: 'Eletrônica', icon: '🎧' },
      { id: 'sertanejo', label: 'Sertanejo', icon: '🤠' },
      { id: 'funk', label: 'Funk', icon: '🎶' },
      { id: 'pagode', label: 'Pagode', icon: '🥁' },
      { id: 'samba', label: 'Samba', icon: '💃' },
      { id: 'reggae', label: 'Reggae', icon: '🟢' },
      { id: 'rock', label: 'Rock', icon: '🎸' },
      { id: 'pop', label: 'Pop', icon: '🎵' },
      { id: 'festa-tematica', label: 'Festa Temática', icon: '🎭' },
      { id: 'outros-noturna', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'confeitaria',
    label: 'Confeitaria',
    plural: 'Confeitarias',
    icon: '🎂',
    subcategorias: [
      { id: 'bolos', label: 'Bolos', icon: '🎂' },
      { id: 'salgados-conf', label: 'Salgados', icon: '🥟' },
      { id: 'doces-finos', label: 'Doces Finos', icon: '🍬' },
      { id: 'tortas', label: 'Tortas', icon: '🥧' },
      { id: 'sobremesas', label: 'Sobremesas', icon: '🍮' },
      { id: 'cupcakes', label: 'Cupcakes', icon: '🧁' },
      { id: 'brownies', label: 'Brownies', icon: '🍫' },
      { id: 'cookies', label: 'Cookies', icon: '🍪' },
      { id: 'bolos-decorados', label: 'Bolos Decorados', icon: '🎀' },
      { id: 'outros-confeitaria', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'entretenimento',
    label: 'Entretenimento',
    plural: 'Entretenimento',
    icon: '🎮',
    subcategorias: [
      { id: 'cinema', label: 'Cinema', icon: '🎬' },
      { id: 'boliche', label: 'Boliche', icon: '🎳' },
      { id: 'escape-room', label: 'Escape Room', icon: '🔐' },
      { id: 'parque', label: 'Parque', icon: '🎢' },
      { id: 'jogos', label: 'Jogos', icon: '🎮' },
      { id: 'karaoke', label: 'Karaokê', icon: '🎙️' },
      { id: 'teatro', label: 'Teatro', icon: '🎭' },
      { id: 'fliperama', label: 'Fliperama', icon: '👾' },
      { id: 'laser-tag', label: 'Laser Tag', icon: '🔫' },
      { id: 'kart', label: 'Kart', icon: '🏎️' },
      { id: 'paintball', label: 'Paintball', icon: '🎯' },
      { id: 'outros-entretenimento', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'hospedagem',
    label: 'Hospedagem',
    plural: 'Hospedagem',
    icon: '🏨',
    subcategorias: [
      { id: 'hotel', label: 'Hotel', icon: '🏨' },
      { id: 'pousada', label: 'Pousada', icon: '🏡' },
      { id: 'resort', label: 'Resort', icon: '🏝️' },
      { id: 'day-use', label: 'Day Use', icon: '☀️' },
      { id: 'spa-hosp', label: 'Spa', icon: '🧖' },
      { id: 'hostel', label: 'Hostel', icon: '🛏️' },
      { id: 'flat', label: 'Flat', icon: '🏢' },
      { id: 'chale', label: 'Chalé', icon: '🏔️' },
      { id: 'camping', label: 'Camping', icon: '⛺' },
      { id: 'outros-hospedagem', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'loja',
    label: 'Loja',
    plural: 'Lojas',
    icon: '🛍️',
    subcategorias: [
      { id: 'roupas', label: 'Roupas', icon: '👗' },
      { id: 'calcados', label: 'Calçados', icon: '👟' },
      { id: 'cosmeticos', label: 'Cosméticos', icon: '🧴' },
      { id: 'acessorios', label: 'Acessórios', icon: '👜' },
      { id: 'presentes', label: 'Presentes', icon: '🎁' },
      { id: 'eletronicos', label: 'Eletrônicos', icon: '📱' },
      { id: 'decoracao', label: 'Decoração', icon: '🏠' },
      { id: 'joias', label: 'Joias', icon: '💍' },
      { id: 'bolsas', label: 'Bolsas', icon: '👜' },
      { id: 'oculos', label: 'Óculos', icon: '👓' },
      { id: 'perfumaria', label: 'Perfumaria', icon: '🌸' },
      { id: 'chocolates', label: 'Chocolates', icon: '🍫' },
      { id: 'flores', label: 'Flores', icon: '💐' },
      { id: 'pet-shop', label: 'Pet Shop', icon: '🐾' },
      { id: 'suplementos', label: 'Suplementos', icon: '💪' },
      { id: 'brinquedos', label: 'Brinquedos', icon: '🧸' },
      { id: 'papelaria', label: 'Papelaria', icon: '📝' },
      { id: 'livraria', label: 'Livraria', icon: '📚' },
      { id: 'sex-shop', label: 'Sex Shop', icon: '❤️‍🔥' },
      { id: 'outros-loja', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'restaurante',
    label: 'Restaurante',
    plural: 'Restaurantes',
    icon: '🍽️',
    subcategorias: [
      { id: 'pizzaria', label: 'Pizzaria', icon: '🍕' },
      { id: 'churrascaria', label: 'Churrascaria', icon: '🥩' },
      { id: 'japonesa', label: 'Japonesa', icon: '🍣' },
      { id: 'hamburguer', label: 'Hambúrguer', icon: '🍔' },
      { id: 'italiana', label: 'Italiana', icon: '🍝' },
      { id: 'brasileira', label: 'Brasileira', icon: '🍛' },
      { id: 'mexicana', label: 'Mexicana', icon: '🌮' },
      { id: 'arabe', label: 'Árabe', icon: '🥙' },
      { id: 'asiatica', label: 'Asiática', icon: '🥡' },
      { id: 'frutos-mar', label: 'Frutos do Mar', icon: '🦐' },
      { id: 'vegetariana', label: 'Vegetariana', icon: '🥗' },
      { id: 'vegana', label: 'Vegana', icon: '🌱' },
      { id: 'self-service', label: 'Self-Service', icon: '🍱' },
      { id: 'rodizio', label: 'Rodízio', icon: '🔄' },
      { id: 'fast-food', label: 'Fast Food', icon: '🍟' },
      { id: 'caseira', label: 'Caseira', icon: '🏠' },
      { id: 'cafe-manha', label: 'Café da Manhã', icon: '🥐' },
      { id: 'massas', label: 'Massas', icon: '🍜' },
      { id: 'carnes', label: 'Carnes', icon: '🍖' },
      { id: 'outros-restaurante', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'salao',
    label: 'Salão de Beleza',
    plural: 'Salões de Beleza',
    icon: '💇',
    subcategorias: [
      { id: 'corte', label: 'Corte', icon: '✂️' },
      { id: 'coloracao', label: 'Coloração', icon: '🎨' },
      { id: 'manicure-pedicure', label: 'Manicure/Pedicure', icon: '💅' },
      { id: 'maquiagem', label: 'Maquiagem', icon: '💄' },
      { id: 'sobrancelha', label: 'Sobrancelha', icon: '✨' },
      { id: 'depilacao', label: 'Depilação', icon: '🪒' },
      { id: 'tratamentos-capilares', label: 'Tratamentos Capilares', icon: '💆‍♀️' },
      { id: 'escova', label: 'Escova', icon: '💇‍♀️' },
      { id: 'penteado', label: 'Penteado', icon: '👰' },
      { id: 'extensao-cilios', label: 'Extensão de Cílios', icon: '👁️' },
      { id: 'design-sobrancelha', label: 'Design de Sobrancelha', icon: '✏️' },
      { id: 'outros-salao', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'servicos',
    label: 'Serviço',
    plural: 'Serviços',
    icon: '⭐',
    subcategorias: [
      { id: 'estetica', label: 'Estética', icon: '✨' },
      { id: 'massagem', label: 'Massagem', icon: '💆' },
      { id: 'spa-day', label: 'Spa Day', icon: '🧖' },
      { id: 'bronzeamento', label: 'Bronzeamento', icon: '☀️' },
      { id: 'tatuagem', label: 'Tatuagem', icon: '🎨' },
      { id: 'piercing', label: 'Piercing', icon: '💎' },
      { id: 'limpeza-pele', label: 'Limpeza de Pele', icon: '🧴' },
      { id: 'drenagem', label: 'Drenagem', icon: '💧' },
      { id: 'harmonizacao-facial', label: 'Harmonização Facial', icon: '💉' },
      { id: 'ensaio-fotografico', label: 'Ensaio Fotográfico', icon: '📸' },
      { id: 'fotografo', label: 'Fotógrafo', icon: '📷' },
      { id: 'aluguel-roupas', label: 'Aluguel de Roupas', icon: '👗' },
      { id: 'maquiador', label: 'Maquiador', icon: '💄' },
      { id: 'day-spa', label: 'Day Spa', icon: '🧖‍♀️' },
      { id: 'depilacao-laser', label: 'Depilação a Laser', icon: '✨' },
      { id: 'casa-festas', label: 'Casa de Festas', icon: '🎈' },
      { id: 'buffet-infantil', label: 'Buffet Infantil', icon: '🎂' },
      { id: 'espaco-eventos', label: 'Espaço para Eventos', icon: '🏛️' },
      { id: 'outros-servicos', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'sorveteria',
    label: 'Sorveteria',
    plural: 'Sorveterias',
    icon: '🍦',
    subcategorias: [
      { id: 'sorvete-artesanal', label: 'Sorvete Artesanal', icon: '🍦' },
      { id: 'gelato', label: 'Gelato', icon: '🍨' },
      { id: 'acai-sorv', label: 'Açaí', icon: '🫐' },
      { id: 'milkshake', label: 'Milkshake', icon: '🥤' },
      { id: 'picole', label: 'Picolé', icon: '🍡' },
      { id: 'frozen-yogurt', label: 'Frozen Yogurt', icon: '🧊' },
      { id: 'outros-sorveteria', label: 'Outros', icon: '➕' },
    ]
  },
  {
    id: 'outros',
    label: 'Outro',
    plural: 'Outros',
    icon: '➕',
    subcategorias: [
      { id: 'outros-geral', label: 'Outros', icon: '➕' },
    ]
  },
];

// ============= HELPERS =============

// Buscar categoria por ID
export const getCategoriaById = (id: string): Categoria | undefined => {
  return CATEGORIAS.find(c => c.id === id);
};

// Buscar categoria por label (para compatibilidade com dados antigos)
export const getCategoriaByLabel = (label: string): Categoria | undefined => {
  const normalizedLabel = label.toLowerCase().trim();
  return CATEGORIAS.find(c => 
    c.label.toLowerCase() === normalizedLabel ||
    c.id === normalizedLabel
  );
};

// Buscar subcategoria por ID
export const getSubcategoriaById = (categoriaId: string, subcategoriaId: string): Subcategoria | undefined => {
  const categoria = getCategoriaById(categoriaId);
  return categoria?.subcategorias.find(s => s.id === subcategoriaId);
};

// Buscar subcategoria por label
export const getSubcategoriaByLabel = (categoriaId: string, label: string): Subcategoria | undefined => {
  const categoria = getCategoriaById(categoriaId);
  const normalizedLabel = label.toLowerCase().trim();
  return categoria?.subcategorias.find(s => 
    s.label.toLowerCase() === normalizedLabel ||
    s.id === normalizedLabel
  );
};

// Obter label da subcategoria
export const getSubcategoriaLabel = (categoriaId: string, subcategoriaId: string): string => {
  const sub = getSubcategoriaById(categoriaId, subcategoriaId);
  return sub?.label || subcategoriaId;
};

// Obter ícone da subcategoria
export const getSubcategoriaIcon = (categoriaId: string, subcategoriaId: string): string => {
  const sub = getSubcategoriaById(categoriaId, subcategoriaId);
  return sub?.icon || '📍';
};

// Obter ícone da categoria
export const getCategoriaIcon = (categoriaId: string): string => {
  const cat = getCategoriaById(categoriaId);
  return cat?.icon || '📍';
};

// Obter label da categoria (SINGULAR - para cards, perfil, cadastro)
export const getCategoriaLabel = (categoriaId: string): string => {
  const cat = getCategoriaById(categoriaId);
  return cat?.label || categoriaId;
};

// Alias para getCategoriaLabel (singular)
export const getCategoriaSingular = getCategoriaLabel;

// Obter label da categoria no PLURAL (para filtros/pills)
export const getCategoriaPlural = (categoriaId: string): string => {
  const cat = getCategoriaById(categoriaId);
  return cat?.plural || cat?.label || categoriaId;
};

// Listar todas as categorias como opções para select (usa singular)
export const getCategoriasOptions = () => {
  return CATEGORIAS.map(c => ({
    value: c.id,
    label: c.label, // Singular para dropdown
    icon: c.icon,
  }));
};

// Listar todas as categorias para pills de filtro (usa plural)
export const getCategoriasFilterOptions = () => {
  return CATEGORIAS.map(c => ({
    value: c.id,
    label: c.plural, // Plural para filtros
    icon: c.icon,
  }));
};

// Listar subcategorias de uma categoria como opções para select
export const getSubcategoriasOptions = (categoriaId: string) => {
  const categoria = getCategoriaById(categoriaId);
  if (!categoria) return [];
  
  return categoria.subcategorias.map(s => ({
    value: s.id,
    label: s.label,
    icon: s.icon,
  }));
};

// Mapear categoria antiga (label) para novo ID
export const mapLegacyCategoriaToId = (legacyValue: string): string => {
  const mapping: Record<string, string> = {
    'Academia': 'academia',
    'Bar': 'bar',
    'Barbearia': 'barbearia',
    'Cafeteria': 'cafeteria',
    'Casa Noturna': 'casa-noturna',
    'Confeitaria': 'confeitaria',
    'Entretenimento': 'entretenimento',
    'Hospedagem': 'hospedagem',
    'Loja': 'loja',
    'Restaurante': 'restaurante',
    'Salão de Beleza': 'salao',
    'Serviços': 'servicos',
    'Sorveteria': 'sorveteria',
    'Outros': 'outros',
  };
  
  return mapping[legacyValue] || legacyValue.toLowerCase().replace(/\s+/g, '-');
};

// Validar se subcategoria pertence à categoria
export const isValidSubcategoria = (categoriaId: string, subcategoriaId: string): boolean => {
  const categoria = getCategoriaById(categoriaId);
  if (!categoria) return false;
  return categoria.subcategorias.some(s => s.id === subcategoriaId);
};

// Obter dados formatados para exibição no card
export const getSubcategoriaBadgeData = (categoriaId: string, subcategoriaId: string) => {
  const sub = getSubcategoriaById(categoriaId, subcategoriaId);
  if (!sub) {
    // Fallback para categoria
    const cat = getCategoriaById(categoriaId);
    return cat ? { icon: cat.icon, label: cat.label } : { icon: '📍', label: 'Outros' };
  }
  return { icon: sub.icon, label: sub.label };
};

// Obter primeira subcategoria (principal) de um array
export const getPrimarySubcategoria = (categoriaId: string, subcategoriaIds: string[]) => {
  if (!subcategoriaIds?.length) return null;
  return getSubcategoriaBadgeData(categoriaId, subcategoriaIds[0]);
};

// Total de subcategorias
export const TOTAL_SUBCATEGORIAS = CATEGORIAS.reduce((acc, cat) => acc + cat.subcategorias.length, 0);

// Total de categorias
export const TOTAL_CATEGORIAS = CATEGORIAS.length;
