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
import { Heart, MapPin, Gift, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

// =============================================================================
// CONSTANTS
// =============================================================================

const CARD_WIDTH_MOBILE = 280;
const CARD_WIDTH_DESKTOP = 300;
const CARD_GAP = 16;
const SKELETON_COUNT = 6;
const PRELOAD_AHEAD = 3;
const DOUBLE_TAP_DELAY = 300;
const FAVORITES_STORAGE_KEY = "aniversariantevip_favorites";

// Estilos para esconder scrollbar (cross-browser)
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
    // Storage full or disabled - silently fail
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

/**
 * Hook para usar favoritos - funciona com ou sem Provider
 */
const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(() =>
    context ? new Set() : loadFavoritesFromStorage(),
  );

  // Se tem context, usa ele
  if (context) return context;

  // Fallback standalone (memoizado para evitar re-renders)
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
        observer.disconnect(); // Uma vez visível, não precisa mais observar
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
// SKELETON
// =============================================================================

const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

const AirbnbCardSkeleton = memo(() => {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start"
        role="status"
        aria-label="Carregando estabelecimento"
      >
        <div className="relative aspect-[4/3] rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
          {!reducedMotion && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
              style={{ animation: "shimmer 1.5s infinite" }}
            />
          )}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="absolute bottom-3 left-3 w-20 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <div className="space-y-2 pr-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-[85%]" />
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-[60%]" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-[40%]" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-[70%]" />
        </div>

        <span className="sr-only">Carregando estabelecimento...</span>
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
        <div className={cn("absolute inset-0 bg-gray-200 dark:bg-gray-700", !reducedMotion && "animate-pulse")} />
      )}

      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          !reducedMotion && "transition-all duration-500",
          status === "loading" && "opacity-0 scale-105",
          status === "loaded" && "opacity-100 scale-100",
          status === "error" && "opacity-50",
        )}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        draggable={false}
        onLoad={handleLoad}
        onError={handleError}
      />

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <AlertCircle className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
      )}
    </div>
  );
});

CardImage.displayName = "CardImage";

