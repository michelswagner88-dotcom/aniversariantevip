interface SEOData {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: "website" | "place" | "article";
}

interface SEOContent {
  [key: string]: {
    title: string;
    description: string;
  };
}

export const SEO_CONTENT: SEOContent = {
  home: {
    title: "Benefícios Exclusivos para Aniversariantes",
    description:
      "O maior guia de benefícios para aniversariantes do Brasil. Encontre restaurantes, bares, academias e mais de 50 categorias com vantagens especiais no seu aniversário. Cadastre-se grátis!",
  },
  explorar: {
    title: "Explorar Estabelecimentos",
    description:
      "Encontre estabelecimentos parceiros com benefícios exclusivos para aniversariantes. Filtre por cidade, categoria e descubra ofertas especiais.",
  },
  comoFunciona: {
    title: "Como Funciona",
    description:
      "Descubra como aproveitar benefícios exclusivos no seu aniversário. Cadastre-se grátis, encontre estabelecimentos parceiros e resgate suas vantagens.",
  },
  sejaParceiro: {
    title: "Seja Parceiro",
    description:
      "Cadastre seu estabelecimento no Aniversariante VIP e atraia clientes no dia mais especial deles. Aumente suas vendas com marketing direcionado.",
  },
  faq: {
    title: "Perguntas Frequentes",
    description:
      "Tire suas dúvidas sobre o Aniversariante VIP. Como usar benefícios, cadastro de estabelecimentos, e tudo que você precisa saber.",
  },
  termosUso: {
    title: "Termos de Uso",
    description: "Termos e condições de uso da plataforma Aniversariante VIP.",
  },
  politicaPrivacidade: {
    title: "Política de Privacidade",
    description: "Saiba como protegemos seus dados pessoais em conformidade com a LGPD.",
  },
  feed: {
    title: "Feed de Novidades",
    description:
      "Acompanhe as últimas novidades, promoções e eventos dos estabelecimentos parceiros do Aniversariante VIP.",
  },
  flashDeals: {
    title: "Ofertas Relâmpago",
    description: "Aproveite ofertas exclusivas por tempo limitado dos nossos estabelecimentos parceiros.",
  },
  meusCupons: {
    title: "Meus Cupons",
    description: "Gerencie seus cupons de aniversário e acompanhe os benefícios resgatados.",
  },
  meusFavoritos: {
    title: "Meus Favoritos",
    description: "Acesse rapidamente seus estabelecimentos favoritos e não perca nenhum benefício.",
  },
  afiliado: {
    title: "Programa de Afiliados",
    description: "Ganhe comissões indicando estabelecimentos para o Aniversariante VIP. 30% de comissão recorrente.",
  },
  auth: {
    title: "Entrar ou Cadastrar",
    description:
      "Acesse sua conta ou cadastre-se gratuitamente para aproveitar benefícios exclusivos no seu aniversário.",
  },
  dashboard: {
    title: "Minha Área",
    description: "Gerencie seu perfil, cupons e benefícios no Aniversariante VIP.",
  },
};

// Gerar SEO dinâmico para cidade
export const getCidadeSEO = (cidade: string, estado: string, totalEstabelecimentos?: number): SEOData => ({
  title: `Benefícios para Aniversariantes em ${cidade}, ${estado}`,
  description: `Encontre ${totalEstabelecimentos ? `${totalEstabelecimentos} estabelecimentos` : "diversos estabelecimentos"} com benefícios exclusivos para aniversariantes em ${cidade}. Restaurantes, bares, academias e muito mais!`,
});

// Gerar SEO dinâmico para categoria
export const getCategoriaSEO = (categoria: string, cidade?: string, estado?: string): SEOData => {
  const local = cidade && estado ? ` em ${cidade}, ${estado}` : "";
  return {
    title: `${categoria} com Benefícios para Aniversariantes${local}`,
    description: `Descubra ${categoria.toLowerCase()} que oferecem benefícios exclusivos para aniversariantes${local}. Confira as melhores opções e aproveite seu dia especial!`,
  };
};

// Gerar SEO dinâmico para estabelecimento
export const getEstabelecimentoSEO = (estabelecimento: {
  nome_fantasia?: string | null;
  categoria?: string[] | null;
  cidade?: string | null;
  estado?: string | null;
  descricao_beneficio?: string | null;
  logo_url?: string | null;
}): SEOData => {
  const nome = estabelecimento.nome_fantasia || "Estabelecimento";
  const categoria = estabelecimento.categoria?.[0] || "Estabelecimento";
  const cidade = estabelecimento.cidade;
  const estado = estabelecimento.estado;

  // Monta localização apenas se ambos existirem
  const localizacao = cidade && estado ? ` em ${cidade}, ${estado}` : "";
  const localizacaoCompleta = cidade && estado ? `${cidade}, ${estado}` : "sua cidade";

  return {
    title: localizacao ? `${nome} - ${categoria}${localizacao}` : `${nome} - ${categoria}`,
    description: estabelecimento.descricao_beneficio
      ? `${nome} oferece: ${estabelecimento.descricao_beneficio}. Aproveite este benefício exclusivo para aniversariantes em ${localizacaoCompleta}!`
      : `Confira os benefícios exclusivos para aniversariantes no ${nome}, ${categoria} em ${localizacaoCompleta}.`,
    ogImage: estabelecimento.logo_url || undefined,
    ogType: "place",
  };
};
