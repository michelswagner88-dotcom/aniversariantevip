// =============================================================================
// INDEX.TSX - ANIVERSARIANTE VIP
// Design: Otimizado, identidade mantida, cards visíveis
// =============================================================================

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEstabelecimentos } from "@/hooks/useEstabelecimentos";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calcularDistancia } from "@/lib/geoUtils";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { getSubcategoriesForCategory } from "@/constants/categorySubcategories";

// Components
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CategoriasPills } from "@/components/home/CategoriasPills";
import { EmptyStateBanner } from "@/components/home/EmptyStateBanner";
import { CardGrid } from "@/components/home/CardGrid";
import { CardCarousel } from "@/components/home/CardCarousel";
import { Footer } from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

// UI
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
  }, []);

  return { city, state, loading, update };
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

    // City
    const byCity = items.filter(
      (e) => e.cidade?.toLowerCase() === city.toLowerCase() && e.estado?.toLowerCase() === state.toLowerCase(),
    );
    if (byCity.length > 0) {
      items = byCity;
    } else {
      usingFallback = true;
    }

    // Category
    if (categoria && categoria !== "all") {
      items = items.filter((e) => {
        const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
        return cats.some((c) => c?.toLowerCase() === categoria.toLowerCase());
      });
    }

    // Subcategories
    if (subcategories.length > 0) {
      items = items.filter((e) => {
        const specs = e.especialidades || [];
        return subcategories.some((s) => specs.includes(s));
      });
    }

    // Distance
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

  // Handlers
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

  const handleNotify = () => {
    navigate("/cadastro?interesse=" + encodeURIComponent(city));
  };

  const filterCount = (subcategories.length > 0 ? 1 : 0) + (distance ? 1 : 0);

  const showGrid = categoria !== "all";
  const showCarousels = categoria === "all" && carousels.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header>
        <SearchBar city={city} state={state} isLoading={locationLoading} onCityChange={updateCity} />
      </Header>

      {/* Categorias */}
      <CategoriasPills
        selected={categoria}
        onSelect={handleCategoria}
        onFilterClick={() => setShowFilters(true)}
        filterCount={filterCount}
      />

      {/* Main */}
      <main className="flex-1 pb-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Fallback Banner */}
          {!isLoading && fallback && (
            <div className="mb-4">
              <EmptyStateBanner cidade={city} onNotifyMe={handleNotify} />
            </div>
          )}

          {/* Loading */}
          {isLoading && <CardGrid items={[]} isLoading />}

          {/* Carousels */}
          {!isLoading && showCarousels && (
            <div className="space-y-6">
              {carousels.map((c) => (
                <CardCarousel
                  key={c.id}
                  title={fallback ? `${c.title} no Brasil` : `${c.title} em ${city}`}
                  subtitle={c.subtitle}
                  items={c.items}
                />
              ))}
            </div>
          )}

          {/* Grid */}
          {!isLoading && showGrid && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {fallback ? `${categoria} no Brasil` : `${categoria} em ${city}`}
                </h2>
                <p className="text-sm text-gray-500">
                  {filtered.length} {filtered.length === 1 ? "lugar" : "lugares"}
                </p>
              </div>
              <CardGrid items={filtered} />
            </div>
          )}

          {/* Fallback Grid */}
          {!isLoading && !showCarousels && !showGrid && filtered.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Em destaque</h2>
              <CardGrid items={filtered} />
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
              {/* Categoria */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categoria</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={categoria === "all" ? "default" : "outline"}
                    className={cn("cursor-pointer h-8 rounded-full", categoria === "all" && "bg-violet-600")}
                    onClick={() => handleCategoria("all")}
                  >
                    Todos
                  </Badge>
                  {CATEGORIAS_ESTABELECIMENTO.map((c) => (
                    <Badge
                      key={c.value}
                      variant={categoria === c.value ? "default" : "outline"}
                      className={cn("cursor-pointer h-8 rounded-full", categoria === c.value && "bg-violet-600")}
                      onClick={() => handleCategoria(c.value)}
                    >
                      {c.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Subcategorias */}
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
                        onClick={() => {
                          setSubcategories((prev) =>
                            prev.includes(s.label) ? prev.filter((x) => x !== s.label) : [...prev, s.label],
                          );
                        }}
                      >
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Distância */}
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

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSubcategories([]);
                setDistance(null);
                handleCategoria("all");
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
