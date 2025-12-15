import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  memo,
  createContext,
  useContext,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

// =============================================================================
// CONSTANTS
// =============================================================================

const CARD_WIDTH_MOBILE = 160;
const CARD_WIDTH_DESKTOP = 220;
const CARD_GAP = 12;
const SKELETON_COUNT = 6;
const PRELOAD_AHEAD = 3;
const DOUBLE_TAP_DELAY = 300;
const FAVORITES_STORAGE_KEY = "aniversariantevip_favorites";

const SCROLL_HIDE_STYLES: CSSProperties = {
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

// =============================================================================
// TYPES
// =============================================================================

interface Estabelecimento {
  id: string;
  nome_fantasia?: string;
  razao_social?: string;
  estado: string;
  cidade: string;
  bairro?: string;
  slug?: string;
  categoria?: string | string[];
  descricao_beneficio?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  galeria_fotos?: string[];
}

interface AirbnbCardGridProps {
  estabelecimentos: Estabelecimento[];
  isLoading: boolean;
  userLocation?: { lat: number; lng: number } | null;
  onCardClick?: (id: string) => void;
  onFavoriteChange?: (id: string, isFavorited: boolean) => void;
  onImpression?: (ids: string[]) => void;
}

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

// =============================================================================
// FAVORITES CONTEXT
// =============================================================================

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const loadFavoritesFromStorage = (): Set<string> => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveFavoritesToStorage = (favorites: Set<string>) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // Silent fail
  }
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavoritesFromStorage());

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveFavoritesToStorage(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  const value = useMemo(() => ({ favorites, toggleFavorite, isFavorite }), [favorites, toggleFavorite, isFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(() =>
    context ? new Set() : loadFavoritesFromStorage(),
  );

  if (context) return context;

  return {
    favorites: localFavorites,
    toggleFavorite: (id: string) => {
      setLocalFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        saveFavoritesToStorage(next);
        return next;
      });
    },
    isFavorite: (id: string) => localFavorites.has(id),
  };
};

// =============================================================================
// HOOKS
// =============================================================================

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useDebounce = <T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
};

const INTERSECTION_OPTIONS: IntersectionObserverInit = {
  threshold: 0.1,
  rootMargin: "100px",
};

const useInView = () => {
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasBeenInView(true);
        observer.disconnect();
      }
    }, INTERSECTION_OPTIONS);

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, hasBeenInView };
};

// =============================================================================
// UTILS
// =============================================================================

const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatarDistancia = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

const preloadImage = (src: string): void => {
  const img = new Image();
  img.src = src;
};

const getCardWidth = (): number => {
  if (typeof window === "undefined") return CARD_WIDTH_DESKTOP;
  return window.innerWidth < 640 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
};

// =============================================================================
// SHIMMER
// =============================================================================

const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

// =============================================================================
// SKELETON
// =============================================================================

const AirbnbCardSkeleton = memo(() => {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div className="flex-shrink-0 w-[160px] sm:w-[220px] snap-start" role="status" aria-label="Carregando">
        <div className="relative aspect-square rounded-2xl bg-violet-100 dark:bg-violet-900/30 overflow-hidden mb-2">
          {!reducedMotion && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              style={{ animation: "shimmer 1.5s infinite" }}
            />
          )}
        </div>
        <div className="space-y-1.5">
          <div className="h-4 bg-violet-100 dark:bg-violet-900/30 rounded w-[85%]" />
          <div className="h-3 bg-violet-100 dark:bg-violet-900/30 rounded w-[60%]" />
          <div className="h-3 bg-violet-100 dark:bg-violet-900/30 rounded w-[50%]" />
        </div>
        <span className="sr-only">Carregando...</span>
      </div>
    </>
  );
});

AirbnbCardSkeleton.displayName = "AirbnbCardSkeleton";

// =============================================================================
// CARD IMAGE
// =============================================================================

interface CardImageProps {
  src: string;
  fallback: string;
  alt: string;
  priority: boolean;
}

const CardImage = memo(({ src, fallback, alt, priority }: CardImageProps) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(priority ? "loaded" : "loading");
  const [currentSrc, setCurrentSrc] = useState(src);
  const reducedMotion = useReducedMotion();

  const handleLoad = useCallback(() => setStatus("loaded"), []);

  const handleError = useCallback(() => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    } else {
      setStatus("error");
    }
  }, [currentSrc, fallback]);

  return (
    <div className="relative w-full h-full">
      {status === "loading" && (
        <div
          className={cn("absolute inset-0 bg-violet-100 dark:bg-violet-900/30", !reducedMotion && "animate-pulse")}
        />
      )}

      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          !reducedMotion && "transition-opacity duration-300",
          status === "loading" && "opacity-0",
          status === "loaded" && "opacity-100",
          status === "error" && "opacity-50",
        )}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        draggable={false}
        onLoad={handleLoad}
        onError={handleError}
      />

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-violet-50 dark:bg-violet-900/20">
          <AlertCircle className="w-6 h-6 text-violet-300" aria-hidden="true" />
        </div>
      )}
    </div>
  );
});

