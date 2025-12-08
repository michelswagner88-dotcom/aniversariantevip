export interface HomeSection {
  id: string;
  title: string;
  subtitle: string;
  category: string; // categoria do banco (label)
  priority: 'fixed' | 'rotating';
  viewAllLink: string;
}

// Pool completo de seções disponíveis
export const ALL_HOME_SECTIONS: HomeSection[] = [
  // FIXA - Sempre aparece primeiro
  {
    id: 'em-alta',
    title: 'Em alta agora',
    subtitle: 'Todo mundo está indo',
    category: 'all',
    priority: 'fixed',
    viewAllLink: '/explorar'
  },
  
  // ROTATIVAS - Alternam entre si
  {
    id: 'restaurantes',
    title: 'Sabores que celebram você',
    subtitle: 'Do casual ao sofisticado',
    category: 'Restaurante',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Restaurante'
  },
  {
    id: 'bares',
    title: 'Drinks e celebração',
    subtitle: 'Os melhores bares',
    category: 'Bar',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Bar'
  },
  {
    id: 'saloes',
    title: 'Salões de beleza',
    subtitle: 'Renove o visual',
    category: 'Salão de Beleza',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Salão de Beleza'
  },
  {
    id: 'academias',
    title: 'Corpo em forma',
    subtitle: 'Treine com desconto',
    category: 'Academia',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Academia'
  },
  {
    id: 'cafeterias',
    title: 'Momentos doces',
    subtitle: 'Cafés e confeitarias',
    category: 'Cafeteria',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Cafeteria'
  },
  {
    id: 'confeitarias',
    title: 'Doces e delícias',
    subtitle: 'Bolos e sobremesas',
    category: 'Confeitaria',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Confeitaria'
  },
  {
    id: 'hospedagem',
    title: 'Estadias especiais',
    subtitle: 'Hotéis e pousadas',
    category: 'Hospedagem',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Hospedagem'
  },
  {
    id: 'entretenimento',
    title: 'Diversão garantida',
    subtitle: 'Cinema, teatro e mais',
    category: 'Entretenimento',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Entretenimento'
  },
  {
    id: 'lojas',
    title: 'Presentes e mimos',
    subtitle: 'Descontos especiais',
    category: 'Loja',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Loja'
  },
  {
    id: 'barbearias',
    title: 'Estilo masculino',
    subtitle: 'Barbearias premium',
    category: 'Barbearia',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Barbearia'
  },
  {
    id: 'casas-noturnas',
    title: 'Noite especial',
    subtitle: 'Baladas e festas',
    category: 'Casa Noturna',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Casa Noturna'
  },
  {
    id: 'saude',
    title: 'Saúde e bem-estar',
    subtitle: 'Cuide de você',
    category: 'Saúde e Suplementos',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Saúde e Suplementos'
  },
  {
    id: 'servicos',
    title: 'Serviços de niver',
    subtitle: 'Comemore com estilo',
    category: 'Serviços',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Serviços'
  },
  {
    id: 'sorveterias',
    title: 'Gelados e refrescantes',
    subtitle: 'Sorvetes e açaí',
    category: 'Sorveteria',
    priority: 'rotating',
    viewAllLink: '/explorar?categoria=Sorveteria'
  },
];
