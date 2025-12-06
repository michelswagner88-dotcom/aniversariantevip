import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useCidadeInteligente } from '@/hooks/useCidadeInteligente';
import { useEstabelecimentos } from '@/hooks/useEstabelecimentos';

// Components
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { AirbnbSearchBar } from '@/components/home/AirbnbSearchBar';
import { AirbnbCategoryPills } from '@/components/home/AirbnbCategoryPills';
import { AirbnbCardGrid } from '@/components/home/AirbnbCardGrid';
import { MapFAB } from '@/components/home/MapFAB';

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
    
    // Filtrar por cidade (se detectada/selecionada)
    if (cidadeFinal && estadoFinal) {
      const filtradosPorCidade = filtrados.filter(est => 
        est.cidade?.toLowerCase() === cidadeFinal.toLowerCase() &&
        est.estado?.toLowerCase() === estadoFinal.toLowerCase()
      );
      
      if (filtradosPorCidade.length > 0) {
        filtrados = filtradosPorCidade;
      }
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
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      
      <main className="pt-20 pb-24">
        {/* Search Bar Flutuante estilo Airbnb */}
        <div className="max-w-3xl mx-auto px-6 md:px-20 mb-8">
          <AirbnbSearchBar
            cidade={cidadeFinal || ''}
            estado={estadoFinal || ''}
            busca={buscaParam || ''}
            onBuscaChange={handleBuscaChange}
            onCidadeSelect={handleCidadeChange}
          />
        </div>
        
        {/* Pills de categorias estilo Airbnb */}
        <div className="border-b border-slate-200 dark:border-slate-800 sticky top-16 bg-white dark:bg-slate-950 z-30">
          <div className="max-w-7xl mx-auto px-6 md:px-20">
            <AirbnbCategoryPills
              categoriaAtiva={categoriaParam}
              onCategoriaChange={handleCategoriaChange}
              estabelecimentos={estabelecimentos || []}
            />
          </div>
        </div>
        
        {/* Container principal com muito espaçamento */}
        <div className="max-w-7xl mx-auto px-6 md:px-20 pt-8">
          {/* Título da seção com storytelling */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">
              {sectionTitle}
            </h2>
            {estabelecimentosFiltrados.length > 0 && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {estabelecimentosFiltrados.length} lugares
              </span>
            )}
          </div>
          
          {/* Grid de cards estilo Airbnb */}
          <AirbnbCardGrid
            estabelecimentos={estabelecimentosFiltrados}
            isLoading={isLoadingEstabelecimentos}
          />
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