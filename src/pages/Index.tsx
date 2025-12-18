// =============================================================================
// INDEX.TSX - ANIVERSARIANTE VIP
// Versão simplificada - usa apenas componentes existentes
// =============================================================================

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Search, X, Bell, ChevronRight } from "lucide-react";
import { useEstabelecimentos } from "@/hooks/useEstabelecimentos";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calcularDistancia } from "@/lib/geoUtils";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { getSubcategoriesForCategory } from "@/constants/categorySubcategories";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { cn } from "@/lib/utils";

// Components existentes
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { EstablishmentCard } from "@/components/cards";

// UI
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Dumbbell,
  Beer,
  Scissors,
  Coffee,
  PartyPopper,
  Gamepad2,
  Hotel,
  Store,
  Paintbrush,
  Utensils,
  IceCream,
  SlidersHorizontal,
} from "lucide-react";

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CITY = "São Paulo";
const DEFAULT_STATE = "SP";

// =============================================================================
// HOOKS
// =============================================================================

const useLocation = () => {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [state, setState] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("aniversariantevip_city");
    const savedState = localStorage.getItem("aniversariantevip_state");

    if (saved && savedState) {
      setCity(saved);
      setState(savedState);
      setLoading(false);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
              { headers: { "Accept-Language": "pt-BR" } },
            );
            const data = await res.json();
            const addr = data.address;
            const c = addr.city || addr.town || addr.municipality || DEFAULT_CITY;
            const s = addr["ISO3166-2-lvl4"]?.split("-")[1] || DEFAULT_STATE;
            setCity(c);
            setState(s);
            localStorage.setItem("aniversariantevip_city", c);
            localStorage.setItem("aniversariantevip_state", s);
          } catch {
            // keep default
          } finally {
            setLoading(false);
          }
        },
        () => setLoading(false),
        { timeout: 8000 },
      );
    } else {
      setLoading(false);
    }
  }, []);

  const update = useCallback((c: string, s: string) => {
    setCity(c);
    setState(s);
    localStorage.setItem("aniversariantevip_city", c);
    localStorage.setItem("aniversariantevip_state", s);
  }, []);

  return { city, state, loading, update };
};

// =============================================================================
// INLINE COMPONENTS (para não criar arquivos novos)
// =============================================================================

// Search Bar inline
interface SearchBarInlineProps {
  city: string;
  state: string;
  isLoading?: boolean;
  onCityChange: (city: string, state: string) => void;
}

