// =============================================================================
// INDEX.TSX - ANIVERSARIANTE VIP
// Redesign Airbnb-like - TUDO INLINE
// =============================================================================

import { useMemo, useState, useEffect, useCallback, useRef, memo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Search,
  X,
  Bell,
  Menu,
  User,
  Gift,
  Building2,
  LogOut,
  Settings,
  HelpCircle,
  Heart,
  SlidersHorizontal,
  Sparkles,
  Dumbbell,
  Beer,
  Scissors,
  Coffee,
  PartyPopper,
  Gamepad2,
  Hotel,
  Store,
  Utensils,
  Paintbrush,
  IceCream,
} from "lucide-react";
import { useEstabelecimentos } from "@/hooks/useEstabelecimentos";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calcularDistancia } from "@/lib/geoUtils";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { getSubcategoriesForCategory } from "@/constants/categorySubcategories";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Footer } from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CITY = "São Paulo";
const DEFAULT_STATE = "SP";

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
  salão: Paintbrush,
  sorveteria: IceCream,
};

// =============================================================================
// HOOKS
// =============================================================================

const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado");
  }, []);

  return { user, signOut };
};

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
          } catch {}
          setLoading(false);
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
// HEADER - Branco, limpo, estilo Airbnb
// =============================================================================

