// =============================================================================
// INDEX.TSX - ANIVERSARIANTE VIP
// V10 - Categorias Sticky + Badges Coloridos + Menu Dark
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

// Intervalo de rotação dos carousels em milissegundos (1 minuto)
const ROTATION_INTERVAL_MS = 60000;

// Tempo de espera após interação antes de voltar a rotacionar (30 segundos)
const INTERACTION_COOLDOWN_MS = 30000;

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
  salao: "Beleza",
  salão: "Beleza",
};

const ALL_CATEGORIES = [
  { id: "restaurante", label: "Restaurantes", subtitle: "Jante com vantagens" },
  { id: "bar", label: "Bares", subtitle: "Brinde seu mês" },
  { id: "academia", label: "Academias", subtitle: "Treine com benefícios" },
  { id: "salao", label: "Salões de Beleza", subtitle: "Cuide-se no seu mês" },
  { id: "cafeteria", label: "Cafeterias", subtitle: "Café pra celebrar" },
  { id: "barbearia", label: "Barbearias", subtitle: "Estilo no seu mês" },
  { id: "loja", label: "Lojas", subtitle: "Mimos e presentes" },
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

// =============================================================================
// ROTATING CATEGORIES HOOK - EXATAMENTE 1 MINUTO + PROTEÇÃO DE INTERAÇÃO
// =============================================================================

const useRotatingCategories = (isUserInteracting: boolean) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Não rotaciona se o usuário estiver interagindo
    if (isUserInteracting) return;

    // Primeira rotação em 10 segundos para feedback visual
    const initialTimeout = setTimeout(() => {
      setRotation((prev) => prev + 1);
    }, 10000);

    // Rotações subsequentes a cada 1 minuto
    const interval = setInterval(() => {
      setRotation((prev) => prev + 1);
    }, ROTATION_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isUserInteracting]);

  return rotation;
};

// Hook para detectar interação do usuário com carousels
const useCarouselInteraction = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInteractionStart = useCallback(() => {
    // Cancela qualquer timeout pendente
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
      interactionTimeout.current = null;
    }
    setIsInteracting(true);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    // Aguarda 30 segundos após a última interação para voltar a rotacionar
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }
    interactionTimeout.current = setTimeout(() => {
      setIsInteracting(false);
    }, INTERACTION_COOLDOWN_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
    };
  }, []);

  return { isInteracting, handleInteractionStart, handleInteractionEnd };
};

// =============================================================================
// LOGO
// =============================================================================

const Logo = memo(({ showTextOnMobile = false }: { showTextOnMobile?: boolean }) => (
  <Link to="/" className="flex items-center gap-2 flex-shrink-0">
    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
      <Gift className="w-4.5 h-4.5 text-white" />
    </div>
    <span
      className={cn("font-bold tracking-tight", showTextOnMobile ? "text-sm" : "text-base hidden sm:block")}
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
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
        aria-label="Usar minha localização"
      >
        <Navigation className="w-4 h-4 text-violet-600" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden">
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
// MENU BUTTONS
// =============================================================================

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

const MenuBtnDark = ({ icon, label, sub, onClick, danger }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
      danger ? "hover:bg-red-500/20" : "hover:bg-white/10",
    )}
  >
    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <span className={cn("text-sm font-semibold block", danger ? "text-red-400" : "text-white")}>{label}</span>
      {sub && <span className="text-xs text-white/50">{sub}</span>}
    </div>
  </button>
);

// =============================================================================
// HEADER
// =============================================================================

