import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useCidadeInteligente } from '@/hooks/useCidadeInteligente';
import { useEstabelecimentos } from '@/hooks/useEstabelecimentos';
import { useUserLocation } from '@/hooks/useUserLocation';
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';
import { getSectionTitle, getCategoryTitle, getCategorySubtitle } from '@/utils/sectionTitles';
import { calcularDistancia } from '@/lib/geoUtils';
import { getSubcategoriesForCategory } from '@/constants/categorySubcategories';

// Components
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { AirbnbSearchBar } from '@/components/home/AirbnbSearchBar';
import { AirbnbCategoryPills } from '@/components/home/AirbnbCategoryPills';
import { AirbnbCardGrid } from '@/components/home/AirbnbCardGrid';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { AirbnbMapLayout } from '@/components/map/AirbnbMapLayout';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { CarouselSkeleton } from '@/components/skeletons';
import SubcategoryFilter from '@/components/SubcategoryFilter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, MapPin, X } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  const estabelecimentosFiltrados = useMemo(() => {
    if (!estabelecimentos) return [];
    
    let filtrados = [...estabelecimentos];
    
    // Filtrar por cidade (se detectada/selecionada)
    if (cidadeFinal && estadoFinal) {
      filtrados = filtrados.filter(est => 
        est.cidade?.toLowerCase() === cidadeFinal.toLowerCase() &&
        est.estado?.toLowerCase() === estadoFinal.toLowerCase()
      );
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
    
    return filtrados;
  }, [estabelecimentos, cidadeFinal, estadoFinal, categoriaParam, buscaParam, selectedSubcategories, filterDistance, userLocation]);
  
  // Transformar estabelecimentos filtrados para o formato do mapa
  const estabelecimentosParaMapa = useMemo(() => {
    return estabelecimentosFiltrados
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
  }, [estabelecimentosFiltrados]);
  
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
      .map(([cat, ests]) => {
        const config = getSectionTitle(cat, cidadeFinal || undefined);
        return {
          categoria: cat,
          titulo: config.titulo,
          subtitulo: config.subtitulo,
          estabelecimentos: ests
        };
      });
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
          <p className="text-center text-xs font-medium tracking-[0.08em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-violet-400 to-slate-400 mt-4 opacity-0 animate-[fadeInSlide_0.8s_ease-out_0.5s_forwards] cursor-default transition-all duration-500 hover:from-violet-300 hover:via-fuchsia-300 hover:to-cyan-300 hover:scale-105">
            ✨ O maior guia de benefícios para aniversariantes do Brasil ✨
          </p>
        </div>
        
        {/* Pills de categorias estilo Airbnb + Botão de Filtros */}
        <div className="border-b border-slate-200 dark:border-slate-800 sticky top-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg z-30">
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
              
              {/* Botão de Filtros */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="shrink-0 gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-violet-500 text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subcategorias - aparecem quando uma categoria está selecionada */}
        {categoriaParam && (
          <div className="bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
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
        
        {/* Container principal com padding respirado */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-8 pb-16">
          
          {/* Loading state com skeletons */}
          {isLoadingEstabelecimentos ? (
            <div className="space-y-16 md:space-y-20">
              {Array.from({ length: 3 }).map((_, i) => (
                <CarouselSkeleton key={i} />
              ))}
            </div>
          ) : mostrarCarrosseis ? (
            /* MODO CARROSSÉIS: Quando não há filtro ativo */
            <div className="space-y-16 md:space-y-20">
              {/* Destaques gerais primeiro */}
              <CategoryCarousel
                title={destaquesConfig.titulo}
                subtitle={destaquesConfig.subtitulo}
                estabelecimentos={estabelecimentosFiltrados.slice(0, 10)}
                linkHref={cidadeFinal ? `/explorar?cidade=${cidadeFinal}&estado=${estadoFinal}` : '/explorar'}
              />
              
              {/* Carrosséis por categoria */}
              {estabelecimentosPorCategoria.map(({ categoria, titulo, subtitulo, estabelecimentos: ests }) => (
                <CategoryCarousel
                  key={categoria}
                  title={titulo}
                  subtitle={subtitulo}
                  estabelecimentos={ests}
                  linkHref={`/explorar?categoria=${encodeURIComponent(categoria)}${cidadeFinal ? `&cidade=${cidadeFinal}&estado=${estadoFinal}` : ''}`}
                />
              ))}
            </div>
          ) : (
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">
                      {categoriaParam ? getCategoryTitle(categoriaParam, cidadeFinal || undefined) : destaquesConfig.titulo}
                    </h2>
                    {categoriaParam && getCategorySubtitle(categoriaParam) && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {getCategorySubtitle(categoriaParam)}
                      </p>
                    )}
                  </div>
                  {estabelecimentosFiltrados.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {estabelecimentosFiltrados.length} {estabelecimentosFiltrados.length === 1 ? 'lugar' : 'lugares'}
                    </span>
                  )}
                </div>
              }
            >
              <AirbnbCardGrid
                estabelecimentos={estabelecimentosFiltrados}
                isLoading={isLoadingEstabelecimentos}
              />
            </AirbnbMapLayout>
          )}
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