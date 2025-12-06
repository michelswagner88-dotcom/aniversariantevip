// src/constants/categorySubcategories.ts
// Mapeamento de categorias para subcategorias com ícones - 147 subcategorias no total

export interface Subcategoria {
  id: string;
  label: string;
  icon: string;
}

export const CATEGORY_SUBCATEGORIES: Record<string, Subcategoria[]> = {
  'Academia': [
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
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Bar': [
    { id: 'cervejaria', label: 'Cervejaria', icon: '🍺' },
    { id: 'coquetelaria', label: 'Coquetelaria', icon: '🍸' },
    { id: 'wine-bar', label: 'Wine Bar', icon: '🍷' },
    { id: 'karaoke', label: 'Karaokê', icon: '🎤' },
    { id: 'sports-bar', label: 'Sports Bar', icon: '⚽' },
    { id: 'boteco', label: 'Boteco', icon: '🍻' },
    { id: 'musica-ao-vivo', label: 'Música ao Vivo', icon: '🎵' },
    { id: 'rooftop', label: 'Rooftop', icon: '🌃' },
    { id: 'pub', label: 'Pub', icon: '🍺' },
    { id: 'petiscos', label: 'Petiscos', icon: '🥨' },
    { id: 'happy-hour', label: 'Happy Hour', icon: '🕐' },
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Barbearia': [
    { id: 'corte-masculino', label: 'Corte Masculino', icon: '✂️' },
    { id: 'barba', label: 'Barba', icon: '🧔' },
    { id: 'pigmentacao', label: 'Pigmentação', icon: '🎨' },
    { id: 'tratamentos', label: 'Tratamentos', icon: '💆‍♂️' },
    { id: 'relaxamento', label: 'Relaxamento', icon: '🧴' },
    { id: 'hidratacao', label: 'Hidratação', icon: '💧' },
    { id: 'platinado', label: 'Platinado', icon: '⚪' },
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Cafeteria': [
    { id: 'cafe-especial', label: 'Café Especial', icon: '☕' },
    { id: 'brunch', label: 'Brunch', icon: '🥞' },
    { id: 'doces', label: 'Doces', icon: '🍰' },
    { id: 'salgados', label: 'Salgados', icon: '🥐' },
    { id: 'cafe-colonial', label: 'Café Colonial', icon: '🧁' },
    { id: 'chas', label: 'Chás', icon: '🍵' },
    { id: 'acai', label: 'Açaí', icon: '🫐' },
    { id: 'sucos', label: 'Sucos', icon: '🧃' },
    { id: 'lanches', label: 'Lanches', icon: '🥪' },
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Casa Noturna': [
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
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Confeitaria': [
    { id: 'bolos', label: 'Bolos', icon: '🎂' },
    { id: 'salgados', label: 'Salgados', icon: '🥟' },
    { id: 'doces-finos', label: 'Doces Finos', icon: '🍬' },
    { id: 'tortas', label: 'Tortas', icon: '🥧' },
    { id: 'sobremesas', label: 'Sobremesas', icon: '🍮' },
    { id: 'cupcakes', label: 'Cupcakes', icon: '🧁' },
    { id: 'brownies', label: 'Brownies', icon: '🍫' },
    { id: 'cookies', label: 'Cookies', icon: '🍪' },
    { id: 'bolos-decorados', label: 'Bolos Decorados', icon: '🎀' },
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Entretenimento': [
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
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Hospedagem': [
    { id: 'hotel', label: 'Hotel', icon: '🏨' },
    { id: 'pousada', label: 'Pousada', icon: '🏡' },
    { id: 'resort', label: 'Resort', icon: '🏝️' },
    { id: 'day-use', label: 'Day Use', icon: '☀️' },
    { id: 'spa', label: 'Spa', icon: '🧖' },
    { id: 'hostel', label: 'Hostel', icon: '🛏️' },
    { id: 'flat', label: 'Flat', icon: '🏢' },
    { id: 'chale', label: 'Chalé', icon: '🏔️' },
    { id: 'camping', label: 'Camping', icon: '⛺' },
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Loja': [
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
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Restaurante': [
    { id: 'pizzaria', label: 'Pizzaria', icon: '🍕' },
    { id: 'churrascaria', label: 'Churrascaria', icon: '🥩' },
    { id: 'sushi-japones', label: 'Sushi/Japonês', icon: '🍣' },
    { id: 'hamburguer', label: 'Hambúrguer', icon: '🍔' },
    { id: 'italiana', label: 'Italiana', icon: '🍝' },
    { id: 'brasileira', label: 'Brasileira', icon: '🍛' },
    { id: 'mexicana', label: 'Mexicana', icon: '🌮' },
    { id: 'arabe', label: 'Árabe', icon: '🥙' },
    { id: 'chinesa-asiatica', label: 'Chinesa/Asiática', icon: '🥡' },
    { id: 'frutos-do-mar', label: 'Frutos do Mar', icon: '🦐' },
    { id: 'vegetariana-vegana', label: 'Vegetariana/Vegana', icon: '🥗' },
    { id: 'self-service', label: 'Self-Service', icon: '🍱' },
    { id: 'rodizio', label: 'Rodízio', icon: '🔄' },
    { id: 'fast-food', label: 'Fast Food', icon: '🍟' },
    { id: 'comida-caseira', label: 'Comida Caseira', icon: '🏠' },
    { id: 'cafe-da-manha', label: 'Café da Manhã', icon: '🥐' },
    { id: 'massas', label: 'Massas', icon: '🍜' },
    { id: 'carnes', label: 'Carnes', icon: '🍖' },
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Salão de Beleza': [
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
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Serviços': [
    { id: 'estetica', label: 'Estética', icon: '✨' },
    { id: 'massagem', label: 'Massagem', icon: '💆' },
    { id: 'spa-day', label: 'Spa Day', icon: '🧖' },
    { id: 'bronzeamento', label: 'Bronzeamento', icon: '☀️' },
    { id: 'tatuagem', label: 'Tatuagem', icon: '🎨' },
    { id: 'piercing', label: 'Piercing', icon: '💎' },
    { id: 'limpeza-de-pele', label: 'Limpeza de Pele', icon: '🧴' },
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
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Sorveteria': [
    { id: 'sorvete-artesanal', label: 'Sorvete Artesanal', icon: '🍦' },
    { id: 'gelato', label: 'Gelato', icon: '🍨' },
    { id: 'acai', label: 'Açaí', icon: '🫐' },
    { id: 'milkshake', label: 'Milkshake', icon: '🥤' },
    { id: 'picole', label: 'Picolé', icon: '🍡' },
    { id: 'frozen', label: 'Frozen', icon: '🧊' },
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
  'Outros': [
    { id: 'outros', label: 'Outros', icon: '➕' },
  ],
};

// Helper para obter subcategorias de uma categoria (retorna array de objetos)
export const getSubcategoriesForCategory = (category: string): Subcategoria[] => {
  return CATEGORY_SUBCATEGORIES[category] || [];
};

// Helper para obter apenas os labels (para compatibilidade com código existente)
export const getSubcategoryLabels = (category: string): string[] => {
  const subs = CATEGORY_SUBCATEGORIES[category] || [];
  return subs.map(s => s.label);
};

// Helper para obter ícone de uma subcategoria pelo label
export const getSubcategoryIcon = (category: string, subcategoryLabel: string): string => {
  const subs = CATEGORY_SUBCATEGORIES[category] || [];
  const found = subs.find(s => s.label === subcategoryLabel);
  return found?.icon || '📍';
};

// Helper para validar se uma subcategoria pertence à categoria
export const isValidSubcategory = (category: string, subcategory: string): boolean => {
  const validSubcategories = CATEGORY_SUBCATEGORIES[category] || [];
  return validSubcategories.some(s => s.label === subcategory || s.id === subcategory);
};

// Lista de todas as categorias
export const CATEGORIES = Object.keys(CATEGORY_SUBCATEGORIES);

// Contagem total de subcategorias
export const TOTAL_SUBCATEGORIES = Object.values(CATEGORY_SUBCATEGORIES)
  .reduce((acc, subs) => acc + subs.length, 0);