const Header = memo(
  ({ children, onUseCurrentLocation }: { children?: React.ReactNode; onUseCurrentLocation?: () => void }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    return (
      <>
        <header className="sticky top-0 z-50" style={{ backgroundColor: HEADER_COLOR }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* DESKTOP */}
            <div className="hidden sm:flex items-center justify-between h-16 gap-6">
              <Logo />
              <div className="flex-1 max-w-xl flex items-center gap-2">
                {onUseCurrentLocation && <LocationButton onUseCurrentLocation={onUseCurrentLocation} />}
                <div className="flex-1">{children}</div>
              </div>
              <button
                onClick={() => setMenuOpen(true)}
                className="flex items-center gap-1.5 h-10 pl-3 pr-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu className="w-4 h-4 text-white" />
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>

            {/* MOBILE */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between h-12 py-2">
                <Logo showTextOnMobile />
                <button
                  onClick={() => setMenuOpen(true)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Abrir menu"
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

        {/* ========== MENU LATERAL PREMIUM ========== */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <div
              className="fixed top-0 right-0 bottom-0 w-[300px] z-50 shadow-2xl overflow-y-auto"
              style={{ backgroundColor: "#240046" }}
            >
              {/* Header do Menu */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <span className="font-bold text-white text-lg">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4">
                {user ? (
                  <>
                    {/* Usuário Logado */}
                    <div className="px-4 py-3 mb-3 bg-white/10 rounded-xl border border-white/20">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.user_metadata?.full_name || "Usuário"}
                      </p>
                      <p className="text-xs text-white/60 truncate">{user.email}</p>
                    </div>

                    <MenuBtnDark
                      icon={<Gift className="w-5 h-5 text-fuchsia-400" />}
                      label="Minha Área"
                      sub="Gerencie seu perfil"
                      onClick={() => {
                        navigate("/area-aniversariante");
                        setMenuOpen(false);
                      }}
                    />
                    <MenuBtnDark
                      icon={<Heart className="w-5 h-5 text-pink-400" />}
                      label="Meus Favoritos"
                      sub="Lugares salvos"
                      onClick={() => {
                        navigate("/meus-favoritos");
                        setMenuOpen(false);
                      }}
                    />
                    <MenuBtnDark
                      icon={<Settings className="w-5 h-5 text-white/70" />}
                      label="Configurações"
                      onClick={() => {
                        navigate("/configuracoes");
                        setMenuOpen(false);
                      }}
                    />

                    <div className="my-3 mx-2 border-t border-white/10" />

                    <MenuBtnDark
                      icon={<LogOut className="w-5 h-5 text-red-400" />}
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
                    {/* ===== SEÇÃO ANIVERSARIANTE ===== */}
                    <div className="mb-2 px-2">
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Aniversariante
                      </span>
                    </div>

                    <MenuBtnDark
                      icon={<User className="w-5 h-5 text-violet-400" />}
                      label="Entrar"
                      sub="Acessar minha conta"
                      onClick={() => {
                        navigate("/login");
                        setMenuOpen(false);
                      }}
                    />
                    <MenuBtnDark
                      icon={<Gift className="w-5 h-5 text-fuchsia-400" />}
                      label="Cadastrar"
                      sub="É grátis"
                      onClick={() => {
                        navigate("/cadastro");
                        setMenuOpen(false);
                      }}
                    />

                    <div className="my-4 mx-2 border-t border-white/10" />

                    {/* ===== SEÇÃO EMPRESAS ===== */}
                    <div className="mb-2 px-2">
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Para Empresas
                      </span>
                    </div>

                    <MenuBtnDark
                      icon={<Building2 className="w-5 h-5 text-blue-400" />}
                      label="Entrar"
                      sub="Acesso do parceiro"
                      onClick={() => {
                        navigate("/login-parceiro");
                        setMenuOpen(false);
                      }}
                    />
                    <MenuBtnDark
                      icon={<Store className="w-5 h-5 text-emerald-400" />}
                      label="Cadastrar Empresa"
                      sub="Seja um parceiro VIP"
                      onClick={() => {
                        navigate("/seja-parceiro");
                        setMenuOpen(false);
                      }}
                    />

                    <div className="my-4 mx-2 border-t border-white/10" />

                    {/* ===== AJUDA ===== */}
                    <MenuBtnDark
                      icon={<HelpCircle className="w-5 h-5 text-white/70" />}
                      label="Como Funciona"
                      sub="Tire suas dúvidas"
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
  },
);

// =============================================================================
// SEARCH PILL
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
            "flex items-center h-11 bg-white rounded-full shadow-sm transition-all",
            isOpen ? "shadow-md ring-2 ring-violet-300" : "",
          )}
        >
          <div className="flex items-center gap-2.5 px-4 flex-1">
            <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
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
// SUBCATEGORIES DATA
// =============================================================================

const SUBCATEGORIAS: Record<string, string[]> = {
  academia: ["Musculação", "CrossFit", "Pilates", "Natação", "Funcional", "Spinning", "Yoga", "Artes Marciais"],
  bar: ["Cervejaria", "Pub", "Rooftop", "Bar de Vinhos", "Coquetelaria", "Boteco", "Sports Bar"],
  restaurante: ["Italiano", "Japonês", "Brasileiro", "Churrascaria", "Pizzaria", "Fast Food", "Vegano", "Árabe"],
  cafeteria: ["Café Especial", "Confeitaria", "Padaria", "Brunch", "Doceria"],
  barbearia: ["Corte Masculino", "Barba", "Tratamento Capilar", "Pigmentação"],
  salao: ["Cabelo", "Manicure", "Estética", "Maquiagem", "Depilação", "Sobrancelha"],
  "casa noturna": ["Balada", "Club", "Festa", "Show ao Vivo"],
  hospedagem: ["Hotel", "Pousada", "Resort", "Hostel", "Flat"],
  loja: ["Roupas", "Calçados", "Acessórios", "Presentes", "Eletrônicos", "Decoração"],
  entretenimento: ["Cinema", "Teatro", "Parque", "Escape Room", "Boliche", "Karaokê"],
  sorveteria: ["Artesanal", "Açaí", "Frozen", "Picolé", "Milk Shake"],
};

// =============================================================================
// CATEGORIES
// =============================================================================

const Categories = memo(
  ({
    selected,
    onSelect,
    selectedSubcategory,
    onSubcategorySelect,
    onViewAll,
    estabelecimentos,
  }: {
    selected: string;
    onSelect: (id: string) => void;
    selectedSubcategory: string | null;
    onSubcategorySelect: (sub: string | null) => void;
    onViewAll: (categoryId: string) => void;
    estabelecimentos: any[];
  }) => {
    const cats = [
      { id: "all", label: "Todos" },
      ...CATEGORIAS_ESTABELECIMENTO.map((c) => ({ id: c.value, label: c.label })),
    ];

    const subcatsDisponiveis = useMemo(() => {
      if (selected === "all") return [];
      const todasSubs = SUBCATEGORIAS[selected.toLowerCase()] || [];
      if (todasSubs.length === 0) return [];
      const estabsDaCategoria = estabelecimentos.filter((e) => {
        const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
        return cats.some((c) => c?.toLowerCase() === selected.toLowerCase());
      });
      if (estabsDaCategoria.length === 0) return [];
      const especialidadesExistentes = new Set<string>();
      estabsDaCategoria.forEach((est) => {
        const specs = est.especialidades || [];
        specs.forEach((s: string) => especialidadesExistentes.add(s.toLowerCase()));
      });
      return todasSubs.filter((sub) => {
        const subLower = sub.toLowerCase();
        return Array.from(especialidadesExistentes).some(
          (esp) => esp.includes(subLower) || subLower.includes(esp) || esp === subLower,
        );
      });
    }, [selected, estabelecimentos]);

    return (
      <div className="sticky top-[48px] sm:top-[64px] z-40 bg-[#240046]">
        <div className="max-w-7xl mx-auto">
          <div
            className="flex items-center overflow-x-auto scrollbar-hide pl-4 sm:pl-6 lg:pl-8 border-b border-white/10"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center gap-1 py-2 pr-6 sm:pr-8">
              {cats.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id.toLowerCase()] || Sparkles;
                const isActive = selected === cat.id;
                const shortLabel = CATEGORY_LABELS_SHORT[cat.id.toLowerCase()] || cat.label;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelect(cat.id);
                      onSubcategorySelect(null);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[72px] px-2 sm:px-3 py-2 relative transition-all flex-shrink-0",
                      "text-white",
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                    <span
                      className={cn(
                        "text-[10px] sm:text-[11px] font-semibold whitespace-nowrap text-white",
                        isActive ? "opacity-100" : "opacity-80",
                      )}
                    >
                      {shortLabel}
                    </span>
                    {isActive && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-white rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>

          {selected !== "all" && subcatsDisponiveis.length > 0 && (
            <div
              className="flex items-center overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 py-2 bg-[#3C096C]/50"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewAll(selected)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#240046] text-xs font-semibold hover:bg-white/90 transition-colors flex-shrink-0"
                >
                  <span>Ver todos</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <div className="w-px h-5 bg-white/30 mx-1" />
                {subcatsDisponiveis.map((sub) => {
                  const isSubActive = selectedSubcategory === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => onSubcategorySelect(isSubActive ? null : sub)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0",
                        isSubActive ? "bg-white text-[#240046]" : "bg-white/90 text-[#240046] hover:bg-white",
                      )}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

// =============================================================================
// BENEFIT CHIP
// =============================================================================

const BADGE_STYLE = "bg-white text-[#240046] font-bold shadow-md border border-violet-100";

const getBenefitChip = (beneficio?: string): { emoji: string; text: string } => {
  if (!beneficio || beneficio.length < 3) return { emoji: "🎂", text: "Benefício" };
  const b = beneficio.toLowerCase();
  const descontoMatch = beneficio.match(/(\d+)\s*%/);
  if (descontoMatch) return { emoji: "🏷️", text: `${descontoMatch[1]}% OFF` };
  if (b.includes("grátis") || b.includes("gratis") || b.includes("free") || b.includes("cortesia")) {
    if (b.includes("drink") || b.includes("bebida") || b.includes("chopp") || b.includes("cerveja"))
      return { emoji: "🍺", text: "Drink grátis" };
    if (b.includes("sobremesa") || b.includes("doce") || b.includes("bolo"))
      return { emoji: "🍰", text: "Sobremesa grátis" };
    if (b.includes("entrada") || b.includes("ingresso") || b.includes("acesso"))
      return { emoji: "🎟️", text: "Entrada grátis" };
    if (b.includes("corte") || b.includes("cabelo")) return { emoji: "✂️", text: "Corte grátis" };
    if (b.includes("café") || b.includes("coffee") || b.includes("capuccino"))
      return { emoji: "☕", text: "Café grátis" };
    if (b.includes("pizza")) return { emoji: "🍕", text: "Pizza grátis" };
    if (b.includes("hambur") || b.includes("burger") || b.includes("lanche"))
      return { emoji: "🍔", text: "Burger grátis" };
    if (b.includes("sorvete") || b.includes("gelato") || b.includes("açaí"))
      return { emoji: "🍦", text: "Sorvete grátis" };
    if (b.includes("prato") || b.includes("refeição") || b.includes("almoço") || b.includes("jantar"))
      return { emoji: "🍽️", text: "Refeição grátis" };
    return { emoji: "🎁", text: "Grátis" };
  }
  if (b.includes("brinde") || b.includes("presente") || b.includes("mimo") || b.includes("surpresa"))
    return { emoji: "🎁", text: "Brinde" };
  if (beneficio.length <= 15) return { emoji: "🎁", text: beneficio };
  return { emoji: "🎂", text: "Benefício" };
};

// =============================================================================
// SKELETON
// =============================================================================

const CardSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="aspect-[4/5] rounded-2xl bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] mb-2.5" />
    <div className="space-y-1.5 px-0.5">
      <div className="h-4 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-md w-4/5" />
      <div className="h-3.5 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-md w-3/5" />
    </div>
  </div>
));

// =============================================================================
// FAVORITE BUTTON
// =============================================================================

const FavoriteButton = memo(
  ({
    estabelecimentoId,
    estabelecimentoNome,
    isLoggedIn,
    onLoginRequired,
  }: {
    estabelecimentoId: string;
    estabelecimentoNome: string;
    isLoggedIn: boolean;
    onLoginRequired: () => void;
  }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isLoggedIn) {
        onLoginRequired();
        return;
      }
      setIsAnimating(true);
      setIsFavorited((prev) => !prev);
      setTimeout(() => setIsAnimating(false), 300);
    };

    return (
      <button
        onClick={handleClick}
        className={cn(
          "absolute top-2 right-2",
          "w-[44px] h-[44px] sm:w-[36px] sm:h-[36px]",
          "flex items-center justify-center",
          "hover:scale-110 active:scale-95",
          "transition-transform duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-0 rounded-full",
        )}
        aria-label={
          isFavorited
            ? `Remover ${estabelecimentoNome} dos favoritos`
            : `Adicionar ${estabelecimentoNome} aos favoritos`
        }
      >
        <Heart
          className={cn(
            "w-6 h-6 sm:w-5 sm:h-5",
            "drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
            "transition-all duration-200",
            isAnimating && "animate-pulse",
            isFavorited
              ? "fill-red-500 text-red-500 stroke-white stroke-[1.5]"
              : "fill-black/30 text-white stroke-white stroke-2",
          )}
        />
      </button>
    );
  },
);

// =============================================================================
// CARD
// =============================================================================

const Card = memo(({ data, onClick, isLoggedIn, onLoginRequired }: any) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const nome = data.nome_fantasia || data.name || "Estabelecimento";
  const cat = Array.isArray(data.categoria) ? data.categoria[0] : data.categoria || data.category;
  const img = data.imagem_url || data.logo_url || data.photo_url;
  const chip = getBenefitChip(data.descricao_beneficio || data.benefit_description);

  return (
    <article onClick={onClick} className="cursor-pointer group">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100 mb-2.5">
        {img && !error && (
          <img
            src={img}
            alt={nome}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              loaded ? "opacity-100 group-hover:scale-105" : "opacity-0",
            )}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
        {(!img || error || !loaded) && (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full", BADGE_STYLE)}>
            <span>{chip.emoji}</span>
            <span>{chip.text}</span>
          </span>
        </div>
        <FavoriteButton
          estabelecimentoId={data.id}
          estabelecimentoNome={nome}
          isLoggedIn={isLoggedIn}
          onLoginRequired={onLoginRequired}
        />
      </div>
      <div className="px-0.5">
        <h3 className="font-semibold text-zinc-900 text-sm leading-tight line-clamp-1 group-hover:text-violet-700 transition-colors">
          {nome}
        </h3>
        <p className="text-zinc-500 text-sm line-clamp-1 mt-0.5">
          {cat && <span className="capitalize">{cat}</span>}
          {cat && data.bairro && " · "}
          {data.bairro}
        </p>
      </div>
    </article>
  );
});

// =============================================================================
// CAROUSEL - COM PROTEÇÃO DE INTERAÇÃO
// =============================================================================

const Carousel = memo(
  ({ title, subtitle, items, onSeeAll, isLoggedIn, onLoginRequired, onInteractionStart, onInteractionEnd }: any) => {
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
        el.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);
        return () => {
          el.removeEventListener("scroll", updateScrollState);
          window.removeEventListener("resize", updateScrollState);
        };
      }
    }, [updateScrollState, items]);

    const scroll = (direction: "left" | "right") => {
      if (scrollRef.current) {
        const cardWidth = window.innerWidth < 640 ? 160 : 192;
        const gap = 16;
        const scrollAmount = (cardWidth + gap) * 3;
        scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
      }
    };

    // Handlers para detectar interação do usuário
    const handleTouchStart = () => {
      onInteractionStart?.();
    };

    const handleTouchEnd = () => {
      onInteractionEnd?.();
    };

    const handleMouseDown = () => {
      onInteractionStart?.();
    };

    const handleMouseUp = () => {
      onInteractionEnd?.();
    };

    if (!items?.length) return null;

    return (
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
            {subtitle && <p className="text-sm text-zinc-600">{subtitle}</p>}
          </div>
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1.5 text-[#240046] hover:text-[#3C096C] text-sm font-medium ml-4 flex-shrink-0"
          >
            <span>Ver todos ({items.length}+)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="hidden sm:flex items-center gap-2 ml-4">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-full border border-zinc-300 bg-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:border-zinc-400 hover:scale-105 transition-all"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-700" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-9 h-9 rounded-full border border-zinc-300 bg-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:border-zinc-400 hover:scale-105 transition-all"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5 text-zinc-700" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            "flex gap-4 overflow-x-auto snap-x snap-mandatory",
            "px-4 sm:px-6 lg:px-8",
            "scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-8",
            "scroll-pr-4 sm:scroll-pr-6 lg:scroll-pr-8",
            "scrollbar-hide",
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((est: any) => (
            <div key={est.id} className="snap-start flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[192px]">
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
                isLoggedIn={isLoggedIn}
                onLoginRequired={onLoginRequired}
              />
            </div>
          ))}
          <div className="flex-shrink-0 w-4 sm:w-6 lg:w-8" aria-hidden="true" />
        </div>
      </section>
    );
  },
);

// =============================================================================
// GRID
// =============================================================================

const Grid = memo(({ items, isLoading, isLoggedIn, onLoginRequired }: any) => {
  const navigate = useNavigate();
  if (isLoading)
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  if (!items?.length)
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-zinc-400" />
        </div>
        <p className="text-zinc-900 font-medium">Nenhum resultado</p>
        <p className="text-zinc-500 text-sm mt-1">Tente outra categoria</p>
      </div>
    );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
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
          isLoggedIn={isLoggedIn}
          onLoginRequired={onLoginRequired}
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
  const categoria = searchParams.get("categoria") || "all";
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Hook de interação dos carousels
  const { isInteracting, handleInteractionStart, handleInteractionEnd } = useCarouselInteraction();

  // Rotação dos carousels - pausa quando usuário está interagindo
  const rotation = useRotatingCategories(isInteracting);

  const handleLoginRequired = useCallback(() => {
    toast("Faça login para favoritar", {
      description: "Crie uma conta gratuita para salvar seus favoritos",
      action: { label: "Entrar", onClick: () => navigate("/login") },
    });
  }, [navigate]);

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
    let result = cityEstablishments;
    if (categoria !== "all")
      result = result.filter((e) => {
        const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
        return cats.some((c) => c?.toLowerCase() === categoria.toLowerCase());
      });
    if (selectedSubcategory)
      result = result.filter((e) => {
        const specs = e.especialidades || [];
        return specs.some((s: string) => s.toLowerCase().includes(selectedSubcategory.toLowerCase()));
      });
    return result;
  }, [cityEstablishments, categoria, selectedSubcategory]);

  const carousels = useMemo(() => {
    if (!cityEstablishments.length || categoria !== "all") return [];
    const getByCategory = (catId: string) =>
      cityEstablishments.filter((e) => {
        const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
        return cats.some((c) => c?.toLowerCase() === catId.toLowerCase());
      });
    const rotatedCategories = [...ALL_CATEGORIES];
    const rotationIndex = rotation % ALL_CATEGORIES.length;
    for (let i = 0; i < rotationIndex; i++) rotatedCategories.push(rotatedCategories.shift()!);
    const result: any[] = [];
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
    setSelectedSubcategory(null);
  };
  const handleViewAll = (categoryId: string) => {
    navigate(`/explorar?categoria=${categoryId}&cidade=${encodeURIComponent(city)}&estado=${state}`);
  };
  const handleSeeAll = (categoryId: string) => {
    navigate(`/explorar?categoria=${categoryId}&cidade=${encodeURIComponent(city)}&estado=${state}`);
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
            const exact = availableCities.find(
              (c) =>
                c.cidade.toLowerCase() === userCity.toLowerCase() && c.estado.toLowerCase() === userState.toLowerCase(),
            );
            if (exact) {
              updateCity(exact.cidade, exact.estado);
              toast.success(`Localização atualizada para ${exact.cidade}`);
            } else {
              const capital = STATE_CAPITALS[userState.toUpperCase()];
              const capitalCity = availableCities.find(
                (c) =>
                  c.cidade.toLowerCase() === capital?.toLowerCase() &&
                  c.estado.toLowerCase() === userState.toLowerCase(),
              );
              if (capitalCity) {
                updateCity(capitalCity.cidade, capitalCity.estado);
                toast.success(`Localização: ${capitalCity.cidade} (capital)`);
              } else toast.info(`Não há parceiros em ${userCity || "sua região"} ainda`);
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

  const showGrid = categoria !== "all" || selectedSubcategory !== null;
  const showCarousels = categoria === "all" && selectedSubcategory === null && carousels.length > 0;

  // Estado para transição suave dos carousels
  const [carouselsVisible, setCarouselsVisible] = useState(true);
  const [displayedCarousels, setDisplayedCarousels] = useState(carousels);
  const prevRotation = useRef(rotation);

  // Efeito para transição suave quando rotação muda
  useEffect(() => {
    if (prevRotation.current !== rotation && carousels.length > 0) {
      // Fade out
      setCarouselsVisible(false);

      // Após fade out, atualiza conteúdo e fade in
      const timeout = setTimeout(() => {
        setDisplayedCarousels(carousels);
        setCarouselsVisible(true);
      }, 300);

      prevRotation.current = rotation;
      return () => clearTimeout(timeout);
    } else {
      // Primeira renderização ou sem mudança
      setDisplayedCarousels(carousels);
    }
  }, [rotation, carousels]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
      <Header onUseCurrentLocation={handleUseCurrentLocation}>
        <SearchPill
          city={city}
          state={state}
          isLoading={locationLoading || isLoading}
          onSelect={updateCity}
          availableCities={availableCities}
        />
      </Header>
      <Categories
        selected={categoria}
        onSelect={handleCategoria}
        selectedSubcategory={selectedSubcategory}
        onSubcategorySelect={setSelectedSubcategory}
        onViewAll={handleViewAll}
        estabelecimentos={cityEstablishments}
      />
      <main className="flex-1 pb-20 sm:pb-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-5">
          {(isLoading || locationLoading) && (
            <div className="px-4 sm:px-6 lg:px-8">
              <Grid items={[]} isLoading isLoggedIn={isLoggedIn} onLoginRequired={handleLoginRequired} />
            </div>
          )}
          {!isLoading && !locationLoading && showCarousels && (
            <div
              className={cn(
                "transition-opacity duration-300 ease-in-out",
                carouselsVisible ? "opacity-100" : "opacity-0",
              )}
            >
              {displayedCarousels.map((c, index) => (
                <Carousel
                  key={`carousel-${index}`}
                  title={c.title}
                  subtitle={c.subtitle}
                  items={c.items}
                  onSeeAll={() => handleSeeAll(c.categoryId)}
                  isLoggedIn={isLoggedIn}
                  onLoginRequired={handleLoginRequired}
                  onInteractionStart={handleInteractionStart}
                  onInteractionEnd={handleInteractionEnd}
                />
              ))}
            </div>
          )}
          {!isLoading && !locationLoading && showGrid && (
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 capitalize">
                  {selectedSubcategory ? `${selectedSubcategory} em ${city}` : `${categoria} em ${city}`}
                </h2>
                <p className="text-sm text-zinc-600">{filtered.length} lugares encontrados</p>
              </div>
              {filtered.length === 0 && selectedSubcategory && (
                <div className="text-center py-12 bg-zinc-50 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-zinc-900 font-medium mb-1">Nenhum resultado para "{selectedSubcategory}"</p>
                  <p className="text-zinc-500 text-sm mb-4">Tente outra subcategoria ou veja todos</p>
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                  >
                    Ver todos de {categoria}
                  </button>
                </div>
              )}
              {filtered.length > 0 && (
                <Grid
                  items={filtered}
                  isLoading={false}
                  isLoggedIn={isLoggedIn}
                  onLoginRequired={handleLoginRequired}
                />
              )}
            </div>
          )}
          {!isLoading && !locationLoading && !showCarousels && !showGrid && (
            <div className="px-4 sm:px-6 lg:px-8">
              <Grid items={[]} isLoading={false} isLoggedIn={isLoggedIn} onLoginRequired={handleLoginRequired} />
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