CardImage.displayName = "CardImage";

// =============================================================================
// CARD COMPONENT - Estilo AniversarianteVIP (layout Airbnb + cores violeta)
// =============================================================================

interface AirbnbCardProps {
  estabelecimento: Estabelecimento;
  priority?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  index: number;
  onImpression?: (id: string) => void;
  onFavoriteChange?: (id: string, isFavorited: boolean) => void;
  onClick?: (id: string) => void;
}

const AirbnbCard = memo(
  ({
    estabelecimento,
    priority = false,
    userLocation,
    index,
    onImpression,
    onFavoriteChange,
    onClick,
  }: AirbnbCardProps) => {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [isAnimating, setIsAnimating] = useState(false);
    const lastTapRef = useRef<number>(0);
    const reducedMotion = useReducedMotion();
    const { ref, hasBeenInView } = useInView();

    const est = estabelecimento;
    const isFavorited = isFavorite(est.id);

    // Track impression
    const impressionTrackedRef = useRef(false);
    useEffect(() => {
      if (hasBeenInView && onImpression && !impressionTrackedRef.current) {
        impressionTrackedRef.current = true;
        onImpression(est.id);
      }
    }, [hasBeenInView, est.id, onImpression]);

    // Memoized values
    const url = useMemo(
      () =>
        getEstabelecimentoUrl({
          estado: est.estado,
          cidade: est.cidade,
          slug: est.slug,
          id: est.id,
        }),
      [est.estado, est.cidade, est.slug, est.id],
    );

    const categoria = useMemo(() => (Array.isArray(est.categoria) ? est.categoria[0] : est.categoria), [est.categoria]);

    const fotoUrl = useMemo(
      () => getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria),
      [est.logo_url, est.galeria_fotos, est.categoria],
    );

    const fallbackUrl = useMemo(() => getPlaceholderPorCategoria(est.categoria), [est.categoria]);

    const temBeneficio = Boolean(est.descricao_beneficio);
    const nomeDisplay = est.nome_fantasia || est.razao_social || "Estabelecimento";
    const bairroDisplay = est.bairro || est.cidade;

    // DEBUG - REMOVER DEPOIS
    useEffect(() => {
      console.log(`[Card ${index}]`, {
        id: est.id,
        nome_fantasia: est.nome_fantasia,
        razao_social: est.razao_social,
        bairro: est.bairro,
        cidade: est.cidade,
        nomeDisplay,
        bairroDisplay,
        todasAsChaves: Object.keys(est)
      });
    }, []);

    // Handlers
    const handleClick = useCallback(() => {
      onClick?.(est.id);
      navigate(url);
    }, [navigate, url, onClick, est.id]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      },
      [handleClick],
    );

    const handleMouseEnter = useCallback(() => {
      if (fotoUrl) preloadImage(fotoUrl);
    }, [fotoUrl]);

    const handleFavoriteToggle = useCallback(
      (e?: React.MouseEvent | React.TouchEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (navigator.vibrate) {
          navigator.vibrate(isFavorited ? [10] : [10, 50, 10]);
        }

        if (!reducedMotion) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 300);
        }

        toggleFavorite(est.id);
        onFavoriteChange?.(est.id, !isFavorited);
      },
      [est.id, isFavorited, toggleFavorite, reducedMotion, onFavoriteChange],
    );

    const handleTouchEnd = useCallback(
      (e: React.TouchEvent) => {
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          e.preventDefault();
          handleFavoriteToggle();
        }
        lastTapRef.current = now;
      },
      [handleFavoriteToggle],
    );

    return (
      <article
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        role="link"
        aria-label={`Ver ${nomeDisplay}`}
        data-index={index}
        className={cn(
          "flex-shrink-0 w-[160px] sm:w-[220px] group cursor-pointer snap-start",
          "outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-2xl",
        )}
      >
        {/* Imagem - Quadrada com bordas arredondadas */}
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 bg-violet-50 dark:bg-violet-900/20">
          {hasBeenInView || priority ? (
            <CardImage src={fotoUrl || fallbackUrl} fallback={fallbackUrl} alt={nomeDisplay} priority={priority} />
          ) : (
            <div className="w-full h-full bg-violet-100 dark:bg-violet-900/30 animate-pulse" />
          )}

          {/* Badge Benefício - Top Left */}
          {temBeneficio && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/95 dark:bg-gray-900/95 shadow-sm">
              <span className="text-[10px] sm:text-xs font-medium text-violet-700 dark:text-violet-300">Benefício</span>
            </div>
          )}

          {/* Coração - Top Right */}
          <button
            onClick={handleFavoriteToggle}
            aria-label={isFavorited ? "Remover dos favoritos" : "Salvar"}
            aria-pressed={isFavorited}
            className={cn(
              "absolute top-2 right-2 p-1",
              "transition-transform duration-200",
              "hover:scale-110 active:scale-95",
              "focus-visible:outline-none",
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5 sm:w-6 sm:h-6",
                "drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
                "transition-all duration-200",
                isFavorited ? "text-violet-500 fill-violet-500" : "text-white fill-white/40 stroke-2",
                isAnimating && "scale-125",
              )}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Conteúdo - Exatamente como no print */}
        <div className="space-y-0.5 px-0.5">
          {/* Nome do estabelecimento - Negrito, roxo escuro */}
          <h3 className="font-semibold text-sm sm:text-[15px] leading-tight text-violet-950 dark:text-white line-clamp-2">
            {nomeDisplay}
          </h3>

          {/* Bairro - Cinza/roxo claro */}
          <p className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70 truncate">{bairroDisplay}</p>

          {/* Categoria - Cinza/roxo claro */}
          {categoria && (
            <p className="text-xs sm:text-sm text-violet-600/70 dark:text-violet-300/70 truncate">{categoria}</p>
          )}

          {/* Benefício no aniversário - Destaque roxo */}
          {temBeneficio && (
            <p className="text-xs sm:text-sm text-violet-700 dark:text-violet-400 font-medium flex items-center gap-1 pt-0.5">
              <span>🎁</span>
              <span>Benefício no aniversário</span>
            </p>
          )}
        </div>
      </article>
    );
  },
);

