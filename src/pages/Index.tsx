import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useCidadeInteligente } from '@/hooks/useCidadeInteligente';
import { useEstabelecimentos } from '@/hooks/useEstabelecimentos';

// Components
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { HomeHeader } from '@/components/home/HomeHeader';
import { CategoriasPills } from '@/components/home/CategoriasPills';
import { EstabelecimentosGrid } from '@/components/home/EstabelecimentosGrid';

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
    showAll: true,  // Carrega TODOS do Brasil
    enabled: true,  // Sempre habilitado - nunca bloqueia
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
      
      // Se encontrou resultados na cidade, usar. Senão, mostrar todos (nunca tela vazia!)
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
  
  // SEMPRE RENDERIZA OS CARDS - NUNCA BLOQUEIA (estilo Airbnb)
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        {/* Header com cidade opcional + busca */}
        <HomeHeader
          cidade={cidadeFinal || ''}
          estado={estadoFinal || ''}
          origem={origem}
          onMudarCidade={handleMudarCidade}
          onCidadeSelect={handleCidadeChange}
          onBusca={handleBuscaChange}
          buscaAtual={buscaParam || ''}
        />
        
        {/* Pills de categorias */}
        <CategoriasPills
          categoriaAtiva={categoriaParam}
          onCategoriaChange={handleCategoriaChange}
          estabelecimentos={estabelecimentos || []}
        />
        
        {/* Contador de resultados */}
        <div className="flex items-center justify-between my-4">
          <p className="text-slate-400">
            <span className="text-white font-semibold">{estabelecimentosFiltrados.length}</span>
            {' '}estabelecimento{estabelecimentosFiltrados.length !== 1 ? 's' : ''}
            {cidadeFinal && ` em ${cidadeFinal}`}
            {!cidadeFinal && ' no Brasil'}
          </p>
        </div>
        
        {/* Grid de estabelecimentos - SEMPRE RENDERIZADO */}
        <EstabelecimentosGrid
          estabelecimentos={estabelecimentosFiltrados}
          isLoading={isLoadingEstabelecimentos}
        />
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
