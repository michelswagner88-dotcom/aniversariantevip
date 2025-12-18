// =============================================================================
// INDEX.TSX - ANIVERSARIANTE VIP
// V6 - Busca Inline no Header, Sem "no Brasil"
// =============================================================================

import { useMemo, useState, useEffect, useCallback, useRef, memo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Search,
  X,
  Menu,
  User,
  Gift,
  Building2,
  LogOut,
  Settings,
  HelpCircle,
  Heart,
  ChevronRight,
  ChevronLeft,
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
  Crosshair,
  Navigation,
  Loader2,
} from "lucide-react";
import { useEstabelecimentos } from "@/hooks/useEstabelecimentos";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { Footer } from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

// =============================================================================
// CONSTANTS
// =============================================================================

const HEADER_COLOR = "#240046";
const DEFAULT_CITY = "São Paulo";
const DEFAULT_STATE = "SP";

const STATE_CAPITALS: Record<string, string> = {
  AC: "Rio Branco",
  AL: "Maceió",
  AP: "Macapá",
  AM: "Manaus",
  BA: "Salvador",
  CE: "Fortaleza",
  DF: "Brasília",
  ES: "Vitória",
  GO: "Goiânia",
  MA: "São Luís",
  MT: "Cuiabá",
  MS: "Campo Grande",
  MG: "Belo Horizonte",
  PA: "Belém",
  PB: "João Pessoa",
  PR: "Curitiba",
  PE: "Recife",
  PI: "Teresina",
  RJ: "Rio de Janeiro",
  RN: "Natal",
  RS: "Porto Alegre",
  RO: "Porto Velho",
  RR: "Boa Vista",
  SC: "Florianópolis",
  SP: "São Paulo",
  SE: "Aracaju",
  TO: "Palmas",
};

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

const ALL_CATEGORIES = [
  { id: "restaurante", label: "Restaurantes", subtitle: "Jante com vantagens" },
  { id: "bar", label: "Bares", subtitle: "Celebre seu dia" },
  { id: "academia", label: "Academias", subtitle: "Treine com benefícios" },
  { id: "salao", label: "Salões de Beleza", subtitle: "Cuide-se" },
  { id: "cafeteria", label: "Cafeterias", subtitle: "Momentos especiais" },
  { id: "barbearia", label: "Barbearias", subtitle: "Estilo no seu dia" },
  { id: "loja", label: "Lojas", subtitle: "Presentes e mimos" },
  { id: "hospedagem", label: "Hospedagem", subtitle: "Descanse com desconto" },
  { id: "entretenimento", label: "Entretenimento", subtitle: "Diversão garantida" },
  { id: "casa noturna", label: "Casas Noturnas", subtitle: "Noite especial" },
  { id: "sorveteria", label: "Sorveterias", subtitle: "Doce celebração" },
];

// =============================================================================
// HOOKS
// =============================================================================

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado");
  }, []);
  return { user, signOut };
};

const useAvailableCities = (estabelecimentos: any[]) => {
  return useMemo(() => {
    if (!estabelecimentos?.length) return [];
    const cityMap = new Map<string, { cidade: string; estado: string }>();
    estabelecimentos.forEach((est) => {
      if (est.cidade && est.estado) {
        const key = `${est.cidade.toLowerCase()}-${est.estado.toLowerCase()}`;
        if (!cityMap.has(key)) cityMap.set(key, { cidade: est.cidade, estado: est.estado.toUpperCase() });
      }
    });
    return Array.from(cityMap.values()).sort((a, b) => a.cidade.localeCompare(b.cidade));
  }, [estabelecimentos]);
};

