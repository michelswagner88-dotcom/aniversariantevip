// =============================================================================
// INDEX.TSX - ANIVERSARIANTE VIP
// V3 - Topo Roxo Premium + Polish Final
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
  Cake,
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

const CATEGORY_LABELS_SHORT: Record<string, string> = {
  "casa noturna": "Baladas",
  cafeteria: "Cafés",
  entretenimento: "Lazer",
  hospedagem: "Hotéis",
  sorveteria: "Sorveterias",
  salao: "Beleza",
  salão: "Beleza",
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
// HEADER - TOPO ROXO
// =============================================================================

const Header = memo(({ children }: { children?: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#240046]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-between h-14 gap-4">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#3d1a5c] flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span 
                className="text-sm font-bold uppercase tracking-wide"
                style={{
                  background: "linear-gradient(to right, #A78BFA, #60A5FA, #22D3EE)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ANIVERSARIANTE VIP
              </span>
            </Link>

            <div className="flex-1 max-w-xl">{children}</div>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-1.5 h-9 pl-2.5 pr-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-3.5 h-3.5 text-white" />
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          </div>

          {/* Mobile */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between h-12">
              <Link to="/" className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-xl bg-[#3d1a5c] flex items-center justify-center">
                  <Gift className="w-3.5 h-3.5 text-white" />
                </div>
                <span 
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    background: "linear-gradient(to right, #A78BFA, #60A5FA, #22D3EE)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ANIVERSARIANTE VIP
                </span>
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                aria-label="Abrir menu"
              >
                <Menu className="w-4 h-4 text-white" />
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
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            <div className="p-3">
              {user ? (
                <>
                  <div className="px-3 py-2.5 mb-2 bg-violet-50 rounded-xl">
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                      {user.user_metadata?.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <MenuBtn
                    icon={<Gift className="w-4 h-4 text-violet-600" />}
                    label="Minha Área"
                    onClick={() => {
                      navigate("/area-aniversariante");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuBtn
                    icon={<Settings className="w-4 h-4 text-zinc-400" />}
                    label="Configurações"
                    onClick={() => {
                      navigate("/configuracoes");
                      setMenuOpen(false);
                    }}
                  />
                  <div className="my-2 mx-3 border-t border-zinc-100" />
                  <MenuBtn
                    icon={<LogOut className="w-4 h-4 text-red-500" />}
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
                    icon={<User className="w-4 h-4 text-violet-600" />}
                    label="Entrar"
                    sub="Aniversariante"
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuBtn
                    icon={<Gift className="w-4 h-4 text-fuchsia-600" />}
                    label="Cadastrar"
                    sub="É grátis"
                    onClick={() => {
                      navigate("/cadastro");
                      setMenuOpen(false);
                    }}
                  />
                  <div className="my-2 mx-3 border-t border-zinc-100" />
                  <MenuBtn
                    icon={<Building2 className="w-4 h-4 text-blue-600" />}
                    label="Para Empresas"
                    sub="Cadastre seu estabelecimento"
                    onClick={() => {
                      navigate("/seja-parceiro");
                      setMenuOpen(false);
                    }}
                  />
                  <div className="my-2 mx-3 border-t border-zinc-100" />
                  <MenuBtn
                    icon={<HelpCircle className="w-4 h-4 text-zinc-400" />}
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
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
      danger ? "hover:bg-red-50" : "hover:bg-zinc-50",
    )}
  >
    {icon}
    <div>
      <span className={cn("text-sm font-medium block", danger ? "text-red-600" : "text-zinc-900")}>{label}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  </button>
);

// =============================================================================
// SEARCH PILL - Branca sobre fundo roxo
// =============================================================================

const SearchPill = memo(({ city, state, isLoading, onCityClick, onFilterClick, filterCount }: any) => (
  <>
    {/* Desktop - Filtro antes + Pill branca */}
    <div className="hidden sm:flex items-center gap-2">
      {/* Botão filtro PRIMEIRO (menor) */}
      <button
        onClick={onFilterClick}
        className="w-9 h-9 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center relative flex-shrink-0"
        aria-label="Abrir filtros"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
        {filterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>

      {/* Barra de localização DEPOIS */}
      <button
        onClick={onCityClick}
        className="flex items-center gap-2 h-10 pl-3.5 pr-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
        aria-label="Selecionar cidade"
      >
        <MapPin className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
        <div className="text-left min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase font-medium leading-none">Onde</p>
          <p className="text-sm font-medium text-zinc-900 truncate">{isLoading ? "..." : `${city}, ${state}`}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 ml-1">
          <Search className="w-3.5 h-3.5 text-white" />
        </div>
      </button>
    </div>

    {/* Mobile - Pill compacta */}
    <div className="sm:hidden flex items-center gap-2">
      {/* Botão filtro PRIMEIRO (menor) */}
      <button
        onClick={onFilterClick}
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center relative flex-shrink-0"
        aria-label="Abrir filtros"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
        {filterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>

      {/* Barra de busca DEPOIS (menor) */}
      <button
        onClick={onCityClick}
        className="flex-1 flex items-center gap-2 h-9 px-3 bg-white rounded-full shadow-sm"
        aria-label="Selecionar cidade"
      >
        <MapPin className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
        <div className="text-left flex-1 min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase font-medium leading-none">Onde</p>
          <p className="text-sm font-medium text-zinc-900 truncate">{isLoading ? "..." : `${city}, ${state}`}</p>
        </div>
      </button>
    </div>
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
      <div className="flex items-center gap-3 px-4 h-12 border-b border-zinc-100">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-zinc-500" />
        </button>
        <span className="font-semibold text-zinc-900 text-sm">Alterar cidade</span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2.5 bg-zinc-100 rounded-xl px-3.5 h-11">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cidade..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {searching && (
            <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>
      {query.length < 2 && (
        <div className="px-3">
          <p className="text-[10px] text-zinc-500 uppercase mb-1.5 px-1 font-medium">Cidade atual</p>
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-50 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 text-sm">{city}</p>
              <p className="text-xs text-zinc-500">{state}</p>
            </div>
          </button>
        </div>
      )}
      {results.length > 0 && (
        <div className="px-3 mt-2">
          <p className="text-[10px] text-zinc-500 uppercase mb-1.5 px-1 font-medium">Resultados</p>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(r.cidade, r.estado);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="font-medium text-zinc-900 text-sm">{r.cidade}</p>
                <p className="text-xs text-zinc-500">{r.estado}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// =============================================================================
// CATEGORIES - Fundo roxo, ícones brancos
// =============================================================================

const Categories = memo(({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) => {
  const cats = [
    { id: "all", label: "Todos" },
    ...CATEGORIAS_ESTABELECIMENTO.map((c) => ({ id: c.value, label: c.label })),
  ];

  return (
    <div className="sticky top-[48px] sm:top-[56px] z-30 bg-[#240046]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {cats.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id.toLowerCase()] || Sparkles;
            const isActive = selected === cat.id;
            const shortLabel = CATEGORY_LABELS_SHORT[cat.id.toLowerCase()] || cat.label;

            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className="flex flex-col items-center gap-0.5 min-w-[60px] sm:min-w-[68px] px-2 py-2 relative text-white"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium whitespace-nowrap">{shortLabel}</span>
                {isActive && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-white rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// EMPTY BANNER - Discreto com CTA roxo
// =============================================================================

const EmptyBanner = memo(({ cidade, onNotify, onDismiss }: any) => (
<div className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-xl mb-3">
    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-zinc-900">Ainda não chegamos em {cidade}</p>
      <p className="text-[10px] text-zinc-500">Mostrando outros lugares</p>
    </div>
    <button
      onClick={onNotify}
      className="h-7 px-2.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-medium rounded-full flex items-center gap-1 flex-shrink-0"
      aria-label="Avise-me quando chegar"
    >
      <Bell className="w-3 h-3" />
      Avise-me
    </button>
    <button
      onClick={onDismiss}
      className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center flex-shrink-0"
      aria-label="Fechar aviso"
    >
      <X className="w-3.5 h-3.5 text-zinc-400" />
    </button>
  </div>
));

// =============================================================================
// BENEFIT CHIP - Curto e útil
// =============================================================================

const getBenefitChipText = (beneficio?: string): string => {
  if (!beneficio || beneficio.length < 3) return "🎂 Benefício";

  const descontoMatch = beneficio.match(/(\d+)\s*%/);
  if (descontoMatch) return `🎁 ${descontoMatch[1]}% OFF`;

  if (beneficio.toLowerCase().includes("grátis") || beneficio.toLowerCase().includes("gratis")) {
    if (beneficio.toLowerCase().includes("drink")) return "🥂 Drink grátis";
    if (beneficio.toLowerCase().includes("sobremesa")) return "🍰 Sobremesa";
    if (beneficio.toLowerCase().includes("entrada")) return "🎟️ Entrada";
    return "🎁 Grátis";
  }

  if (beneficio.length <= 12) return `🎁 ${beneficio}`;
  return "🎂 Benefício";
};

// =============================================================================
// CARD - Premium com skeleton shimmer
// =============================================================================

const Card = memo(({ data, onClick }: any) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const nome = data.nome_fantasia || data.name || "Estabelecimento";
  const cat = Array.isArray(data.categoria) ? data.categoria[0] : data.categoria || data.category;
  const img = data.imagem_url || data.logo_url || data.photo_url;
  const beneficio = data.descricao_beneficio || data.benefit_description;
  const chipText = getBenefitChipText(beneficio);

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
        ) : null}

        {(!img || error || !loaded) && (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        )}

        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center px-2 py-0.5 bg-white/95 backdrop-blur-sm text-[10px] font-semibold text-zinc-700 rounded-full shadow-sm">
            {chipText}
          </span>
        </div>

        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center"
          aria-label="Favoritar"
        >
          <Heart className="w-3.5 h-3.5 text-zinc-500" />
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
// CAROUSEL - Padding corrigido
// =============================================================================

const Carousel = memo(({ title, subtitle, items }: any) => {
  const navigate = useNavigate();
  if (!items?.length) return null;

  return (
    <section className="mb-6">
      <div className="mb-2.5 px-4 sm:px-0">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-600">{subtitle}</p>}
      </div>
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-0 scroll-pl-4 scroll-pr-4"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((est: any) => (
          <div key={est.id} className="snap-start flex-shrink-0 w-[44%] sm:w-[180px]">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] rounded-2xl bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] mb-2" />
            <div className="h-4 bg-zinc-200 rounded w-3/4 mb-1" />
            <div className="h-3 bg-zinc-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
          <Gift className="w-7 h-7 text-zinc-400" />
        </div>
        <p className="text-zinc-900 font-medium text-sm">Nenhum resultado</p>
        <p className="text-zinc-500 text-sm">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
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
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <Header>
        <SearchPill
          city={city}
          state={state}
          isLoading={locationLoading}
          onCityClick={() => setCityModalOpen(true)}
          onFilterClick={() => setShowFilters(true)}
          filterCount={filterCount}
        />
      </Header>

      <Categories selected={categoria} onSelect={handleCategoria} />

      <main className="flex-1 pb-20 sm:pb-6">
        <div className="max-w-7xl mx-auto sm:px-6 py-3 sm:py-4">
          {!isLoading && fallback && !bannerDismissed && (
            <div className="px-4 sm:px-0">
              <EmptyBanner
                cidade={city}
                onNotify={() => navigate("/cadastro?interesse=" + encodeURIComponent(city))}
                onDismiss={() => setBannerDismissed(true)}
              />
            </div>
          )}

          {isLoading && (
            <div className="px-4 sm:px-0">
              <Grid items={[]} isLoading />
            </div>
          )}

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
            <div className="px-4 sm:px-0">
              <div className="mb-3">
                <h2 className="text-base font-semibold text-zinc-900 capitalize">
                  {fallback ? `${categoria} no Brasil` : `${categoria} em ${city}`}
                </h2>
                <p className="text-sm text-zinc-500">{filtered.length} lugares</p>
              </div>
              <Grid items={filtered} isLoading={false} />
            </div>
          )}

          {!isLoading && !showCarousels && !showGrid && filtered.length > 0 && (
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-semibold text-zinc-900 mb-3">Em destaque</h2>
              <Grid items={filtered} isLoading={false} />
            </div>
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

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md max-h-[80vh] p-0 rounded-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-base">Filtros</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[55vh] px-4">
            <div className="space-y-5 py-4">
              {categoria !== "all" && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">Tipo</h3>
                  <div className="flex flex-wrap gap-2">
                    {getSubcategoriesForCategory(categoria).map((s) => (
                      <Badge
                        key={s.id}
                        variant={subcategories.includes(s.label) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer h-8 rounded-full text-xs",
                          subcategories.includes(s.label) && "bg-violet-600 hover:bg-violet-700",
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
                <h3 className="text-sm font-medium text-zinc-900 mb-2">Distância</h3>
                {!userLocation ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestLocation}
                    disabled={geoLoading}
                    className="gap-2 h-8 text-xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {geoLoading ? "Obtendo..." : "Usar localização"}
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10, 20].map((km) => (
                      <Badge
                        key={km}
                        variant={distance === km ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer h-8 rounded-full text-xs",
                          distance === km && "bg-violet-600 hover:bg-violet-700",
                        )}
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
              className="text-xs h-8"
            >
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={() => setShowFilters(false)}
              className="bg-violet-600 hover:bg-violet-700 rounded-full px-5 h-8 text-xs"
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