AirbnbCard.displayName = "AirbnbCard";

// =============================================================================
// NAVIGATION BUTTON
// =============================================================================

interface NavButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
  reducedMotion: boolean;
}

const NavButton = memo(({ direction, onClick, visible, reducedMotion }: NavButtonProps) => {
  const isLeft = direction === "left";
  const Icon = isLeft ? ChevronLeft : ChevronRight;

  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? "Anterior" : "Próximo"}
      className={cn(
        "absolute top-[90px] sm:top-[110px] -translate-y-1/2 z-20",
        isLeft ? "-left-2 sm:-left-3" : "-right-2 sm:-right-3",
        "w-8 h-8 sm:w-9 sm:h-9 rounded-full",
        "bg-white dark:bg-gray-800",
        "shadow-lg border border-gray-200 dark:border-gray-700",
        "flex items-center justify-center",
        "opacity-0 group-hover/carousel:opacity-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        !reducedMotion && "transition-all duration-200 hover:scale-110 hover:shadow-xl",
      )}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" aria-hidden="true" />
    </button>
  );
});

NavButton.displayName = "NavButton";

// =============================================================================
// MAIN GRID COMPONENT
// =============================================================================

export const AirbnbCardGrid = memo(
  ({ estabelecimentos, isLoading, userLocation, onCardClick, onFavoriteChange, onImpression }: AirbnbCardGridProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const reducedMotion = useReducedMotion();

    const checkScrollPosition = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;

      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }, []);

    const debouncedCheckScroll = useDebounce(checkScrollPosition, 50);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      checkScrollPosition();
      el.addEventListener("scroll", debouncedCheckScroll, { passive: true });
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        el.removeEventListener("scroll", debouncedCheckScroll);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }, [checkScrollPosition, debouncedCheckScroll, estabelecimentos]);

    const scrollByAmount = useCallback(
      (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;

        const cardTotalWidth = getCardWidth() + CARD_GAP;
        const visibleCards = Math.floor(el.clientWidth / cardTotalWidth);
        const scrollAmount = cardTotalWidth * Math.max(1, visibleCards - 1);

        el.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [reducedMotion],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollByAmount("left");
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollByAmount("right");
        }
      },
      [scrollByAmount],
    );

    const handleImpression = useCallback(
      (id: string) => {
        onImpression?.([id]);
      },
      [onImpression],
    );

    // Loading
    if (isLoading) {
      return (
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-6" style={SCROLL_HIDE_STYLES} aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <AirbnbCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      );
    }

    // Empty
    if (!estabelecimentos.length) {
      return <EmptyState type="geral" />;
    }

    return (
      <div
        className="relative group/carousel px-4 sm:px-6"
        role="region"
        aria-label={`${estabelecimentos.length} estabelecimentos`}
        onKeyDown={handleKeyDown}
      >
        {/* Setas de navegação */}
        <NavButton
          direction="left"
          onClick={() => scrollByAmount("left")}
          visible={showLeftArrow}
          reducedMotion={reducedMotion}
        />

        <NavButton
          direction="right"
          onClick={() => scrollByAmount("right")}
          visible={showRightArrow}
          reducedMotion={reducedMotion}
        />

        {/* Container do scroll */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-3 overflow-x-auto py-1 -mx-4 px-4 sm:-mx-6 sm:px-6",
            "snap-x snap-mandatory",
            reducedMotion ? "scroll-auto" : "scroll-smooth",
          )}
          style={SCROLL_HIDE_STYLES}
          role="list"
        >
          {estabelecimentos.map((est, index) => (
            <AirbnbCard
              key={est.id}
              estabelecimento={est}
              priority={index < 4}
              userLocation={userLocation}
              index={index}
              onImpression={handleImpression}
              onFavoriteChange={onFavoriteChange}
              onClick={onCardClick}
            />
          ))}
        </div>
      </div>
    );
  },
);

AirbnbCardGrid.displayName = "AirbnbCardGrid";
