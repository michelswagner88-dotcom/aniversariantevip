// src/constants/categorySubcategories.ts
// Mapeamento de categorias para subcategorias

export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  'Academia': [
    'Musculação', 'CrossFit', 'Funcional', 'Pilates', 'Yoga', 
    'Natação', 'Artes Marciais', 'Dança', 'Spinning', 'Hidroginástica', 
    'Personal Trainer', 'Outros'
  ],
  'Bar': [
    'Cervejaria', 'Coquetelaria', 'Wine Bar', 'Karaokê', 'Sports Bar', 
    'Boteco', 'Música ao Vivo', 'Rooftop', 'Pub', 'Petiscos', 'Happy Hour', 'Outros'
  ],
  'Barbearia': [
    'Corte Masculino', 'Barba', 'Pigmentação', 'Tratamentos', 
    'Relaxamento', 'Hidratação', 'Platinado', 'Outros'
  ],
  'Cafeteria': [
    'Café Especial', 'Brunch', 'Doces', 'Salgados', 'Café Colonial', 
    'Chás', 'Açaí', 'Sucos', 'Lanches', 'Outros'
  ],
  'Casa Noturna': [
    'Balada', 'Shows ao Vivo', 'Eletrônica', 'Sertanejo', 'Funk', 
    'Pagode', 'Samba', 'Reggae', 'Rock', 'Pop', 'Festa Temática', 'Outros'
  ],
  'Confeitaria': [
    'Bolos', 'Salgados', 'Doces Finos', 'Tortas', 'Sobremesas', 
    'Cupcakes', 'Brownies', 'Cookies', 'Bolos Decorados', 'Outros'
  ],
  'Entretenimento': [
    'Cinema', 'Boliche', 'Escape Room', 'Parque', 'Jogos', 'Karaokê', 
    'Teatro', 'Fliperama', 'Laser Tag', 'Kart', 'Paintball', 'Outros'
  ],
  'Hospedagem': [
    'Hotel', 'Pousada', 'Resort', 'Day Use', 'Spa', 
    'Hostel', 'Flat', 'Chalé', 'Camping', 'Outros'
  ],
  'Loja': [
    'Roupas', 'Calçados', 'Cosméticos', 'Acessórios', 'Presentes', 
    'Eletrônicos', 'Decoração', 'Joias', 'Bolsas', 'Óculos', 'Perfumaria', 'Suplementos', 'Outros'
  ],
  'Restaurante': [
    'Pizzaria', 'Churrascaria', 'Sushi/Japonês', 'Hambúrguer', 'Italiana', 
    'Brasileira', 'Mexicana', 'Árabe', 'Chinesa/Asiática', 'Frutos do Mar', 
    'Vegetariana/Vegana', 'Self-Service', 'Rodízio', 'Fast Food', 
    'Comida Caseira', 'Café da Manhã', 'Massas', 'Carnes', 'Outros'
  ],
  'Salão de Beleza': [
    'Corte', 'Coloração', 'Manicure/Pedicure', 'Maquiagem', 
    'Sobrancelha', 'Depilação', 'Tratamentos Capilares', 'Escova', 
    'Penteado', 'Extensão de Cílios', 'Design de Sobrancelha', 'Outros'
  ],
  'Serviços': [
    'Estética', 'Massagem', 'Spa Day', 'Bronzeamento', 'Tatuagem', 
    'Piercing', 'Limpeza de Pele', 'Drenagem', 'Harmonização Facial', 
    'Ensaio Fotográfico', 'Fotógrafo', 'Aluguel de Roupas', 'Maquiador', 
    'Day Spa', 'Depilação a Laser', 'Casa de Festas', 'Buffet Infantil', 
    'Espaço para Eventos', 'Outros'
  ],
  'Sorveteria': [
    'Sorvete Artesanal', 'Açaí e Frozen', 'Paletas e Picolés', 'Outros'
  ],
  'Outros': [
    'Outros'
  ],
};

// Helper para obter subcategorias de uma categoria
export const getSubcategoriesForCategory = (category: string): string[] => {
  return CATEGORY_SUBCATEGORIES[category] || [];
};

// Helper para validar se uma subcategoria pertence à categoria
export const isValidSubcategory = (category: string, subcategory: string): boolean => {
  const validSubcategories = CATEGORY_SUBCATEGORIES[category] || [];
  return validSubcategories.includes(subcategory);
};

// Lista de todas as categorias
export const CATEGORIES = Object.keys(CATEGORY_SUBCATEGORIES);
