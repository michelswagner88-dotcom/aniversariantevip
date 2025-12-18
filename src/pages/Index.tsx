// src/pages/Index.tsx
import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { useCidadeInteligente } from "@/hooks/useCidadeInteligente";
import { useEstabelecimentos } from "@/hooks/useEstabelecimentos";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useRotatingSections } from "@/hooks/useRotatingSections";
import { ALL_HOME_SECTIONS } from "@/types/homeCategories";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { getSectionTitle, getCategoryTitle, getCategorySubtitle } from "@/utils/sectionTitles";
import { calcularDistancia } from "@/lib/geoUtils";
import { getSubcategoriesForCategory } from "@/constants/categorySubcategories";

// Components
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import HeroSection from "@/components/home/HeroSection";
import { AirbnbSearchBar } from "@/components/home/AirbnbSearchBar";
import CategoriasPills, { DEFAULT_CATEGORIES } from "@/components/home/CategoriasPills";
import { AirbnbCardGrid } from "@/components/home/AirbnbCardGrid";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { AirbnbMapLayout } from "@/components/map/AirbnbMapLayout";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { CarouselSkeleton } from "@/components/skeletons";
import CTABanner from "@/components/home/CTABanner";
import SubcategoryFilter from "@/components/SubcategoryFilter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MapPin, X, Bell, Sparkles } from "lucide-react";

// =============================================================================
// EMPTY STATE BANNER - Premium Component
// =============================================================================

interface EmptyStateBannerProps {
  cidade: string;
  onNotifyMe?: () => void;
  onSuggestPlace?: () => void;
}