const useSmartLocation = (availableCities: { cidade: string; estado: string }[]) => {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [state, setState] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  const findBestCity = useCallback(
    (userCity: string, userState: string) => {
      const exact = availableCities.find(
        (c) => c.cidade.toLowerCase() === userCity.toLowerCase() && c.estado.toLowerCase() === userState.toLowerCase(),
      );
      if (exact) return exact;
      const capital = STATE_CAPITALS[userState.toUpperCase()];
      if (capital) {
        const capitalCity = availableCities.find(
          (c) => c.cidade.toLowerCase() === capital.toLowerCase() && c.estado.toLowerCase() === userState.toLowerCase(),
        );
        if (capitalCity) return capitalCity;
      }
      const sameState = availableCities.find((c) => c.estado.toLowerCase() === userState.toLowerCase());
      if (sameState) return sameState;
      const sp = availableCities.find((c) => c.cidade.toLowerCase() === "são paulo" && c.estado.toLowerCase() === "sp");
      if (sp) return sp;
      return availableCities[0] || { cidade: DEFAULT_CITY, estado: DEFAULT_STATE };
    },
    [availableCities],
  );

  useEffect(() => {
    if (!availableCities.length) return;
    const saved = localStorage.getItem("aniversariantevip_city");
    const savedState = localStorage.getItem("aniversariantevip_state");
    if (saved && savedState) {
      const exists = availableCities.find(
        (c) => c.cidade.toLowerCase() === saved.toLowerCase() && c.estado.toLowerCase() === savedState.toLowerCase(),
      );
      if (exists) {
        setCity(exists.cidade);
        setState(exists.estado);
        setLoading(false);
        return;
      }
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
            const userCity = addr.city || addr.town || addr.municipality || "";
            const userState = addr["ISO3166-2-lvl4"]?.split("-")[1] || "";
            const best = findBestCity(userCity, userState);
            setCity(best.cidade);
            setState(best.estado);
            localStorage.setItem("aniversariantevip_city", best.cidade);
            localStorage.setItem("aniversariantevip_state", best.estado);
          } catch {
            const best = findBestCity("", "SP");
            setCity(best.cidade);
            setState(best.estado);
          }
          setLoading(false);
        },
        () => {
          const best = findBestCity("São Paulo", "SP");
          setCity(best.cidade);
          setState(best.estado);
          setLoading(false);
        },
        { timeout: 8000 },
      );
    } else {
      const best = findBestCity("São Paulo", "SP");
      setCity(best.cidade);
      setState(best.estado);
      setLoading(false);
    }
  }, [availableCities, findBestCity]);

  const update = useCallback((c: string, s: string) => {
    setCity(c);
    setState(s);
    localStorage.setItem("aniversariantevip_city", c);
    localStorage.setItem("aniversariantevip_state", s);
  }, []);

  return { city, state, loading, update };
};

const useRotatingCategories = () => {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    const now = new Date();
    setRotation(Math.floor(now.getMinutes() / 5));
    const interval = setInterval(() => setRotation(Math.floor(new Date().getMinutes() / 5)), 60000);
    return () => clearInterval(interval);
  }, []);
  return rotation;
};

// =============================================================================
// LOGO
// =============================================================================