// =============================================================================
// CARD COMPONENT
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

    // Track impression (só uma vez)
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

    const distancia = useMemo(() => {
      if (!userLocation || !est.latitude || !est.longitude) return null;
      const dist = calcularDistancia(userLocation.lat, userLocation.lng, est.latitude, est.longitude);
      return formatarDistancia(dist);
    }, [userLocation, est.latitude, est.longitude]);

    const fotoUrl = useMemo(
      () => getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria),
      [est.logo_url, est.galeria_fotos, est.categoria],
    );

    const fallbackUrl = useMemo(() => getPlaceholderPorCategoria(est.categoria), [est.categoria]);

    const temBeneficio = Boolean(est.descricao_beneficio);
    const nomeDisplay = est.nome_fantasia || est.razao_social || "Estabelecimento";

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

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(isFavorited ? [10] : [10, 50, 10]);
        }

        // Animação
        if (!reducedMotion) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 600);
        }

        toggleFavorite(est.id);
        onFavoriteChange?.(est.id, !isFavorited);
      },
      [est.id, isFavorited, toggleFavorite, reducedMotion, onFavoriteChange],
    );

    // Double tap to favorite
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
        aria-label={`Ver ${nomeDisplay}${temBeneficio ? ", possui benefício para aniversariantes" : ""}`}
        data-index={index}
        className={cn(
          "flex-shrink-0 w-[280px] sm:w-[300px] group cursor-pointer snap-start",
          "outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl",
          "transform-gpu",
          !reducedMotion && "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
        )}
      >
        <div
          className={cn(
            "relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800",
            !reducedMotion && "transition-shadow duration-300",
            "group-hover:shadow-xl group-focus-visible:shadow-xl",
          )}
        >
          {hasBeenInView || priority ? (
            <div
              className={cn(
                "w-full h-full",
                !reducedMotion && "transition-transform duration-500 ease-out",
                "group-hover:scale-105 group-focus-visible:scale-105",
              )}
            >
              <CardImage src={fotoUrl || fallbackUrl} fallback={fallbackUrl} alt={nomeDisplay} priority={priority} />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}

          {/* Overlay gradient */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10",
              "opacity-0 group-hover:opacity-100",
              !reducedMotion && "transition-opacity duration-300",
              "pointer-events-none",
            )}
            aria-hidden="true"
          />

          {/* Favorite button */}
          <button
            onClick={handleFavoriteToggle}
            aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={isFavorited}
            className={cn(
              "absolute top-3 right-3 z-10 p-2 rounded-full",
              "bg-black/20 backdrop-blur-sm",
              "hover:bg-black/40 hover:scale-110",
              "active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              !reducedMotion && "transition-all duration-200",
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5 drop-shadow-lg",
                !reducedMotion && "transition-all duration-200",
                isFavorited ? "text-red-500 fill-red-500" : "text-white fill-white/20",
                isAnimating && !reducedMotion && "scale-125",
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          {/* Benefit badge */}
          {temBeneficio && (
            <div
              className={cn(
                "absolute bottom-3 left-3 px-2.5 py-1.5",
                "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
                "rounded-full shadow-lg",
                "text-xs font-semibold text-purple-700 dark:text-purple-300",
                "flex items-center gap-1.5",
                !reducedMotion && "transition-transform duration-200 group-hover:scale-105",
              )}
            >
              <Gift className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Benefício</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1 pr-4">
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 truncate leading-tight">
            {nomeDisplay}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{est.bairro || est.cidade}</span>
            {distancia && (
              <>
                <span aria-hidden="true" className="text-gray-400">
                  •
                </span>
                <span className="flex-shrink-0 text-gray-500">{distancia}</span>
              </>
            )}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-500 truncate">{categoria || "Estabelecimento"}</p>

          {temBeneficio && (
            <p className="text-sm text-purple-700 dark:text-purple-400 font-medium flex items-center gap-1">
              <span aria-hidden="true">🎁</span>
              <span>Benefício disponível</span>
            </p>
          )}
        </div>
      </article>
    );
  },
);

AirbnbCard.displayName = "AirbnbCard";

// =============================================================================
// POSITION INDICATOR
// =============================================================================

interface PositionIndicatorProps {
  total: number;
  current: number;
  visible?: number;
}

const PositionIndicator = memo(({ total, current, visible = 5 }: PositionIndicatorProps) => {
  if (total <= visible) {
    return (
      <div className="flex items-center justify-center gap-1.5 py-3" role="tablist" aria-label="Posição no carrossel">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            role="tab"
            aria-selected={i === current}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current ? "w-4 bg-purple-600 dark:bg-purple-400" : "w-1.5 bg-gray-300 dark:bg-gray-600",
            )}
          />
        ))}
      </div>
    );
  }

  const progress = total > 1 ? (current / (total - 1)) * 100 : 0;

  return (
    <div className="flex items-center justify-center py-3 px-4">
      <div className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-300"
          style={{ width: `${Math.max(10, progress)}%` }}
        />
      </div>
    </div>
  );
});

PositionIndicator.displayName = "PositionIndicator";

// =============================================================================
// NAVIGATION BUTTON
// =============================================================================

interface NavButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
  reducedMotion: boolean;
}

const NavButton = memo(({ direction, onClick, disabled, reducedMotion }: NavButtonProps) => {
  const isLeft = direction === "left";
  const Icon = isLeft ? ChevronLeft : ChevronRight;

  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? "Ver estabelecimentos anteriores" : "Ver próximos estabelecimentos"}
      disabled={disabled}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-20",
        isLeft ? "left-2 sm:left-4 lg:left-8" : "right-2 sm:right-4 lg:right-8",
        "w-11 h-11 sm:w-12 sm:h-12 rounded-full",
        "bg-white dark:bg-gray-800",
        "shadow-lg border border-gray-200 dark:border-gray-700",
        "flex items-center justify-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
        "disabled:opacity-0 disabled:pointer-events-none",
        "opacity-0 group-hover/carousel:opacity-100 sm:opacity-100",
        !reducedMotion && "transition-all duration-200 hover:scale-105 active:scale-95",
        disabled && "!opacity-0 pointer-events-none",
      )}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-200" aria-hidden="true" />
    </button>
  );
});

