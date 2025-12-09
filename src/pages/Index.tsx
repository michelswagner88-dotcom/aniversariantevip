import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useCidadeInteligente } from '@/hooks/useCidadeInteligente';
import { useEstabelecimentos } from '@/hooks/useEstabelecimentos';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useRotatingSections } from '@/hooks/useRotatingSections';
import { ALL_HOME_SECTIONS } from '@/types/homeCategories';
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';
import { getSectionTitle, getCategoryTitle, getCategorySubtitle } from '@/utils/sectionTitles';
import { calcularDistancia } from '@/lib/geoUtils';
import { getSubcategoriesForCategory } from '@/constants/categorySubcategories';

// Components
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import HeroSection from '@/components/home/HeroSection';
import { AirbnbSearchBar } from '@/components/home/AirbnbSearchBar';
import { AirbnbCategoryPills } from '@/components/home/AirbnbCategoryPills';
import { AirbnbCardGrid } from '@/components/home/AirbnbCardGrid';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { AirbnbMapLayout } from '@/components/map/AirbnbMapLayout';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { CarouselSkeleton } from '@/components/skeletons';
import CTABanner from '@/components/home/CTABanner';
import SubcategoryFilter from '@/components/SubcategoryFilter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, MapPin, X } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Ativar scroll reveal
  useScrollReveal();
  
  // Estados de filtros avançados
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [filterDistance, setFilterDistance] = useState<number | null>(null);
  const [filterValidity, setFilterValidity] = useState<string | null>(null);
  
  // Geolocalização para filtro de distância
  const { location: userLocation, requestLocation, loading: locationLoading } = useUserLocation();
  
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
  
  // Filtrar por cidade, categoria, subcategoria, distância e busca (client-side)
  const { estabelecimentosFiltrados, usandoFallback } = useMemo(() => {
    if (!estabelecimentos) return { estabelecimentosFiltrados: [], usandoFallback: false };
    
    let filtrados = [...estabelecimentos];
    let usouFallback = false;
    
    // Filtrar por cidade (se detectada/selecionada)
    if (cidadeFinal && estadoFinal) {
      const filtradosPorCidade = filtrados.filter(est => 
        est.cidade?.toLowerCase() === cidadeFinal.toLowerCase() &&
        est.estado?.toLowerCase() === estadoFinal.toLowerCase()
      );
      
      // Se não tem na cidade, mostrar de todas as cidades (fallback)
      if (filtradosPorCidade.length > 0) {
        filtrados = filtradosPorCidade;
      } else {
        usouFallback = true;
        // Manter todos os estabelecimentos quando não há na cidade
      }
    }
    
    // Filtrar por categoria
    if (categoriaParam) {
      filtrados = filtrados.filter(est => {
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        return cats.some(cat => cat?.toLowerCase() === categoriaParam.toLowerCase());
      });
    }
    
    // Filtrar por subcategorias
    if (selectedSubcategories.length > 0) {
      filtrados = filtrados.filter(est => {
        const specs = est.especialidades || [];
        return selectedSubcategories.some(sub => specs.includes(sub));
      });
    }
    
    // Filtrar por distância (se tiver localização do usuário)
    if (filterDistance && userLocation) {
      filtrados = filtrados.filter(est => {
        if (!est.latitude || !est.longitude) return false;
        const dist = calcularDistancia(
          userLocation.lat,
          userLocation.lng,
          est.latitude,
          est.longitude
        );
        return dist <= filterDistance;
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
    
    return { estabelecimentosFiltrados: filtrados, usandoFallback: usouFallback };
  }, [estabelecimentos, cidadeFinal, estadoFinal, categoriaParam, buscaParam, selectedSubcategories, filterDistance, userLocation]);
  
  // Dados para exibição - SEMPRE ter algo para mostrar
  const dadosParaExibir = useMemo(() => {
    // Se tem dados filtrados, usar; senão usar TODOS os estabelecimentos
    if (estabelecimentosFiltrados && estabelecimentosFiltrados.length > 0) {
      return estabelecimentosFiltrados;
    }
    // FALLBACK GARANTIDO: Sempre usar todos os estabelecimentos se filtrados estiver vazio
    return estabelecimentos || [];
  }, [estabelecimentosFiltrados, estabelecimentos]);

  // Transformar estabelecimentos para o formato do mapa (usa dadosParaExibir com fallback)
  const estabelecimentosParaMapa = useMemo(() => {
    return dadosParaExibir
      .filter(est => est.latitude && est.longitude && est.latitude !== 0 && est.longitude !== 0)
      .map(est => ({
        id: est.id,
        nome_fantasia: est.nome_fantasia || '',
        categoria: Array.isArray(est.categoria) ? est.categoria : [est.categoria].filter(Boolean),
        endereco: `${est.logradouro || ''}, ${est.numero || ''} - ${est.bairro || ''}`,
        latitude: Number(est.latitude),
        longitude: Number(est.longitude),
        logo_url: est.logo_url || null,
        descricao_beneficio: est.descricao_beneficio || '',
        cidade: est.cidade || '',
        estado: est.estado || '',
        slug: est.slug || null,
      }));
  }, [dadosParaExibir]);
  
  // Contagem de filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSubcategories.length > 0) count++;
    if (filterDistance) count++;
    if (filterValidity) count++;
    return count;
  }, [selectedSubcategories, filterDistance, filterValidity]);
  
  // Limpar todos os filtros
  const clearAllFilters = () => {
    setSelectedSubcategories([]);
    setFilterDistance(null);
    setFilterValidity(null);
    handleCategoriaChange(null);
  };
  
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

  // Título e subtítulo da seção baseado no contexto
  const destaquesConfig = getSectionTitle('destaques', cidadeFinal || undefined);

  // Sistema de rotação dinâmica de seções
  const { sections: rotatingSections, animationKey } = useRotatingSections(ALL_HOME_SECTIONS, {
    rotatingCount: 5,
    rotationInterval: 60000, // 1 minuto
    rotateOnMount: true,
  });

  // Agrupar estabelecimentos por categoria para as seções rotativas
  const secoesDinamicas = useMemo(() => {
    // Sem dados base ou com filtros ativos, não mostrar carrosséis
    if (!estabelecimentos || estabelecimentos.length === 0) return [];
    if (categoriaParam || buscaParam) return [];
    
    // CORREÇÃO CRÍTICA: Usar dadosParaExibir que SEMPRE tem dados (fallback garantido)
    const dadosBase = dadosParaExibir.length > 0 ? dadosParaExibir : estabelecimentos;
    
    return rotatingSections.map(section => {
      let ests: any[] = [];
      
      if (section.category === 'all') {
        // Seção "Em alta" - mostrar os mais populares (primeiros 10)
        ests = dadosBase.slice(0, 10);
      } else {
        // Filtrar por categoria específica
        ests = dadosBase.filter(est => {
          const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
          return cats.some(cat => cat?.toLowerCase() === section.category.toLowerCase());
        }).slice(0, 10);
      }
      
      return {
        ...section,
        estabelecimentos: ests,
        hasContent: ests.length >= 1, // Mostrar seção mesmo com 1 estabelecimento
      };
    }).filter(section => section.hasContent);
  }, [estabelecimentos, dadosParaExibir, rotatingSections, categoriaParam, buscaParam]);

  // Mostrar carrosséis apenas quando não há filtro ativo E tem seções com conteúdo
  const mostrarCarrosseis = !categoriaParam && !buscaParam && secoesDinamicas.length > 0;
  
  // Fallback: mostrar grid simples quando não há seções dinâmicas mas TEM dados
  // SIMPLIFICADO: Se não tem carrosséis e não está carregando, mostrar grid
  const mostrarGridSimples = !isLoadingEstabelecimentos && !mostrarCarrosseis && !categoriaParam && !buscaParam;
  
  // Estado para controlar se mostra Hero ou modo filtrado
  const isFiltered = !!(categoriaParam || buscaParam);

  // Função para navegar para explorar com busca
  const handleHeroBuscar = () => {
    navigate(`/explorar${buscaParam ? `?q=${buscaParam}` : ''}${cidadeFinal ? `${buscaParam ? '&' : '?'}cidade=${cidadeFinal}&estado=${estadoFinal}` : ''}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Apenas na home sem filtros */}
        {!isFiltered && (
          <HeroSection
            cidade={cidadeFinal || undefined}
            estado={estadoFinal || undefined}
            onCidadeSelect={handleCidadeChange}
            onBuscaChange={handleBuscaChange}
            onBuscar={handleHeroBuscar}
          />
        )}
        
        {/* Search Bar alternativa quando filtrado */}
        {isFiltered && (
          <div className="pt-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
            <AirbnbSearchBar
              cidade={cidadeFinal || ''}
              estado={estadoFinal || ''}
              busca={buscaParam || ''}
              onBuscaChange={handleBuscaChange}
              onCidadeSelect={handleCidadeChange}
              onCategoriaChange={handleCategoriaChange}
              onUseLocation={requestLocation}
            />
          </div>
        )}
        
        {/* Pills de categorias - MESMO FUNDO DO HERO */}
        <div className="bg-background border-b border-white/10 sticky top-16 backdrop-blur-lg z-30">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
            <div className="flex items-center gap-3">
              <div className="flex-1 overflow-hidden">
                <AirbnbCategoryPills
                  categoriaAtiva={categoriaParam}
                  onCategoriaChange={(cat) => {
                    handleCategoriaChange(cat);
                    setSelectedSubcategories([]); // Reset subcategorias ao mudar categoria
                  }}
                  estabelecimentos={estabelecimentos || []}
                />
              </div>
              
              {/* Botão de Filtros - estilo escuro */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="shrink-0 gap-2 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/40 bg-transparent"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-[#240046] to-[#3C096C] text-white border-0">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subcategorias - aparecem quando uma categoria está selecionada */}
        {categoriaParam && (
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-3">
              <SubcategoryFilter
                category={categoriaParam}
                selectedSubcategories={selectedSubcategories}
                onSubcategoriesChange={setSelectedSubcategories}
                cidade={cidadeFinal || undefined}
                estado={estadoFinal || undefined}
              />
            </div>
          </div>
        )}
        
        {/* Container principal - ÁREA BRANCA FIXA vai direto até o footer */}
        <div className="bg-white min-h-[50vh]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-8 pb-24">
          
          {/* Loading state com skeletons */}
          {isLoadingEstabelecimentos && (
            <div className="space-y-16 md:space-y-20">
              {Array.from({ length: 3 }).map((_, i) => (
                <CarouselSkeleton key={i} />
              ))}
            </div>
          )}
          
          {/* SEMPRE mostrar conteúdo quando não está carregando */}
          {!isLoadingEstabelecimentos && mostrarCarrosseis && (
            /* MODO CARROSSÉIS: Quando não há filtro ativo e tem seções */
            <div className="space-y-8 md:space-y-12">
              {/* Aviso quando mostrando de outras cidades */}
              {usandoFallback && cidadeFinal && (
                <div className="bg-[#240046]/10 border border-[#240046]/20 rounded-xl px-6 py-4">
                  <p className="text-sm text-[#222222] text-center">
                    <span className="font-medium">Ainda não temos estabelecimentos em {cidadeFinal}.</span>
                    {' '}Mostrando lugares de outras cidades disponíveis.
                  </p>
                </div>
              )}
              
              {/* Seções dinâmicas com rotação */}
              {secoesDinamicas.map((section, index) => (
                <div key={`${section.id}-${animationKey}`}>
                  {/* Seção de carrossel */}
                  <div 
                    className="scroll-reveal animate-fade-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CategoryCarousel
                      title={section.title}
                      subtitle={section.subtitle}
                      estabelecimentos={section.estabelecimentos}
                      linkHref={section.viewAllLink + (cidadeFinal ? `${section.viewAllLink.includes('?') ? '&' : '?'}cidade=${cidadeFinal}&estado=${estadoFinal}` : '')}
                    />
                  </div>
                  
                  {/* CTA Banner após a primeira seção (Em Alta) */}
                  {index === 0 && (
                    <div className="scroll-reveal mt-8">
                      <CTABanner variant="register" />
                    </div>
                  )}
                  
                  {/* CTA Banner para parceiros após a terceira seção */}
                  {index === 2 && (
                    <div className="scroll-reveal-scale mt-8">
                      <CTABanner variant="partner" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* MODO GRID SIMPLES: Fallback quando não há seções dinâmicas */}
          {/* CORREÇÃO DEFINITIVA: Sempre mostrar se não está carregando e não tem carrosséis */}
          {!isLoadingEstabelecimentos && !mostrarCarrosseis && !categoriaParam && !buscaParam && (
            <div className="space-y-8">
              {/* Aviso quando mostrando de outras cidades */}
              {usandoFallback && cidadeFinal && (
                <div className="bg-[#240046]/10 border border-[#240046]/20 rounded-xl px-6 py-4">
                  <p className="text-sm text-[#222222] text-center">
                    <span className="font-medium">Ainda não temos estabelecimentos em {cidadeFinal}.</span>
                    {' '}Mostrando lugares de outras cidades disponíveis.
                  </p>
                </div>
              )}
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-[#222222]">
                    {destaquesConfig.titulo}
                  </h2>
                  <p className="text-sm text-[#717171] mt-0.5">{destaquesConfig.subtitulo}</p>
                </div>
                <span className="text-sm text-[#717171]">
                  {dadosParaExibir.length} {dadosParaExibir.length === 1 ? 'lugar' : 'lugares'}
                </span>
              </div>
              
              {/* Grid de cards - SEMPRE usa dadosParaExibir que tem fallback garantido */}
              <AirbnbCardGrid
                estabelecimentos={dadosParaExibir}
                isLoading={false}
                userLocation={userLocation}
              />
              
              <CTABanner variant="register" />
            </div>
          )}
          
          {/* MODO GRID COM MAPA: Quando há filtro de categoria ou busca */}
          {!isLoadingEstabelecimentos && !mostrarCarrosseis && !mostrarGridSimples && (categoriaParam || buscaParam) && (
            /* MODO GRID COM MAPA: Quando há filtro de categoria ou busca */
            <AirbnbMapLayout
              establishments={estabelecimentosParaMapa}
              onEstablishmentClick={(establishment) => {
                const url = getEstabelecimentoUrl({
                  estado: establishment.estado,
                  cidade: establishment.cidade,
                  slug: establishment.slug,
                  id: establishment.id
                });
                navigate(url);
              }}
              userLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null}
              listHeader={
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold text-[#222222]">
                        {categoriaParam ? getCategoryTitle(categoriaParam, cidadeFinal || undefined) : destaquesConfig.titulo}
                      </h2>
                      {categoriaParam && getCategorySubtitle(categoriaParam) && (
                        <p className="text-sm text-[#717171] mt-0.5">
                          {getCategorySubtitle(categoriaParam)}
                        </p>
                      )}
                    </div>
                    {estabelecimentosFiltrados.length > 0 && (
                      <span className="text-sm text-[#717171]">
                        {estabelecimentosFiltrados.length} {estabelecimentosFiltrados.length === 1 ? 'lugar' : 'lugares'}
                      </span>
                    )}
                  </div>
                  
                  {/* Aviso quando mostrando de outras cidades */}
                  {usandoFallback && cidadeFinal && (
                    <div className="bg-[#240046]/10 border border-[#240046]/20 rounded-lg px-4 py-2">
                      <p className="text-sm text-[#240046]">
                        <span className="font-medium">Ainda não temos {categoriaParam?.toLowerCase() || 'lugares'} em {cidadeFinal}.</span>
                        {' '}Mostrando de outras cidades disponíveis.
                      </p>
                    </div>
                  )}
                </div>
              }
            >
              <AirbnbCardGrid
                estabelecimentos={estabelecimentosFiltrados}
                isLoading={isLoadingEstabelecimentos}
                userLocation={userLocation}
              />
            </AirbnbMapLayout>
          )}
          
          {/* FALLBACK ABSOLUTO: Se nada mais renderizou mas temos dados, mostrar grid */}
          {!isLoadingEstabelecimentos && !mostrarCarrosseis && !mostrarGridSimples && !(categoriaParam || buscaParam) && dadosParaExibir.length > 0 && (
            <div className="space-y-8">
              {usandoFallback && cidadeFinal && (
                <div className="bg-[#240046]/10 border border-[#240046]/20 rounded-xl px-6 py-4">
                  <p className="text-sm text-[#222222] text-center">
                    <span className="font-medium">Ainda não temos estabelecimentos em {cidadeFinal}.</span>
                    {' '}Mostrando lugares de outras cidades disponíveis.
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-[#222222]">
                    {destaquesConfig.titulo}
                  </h2>
                  <p className="text-sm text-[#717171] mt-0.5">{destaquesConfig.subtitulo}</p>
                </div>
                <span className="text-sm text-[#717171]">
                  {dadosParaExibir.length} {dadosParaExibir.length === 1 ? 'lugar' : 'lugares'}
                </span>
              </div>
              
              <AirbnbCardGrid
                estabelecimentos={dadosParaExibir}
                isLoading={false}
                userLocation={userLocation}
              />
              
              <CTABanner variant="register" />
            </div>
          )}
        </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
      
      {/* Modal de Filtros Avançados */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-semibold">Filtros</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] px-4">
            <div className="space-y-6 py-4">
              
              {/* Seção: Categorias */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Categorias</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!categoriaParam ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      handleCategoriaChange(null);
                      setSelectedSubcategories([]);
                    }}
                    className={!categoriaParam ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white" : ""}
                  >
                    Todos
                  </Button>
                  {CATEGORIAS_ESTABELECIMENTO.map((cat) => (
                    <Button
                      key={cat.value}
                      variant={categoriaParam === cat.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        handleCategoriaChange(cat.value);
                        setSelectedSubcategories([]);
                      }}
                      className={categoriaParam === cat.value ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white" : ""}
                    >
                      {cat.icon} {cat.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Seção: Subcategorias (aparecem quando categoria selecionada) */}
              {categoriaParam && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Tipo de {categoriaParam}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getSubcategoriesForCategory(categoriaParam).map((sub) => {
                      const isSelected = selectedSubcategories.includes(sub.label);
                      return (
                        <Badge
                          key={sub.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent" 
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSubcategories(prev => prev.filter(s => s !== sub.label));
                            } else {
                              setSelectedSubcategories(prev => [...prev, sub.label]);
                            }
                          }}
                        >
                          {sub.icon} {sub.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Seção: Distância */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Distância</h3>
                {!userLocation ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestLocation}
                    disabled={locationLoading}
                    className="gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    {locationLoading ? "Obtendo localização..." : "Usar minha localização"}
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10, 20].map((km) => (
                      <Badge
                        key={km}
                        variant={filterDistance === km ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          filterDistance === km 
                            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent" 
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        onClick={() => setFilterDistance(filterDistance === km ? null : km)}
                      >
                        Até {km} km
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Seção: Validade do Benefício */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Validade do Benefício</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'dia', label: '🎂 No dia' },
                    { value: 'semana', label: '📅 Na semana' },
                    { value: 'mes', label: '🗓️ No mês' },
                  ].map((opt) => (
                    <Badge
                      key={opt.value}
                      variant={filterValidity === opt.value ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        filterValidity === opt.value 
                          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      onClick={() => setFilterValidity(filterValidity === opt.value ? null : opt.value)}
                    >
                      {opt.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
            </div>
          </ScrollArea>
          
          {/* Footer com botões */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={() => setShowFilters(false)}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
            >
              Ver {estabelecimentosFiltrados.length} resultados
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;