const Logo = memo(() => (
  <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
      <Gift className="w-5 h-5 text-white" />
    </div>
    <span
      className="text-base font-bold tracking-tight hidden sm:block"
      style={{
        background: "linear-gradient(90deg, #9D4EDD 0%, #00D4FF 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      ANIVERSARIANTE VIP
    </span>
  </Link>
));

// =============================================================================
// LOCATION BUTTON
// =============================================================================

const LocationButton = memo(({ onUseCurrentLocation }: { onUseCurrentLocation: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUseLocation = async () => {
    setLoading(true);
    try {
      await onUseCurrentLocation();
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center hover:shadow-md hover:border-violet-300 transition-all flex-shrink-0"
        aria-label="Localização"
      >
        <Navigation className="w-4 h-4 text-violet-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-zinc-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
              <p className="text-sm font-medium text-zinc-900">📍 Localização</p>
              <p className="text-xs text-zinc-500 mt-0.5">Encontre benefícios perto de você</p>
            </div>
            <button
              onClick={handleUseLocation}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors disabled:opacity-60"
            >
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                {loading ? (
                  <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                ) : (
                  <Crosshair className="w-5 h-5 text-violet-600" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-900">
                  {loading ? "Detectando..." : "Usar minha localização"}
                </p>
                <p className="text-xs text-zinc-500">Ativar GPS automático</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
});

// =============================================================================
// HEADER
// =============================================================================

const Header = memo(({ children, onUseCurrentLocation }: { children?: React.ReactNode; onUseCurrentLocation?: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40" style={{ backgroundColor: HEADER_COLOR }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="hidden sm:flex items-center justify-between h-16 gap-6">
            <Logo />
            <div className="flex-1 max-w-xl flex items-center gap-2">
              {onUseCurrentLocation && <LocationButton onUseCurrentLocation={onUseCurrentLocation} />}
              <div className="flex-1">{children}</div>
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-1.5 h-10 pl-3 pr-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4 text-white" />
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>
          <div className="sm:hidden">
            <div className="flex items-center justify-between h-14">
              <Logo />
              <button
                onClick={() => setMenuOpen(true)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>
            {children && (
              <div className="pb-3 flex items-center gap-2">
                {onUseCurrentLocation && <LocationButton onUseCurrentLocation={onUseCurrentLocation} />}
                <div className="flex-1">{children}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <span className="font-semibold text-zinc-900">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center"
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
// SEARCH PILL - INLINE DROPDOWN
// =============================================================================

const SearchPill = memo(({ city, state, isLoading, onSelect, availableCities }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    if (!query.trim()) return availableCities.slice(0, 8);
    const q = query.toLowerCase();
    return availableCities
      .filter((c: any) => c.cidade.toLowerCase().includes(q) || c.estado.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, availableCities]);

  const handleSelect = (c: { cidade: string; estado: string }) => {
    onSelect(c.cidade, c.estado);
    setIsOpen(false);
    setQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setQuery("");
  };

  const displayText = isLoading ? "Carregando..." : `${city}, ${state}`;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Desktop */}
      <div className="hidden sm:block">
        <div
          className={cn(
            "flex items-center h-11 bg-white rounded-full shadow-sm transition-all",
            isOpen ? "shadow-md ring-2 ring-violet-300" : "hover:shadow-md",
          )}
        >
          <div className="flex items-center gap-2 pl-4 pr-2 flex-1">
            <MapPin className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder={displayText}
              className="w-full text-sm font-medium text-zinc-900 bg-transparent outline-none placeholder:text-zinc-700"
            />
          </div>
          <button
            className="w-8 h-8 m-1.5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50">
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {filteredCities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-zinc-500 text-sm">Nenhuma cidade encontrada</p>
                </div>
              ) : (
                filteredCities.map((c: any, i: number) => (
                  <button
                    key={i}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(c)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                      c.cidade === city && c.estado === state ? "bg-violet-50" : "hover:bg-zinc-50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        c.cidade === city && c.estado === state ? "bg-violet-100" : "bg-zinc-100",
                      )}
                    >
                      <MapPin
                        className={cn(
                          "w-4 h-4",
                          c.cidade === city && c.estado === state ? "text-violet-600" : "text-zinc-500",
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 text-sm">{c.cidade}</p>
                      <p className="text-xs text-zinc-500">{c.estado}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div
          className={cn(
            "flex items-center h-12 bg-white rounded-full shadow-sm transition-all",
            isOpen ? "shadow-md ring-2 ring-violet-300" : "",
          )}
        >
          <div className="flex items-center gap-2.5 px-4 flex-1">
            <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder={isOpen ? "Buscar cidade..." : displayText}
              className="w-full text-sm font-medium text-zinc-900 bg-transparent outline-none placeholder:text-zinc-600"
            />
          </div>
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50">
            <div className="p-2 max-h-[250px] overflow-y-auto">
              {filteredCities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-zinc-500 text-sm">Nenhuma cidade encontrada</p>
                </div>
              ) : (
                filteredCities.map((c: any, i: number) => (
                  <button
                    key={i}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(c)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                      c.cidade === city && c.estado === state ? "bg-violet-50" : "hover:bg-zinc-50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        c.cidade === city && c.estado === state ? "bg-violet-100" : "bg-zinc-100",
                      )}
                    >
                      <MapPin
                        className={cn(
                          "w-4 h-4",
                          c.cidade === city && c.estado === state ? "text-violet-600" : "text-zinc-500",
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 text-sm">{c.cidade}</p>
                      <p className="text-xs text-zinc-500">{c.estado}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// =============================================================================
// CATEGORIES
// =============================================================================

const Categories = memo(({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) => {
  const cats = [
    { id: "all", label: "Todos" },
    ...CATEGORIAS_ESTABELECIMENTO.map((c) => ({ id: c.value, label: c.label })),
  ];

  return (
    <div className="sticky top-[56px] sm:top-[64px] z-30" style={{ backgroundColor: HEADER_COLOR }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center overflow-x-auto scrollbar-hide py-1" style={{ scrollbarWidth: "none" }}>
          {cats.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id.toLowerCase()] || Sparkles;
            const isActive = selected === cat.id;
            const shortLabel = CATEGORY_LABELS_SHORT[cat.id.toLowerCase()] || cat.label;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[64px] sm:min-w-[72px] px-3 py-2 relative transition-colors",
                  isActive ? "text-white" : "text-white/90 hover:text-white",
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/85")} />
                <span
                  className={cn(
                    "text-[11px] font-semibold whitespace-nowrap",
                    isActive ? "text-white" : "text-white/90",
                  )}
                >
                  {shortLabel}
                </span>
                {isActive && <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// CARD
// =============================================================================

const getBenefitChipText = (beneficio?: string): string => {
  if (!beneficio || beneficio.length < 3) return "🎂 Benefício";
  const descontoMatch = beneficio.match(/(\d+)\s*%/);
  if (descontoMatch) return `🎁 ${descontoMatch[1]}% OFF`;
  if (beneficio.toLowerCase().includes("grátis") || beneficio.toLowerCase().includes("gratis")) {
    if (beneficio.toLowerCase().includes("drink")) return "🥂 Drink grátis";
    if (beneficio.toLowerCase().includes("sobremesa")) return "🍰 Sobremesa";
    return "🎁 Grátis";
  }
  if (beneficio.length <= 12) return `🎁 ${beneficio}`;
  return "🎂 Benefício";
};

const Card = memo(({ data, onClick }: any) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const nome = data.nome_fantasia || data.name || "Estabelecimento";
  const cat = Array.isArray(data.categoria) ? data.categoria[0] : data.categoria || data.category;
  const img = data.imagem_url || data.logo_url || data.photo_url;
  const chipText = getBenefitChipText(data.descricao_beneficio || data.benefit_description);

  return (
    <article onClick={onClick} className="cursor-pointer group">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100 mb-2">
        {img && !error && (
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
        )}
        {(!img || error || !loaded) && (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center px-2 py-1 bg-white/95 backdrop-blur-sm text-[11px] font-medium text-zinc-800 rounded-full shadow-sm border border-zinc-100">
            {chipText}
          </span>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Favoritar"
        >
          <Heart className="w-4 h-4 text-zinc-600 hover:text-red-500 hover:fill-red-500 transition-colors" />
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
// CAROUSEL & GRID
// =============================================================================

const Carousel = memo(({ title, subtitle, items, onSeeAll }: any) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollState);
      return () => el.removeEventListener("scroll", updateScrollState);
    }
  }, [updateScrollState, items]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!items?.length) return null;

  return (
    <section className="mb-5">
      <div className="flex items-center justify-between mb-2 px-4 sm:px-0">
        <button onClick={onSeeAll} className="flex items-center gap-1 group">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 group-hover:underline">{title}</h2>
            {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 mt-0.5" />
        </button>
        {/* Setas de navegação - apenas desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-full border border-zinc-300 bg-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:border-zinc-400 transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-full border border-zinc-300 bg-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:border-zinc-400 transition-all"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4 text-zinc-700" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
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

const Grid = memo(({ items, isLoading }: any) => {
  const navigate = useNavigate();
  if (isLoading)
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
  if (!items?.length)
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
          <Gift className="w-7 h-7 text-zinc-400" />
        </div>
        <p className="text-zinc-900 font-medium text-sm">Nenhum resultado</p>
        <p className="text-zinc-500 text-sm">Tente outra categoria</p>
      </div>
    );
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
  const rotation = useRotatingCategories();
  const categoria = searchParams.get("categoria") || "all";

  const { data: estabelecimentos, isLoading } = useEstabelecimentos({ showAll: true, enabled: true });
  const availableCities = useAvailableCities(estabelecimentos || []);
  const { city, state, loading: locationLoading, update: updateCity } = useSmartLocation(availableCities);

  const cityEstablishments = useMemo(() => {
    if (!estabelecimentos?.length) return [];
    return estabelecimentos.filter(
      (e) => e.cidade?.toLowerCase() === city.toLowerCase() && e.estado?.toLowerCase() === state.toLowerCase(),
    );
  }, [estabelecimentos, city, state]);

  const filtered = useMemo(() => {
    if (categoria === "all") return cityEstablishments;
    return cityEstablishments.filter((e) => {
      const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
      return cats.some((c) => c?.toLowerCase() === categoria.toLowerCase());
    });
  }, [cityEstablishments, categoria]);

  const carousels = useMemo(() => {
    if (!cityEstablishments.length || categoria !== "all") return [];
    const getByCategory = (catId: string) =>
      cityEstablishments.filter((e) => {
        const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
        return cats.some((c) => c?.toLowerCase() === catId.toLowerCase());
      });
    const rotatedCategories = [...ALL_CATEGORIES];
    for (let i = 0; i < rotation; i++) rotatedCategories.push(rotatedCategories.shift()!);
    const result: any[] = [];

    // 1º: Destaques
    const hl = rotatedCategories[0];
    const hlItems = getByCategory(hl.id).slice(0, 12);
    if (hlItems.length >= 2)
      result.push({
        id: "destaques",
        title: `${hl.label} em destaque`,
        subtitle: hl.subtitle,
        categoryId: hl.id,
        items: hlItems,
      });

    // 2-9: Categorias com nome da cidade
    let count = 1;
    for (let i = 1; i < rotatedCategories.length && count < 9; i++) {
      const cat = rotatedCategories[i];
      const items = getByCategory(cat.id).slice(0, 12);
      if (items.length >= 2) {
        result.push({
          id: cat.id,
          title: `${cat.label} em ${city}`,
          subtitle: cat.subtitle,
          categoryId: cat.id,
          items,
        });
        count++;
      }
    }

    // Completar
    if (result.length < 9) {
      for (let i = 0; i < rotatedCategories.length && result.length < 9; i++) {
        const cat = rotatedCategories[i];
        const items = getByCategory(cat.id);
        if (result.some((r) => r.categoryId === cat.id) || items.length < 2) continue;
        result.push({
          id: `${cat.id}-mais`,
          title: `Mais ${cat.label.toLowerCase()} em ${city}`,
          subtitle: "Descubra novos lugares",
          categoryId: cat.id,
          items: items.slice(0, 12),
        });
      }
    }
    return result;
  }, [cityEstablishments, categoria, city, rotation]);

  const handleCategoria = (id: string) => {
    const params = new URLSearchParams(searchParams);
    id === "all" ? params.delete("categoria") : params.set("categoria", id);
    setSearchParams(params);
  };

  const handleSeeAll = (categoryId: string) => {
    handleCategoria(categoryId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUseCurrentLocation = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        toast.error("Geolocalização não disponível");
        reject();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
              { headers: { "Accept-Language": "pt-BR" } },
            );
            const data = await res.json();
            const addr = data.address;
            const userCity = addr.city || addr.town || addr.municipality || "";
            const userState = addr["ISO3166-2-lvl4"]?.split("-")[1] || "";
            
            // Verificar se a cidade existe na lista
            const exact = availableCities.find(
              (c) => c.cidade.toLowerCase() === userCity.toLowerCase() && c.estado.toLowerCase() === userState.toLowerCase(),
            );
            
            if (exact) {
              updateCity(exact.cidade, exact.estado);
              toast.success(`Localização atualizada para ${exact.cidade}`);
            } else {
              // Tentar capital do estado ou cidade mais próxima
              const capital = STATE_CAPITALS[userState.toUpperCase()];
              const capitalCity = availableCities.find(
                (c) => c.cidade.toLowerCase() === capital?.toLowerCase() && c.estado.toLowerCase() === userState.toLowerCase(),
              );
              if (capitalCity) {
                updateCity(capitalCity.cidade, capitalCity.estado);
                toast.success(`Localização: ${capitalCity.cidade} (capital)`);
              } else {
                toast.info(`Não há parceiros em ${userCity || "sua região"} ainda`);
              }
            }
            resolve();
          } catch {
            toast.error("Erro ao detectar localização");
            reject();
          }
        },
        () => {
          toast.error("Permissão de localização negada");
          reject();
        },
        { timeout: 10000 },
      );
    });
  }, [availableCities, updateCity]);

  const showGrid = categoria !== "all";
  const showCarousels = categoria === "all" && carousels.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      <Header onUseCurrentLocation={handleUseCurrentLocation}>
        <SearchPill
          city={city}
          state={state}
          isLoading={locationLoading || isLoading}
          onSelect={updateCity}
          availableCities={availableCities}
        />
      </Header>

      <Categories selected={categoria} onSelect={handleCategoria} />

      <main className="flex-1 pb-20 sm:pb-6">
        <div className="max-w-7xl mx-auto sm:px-6 py-3 sm:py-4">
          {(isLoading || locationLoading) && (
            <div className="px-4 sm:px-0">
              <Grid items={[]} isLoading />
            </div>
          )}
          {!isLoading &&
            !locationLoading &&
            showCarousels &&
            carousels.map((c) => (
              <Carousel
                key={c.id}
                title={c.title}
                subtitle={c.subtitle}
                items={c.items}
                onSeeAll={() => handleSeeAll(c.categoryId)}
              />
            ))}
          {!isLoading && !locationLoading && showGrid && (
            <div className="px-4 sm:px-0">
              <div className="mb-3">
                <h2 className="text-base font-semibold text-zinc-900 capitalize">
                  {categoria} em {city}
                </h2>
                <p className="text-sm text-zinc-500">{filtered.length} lugares</p>
              </div>
              <Grid items={filtered} isLoading={false} />
            </div>
          )}
          {!isLoading && !locationLoading && !showCarousels && !showGrid && (
            <div className="px-4 sm:px-0">
              <Grid items={[]} isLoading={false} />
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