NavButton.displayName = "NavButton";

// =============================================================================
// FADE OVERLAY
// =============================================================================

interface FadeOverlayProps {
  direction: "left" | "right";
  visible: boolean;
  reducedMotion: boolean;
}

const FadeOverlay = memo(({ direction, visible, reducedMotion }: FadeOverlayProps) => (
  <div
    className={cn(
      "absolute top-0 bottom-0 w-8 sm:w-16 lg:w-24 z-10 pointer-events-none",
      direction === "left"
        ? "left-0 bg-gradient-to-r from-white dark:from-gray-900 to-transparent"
        : "right-0 bg-gradient-to-l from-white dark:from-gray-900 to-transparent",
      !reducedMotion && "transition-opacity duration-300",
      visible ? "opacity-100" : "opacity-0",
    )}
    aria-hidden="true"
  />
));

FadeOverlay.displayName = "FadeOverlay";

// =============================================================================
// MAIN GRID COMPONENT
// =============================================================================

export const AirbnbCardGrid = memo(
  ({ estabelecimentos, isLoading, userLocation, onCardClick, onFavoriteChange, onImpression }: AirbnbCardGridProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const reducedMotion = useReducedMotion();

    // Preload next images
    useEffect(() => {
      if (!estabelecimentos.length) return;

      const nextItems = estabelecimentos.slice(currentIndex + 4, currentIndex + 4 + PRELOAD_AHEAD);

      nextItems.forEach((est) => {
        const url = getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria);
        if (url) preloadImage(url);
      });
    }, [currentIndex, estabelecimentos]);

    const checkScrollPosition = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const cardTotalWidth = getCardWidth() + CARD_GAP;

      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
      setCurrentIndex(Math.round(scrollLeft / cardTotalWidth));
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

    // Loading state
    if (isLoading) {
      return (
        <div
          className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-12 xl:px-20"
          style={SCROLL_HIDE_STYLES}
          aria-busy="true"
          aria-label="Carregando estabelecimentos"
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <AirbnbCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      );
    }

    // Empty state
    if (!estabelecimentos.length) {
      return <EmptyState type="geral" />;
    }

    const totalCards = estabelecimentos.length;

    return (
      <div
        className="relative group/carousel"
        role="region"
        aria-label={`Carrossel com ${totalCards} estabelecimentos`}
        onKeyDown={handleKeyDown}
      >
        <NavButton
          direction="left"
          onClick={() => scrollByAmount("left")}
          disabled={!showLeftArrow}
          reducedMotion={reducedMotion}
        />

        <NavButton
          direction="right"
          onClick={() => scrollByAmount("right")}
          disabled={!showRightArrow}
          reducedMotion={reducedMotion}
        />

        <FadeOverlay direction="left" visible={showLeftArrow} reducedMotion={reducedMotion} />

        <FadeOverlay direction="right" visible={showRightArrow} reducedMotion={reducedMotion} />

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-2",
            "snap-x snap-mandatory",
            "touch-pan-x",
            reducedMotion ? "scroll-auto" : "scroll-smooth",
          )}
          style={SCROLL_HIDE_STYLES}
          role="list"
          aria-label="Lista de estabelecimentos"
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

        {totalCards > 4 && <PositionIndicator total={totalCards} current={currentIndex} />}

        {/* Live region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Mostrando item {currentIndex + 1} de {totalCards}
        </div>
      </div>
    );
  },
);

AirbnbCardGrid.displayName = "AirbnbCardGrid";