const Header = memo(({ children }: { children?: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-zinc-900">
                Aniversariante<span className="text-violet-600">VIP</span>
              </span>
            </Link>

            {/* SearchPill Desktop */}
            <div className="flex-1 max-w-2xl">{children}</div>

            {/* Menu */}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-2 h-10 pl-3 pr-2 rounded-full bg-white border border-zinc-200 hover:shadow-md transition-shadow"
            >
              <Menu className="w-4 h-4 text-zinc-600" />
              <div className="w-7 h-7 rounded-full bg-zinc-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>

          {/* Mobile */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between h-14">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-900">
                  Aniversariante<span className="text-violet-600">VIP</span>
                </span>
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
              >
                <Menu className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            {children && <div className="pb-3">{children}</div>}
          </div>
        </div>
      </header>

      {/* Menu Lateral */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <span className="font-semibold text-zinc-900">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            <div className="p-3">
              {user ? (
                <>
                  <div className="px-3 py-3 mb-2 bg-violet-50 rounded-xl">
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                      {user.user_metadata?.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <MenuBtn
                    icon={<Gift className="w-5 h-5 text-violet-600" />}
                    label="Minha Área"
                    onClick={() => {
                      navigate("/area-aniversariante");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuBtn
                    icon={<Settings className="w-5 h-5 text-zinc-400" />}
                    label="Configurações"
                    onClick={() => {
                      navigate("/configuracoes");
                      setMenuOpen(false);
                    }}
                  />
                  <div className="my-2 mx-3 border-t border-zinc-100" />
                  <MenuBtn
                    icon={<LogOut className="w-5 h-5 text-red-500" />}
                    label="Sair"
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    danger
                  />
                </>
              ) : (
                <>
                  <MenuBtn
                    icon={<User className="w-5 h-5 text-violet-600" />}
                    label="Entrar"
                    sub="Aniversariante"
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuBtn
                    icon={<Gift className="w-5 h-5 text-fuchsia-600" />}
                    label="Cadastrar"
                    sub="É grátis"
                    onClick={() => {
                      navigate("/cadastro");
                      setMenuOpen(false);
                    }}
                  />
                  <div className="my-2 mx-3 border-t border-zinc-100" />
                  <MenuBtn
                    icon={<Building2 className="w-5 h-5 text-blue-600" />}
                    label="Para Empresas"
                    sub="Cadastre seu estabelecimento"
                    onClick={() => {
                      navigate("/seja-parceiro");
                      setMenuOpen(false);
                    }}
                  />
                  <div className="my-2 mx-3 border-t border-zinc-100" />
                  <MenuBtn
                    icon={<HelpCircle className="w-5 h-5 text-zinc-400" />}
                    label="Como Funciona"
                    onClick={() => {
                      navigate("/como-funciona");
                      setMenuOpen(false);
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
});

const MenuBtn = ({ icon, label, sub, onClick, danger }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left",
      danger ? "hover:bg-red-50" : "hover:bg-zinc-50",
    )}
  >
    {icon}
    <div>
      <span className={cn("font-medium block", danger ? "text-red-600" : "text-zinc-900")}>{label}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  </button>
);

// =============================================================================
// SEARCH PILL
// =============================================================================

const SearchPill = memo(({ city, state, isLoading, onCityClick, categoria, onFilterClick, filterCount }: any) => (
  <>
    {/* Desktop */}
    <div className="hidden sm:flex items-center h-12 bg-white rounded-full border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onCityClick}
        className="flex items-center gap-2 h-full pl-4 pr-3 rounded-l-full hover:bg-zinc-50"
      >
        <MapPin className="w-4 h-4 text-violet-600" />
        <div className="text-left">
          <p className="text-[10px] text-zinc-500 uppercase font-medium leading-none">Onde</p>
          <p className="text-sm font-medium text-zinc-900">{isLoading ? "..." : `${city}, ${state}`}</p>
        </div>
      </button>
      <div className="w-px h-6 bg-zinc-200" />
      {categoria && categoria !== "all" && (
        <>
          <div className="px-3">
            <span className="text-sm text-zinc-700 capitalize">{categoria}</span>
          </div>
          <div className="w-px h-6 bg-zinc-200" />
        </>
      )}
      <button onClick={onFilterClick} className="flex items-center gap-2 h-full px-3 hover:bg-zinc-50 relative">
        <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
        <span className="text-sm text-zinc-500">Filtros</span>
        {filterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>
      <button className="w-10 h-10 m-1 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center">
        <Search className="w-4 h-4 text-white" />
      </button>
    </div>

    {/* Mobile */}
    <button
      onClick={onCityClick}
      className="sm:hidden w-full flex items-center gap-3 h-12 px-4 bg-white rounded-full border border-zinc-200 shadow-sm"
    >
      <Search className="w-5 h-5 text-zinc-400" />
      <div className="text-left flex-1">
        <p className="text-sm font-medium text-zinc-900">Onde você quer comemorar?</p>
        <p className="text-xs text-zinc-500">{isLoading ? "Detectando..." : `${city}, ${state}`}</p>
      </div>
    </button>
  </>
));

// =============================================================================
// CITY MODAL
// =============================================================================

const CityModal = memo(({ isOpen, onClose, city, state, onSelect }: any) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`);
        const data = await res.json();
        setResults(
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-100">
        <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center">
          <X className="w-5 h-5 text-zinc-500" />
        </button>
        <span className="font-semibold text-zinc-900">Alterar cidade</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 bg-zinc-100 rounded-xl px-4 h-12">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
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
          <p className="text-xs text-zinc-500 uppercase mb-2 px-1">Cidade atual</p>
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-zinc-900">{city}</p>
              <p className="text-sm text-zinc-500">{state}</p>
            </div>
          </button>
        </div>
      )}
      {results.length > 0 && (
        <div className="px-4 mt-2">
          <p className="text-xs text-zinc-500 uppercase mb-2 px-1">Resultados</p>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(r.cidade, r.estado);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-zinc-500" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">{r.cidade}</p>
                <p className="text-sm text-zinc-500">{r.estado}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// =============================================================================
// CATEGORIES
// =============================================================================

const Categories = memo(({ selected, onSelect, onFilterClick, filterCount }: any) => {
  const cats = [
    { id: "all", label: "Todos" },
    ...CATEGORIAS_ESTABELECIMENTO.map((c) => ({ id: c.value, label: c.label })),
  ];

  return (
    <div className="sticky top-[56px] sm:top-[64px] z-30 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-2">
          <div
            className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {cats.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id.toLowerCase()] || Sparkles;
              const isActive = selected === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className="flex flex-col items-center gap-1 min-w-[56px] px-2 py-2 relative"
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-zinc-900" : "text-zinc-400")} />
                  <span
                    className={cn(
                      "text-[11px] font-medium whitespace-nowrap",
                      isActive ? "text-zinc-900" : "text-zinc-500",
                    )}
                  >
                    {cat.label}
                  </span>
                  {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-zinc-900 rounded-full" />}
                </button>
              );
            })}
          </div>
          <div className="w-px h-8 bg-zinc-200 flex-shrink-0" />
          <button
            onClick={onFilterClick}
            className="flex items-center gap-2 h-10 px-4 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
            <span className="text-sm font-medium text-zinc-700">Filtros</span>
            {filterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// EMPTY BANNER
// =============================================================================

const EmptyBanner = memo(({ cidade, onNotify, onDismiss }: any) => (
  <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl mb-4">
    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
      <MapPin className="w-5 h-5 text-zinc-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-zinc-900">Ainda não chegamos em {cidade}</p>
      <p className="text-xs text-zinc-500">Mostrando outros lugares</p>
    </div>
    <button
      onClick={onNotify}
      className="h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full flex items-center gap-1.5 flex-shrink-0"
    >
      <Bell className="w-4 h-4" />
      Avise-me
    </button>
    <button
      onClick={onDismiss}
      className="w-9 h-9 rounded-full hover:bg-zinc-200 flex items-center justify-center flex-shrink-0"
    >
      <X className="w-4 h-4 text-zinc-400" />
    </button>
  </div>
));

// =============================================================================
// CARD
// =============================================================================

const Card = memo(({ data, onClick }: any) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const nome = data.nome_fantasia || data.name || "Estabelecimento";
  const cat = Array.isArray(data.categoria) ? data.categoria[0] : data.categoria || data.category;
  const img = data.imagem_url || data.logo_url || data.photo_url;
  const beneficio = data.descricao_beneficio || data.benefit_description;

  return (
    <article onClick={onClick} className="cursor-pointer group">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100 mb-2">
        {img && !error ? (
          <img
            src={img}
            alt={nome}
            className={cn(
              "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
              loaded ? "opacity-100" : "opacity-0",
            )}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-fuchsia-100">
            <Gift className="w-10 h-10 text-violet-300" />
          </div>
        )}
        {!loaded && img && !error && <div className="absolute inset-0 bg-zinc-200 animate-pulse" />}
        {beneficio && (
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-zinc-900 rounded-full shadow-sm">
              <Gift className="w-3 h-3 text-violet-600" />
              <span className="max-w-[80px] truncate">{beneficio}</span>
            </span>
          </div>
        )}
        <button onClick={(e) => e.stopPropagation()} className="absolute top-2.5 right-2.5" aria-label="Favoritar">
          <Heart className="w-6 h-6 text-white drop-shadow-md fill-black/20 hover:fill-red-500 hover:text-red-500 transition-colors" />
        </button>
      </div>
      <div className="px-0.5">
        <h3 className="font-semibold text-zinc-900 text-sm leading-tight line-clamp-1">{nome}</h3>
        <p className="text-zinc-500 text-sm line-clamp-1">
          {cat && <span className="capitalize">{cat}</span>}
          {cat && data.bairro && " · "}
          {data.bairro}
        </p>
      </div>
    </article>
  );
});

// =============================================================================
// CAROUSEL
// =============================================================================

const Carousel = memo(({ title, subtitle, items }: any) => {
  const navigate = useNavigate();
  if (!items?.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {subtitle && <p className="text-sm text-violet-600">{subtitle}</p>}
      </div>
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((est: any) => (
          <div key={est.id} className="snap-start flex-shrink-0 w-[45%] sm:w-[200px]">
            <Card
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
});

// =============================================================================
// GRID
// =============================================================================

const Grid = memo(({ items, isLoading }: any) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] rounded-2xl bg-zinc-200 mb-2" />
            <div className="h-4 bg-zinc-200 rounded w-3/4 mb-1" />
            <div className="h-3 bg-zinc-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-zinc-400" />
        </div>
        <p className="text-zinc-900 font-medium">Nenhum resultado</p>
        <p className="text-zinc-500 text-sm">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {items.map((est: any) => (
        <Card
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
});

// =============================================================================
// MAIN
// =============================================================================

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { city, state, loading: locationLoading, update: updateCity } = useLocation();
  const { location: userLocation, requestLocation, loading: geoLoading } = useUserLocation();

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const categoria = searchParams.get("categoria") || "all";

  const { data: estabelecimentos, isLoading } = useEstabelecimentos({ showAll: true, enabled: true });

  // Filter
  const { filtered, fallback } = useMemo(() => {
    if (!estabelecimentos?.length) return { filtered: [], fallback: false };

    let items = [...estabelecimentos];
    let usingFallback = false;

    const byCity = items.filter(
      (e) => e.cidade?.toLowerCase() === city.toLowerCase() && e.estado?.toLowerCase() === state.toLowerCase(),
    );
    if (byCity.length > 0) items = byCity;
    else usingFallback = true;

    if (categoria && categoria !== "all") {
      items = items.filter((e) => {
        const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
        return cats.some((c) => c?.toLowerCase() === categoria.toLowerCase());
      });
    }

    if (subcategories.length > 0) {
      items = items.filter((e) => subcategories.some((s) => (e.especialidades || []).includes(s)));
    }

    if (distance && userLocation) {
      items = items.filter(
        (e) =>
          e.latitude &&
          e.longitude &&
          calcularDistancia(userLocation.lat, userLocation.lng, e.latitude, e.longitude) <= distance,
      );
    }

    return { filtered: items, fallback: usingFallback };
  }, [estabelecimentos, city, state, categoria, subcategories, distance, userLocation]);

  // Carousels
  const carousels = useMemo(() => {
    if (!filtered.length || categoria !== "all") return [];
    const cats = ["academia", "bar", "restaurante", "salao"];
    const titles: any = {
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
    id === "all" ? params.delete("categoria") : params.set("categoria", id);
    setSearchParams(params);
    setSubcategories([]);
  };

  const filterCount = (subcategories.length > 0 ? 1 : 0) + (distance ? 1 : 0);
  const showGrid = categoria !== "all";
  const showCarousels = categoria === "all" && carousels.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header>
        <SearchPill
          city={city}
          state={state}
          isLoading={locationLoading}
          onCityClick={() => setCityModalOpen(true)}
          categoria={categoria}
          onFilterClick={() => setShowFilters(true)}
          filterCount={filterCount}
        />
      </Header>

      <Categories
        selected={categoria}
        onSelect={handleCategoria}
        onFilterClick={() => setShowFilters(true)}
        filterCount={filterCount}
      />

      <main className="flex-1 pb-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {!isLoading && fallback && !bannerDismissed && (
            <EmptyBanner
              cidade={city}
              onNotify={() => navigate("/cadastro?interesse=" + encodeURIComponent(city))}
              onDismiss={() => setBannerDismissed(true)}
            />
          )}

          {isLoading && <Grid items={[]} isLoading />}

          {!isLoading &&
            showCarousels &&
            carousels.map((c) => (
              <Carousel
                key={c.id}
                title={fallback ? `${c.title} no Brasil` : `${c.title} em ${city}`}
                subtitle={c.subtitle}
                items={c.items}
              />
            ))}

          {!isLoading && showGrid && (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 capitalize">
                  {fallback ? `${categoria} no Brasil` : `${categoria} em ${city}`}
                </h2>
                <p className="text-sm text-zinc-500">{filtered.length} lugares</p>
              </div>
              <Grid items={filtered} isLoading={false} />
            </>
          )}

          {!isLoading && !showCarousels && !showGrid && filtered.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Em destaque</h2>
              <Grid items={filtered} isLoading={false} />
            </>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />

      <CityModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        city={city}
        state={state}
        onSelect={updateCity}
      />

      {/* Filters Modal */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md max-h-[85vh] p-0 rounded-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-4">
            <div className="space-y-6 py-4">
              {categoria !== "all" && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-3">Tipo</h3>
                  <div className="flex flex-wrap gap-2">
                    {getSubcategoriesForCategory(categoria).map((s) => (
                      <Badge
                        key={s.id}
                        variant={subcategories.includes(s.label) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer h-9 rounded-full",
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
                <h3 className="text-sm font-medium text-zinc-900 mb-3">Distância</h3>
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
                        className={cn("cursor-pointer h-9 rounded-full", distance === km && "bg-violet-600")}
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
          <div className="flex items-center justify-between p-4 border-t border-zinc-100">
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
            <Button
              size="sm"
              onClick={() => setShowFilters(false)}
              className="bg-violet-600 hover:bg-violet-700 rounded-full px-6"
            >
              Ver {filtered.length} lugares
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
