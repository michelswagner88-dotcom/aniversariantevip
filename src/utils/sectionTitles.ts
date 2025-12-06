// utils/sectionTitles.ts

interface TitleConfig {
  titulo: string;
  subtitulo?: string;
}

type TitleGenerator = (cidade?: string, count?: number) => TitleConfig;

export const SECTION_TITLES: Record<string, TitleGenerator> = {
  // === CATEGORIAS ===
  
  'todos': (cidade, count) => ({
    titulo: cidade ? `Destaques em ${cidade}` : 'Destaques pra você',
    subtitulo: count ? `${count} lugares com benefícios especiais` : undefined
  }),
  
  'restaurante': (cidade) => ({
    titulo: 'Restaurantes para comemorar',
    subtitulo: cidade ? `Os melhores de ${cidade}` : 'Celebre com quem você ama'
  }),
  
  'bar': () => ({
    titulo: 'Bares para brindar',
    subtitulo: 'Drinks e bons momentos 🍻'
  }),
  
  'pizzaria': () => ({
    titulo: 'Pizzarias irresistíveis',
    subtitulo: 'Sabor que conquista 🍕'
  }),
  
  'cafeteria': () => ({
    titulo: 'Cafeterias aconchegantes',
    subtitulo: 'Momentos especiais te esperam ☕'
  }),
  
  'academia': () => ({
    titulo: 'Academias parceiras',
    subtitulo: 'Cuide de você 💪'
  }),
  
  'salao': () => ({
    titulo: 'Salões de beleza',
    subtitulo: 'Renove o visual ✨'
  }),
  
  'salao-de-beleza': () => ({
    titulo: 'Salões de beleza',
    subtitulo: 'Renove o visual ✨'
  }),
  
  'barbearia': () => ({
    titulo: 'Barbearias estilosas',
    subtitulo: 'Estilo e cuidado 💈'
  }),
  
  'spa': () => ({
    titulo: 'Spas para relaxar',
    subtitulo: 'Você merece 🧖'
  }),
  
  'casa-noturna': () => ({
    titulo: 'Noites inesquecíveis',
    subtitulo: 'Diversão garantida 🎉'
  }),
  
  'confeitaria': () => ({
    titulo: 'Confeitarias irresistíveis',
    subtitulo: 'Doces momentos 🎂'
  }),
  
  'hospedagem': () => ({
    titulo: 'Hotéis e pousadas',
    subtitulo: 'Estadias especiais 🏨'
  }),
  
  'entretenimento': () => ({
    titulo: 'Diversão garantida',
    subtitulo: 'Experiências únicas 🎮'
  }),
  
  'loja': () => ({
    titulo: 'Lojas parceiras',
    subtitulo: 'Pra você ou pra presentear 🎁'
  }),
  
  'loja-de-presentes': () => ({
    titulo: 'Lojas parceiras',
    subtitulo: 'Pra você ou pra presentear 🎁'
  }),
  
  'moda-e-acessorios': () => ({
    titulo: 'Moda e Acessórios',
    subtitulo: 'Estilo pra você 👗'
  }),
  
  'servicos': () => ({
    titulo: 'Serviços especiais',
    subtitulo: 'Benefícios exclusivos'
  }),
  
  'sorveteria': () => ({
    titulo: 'Sorveterias refrescantes',
    subtitulo: 'Doçura pra qualquer momento 🍦'
  }),
  
  'saude-e-suplementos': () => ({
    titulo: 'Saúde e Bem-estar',
    subtitulo: 'Cuide de você 💊'
  }),
  
  'outros-comercios': () => ({
    titulo: 'Outros Comércios',
    subtitulo: 'Benefícios esperando você'
  }),
  
  // === SEÇÕES ESPECIAIS ===
  
  'destaques': (cidade) => ({
    titulo: cidade ? `Destaques em ${cidade}` : 'Destaques',
    subtitulo: 'Os mais procurados'
  }),
  
  'novos': () => ({
    titulo: 'Novos parceiros',
    subtitulo: 'Recém-chegados 🆕'
  }),
  
  'populares': () => ({
    titulo: 'Os mais buscados',
    subtitulo: 'Favoritos dos aniversariantes ⭐'
  }),
  
  'perto': () => ({
    titulo: 'Pertinho de você',
    subtitulo: 'Benefícios por perto 📍'
  }),
  
  'promocao': () => ({
    titulo: 'Promoções especiais',
    subtitulo: 'Aproveite 🔥'
  }),
  
  'romantico': () => ({
    titulo: 'Para um momento a dois',
    subtitulo: 'Celebre junto 💕'
  }),
  
  'grupo': () => ({
    titulo: 'Perfeitos para grupos',
    subtitulo: 'Leve a galera 👥'
  }),
  
  'familia': () => ({
    titulo: 'Para toda família',
    subtitulo: 'Momentos juntos 👨‍👩‍👧‍👦'
  }),
  
  'pet-friendly': () => ({
    titulo: 'Pet friendly',
    subtitulo: 'Seu pet é bem-vindo 🐕'
  }),
  
  'super-beneficio': () => ({
    titulo: 'Super benefícios',
    subtitulo: 'As melhores ofertas 🏆'
  }),
  
  'gratuito': () => ({
    titulo: 'Benefícios gratuitos',
    subtitulo: 'Aproveite 🎊'
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
