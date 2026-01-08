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
    id: "destaque-baladas",
    title: "Baladas em destaque",
    subtitle: "Noites especiais para celebrar",
    category: "Balada",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Balada",
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
    id: "destaque-beleza",
    title: "Beleza & Estética em destaque",
    subtitle: "Cuide-se no seu mês",
    category: "Beleza & Estética",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Beleza & Estética",
  },
  {
    id: "destaque-gastronomia",
    title: "Gastronomia em destaque",
    subtitle: "Os melhores sabores para você",
    category: "Gastronomia",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Gastronomia",
  },
  {
    id: "destaque-hospedagem",
    title: "Hotéis em destaque",
    subtitle: "Estadias especiais para você",
    category: "Hotel",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Hotel",
  },
  {
    id: "destaque-lojas",
    title: "Lojas em destaque",
    subtitle: "Presentes e descontos especiais",
    category: "Loja",
    priority: "featured",
    viewAllLink: "/explorar?categoria=Loja",
  },
];

// Pool completo de seções ROTATIVAS (aparecem depois da featured)
export const ALL_HOME_SECTIONS: HomeSection[] = [
  {
    id: "gastronomia",
    title: "Sabores que celebram você",
    subtitle: "Restaurantes, cafés e sorveterias",
    category: "Gastronomia",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Gastronomia",
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
    id: "beleza",
    title: "Beleza & Estética",
    subtitle: "Cuide de você",
    category: "Beleza & Estética",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Beleza & Estética",
  },
  {
    id: "hospedagem",
    title: "Estadias especiais",
    subtitle: "Hotéis e pousadas",
    category: "Hotel",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Hotel",
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
    id: "casas-noturnas",
    title: "Noite especial",
    subtitle: "Baladas e festas",
    category: "Balada",
    priority: "rotating",
    viewAllLink: "/explorar?categoria=Balada",
  },
];

// Helper para pegar título com cidade
export const getTitleWithCity = (title: string, cidade?: string): string => {
  if (cidade) {
    return `${title} em ${cidade}`;
  }
  return title;
};