const EmptyStateBanner = ({ cidade, onNotifyMe, onSuggestPlace }: EmptyStateBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#240046] to-[#5A189A] p-4 sm:p-5">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4 text-white/60" />
      </button>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon */}
        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/10 items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-violet-300" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm sm:text-base">Ainda não chegamos em {cidade}</p>
          <p className="text-white/70 text-xs sm:text-sm mt-0.5">
            Mostrando lugares de outras cidades. Em breve teremos novidades!
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={onNotifyMe}
            className="bg-white text-[#240046] hover:bg-white/90 font-medium text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
          >
            <Bell className="w-3.5 h-3.5 mr-1.5" />
            Me avise
          </Button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de filtros avancados
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [filterDistance, setFilterDistance] = useState<number | null>(null);
  const [filterValidity, setFilterValidity] = useState<string | null>(null);

  // Geolocalizacao para filtro de distancia
  const { location: userLocation, requestLocation, loading: locationLoading } = useUserLocation();

  // Parametros da URL - memoizados para evitar re-renders
  const cidadeParam = useMemo(() => searchParams.get("cidade"), [searchParams]);
  const estadoParam = useMemo(() => searchParams.get("estado"), [searchParams]);
  const categoriaParam = useMemo(() => searchParams.get("categoria"), [searchParams]);
  const buscaParam = useMemo(() => searchParams.get("q"), [searchParams]);

  // Sistema de geolocalizacao inteligente
  const { cidade: cidadeDetectada, estado: estadoDetectado, setCidadeManual, limparCidade } = useCidadeInteligente();

  // Cidade final (prioridade: URL > Detectada)
  const cidadeFinal = cidadeParam || cidadeDetectada;
  const estadoFinal = estadoParam || estadoDetectado;

  // CARREGAR TODOS OS ESTABELECIMENTOS
  const { data: estabelecimentos, isLoading: isLoadingEstabelecimentos } = useEstabelecimentos({
    showAll: true,
    enabled: true,
  });

  // Filtrar por cidade, categoria, subcategoria, distancia e busca
  const { estabelecimentosFiltrados, usandoFallback } = useMemo(() => {
    if (!estabelecimentos || estabelecimentos.length === 0) {
      return { estabelecimentosFiltrados: [], usandoFallback: false };
    }

    let filtrados = [...estabelecimentos];
    let usouFallback = false;

    // Filtrar por cidade
    if (cidadeFinal && estadoFinal) {
      const filtradosPorCidade = filtrados.filter(
        (est) =>
          est.cidade?.toLowerCase() === cidadeFinal.toLowerCase() &&
          est.estado?.toLowerCase() === estadoFinal.toLowerCase(),
      );

      if (filtradosPorCidade.length > 0) {
        filtrados = filtradosPorCidade;
      } else {
        usouFallback = true;
      }
    }

    // Filtrar por categoria
    if (categoriaParam) {
      filtrados = filtrados.filter((est) => {
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        return cats.some((cat) => cat?.toLowerCase() === categoriaParam.toLowerCase());
      });
    }

    // Filtrar por subcategorias
    if (selectedSubcategories.length > 0) {
      filtrados = filtrados.filter((est) => {
        const specs = est.especialidades || [];
        return selectedSubcategories.some((sub) => specs.includes(sub));
      });
    }

    // Filtrar por distancia
    if (filterDistance && userLocation) {
      filtrados = filtrados.filter((est) => {
        if (!est.latitude || !est.longitude) return false;
        const dist = calcularDistancia(userLocation.lat, userLocation.lng, est.latitude, est.longitude);
        return dist <= filterDistance;
      });
    }

    // Filtrar por busca de texto
    if (buscaParam) {
      const termoBusca = buscaParam.toLowerCase();
      filtrados = filtrados.filter((est) => {
        const nome = est.nome_fantasia?.toLowerCase() || "";
        const bairro = est.bairro?.toLowerCase() || "";
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        const matchCat = cats.some((c: string | null) => c?.toLowerCase().includes(termoBusca));
        const specs = est.especialidades || [];
        const matchSpec = specs.some((e: string) => e?.toLowerCase().includes(termoBusca));

        return nome.includes(termoBusca) || bairro.includes(termoBusca) || matchCat || matchSpec;
      });
    }

    return { estabelecimentosFiltrados: filtrados, usandoFallback: usouFallback };
  }, [
    estabelecimentos,
    cidadeFinal,
    estadoFinal,
    categoriaParam,
    buscaParam,
    selectedSubcategories,
    filterDistance,
    userLocation,
  ]);

  // Dados para exibicao
  const dadosParaExibir = useMemo(() => {
    if (estabelecimentosFiltrados && estabelecimentosFiltrados.length > 0) {
      return estabelecimentosFiltrados;
    }
    if (estabelecimentos && estabelecimentos.length > 0) {
      return estabelecimentos;
    }
    return [];
  }, [estabelecimentosFiltrados, estabelecimentos]);

  // Transformar estabelecimentos para o formato do mapa
  const estabelecimentosParaMapa = useMemo(() => {
    return dadosParaExibir
      .filter((est) => est.latitude && est.longitude && est.latitude !== 0 && est.longitude !== 0)
      .map((est) => ({
        id: est.id,
        nome_fantasia: est.nome_fantasia || "",
        categoria: Array.isArray(est.categoria) ? est.categoria : [est.categoria].filter(Boolean),
        endereco: `${est.logradouro || ""}, ${est.numero || ""} - ${est.bairro || ""}`,
        latitude: Number(est.latitude),
        longitude: Number(est.longitude),
        logo_url: est.logo_url || null,
        descricao_beneficio: est.descricao_beneficio || "",
        cidade: est.cidade || "",
        estado: est.estado || "",
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
      newParams.set("categoria", categoria);
    } else {
      newParams.delete("categoria");
    }
    setSearchParams(newParams);
  };

  const handleBuscaChange = (termo: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (termo) {
      newParams.set("q", termo);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const handleCidadeChange = (novaCidade: string, novoEstado: string) => {
    setCidadeManual(novaCidade, novoEstado);
    const newParams = new URLSearchParams();
    newParams.set("cidade", novaCidade);
    newParams.set("estado", novoEstado);
    setSearchParams(newParams);
  };

  const handleMudarCidade = () => {
    limparCidade();
    setSearchParams(new URLSearchParams());
  };

  // Handler para notificacao de cidade
  const handleNotifyMe = () => {
    navigate("/cadastro?interesse=" + encodeURIComponent(cidadeFinal || ""));
  };

  // Handler para scroll ate o search do hero
  const handleSearchClick = () => {
    const searchInput = document.querySelector("[data-search-input]") as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // SEO dinamico
  useSEO({
    title:
      cidadeFinal && !usandoFallback
        ? `Beneficios para Aniversariantes em ${cidadeFinal}, ${estadoFinal}`
        : "O Maior Guia de Beneficios para Aniversariantes do Brasil",
    description:
      cidadeFinal && !usandoFallback
        ? `Encontre ${estabelecimentosFiltrados.length} estabelecimentos com beneficios exclusivos para aniversariantes em ${cidadeFinal}. Restaurantes, bares, academias e muito mais!`
        : "Descubra beneficios exclusivos para aniversariantes em restaurantes, bares, academias e mais de 50 categorias. Cadastre-se gratis!",
  });

  // Titulo e subtitulo da secao baseado no contexto
  const destaquesConfig = usandoFallback
    ? { titulo: "Em destaque no Brasil", subtitulo: "Os melhores benefícios para aniversariantes" }
    : getSectionTitle("destaques", cidadeFinal || undefined);

  // Sistema de rotacao dinamica de secoes
  const {
    sections: rotatingSections,
    animationKey,
    lockSection,
  } = useRotatingSections(ALL_HOME_SECTIONS, {
    rotatingCount: 5,
    rotationInterval: 30000,
    featuredRotationInterval: 30000,
    rotateOnMount: true,
    lockDuration: 10000,
  });

  // Agrupar estabelecimentos por categoria para as secoes rotativas
  const secoesDinamicas = useMemo(() => {
    if (!dadosParaExibir || dadosParaExibir.length === 0) return [];
    if (categoriaParam || buscaParam) return [];

    return rotatingSections
      .map((section) => {
        let ests: any[] = [];

        if (section.category === "all") {
          ests = dadosParaExibir.slice(0, 10);
        } else {
          ests = dadosParaExibir
            .filter((est) => {
              const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
              return cats.some((cat) => cat?.toLowerCase() === section.category.toLowerCase());
            })
            .slice(0, 10);
        }

        return {
          ...section,
          estabelecimentos: ests,
          hasContent: ests.length >= 1,
        };
      })
      .filter((section) => section.hasContent);
  }, [dadosParaExibir, rotatingSections, categoriaParam, buscaParam]);

  // Logica de exibicao simplificada
  const mostrarCarrosseis = !categoriaParam && !buscaParam && secoesDinamicas.length > 0;
  const mostrarGridSimples = !isLoadingEstabelecimentos && !mostrarCarrosseis && !categoriaParam && !buscaParam;
  const isFiltered = !!(categoriaParam || buscaParam);

  // Funcao para navegar para explorar com busca
  const handleHeroBuscar = () => {
    navigate(
      `/explorar${buscaParam ? `?q=${buscaParam}` : ""}${cidadeFinal ? `${buscaParam ? "&" : "?"}cidade=${cidadeFinal}&estado=${estadoFinal}` : ""}`,
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Sentinel para scroll detection */}
      <div
        id="scroll-sentinel"
        className="fixed top-0 left-0 w-full h-1 pointer-events-none z-[100]"
        aria-hidden="true"
      />

      <Header />

      <main className="flex-1">
        {/* Hero Section - Apenas na home sem filtros */}
        {!isFiltered && (
          <HeroSection
            selectedCity={cidadeFinal || undefined}
            onCityChange={(city) => handleCidadeChange(city, estadoFinal || "")}
            onSearch={handleHeroBuscar}
          />
        )}

        {/* Search Bar quando filtrado - com padding ajustado */}
        {isFiltered && (
          <div className="bg-[#240046] pt-20 pb-6">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
              <AirbnbSearchBar
                cidade={cidadeFinal || ""}
                estado={estadoFinal || ""}
                busca={buscaParam || ""}
                onBuscaChange={handleBuscaChange}
                onCidadeSelect={handleCidadeChange}
                onCategoriaChange={handleCategoriaChange}
                onUseLocation={requestLocation}
              />
            </div>
          </div>
        )}

        {/* Pills de categorias - COM FILTROS INTEGRADO */}
        <div className="bg-[#240046] sticky top-14 lg:top-16 z-30">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
            <CategoriasPills
              categories={DEFAULT_CATEGORIES}
              selectedCategory={categoriaParam || "all"}
              onSelectCategory={(cat) => {
                handleCategoriaChange(cat === "all" ? null : cat);
                setSelectedSubcategories([]);
              }}
              onFilterClick={() => setShowFilters(true)}
              showFilter={true}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>

        {/* Subcategorias */}
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

        {/* Container principal */}
        <div className="bg-white min-h-[50vh]">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-8 pb-12">
            {/* Loading state */}
            {isLoadingEstabelecimentos && (
              <div className="space-y-16 md:space-y-20">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CarouselSkeleton key={i} />
                ))}
              </div>
            )}

            {/* MODO CARROSSEIS */}
            {!isLoadingEstabelecimentos && mostrarCarrosseis && (
              <div className="space-y-8 md:space-y-12">
                {/* EMPTY STATE BANNER - Premium */}
                {usandoFallback && cidadeFinal && <EmptyStateBanner cidade={cidadeFinal} onNotifyMe={handleNotifyMe} />}

                {secoesDinamicas.map((section, index) => {
                  const isFeatured = index === 0 && section.priority === "featured";

                  // Se usandoFallback, NÃO mostra cidade no título
                  const displayTitle =
                    isFeatured && cidadeFinal && !usandoFallback
                      ? `${section.title} em ${cidadeFinal}`
                      : usandoFallback && isFeatured
                        ? `${section.title} no Brasil`
                        : section.title;

                  return (
                    <div key={`${section.id}-${animationKey}`}>
                      <CategoryCarousel
                        title={displayTitle}
                        subtitle={section.subtitle}
                        estabelecimentos={section.estabelecimentos}
                        sectionId={section.id}
                      />

                      {index === 0 && (
                        <div className="mt-8">
                          <CTABanner variant="register" />
                        </div>
                      )}

                      {index === 2 && (
                        <div className="mt-8">
                          <CTABanner variant="partner" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODO GRID SIMPLES */}
            {!isLoadingEstabelecimentos && mostrarGridSimples && dadosParaExibir.length > 0 && (
              <div className="space-y-8">
                {/* EMPTY STATE BANNER - Premium */}
                {usandoFallback && cidadeFinal && <EmptyStateBanner cidade={cidadeFinal} onNotifyMe={handleNotifyMe} />}

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-[#222222]">{destaquesConfig.titulo}</h2>
                    <p className="text-sm text-[#717171] mt-0.5">{destaquesConfig.subtitulo}</p>
                  </div>
                  <span className="text-sm text-[#717171]">
                    {dadosParaExibir.length} {dadosParaExibir.length === 1 ? "lugar" : "lugares"}
                  </span>
                </div>

                <AirbnbCardGrid estabelecimentos={dadosParaExibir} isLoading={false} userLocation={userLocation} />

                <CTABanner variant="register" />
              </div>
            )}

            {/* MODO GRID COM MAPA - Filtro ativo */}
            {!isLoadingEstabelecimentos && (categoriaParam || buscaParam) && (
              <AirbnbMapLayout
                establishments={estabelecimentosParaMapa}
                onEstablishmentClick={(establishment) => {
                  const url = getEstabelecimentoUrl({
                    estado: establishment.estado,
                    cidade: establishment.cidade,
                    slug: establishment.slug,
                    id: establishment.id,
                  });
                  navigate(url);
                }}
                userLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null}
                listHeader={
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#222222]">
                          {categoriaParam
                            ? usandoFallback
                              ? `${getCategoryTitle(categoriaParam, undefined)} no Brasil`
                              : getCategoryTitle(categoriaParam, cidadeFinal || undefined)
                            : destaquesConfig.titulo}
                        </h2>
                        {categoriaParam && getCategorySubtitle(categoriaParam) && (
                          <p className="text-sm text-[#717171] mt-0.5">{getCategorySubtitle(categoriaParam)}</p>
                        )}
                      </div>
                      {estabelecimentosFiltrados.length > 0 && (
                        <span className="text-sm text-[#717171]">
                          {estabelecimentosFiltrados.length}{" "}
                          {estabelecimentosFiltrados.length === 1 ? "lugar" : "lugares"}
                        </span>
                      )}
                    </div>

                    {/* EMPTY STATE BANNER - Premium (no modo filtrado) */}
                    {usandoFallback && cidadeFinal && (
                      <EmptyStateBanner cidade={cidadeFinal} onNotifyMe={handleNotifyMe} />
                    )}
                  </div>
                }
              >
                <AirbnbCardGrid
                  estabelecimentos={estabelecimentosFiltrados}
                  isLoading={isLoadingEstabelecimentos}
                  userLocation={userLocation}
                  variant="grid"
                />
              </AirbnbMapLayout>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />

      {/* Modal de Filtros */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-semibold">Filtros</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-4">
            <div className="space-y-6 py-4">
              {/* Categorias */}
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
                    className={!categoriaParam ? "bg-gradient-to-r from-[#240046] to-[#3C096C] text-white" : ""}
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
                      className={
                        categoriaParam === cat.value ? "bg-gradient-to-r from-[#240046] to-[#3C096C] text-white" : ""
                      }
                    >
                      {cat.icon} {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subcategorias */}
              {categoriaParam && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Tipo de {categoriaParam}</h3>
                  <div className="flex flex-wrap gap-2">
                    {getSubcategoriesForCategory(categoriaParam).map((sub) => {
                      const isSelected = selectedSubcategories.includes(sub.label);
                      return (
                        <Badge
                          key={sub.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-[#240046] to-[#3C096C] text-white border-transparent"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSubcategories((prev) => prev.filter((s) => s !== sub.label));
                            } else {
                              setSelectedSubcategories((prev) => [...prev, sub.label]);
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

              {/* Distancia */}
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
                            ? "bg-gradient-to-r from-[#240046] to-[#3C096C] text-white border-transparent"
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

              {/* Validade */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Validade do Benefício</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "dia", label: "No dia" },
                    { value: "semana", label: "Na semana" },
                    { value: "mes", label: "No mês" },
                  ].map((opt) => (
                    <Badge
                      key={opt.value}
                      variant={filterValidity === opt.value ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        filterValidity === opt.value
                          ? "bg-gradient-to-r from-[#240046] to-[#3C096C] text-white border-transparent"
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

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={() => setShowFilters(false)}
              className="bg-gradient-to-r from-[#240046] to-[#3C096C] text-white"
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
