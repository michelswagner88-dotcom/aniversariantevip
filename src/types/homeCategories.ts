export interface HomeSection {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  priority: "fixed" | "rotating" | "featured";
  viewAllLink: string;
}

// Seções de DESTAQUE - Alternam na primeira posição (ORDEM ALFABÉTICA)
export const FEATURED_SECTIONS: HomeSection[] = [
  {
    id: "destaque-academias",
    title: "Academias em destaque",
    subtitle: "Treine com benefícios exclusivos",
    category: "Academia",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Academia",
  },
  {
    id: "destaque-barbearias",
    title: "Barbearias em destaque",
    subtitle: "Estilo para o seu aniversário",
    category: "Barbearia",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Barbearia",
  },
  {
    id: "destaque-bares",
    title: "Bares em destaque",
    subtitle: "Drinks especiais para você",
    category: "Bar",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Bar",
  },
  {
    id: "destaque-cafeterias",
    title: "Cafeterias em destaque",
    subtitle: "Momentos doces para celebrar",
    category: "Cafeteria",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Cafeteria",
  },
  {
    id: "destaque-casas-noturnas",
    title: "Casas Noturnas em destaque",
    subtitle: "Baladas para celebrar",
    category: "Casa Noturna",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Casa Noturna",
  },
  {
    id: "destaque-confeitarias",
    title: "Confeitarias em destaque",
    subtitle: "Bolos e doces especiais",
    category: "Confeitaria",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Confeitaria",
  },
  {
    id: "destaque-entretenimento",
    title: "Entretenimento em destaque",
    subtitle: "Diversão garantida",
    category: "Entretenimento",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Entretenimento",
  },
  {
    id: "destaque-hospedagem",
    title: "Hospedagem em destaque",
    subtitle: "Estadias especiais para você",
    category: "Hospedagem",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Hospedagem",
  },
  {
    id: "destaque-lojas",
    title: "Lojas em destaque",
    subtitle: "Presentes e descontos especiais",
    category: "Loja",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Loja",
  },
  {
    id: "destaque-restaurantes",
    title: "Restaurantes em destaque",
    subtitle: "Os melhores lugares para comemorar",
    category: "Restaurante",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Restaurante",
  },
  {
    id: "destaque-saloes",
    title: "Salões de Beleza em destaque",
    subtitle: "Renove o visual no seu dia",
    category: "Salão de Beleza",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Salão de Beleza",
  },
  {
    id: "destaque-servicos",
    title: "Serviços em destaque",
    subtitle: "Tudo para seu aniversário",
    category: "Serviço",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Serviço",
  },
  {
    id: "destaque-sorveterias",
    title: "Sorveterias em destaque",
    subtitle: "Gelados e refrescantes",
    category: "Sorveteria",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Sorveteria",
  },
];

// Pool completo de seções ROTATIVAS (aparecem depois da featured)
export const ALL_HOME_SECTIONS: HomeSection[] = [
  {
    id: "restaurantes",
    title: "Sabores que celebram você",
    subtitle: "Do casual ao sofisticado",
    category: "Restaurante",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Restaurante",
  },
  {
    id: "bares",
    title: "Drinks e celebração",
    subtitle: "Os melhores bares",
    category: "Bar",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Bar",
  },
  {
    id: "saloes",
    title: "Salões de beleza",
    subtitle: "Renove o visual",
    category: "Salão de Beleza",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Salão de Beleza",
  },
  {
    id: "academias",
    title: "Corpo em forma",
    subtitle: "Treine com desconto",
    category: "Academia",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Academia",
  },
  {
    id: "cafeterias",
    title: "Momentos doces",
    subtitle: "Cafés e confeitarias",
    category: "Cafeteria",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Cafeteria",
  },
  {
    id: "confeitarias",
    title: "Doces e delícias",
    subtitle: "Bolos e sobremesas",
    category: "Confeitaria",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Confeitaria",
  },
  {
    id: "hospedagem",
    title: "Estadias especiais",
    subtitle: "Hotéis e pousadas",
    category: "Hospedagem",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Hospedagem",
  },
  {
    id: "entretenimento",
    title: "Diversão garantida",
    subtitle: "Cinema, teatro e mais",
    category: "Entretenimento",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Entretenimento",
  },
  {
    id: "lojas",
    title: "Presentes e mimos",
    subtitle: "Descontos especiais",
    category: "Loja",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Loja",
  },
  {
    id: "barbearias",
    title: "Estilo masculino",
    subtitle: "Barbearias premium",
    category: "Barbearia",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Barbearia",
  },
  {
    id: "casas-noturnas",
    title: "Noite especial",
    subtitle: "Baladas e festas",
    category: "Casa Noturna",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Casa Noturna",
  },
  {
    id: "servicos",
    title: "Serviços especiais",
    subtitle: "Comemore com estilo",
    category: "Serviço",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Serviço",
  },
  {
    id: "sorveterias",
    title: "Gelados e refrescantes",
    subtitle: "Sorvetes e açaí",
    category: "Sorveteria",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Sorveteria",
  },
];

// Helper para pegar título com cidade
export const getTitleWithCity = (title: string, cidade?: string): string => {
  if (cidade) {
    return `${title} em ${cidade}`;
  }
  return title;
};
