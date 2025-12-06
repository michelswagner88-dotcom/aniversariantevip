import { useMemo, useEffect } from 'react';
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
import { SemCidadeView } from '@/components/home/SemCidadeView';
import { CidadeSemEstabelecimentosView } from '@/components/home/CidadeSemEstabelecimentosView';
import { HomeLoadingState } from '@/components/home/HomeLoadingState';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parâmetros da URL
  const cidadeParam = searchParams.get('cidade');
  const estadoParam = searchParams.get('estado');
  const categoriaParam = searchParams.get('categoria');
  const buscaParam = searchParams.get('q');
  
  // Sistema de geolocalização inteligente
  const {
    cidade: cidadeDetectada,
    estado: estadoDetectado,
    origem,
    isLoading: isLoadingCidade,
    isDetecting,
    temEstabelecimentos,
    setCidadeManual,
    limparCidade,
    redetectar
  } = useCidadeInteligente();
  
  // Cidade final (prioridade: URL > Detectada)
  const cidadeFinal = cidadeParam || cidadeDetectada;
  const estadoFinal = estadoParam || estadoDetectado;
  
  // Buscar estabelecimentos da cidade (só quando tiver cidade definida)
  const { 
    data: estabelecimentos, 
    isLoading: isLoadingEstabelecimentos,
  } = useEstabelecimentos({
    cidade: cidadeFinal || '',
    estado: estadoFinal || '',
    enabled: !!cidadeFinal, // Só buscar quando tiver cidade
  });
  
  // Filtrar por categoria e busca
  const estabelecimentosFiltrados = useMemo(() => {
    if (!estabelecimentos) return [];
    
    let filtrados = [...estabelecimentos];
    
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
  }, [estabelecimentos, categoriaParam, buscaParam]);
  
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
  
  // Estados de loading - priorizar URL sobre detecção
  const isLoading = !cidadeParam && (isLoadingCidade || isDetecting);
  
  // Renderização condicional
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <HomeLoadingState />
        <BottomNav />
      </div>
    );
  }
  
  // Sem cidade detectada - mostrar seletor
  if (!cidadeFinal) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <SemCidadeView onCidadeSelect={handleCidadeChange} />
        <Footer />
        <BottomNav />
      </div>
    );
  }
  
  // Cidade detectada mas sem estabelecimentos
  const semEstabelecimentos = temEstabelecimentos === false || 
    (estabelecimentos && estabelecimentos.length === 0 && !isLoadingEstabelecimentos);
    
  if (semEstabelecimentos) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <CidadeSemEstabelecimentosView 
          cidade={cidadeFinal}
          estado={estadoFinal || ''}
          onMudarCidade={handleMudarCidade}
        />
        <Footer />
        <BottomNav />
      </div>
    );
  }
  
  // Cidade com estabelecimentos - mostrar grid
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        {/* Header com cidade e busca */}
        <HomeHeader
          cidade={cidadeFinal}
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
            {categoriaParam && ` em ${categoriaParam}`}
          </p>
        </div>
        
        {/* Grid de estabelecimentos */}
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
