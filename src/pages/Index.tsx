// =============================================================================
// INDEX.TSX - ANIVERSARIANTE VIP
// Design: Estilo Airbnb Mobile - Compacto
// =============================================================================

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
import { MapPin, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// EMPTY STATE BANNER
// =============================================================================

interface EmptyStateBannerProps {
  cidade: string;
  onNotifyMe?: () => void;
}

const EmptyStateBanner = ({ cidade, onNotifyMe }: EmptyStateBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#240046] to-[#5A189A] rounded-xl">
      <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
        <MapPin className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-tight">Ainda não chegamos em {cidade}</p>
        <p className="text-white/70 text-xs mt-0.5">Mostrando outros lugares</p>
      </div>
      <Button
        size="sm"
        onClick={onNotifyMe}
        className="h-9 px-4 rounded-lg bg-white text-[#240046] hover:bg-white/90 font-semibold text-xs flex-shrink-0"
      >
        <Bell className="w-3.5 h-3.5 mr-1.5" />
        Avise-me
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
        aria-label="Fechar"
      >
        <X className="w-4 h-4 text-white/80" />
      </button>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de filtros
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [filterDistance, setFilterDistance] = useState<number | null>(null);
  const [filterValidity, setFilterValidity] = useState<string | null>(null);

  // Geolocalização
  const { location: userLocation, requestLocation, loading: locationLoading } = useUserLocation();

  // Parâmetros da URL
  const cidadeParam = useMemo(() => searchParams.get("cidade"), [searchParams]);
  const estadoParam = useMemo(() => searchParams.get("estado"), [searchParams]);
  const categoriaParam = useMemo(() => searchParams.get("categoria"), [searchParams]);
  const buscaParam = useMemo(() => searchParams.get("q"), [searchParams]);

  // Cidade inteligente
  const { cidade: cidadeDetectada, estado: estadoDetectado, setCidadeManual, limparCidade } = useCidadeInteligente();

  const cidadeFinal = cidadeParam || cidadeDetectada;
  const estadoFinal = estadoParam || estadoDetectado;

  // Estabelecimentos
  const { data: estabelecimentos, isLoading: isLoadingEstabelecimentos } = useEstabelecimentos({
    showAll: true,
    enabled: true,
  });

  // Filtrar estabelecimentos
  const { estabelecimentosFiltrados, usandoFallback } = useMemo(() => {
    if (!estabelecimentos || estabelecimentos.length === 0) {
      return { estabelecimentosFiltrados: [], usandoFallback: false };
    }

    let filtrados = [...estabelecimentos];
    let usouFallback = false;

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

    if (categoriaParam) {
      filtrados = filtrados.filter((est) => {
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        return cats.some((cat) => cat?.toLowerCase() === categoriaParam.toLowerCase());
      });
    }

    if (selectedSubcategories.length > 0) {
      filtrados = filtrados.filter((est) => {
        const specs = est.especialidades || [];
        return selectedSubcategories.some((sub) => specs.includes(sub));
      });
    }

    if (filterDistance && userLocation) {
      filtrados = filtrados.filter((est) => {
        if (!est.latitude || !est.longitude) return false;
        const dist = calcularDistancia(userLocation.lat, userLocation.lng, est.latitude, est.longitude);
        return dist <= filterDistance;
      });
    }

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

  const dadosParaExibir = useMemo(() => {
    if (estabelecimentosFiltrados && estabelecimentosFiltrados.length > 0) {
      return estabelecimentosFiltrados;
    }
    if (estabelecimentos && estabelecimentos.length > 0) {
      return estabelecimentos;
    }
    return [];
  }, [estabelecimentosFiltrados, estabelecimentos]);

  // Mapa
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

  // Contagem de filtros
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSubcategories.length > 0) count++;
    if (filterDistance) count++;
    if (filterValidity) count++;
    return count;
  }, [selectedSubcategories, filterDistance, filterValidity]);

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

  const handleCidadeChange = (novaCidade: string, novoEstado: string) => {
    setCidadeManual(novaCidade, novoEstado);
    const newParams = new URLSearchParams();
    newParams.set("cidade", novaCidade);
    newParams.set("estado", novoEstado);
    setSearchParams(newParams);
  };

  const handleNotifyMe = () => {
    navigate("/cadastro?interesse=" + encodeURIComponent(cidadeFinal || ""));
  };

  // SEO
  useSEO({
    title:
      cidadeFinal && !usandoFallback
        ? `Benefícios para Aniversariantes em ${cidadeFinal}, ${estadoFinal}`
        : "O Maior Guia de Benefícios para Aniversariantes do Brasil",
    description:
      cidadeFinal && !usandoFallback
        ? `Encontre ${estabelecimentosFiltrados.length} estabelecimentos com benefícios exclusivos para aniversariantes em ${cidadeFinal}.`
        : "Descubra benefícios exclusivos para aniversariantes em restaurantes, bares, academias e mais.",
  });

  // Seções dinâmicas
  const destaquesConfig = usandoFallback
    ? { titulo: "Em destaque no Brasil", subtitulo: "Os melhores benefícios para aniversariantes" }
    : getSectionTitle("destaques", cidadeFinal || undefined);

  const { sections: rotatingSections, animationKey } = useRotatingSections(ALL_HOME_SECTIONS, {
    rotatingCount: 5,
    rotationInterval: 30000,
    featuredRotationInterval: 30000,
    rotateOnMount: true,
    lockDuration: 10000,
  });

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

  const mostrarCarrosseis = !categoriaParam && !buscaParam && secoesDinamicas.length > 0;
  const mostrarGridSimples = !isLoadingEstabelecimentos && !mostrarCarrosseis && !categoriaParam && !buscaParam;
  const isFiltered = !!(categoriaParam || buscaParam);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - Compacto */}
      <Header />

      {/* Hero - Apenas busca de cidade */}
      <HeroSection
        selectedCity={cidadeFinal || undefined}
        selectedState={estadoFinal || undefined}
        onCityChange={handleCidadeChange}
      />

      {/* Categorias - Sticky */}
      <div className="bg-[#240046] sticky top-0 z-30">
        <div className="max-w-[1920px] mx-auto px-4">
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
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1920px] mx-auto px-4 py-3">
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

      {/* Conteúdo Principal */}
      <main className="flex-1 pb-20 sm:pb-0">
        <div className="max-w-[1920px] mx-auto px-4 pt-4 pb-8">
          {/* Empty State Banner */}
          {!isLoadingEstabelecimentos && usandoFallback && cidadeFinal && (
            <div className="mb-4">
              <EmptyStateBanner cidade={cidadeFinal} onNotifyMe={handleNotifyMe} />
            </div>
          )}

          {/* Loading */}
          {isLoadingEstabelecimentos && (
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <CarouselSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Carrosseis */}
          {!isLoadingEstabelecimentos && mostrarCarrosseis && (
            <div className="space-y-8">
              {secoesDinamicas.map((section, index) => {
                const isFeatured = index === 0 && section.priority === "featured";
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
                      <div className="mt-6">
                        <CTABanner variant="register" />
                      </div>
                    )}

                    {index === 2 && (
                      <div className="mt-6">
                        <CTABanner variant="partner" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid Simples */}
          {!isLoadingEstabelecimentos && mostrarGridSimples && dadosParaExibir.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{destaquesConfig.titulo}</h2>
                  <p className="text-sm text-gray-500">{destaquesConfig.subtitulo}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {dadosParaExibir.length} {dadosParaExibir.length === 1 ? "lugar" : "lugares"}
                </span>
              </div>

              <AirbnbCardGrid estabelecimentos={dadosParaExibir} isLoading={false} userLocation={userLocation} />

              <CTABanner variant="register" />
            </div>
          )}

          {/* Grid com Mapa - Filtrado */}
          {!isLoadingEstabelecimentos && isFiltered && (
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
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {categoriaParam
                      ? usandoFallback
                        ? `${getCategoryTitle(categoriaParam, undefined)} no Brasil`
                        : getCategoryTitle(categoriaParam, cidadeFinal || undefined)
                      : destaquesConfig.titulo}
                  </h2>
                  {categoriaParam && getCategorySubtitle(categoriaParam) && (
                    <p className="text-sm text-gray-500 mt-0.5">{getCategorySubtitle(categoriaParam)}</p>
                  )}
                  {estabelecimentosFiltrados.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {estabelecimentosFiltrados.length} {estabelecimentosFiltrados.length === 1 ? "lugar" : "lugares"}
                    </p>
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
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categorias</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!categoriaParam ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      handleCategoriaChange(null);
                      setSelectedSubcategories([]);
                    }}
                    className={cn(
                      "min-h-[44px]",
                      !categoriaParam && "bg-gradient-to-r from-[#240046] to-[#5A189A] text-white border-0",
                    )}
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
                      className={cn(
                        "min-h-[44px]",
                        categoriaParam === cat.value &&
                          "bg-gradient-to-r from-[#240046] to-[#5A189A] text-white border-0",
                      )}
                    >
                      {cat.icon} {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subcategorias */}
              {categoriaParam && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tipo de {categoriaParam}</h3>
                  <div className="flex flex-wrap gap-2">
                    {getSubcategoriesForCategory(categoriaParam).map((sub) => {
                      const isSelected = selectedSubcategories.includes(sub.label);
                      return (
                        <Badge
                          key={sub.id}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-all min-h-[36px] px-3",
                            isSelected
                              ? "bg-gradient-to-r from-[#240046] to-[#5A189A] text-white border-transparent"
                              : "hover:bg-gray-100",
                          )}
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

              {/* Distância */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Distância</h3>
                {!userLocation ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestLocation}
                    disabled={locationLoading}
                    className="gap-2 min-h-[44px]"
                  >
                    <MapPin className="h-4 w-4" />
                    {locationLoading ? "Obtendo..." : "Usar minha localização"}
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10, 20].map((km) => (
                      <Badge
                        key={km}
                        variant={filterDistance === km ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all min-h-[36px] px-3",
                          filterDistance === km
                            ? "bg-gradient-to-r from-[#240046] to-[#5A189A] text-white border-transparent"
                            : "hover:bg-gray-100",
                        )}
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
                <h3 className="text-sm font-medium text-gray-900 mb-3">Validade do Benefício</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "dia", label: "No dia" },
                    { value: "semana", label: "Na semana" },
                    { value: "mes", label: "No mês" },
                  ].map((opt) => (
                    <Badge
                      key={opt.value}
                      variant={filterValidity === opt.value ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all min-h-[36px] px-3",
                        filterValidity === opt.value
                          ? "bg-gradient-to-r from-[#240046] to-[#5A189A] text-white border-transparent"
                          : "hover:bg-gray-100",
                      )}
                      onClick={() => setFilterValidity(filterValidity === opt.value ? null : opt.value)}
                    >
                      {opt.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Modal */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-gray-600">
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={() => setShowFilters(false)}
              className="bg-gradient-to-r from-[#240046] to-[#5A189A] text-white min-h-[44px]"
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
