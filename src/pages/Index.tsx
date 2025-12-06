import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useCidadeInteligente } from '@/hooks/useCidadeInteligente';
import { useEstabelecimentos } from '@/hooks/useEstabelecimentos';
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';

// Components
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { AirbnbSearchBar } from '@/components/home/AirbnbSearchBar';
import { AirbnbCategoryPills } from '@/components/home/AirbnbCategoryPills';
import { AirbnbCardGrid } from '@/components/home/AirbnbCardGrid';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { MapFAB } from '@/components/home/MapFAB';

// Títulos com storytelling por categoria
const getCategoryTitle = (categoria: string, cidade?: string | null): string => {
  const titulos: Record<string, string> = {
    'Restaurante': 'Restaurantes para comemorar',
    'Bar': 'Bares populares',
    'Academia': 'Academias com benefícios',
    'Salão de Beleza': 'Salões de beleza',
    'Barbearia': 'Barbearias estilosas',
    'Cafeteria': 'Cafeterias aconchegantes',
    'Casa Noturna': 'Noites inesquecíveis',
    'Confeitaria': 'Confeitarias irresistíveis',
    'Sorveteria': 'Sorveterias refrescantes',
    'Hospedagem': 'Hotéis para celebrar',
    'Entretenimento': 'Entretenimento garantido',
    'Loja': 'Lojas com presentes especiais',
    'Saúde e Suplementos': 'Saúde e bem-estar',
    'Serviços': 'Serviços exclusivos',
    'Pizzaria': 'Pizzarias bem avaliadas',
  };
  return titulos[categoria] || categoria;
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parâmetros da URL
  const cidadeParam = searchParams.get('cidade');
  const estadoParam = searchParams.get('estado');
  const categoriaParam = searchParams.get('categoria');
  const buscaParam = searchParams.get('q');
  
  // Sistema de geolocalização inteligente (em background, não bloqueia)
  const {
    cidade: cidadeDetectada,
    estado: estadoDetectado,
    origem,
    setCidadeManual,
    limparCidade,
  } = useCidadeInteligente();
  
  // Cidade final (prioridade: URL > Detectada)
  const cidadeFinal = cidadeParam || cidadeDetectada;
  const estadoFinal = estadoParam || estadoDetectado;
  
  // CARREGAR TODOS OS ESTABELECIMENTOS IMEDIATAMENTE (estilo Airbnb)
  const { 
    data: estabelecimentos, 
    isLoading: isLoadingEstabelecimentos,
  } = useEstabelecimentos({
    showAll: true,
    enabled: true,
  });
  
  // Filtrar por cidade, categoria e busca (client-side, não bloqueia)
  const estabelecimentosFiltrados = useMemo(() => {
    if (!estabelecimentos) return [];
    
    let filtrados = [...estabelecimentos];
    
    // Filtrar por cidade (se detectada/selecionada) - SEMPRE APLICAR
    if (cidadeFinal && estadoFinal) {
      filtrados = filtrados.filter(est => 
        est.cidade?.toLowerCase() === cidadeFinal.toLowerCase() &&
        est.estado?.toLowerCase() === estadoFinal.toLowerCase()
      );
      // NÃO fazer fallback para todos - mostrar lista vazia se não houver na cidade
    }
    
    // Filtrar por categoria
    if (categoriaParam) {
      filtrados = filtrados.filter(est => {
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        return cats.some(cat => cat?.toLowerCase() === categoriaParam.toLowerCase());
      });
    }
    
    // Filtrar por busca de texto
    if (buscaParam) {
      const termoBusca = buscaParam.toLowerCase();
      filtrados = filtrados.filter(est => {
        const nome = est.nome_fantasia?.toLowerCase() || '';
        const bairro = est.bairro?.toLowerCase() || '';
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        const matchCat = cats.some((c: string | null) => c?.toLowerCase().includes(termoBusca));
        const specs = est.especialidades || [];
        const matchSpec = specs.some((e: string) => e?.toLowerCase().includes(termoBusca));
        
        return nome.includes(termoBusca) || bairro.includes(termoBusca) || matchCat || matchSpec;
      });
    }
    
    console.log('[Index] Filtro aplicado:', { 
      cidadeFinal, estadoFinal, categoriaParam, buscaParam,
      totalBruto: estabelecimentos?.length,
      totalFiltrado: filtrados.length 
    });
    
    return filtrados;
  }, [estabelecimentos, cidadeFinal, estadoFinal, categoriaParam, buscaParam]);
  
  // Handlers
  const handleCategoriaChange = (categoria: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoria) {
      newParams.set('categoria', categoria);
    } else {
      newParams.delete('categoria');
    }
    setSearchParams(newParams);
  };
  
  const handleBuscaChange = (termo: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (termo) {
      newParams.set('q', termo);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };
  
  const handleCidadeChange = (novaCidade: string, novoEstado: string) => {
    setCidadeManual(novaCidade, novoEstado);
    
    const newParams = new URLSearchParams();
    newParams.set('cidade', novaCidade);
    newParams.set('estado', novoEstado);
    setSearchParams(newParams);
  };

  const handleMudarCidade = () => {
    limparCidade();
    setSearchParams(new URLSearchParams());
  };
  
  // SEO dinâmico
  useSEO({
    title: cidadeFinal 
      ? `Benefícios para Aniversariantes em ${cidadeFinal}, ${estadoFinal}`
      : 'O Maior Guia de Benefícios para Aniversariantes',
    description: cidadeFinal
      ? `Encontre ${estabelecimentosFiltrados.length} estabelecimentos com benefícios exclusivos para aniversariantes em ${cidadeFinal}. Restaurantes, bares, academias e muito mais!`
      : 'Descubra benefícios exclusivos para aniversariantes em restaurantes, bares, academias e mais de 50 categorias. Cadastre-se grátis!'
  });

  // Título da seção baseado no contexto
  const sectionTitle = cidadeFinal 
    ? `Destaques em ${cidadeFinal}`
    : 'Destaques no Brasil';

  // Agrupar estabelecimentos por categoria para carrosséis
  const estabelecimentosPorCategoria = useMemo(() => {
    if (!estabelecimentos || categoriaParam || buscaParam) return [];
    
    // Pegar as top 5 categorias com mais estabelecimentos
    const contagem: Record<string, any[]> = {};
    
    estabelecimentosFiltrados.forEach(est => {
      const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
      cats.forEach((cat: string) => {
        if (cat) {
          if (!contagem[cat]) contagem[cat] = [];
          if (contagem[cat].length < 10) {
            contagem[cat].push(est);
          }
        }
      });
    });
    
    // Ordenar por quantidade e pegar top 5
    return Object.entries(contagem)
      .filter(([_, ests]) => ests.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(([cat, ests]) => ({
        categoria: cat,
        titulo: getCategoryTitle(cat, cidadeFinal),
        estabelecimentos: ests
      }));
  }, [estabelecimentos, estabelecimentosFiltrados, categoriaParam, buscaParam, cidadeFinal]);

  // Mostrar carrosséis apenas quando não há filtro ativo
  const mostrarCarrosseis = !categoriaParam && !buscaParam && estabelecimentosPorCategoria.length > 0;
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      
      <main className="pt-20 pb-24">
        {/* Search Bar Flutuante estilo Airbnb */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <AirbnbSearchBar
            cidade={cidadeFinal || ''}
            estado={estadoFinal || ''}
            busca={buscaParam || ''}
            onBuscaChange={handleBuscaChange}
            onCidadeSelect={handleCidadeChange}
          />
          
          {/* Slogan */}
          <p className="text-center text-xs font-medium tracking-[0.08em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-violet-400 to-slate-400 mt-4 opacity-0 animate-[fadeInSlide_0.8s_ease-out_0.5s_forwards]">
            ✨ O maior guia de benefícios para aniversariantes do Brasil ✨
          </p>
        </div>
        
        {/* Pills de categorias estilo Airbnb */}
        <div className="border-b border-slate-200 dark:border-slate-800 sticky top-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg z-30">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
            <AirbnbCategoryPills
              categoriaAtiva={categoriaParam}
              onCategoriaChange={handleCategoriaChange}
              estabelecimentos={estabelecimentos || []}
            />
          </div>
        </div>
        
        {/* Container principal com padding respirado */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-8 pb-16">
          
          {/* MODO CARROSSÉIS: Quando não há filtro ativo */}
          {mostrarCarrosseis ? (
            <div className="space-y-16 md:space-y-20">
              {/* Destaques gerais primeiro */}
              <CategoryCarousel
                title={sectionTitle}
                estabelecimentos={estabelecimentosFiltrados.slice(0, 10)}
                linkHref={cidadeFinal ? `/explorar?cidade=${cidadeFinal}&estado=${estadoFinal}` : '/explorar'}
              />
              
              {/* Carrosséis por categoria */}
              {estabelecimentosPorCategoria.map(({ categoria, titulo, estabelecimentos: ests }) => (
                <CategoryCarousel
                  key={categoria}
                  title={titulo}
                  estabelecimentos={ests}
                  linkHref={`/explorar?categoria=${encodeURIComponent(categoria)}${cidadeFinal ? `&cidade=${cidadeFinal}&estado=${estadoFinal}` : ''}`}
                />
              ))}
            </div>
          ) : (
            /* MODO GRID: Quando há filtro de categoria ou busca */
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">
                  {categoriaParam ? getCategoryTitle(categoriaParam, cidadeFinal) : sectionTitle}
                </h2>
                {estabelecimentosFiltrados.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {estabelecimentosFiltrados.length} {estabelecimentosFiltrados.length === 1 ? 'lugar' : 'lugares'}
                  </span>
                )}
              </div>
              
              <AirbnbCardGrid
                estabelecimentos={estabelecimentosFiltrados}
                isLoading={isLoadingEstabelecimentos}
              />
            </>
          )}
        </div>
      </main>
      
      <Footer />
      <BottomNav />
      
      {/* FAB de Mapa - Mobile only */}
      <MapFAB estabelecimentos={estabelecimentosFiltrados} />
    </div>
  );
};

export default Index;