const SearchBarInline = ({ city, state, isLoading, onCityChange }: SearchBarInlineProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ cidade: string; estado: string }>>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`);
        const data = await res.json();
        setSuggestions(
          data
            .filter((m: any) => m.nome.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8)
            .map((m: any) => ({ cidade: m.nome, estado: m.microrregiao.mesorregiao.UF.sigla })),
        );
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (c: string, s: string) => {
    onCityChange(c, s);
    setModalOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        disabled={isLoading}
        className="w-full flex items-center gap-3 h-12 px-4 bg-white rounded-full shadow-sm text-left hover:shadow-md transition-shadow"
      >
        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-violet-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">ONDE</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {isLoading ? "Detectando..." : `${city}, ${state}`}
          </p>
        </div>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100">
            <button
              onClick={() => setModalOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <span className="font-semibold text-gray-900">Alterar cidade</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 h-12">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cidade..."
                className="flex-1 bg-transparent outline-none"
              />
              {searching && (
                <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
          {query.length < 2 && (
            <div className="px-4">
              <p className="text-xs text-gray-500 uppercase mb-2 px-1">Cidade atual</p>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{city}</p>
                  <p className="text-sm text-gray-500">{state}</p>
                </div>
              </button>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="px-4 mt-2">
              <p className="text-xs text-gray-500 uppercase mb-2 px-1">Resultados</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(s.cidade, s.estado)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{s.cidade}</p>
                    <p className="text-sm text-gray-500">{s.estado}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Empty State Banner inline
const EmptyBanner = ({
  cidade,
  onNotify,
  onDismiss,
}: {
  cidade: string;
  onNotify: () => void;
  onDismiss: () => void;
}) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
      <MapPin className="w-4 h-4 text-gray-500" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">Ainda não chegamos em {cidade}</p>
      <p className="text-xs text-gray-500">Mostrando outros lugares</p>
    </div>
    <button
      onClick={onNotify}
      className="h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
    >
      <Bell className="w-3.5 h-3.5" />
      Avise-me
    </button>
    <button onClick={onDismiss} className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center">
      <X className="w-4 h-4 text-gray-400" />
    </button>
  </div>
);

// Card Grid inline
const CardGridInline = ({ items, isLoading }: { items: any[]; isLoading: boolean }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] rounded-xl bg-gray-200 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Nenhum resultado encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((est) => (
        <EstablishmentCard
          key={est.id}
          data={est}
          onClick={() =>
            navigate(
              getEstabelecimentoUrl({
                estado: est.estado || "",
                cidade: est.cidade || "",
                slug: est.slug || null,
                id: est.id,
              }),
            )
          }
        />
      ))}
    </div>
  );
};

// Carousel inline
const CarouselInline = ({ title, subtitle, items }: { title: string; subtitle?: string; items: any[] }) => {
  const navigate = useNavigate();

  if (!items.length) return null;

  return (
    <section className="mb-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-violet-600">{subtitle}</p>}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
        {items.map((est) => (
          <div key={est.id} className="flex-shrink-0" style={{ width: "calc(50% - 6px)" }}>
            <EstablishmentCard
              data={est}
              onClick={() =>
                navigate(
                  getEstabelecimentoUrl({
                    estado: est.estado || "",
                    cidade: est.cidade || "",
                    slug: est.slug || null,
                    id: est.id,
                  }),
                )
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
};

// Categorias inline
const CATEGORY_ICONS: Record<string, any> = {
  all: Sparkles,
  academia: Dumbbell,
  bar: Beer,
  barbearia: Scissors,
  cafeteria: Coffee,
  "casa noturna": PartyPopper,
  entretenimento: Gamepad2,
  hospedagem: Hotel,
  loja: Store,
  restaurante: Utensils,
  salao: Paintbrush,
  sorveteria: IceCream,
};

const CategoriasPillsInline = ({
  selected,
  onSelect,
  onFilterClick,
  filterCount,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onFilterClick: () => void;
  filterCount: number;
}) => {
  const cats = [
    { id: "all", label: "Todos" },
    ...CATEGORIAS_ESTABELECIMENTO.map((c) => ({ id: c.value, label: c.label })),
  ];

  return (
    <div className="bg-[#240046] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 py-2">
          <div
            className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {cats.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Sparkles;
              const isActive = selected === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className="flex flex-col items-center gap-1 min-w-[60px] px-2 py-2 relative"
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/60")} />
                  <span
                    className={cn(
                      "text-[11px] font-medium whitespace-nowrap",
                      isActive ? "text-white" : "text-white/60",
                    )}
                  >
                    {cat.label}
                  </span>
                  {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />}
                </button>
              );
            })}
          </div>
          <div className="w-px h-8 bg-white/20" />
          <button
            onClick={onFilterClick}
            className="flex items-center gap-2 h-9 px-3 bg-white/10 hover:bg-white/20 rounded-lg"
          >
            <SlidersHorizontal className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Filtros</span>
            {filterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#240046] text-xs font-bold flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN
// =============================================================================

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { city, state, loading: locationLoading, update: updateCity } = useLocation();
  const { location: userLocation, requestLocation, loading: geoLoading } = useUserLocation();

  const [showFilters, setShowFilters] = useState(false);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const categoria = searchParams.get("categoria") || "all";

  const { data: estabelecimentos, isLoading } = useEstabelecimentos({
    showAll: true,
    enabled: true,
  });

  // Filter
  const { filtered, fallback } = useMemo(() => {
    if (!estabelecimentos?.length) return { filtered: [], fallback: false };

    let items = [...estabelecimentos];
    let usingFallback = false;

    const byCity = items.filter(
      (e) => e.cidade?.toLowerCase() === city.toLowerCase() && e.estado?.toLowerCase() === state.toLowerCase(),
    );
    if (byCity.length > 0) {
      items = byCity;
    } else {
      usingFallback = true;
    }

    if (categoria && categoria !== "all") {
      items = items.filter((e) => {
        const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
        return cats.some((c) => c?.toLowerCase() === categoria.toLowerCase());
      });
    }

    if (subcategories.length > 0) {
      items = items.filter((e) => {
        const specs = e.especialidades || [];
        return subcategories.some((s) => specs.includes(s));
      });
    }

    if (distance && userLocation) {
      items = items.filter((e) => {
        if (!e.latitude || !e.longitude) return false;
        return calcularDistancia(userLocation.lat, userLocation.lng, e.latitude, e.longitude) <= distance;
      });
    }

    return { filtered: items, fallback: usingFallback };
  }, [estabelecimentos, city, state, categoria, subcategories, distance, userLocation]);

  // Carousels
  const carousels = useMemo(() => {
    if (!filtered.length || (categoria && categoria !== "all")) return [];

    const cats = ["academia", "bar", "restaurante", "salao"];
    const titles: Record<string, { title: string; subtitle: string }> = {
      academia: { title: "Academias em destaque", subtitle: "Treine com benefícios" },
      bar: { title: "Bares para comemorar", subtitle: "Celebre seu dia" },
      restaurante: { title: "Restaurantes especiais", subtitle: "Jante com vantagens" },
      salao: { title: "Salões de beleza", subtitle: "Cuide-se" },
    };

    return cats
      .map((cat) => ({
        id: cat,
        ...titles[cat],
        items: filtered
          .filter((e) => {
            const cs = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
            return cs.some((c) => c?.toLowerCase() === cat);
          })
          .slice(0, 10),
      }))
      .filter((c) => c.items.length >= 2);
  }, [filtered, categoria]);

  const handleCategoria = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id === "all") {
      params.delete("categoria");
    } else {
      params.set("categoria", id);
    }
    setSearchParams(params);
    setSubcategories([]);
  };

  const filterCount = (subcategories.length > 0 ? 1 : 0) + (distance ? 1 : 0);
  const showGrid = categoria !== "all";
  const showCarousels = categoria === "all" && carousels.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header>
        <SearchBarInline city={city} state={state} isLoading={locationLoading} onCityChange={updateCity} />
      </Header>

      {/* Categorias */}
      <CategoriasPillsInline
        selected={categoria}
        onSelect={handleCategoria}
        onFilterClick={() => setShowFilters(true)}
        filterCount={filterCount}
      />

      {/* Main */}
      <main className="flex-1 pb-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Fallback Banner */}
          {!isLoading && fallback && !bannerDismissed && (
            <EmptyBanner
              cidade={city}
              onNotify={() => navigate("/cadastro?interesse=" + encodeURIComponent(city))}
              onDismiss={() => setBannerDismissed(true)}
            />
          )}

          {/* Loading */}
          {isLoading && <CardGridInline items={[]} isLoading />}

          {/* Carousels */}
          {!isLoading &&
            showCarousels &&
            carousels.map((c) => (
              <CarouselInline
                key={c.id}
                title={fallback ? `${c.title} no Brasil` : `${c.title} em ${city}`}
                subtitle={c.subtitle}
                items={c.items}
              />
            ))}

          {/* Grid */}
          {!isLoading && showGrid && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {fallback ? `${categoria} no Brasil` : `${categoria} em ${city}`}
                </h2>
                <p className="text-sm text-gray-500">{filtered.length} lugares</p>
              </div>
              <CardGridInline items={filtered} isLoading={false} />
            </div>
          )}

          {/* Fallback Grid */}
          {!isLoading && !showCarousels && !showGrid && filtered.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Em destaque</h2>
              <CardGridInline items={filtered} isLoading={false} />
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />

      {/* Filters Modal */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md max-h-[85vh] p-0 rounded-xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-4">
            <div className="space-y-6 py-4">
              {categoria !== "all" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tipo</h3>
                  <div className="flex flex-wrap gap-2">
                    {getSubcategoriesForCategory(categoria).map((s) => (
                      <Badge
                        key={s.id}
                        variant={subcategories.includes(s.label) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer h-8 rounded-full",
                          subcategories.includes(s.label) && "bg-violet-600",
                        )}
                        onClick={() =>
                          setSubcategories((prev) =>
                            prev.includes(s.label) ? prev.filter((x) => x !== s.label) : [...prev, s.label],
                          )
                        }
                      >
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Distância</h3>
                {!userLocation ? (
                  <Button variant="outline" size="sm" onClick={requestLocation} disabled={geoLoading} className="gap-2">
                    <MapPin className="w-4 h-4" />
                    {geoLoading ? "Obtendo..." : "Usar localização"}
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10, 20].map((km) => (
                      <Badge
                        key={km}
                        variant={distance === km ? "default" : "outline"}
                        className={cn("cursor-pointer h-8 rounded-full", distance === km && "bg-violet-600")}
                        onClick={() => setDistance(distance === km ? null : km)}
                      >
                        Até {km} km
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSubcategories([]);
                setDistance(null);
              }}
            >
              Limpar
            </Button>
            <Button size="sm" onClick={() => setShowFilters(false)} className="bg-violet-600 hover:bg-violet-700">
              Ver {filtered.length} lugares
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
