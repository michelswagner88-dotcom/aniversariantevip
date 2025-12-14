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
} from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Gift, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

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
// FAVORITES CONTEXT (Persistência)
// =============================================================================

const FAVORITES_STORAGE_KEY = "aniversariantevip_favorites";

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
    // Storage full or disabled
  }
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavoritesFromStorage);

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

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>
  );
};

const useFavorites = () => {
  const context = useContext(FavoritesContext);

  // Fallback se não tiver provider (funciona standalone)
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(loadFavoritesFromStorage);

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

/**
 * Hook para detectar prefers-reduced-motion
 */
const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

/**
 * Hook para debounce
 */
const useDebounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  ) as T;
};

/**
 * Hook para intersection observer (lazy load)
 */
const useInView = (options?: IntersectionObserverInit) => {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasBeenInView(true);
        }
      },
      { threshold: 0.1, rootMargin: "100px", ...options },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView, hasBeenInView };
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

// Preload image utility
const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

// =============================================================================
// SKELETON (Realista)
// =============================================================================

const AirbnbCardSkeleton = memo(() => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start"
      role="status"
      aria-label="Carregando estabelecimento"
    >
      {/* Imagem skeleton - mesma proporção do card real */}
      <div className="relative aspect-[4/3] rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
        {!reducedMotion && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
        )}

        {/* Simula o botão de favorito */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />

        {/* Simula badge de benefício */}
        <div className="absolute bottom-3 left-3 w-20 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>

      {/* Texto skeleton - mesma estrutura do card real */}
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
  );
});

AirbnbCardSkeleton.displayName = "AirbnbCardSkeleton";

// =============================================================================
// CARD IMAGE (Com lazy load e blur placeholder)
// =============================================================================

const CardImage = memo(
  ({ src, fallback, alt, priority }: { src: string; fallback: string; alt: string; priority: boolean }) => {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">(priority ? "loaded" : "loading");
    const [currentSrc, setCurrentSrc] = useState(src);
    const reducedMotion = useReducedMotion();

    const handleLoad = useCallback(() => {
      setStatus("loaded");
    }, []);

    const handleError = useCallback(() => {
      if (currentSrc !== fallback) {
        setCurrentSrc(fallback);
      } else {
        setStatus("error");
      }
    }, [currentSrc, fallback]);

    return (
      <div className="relative w-full h-full">
        {/* Blur placeholder */}
        {status === "loading" && (
          <div className={cn("absolute inset-0 bg-gray-200 dark:bg-gray-700", !reducedMotion && "animate-pulse")} />
        )}

        {/* Imagem real */}
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
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

        {/* Error state */}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
    );
  },
);

CardImage.displayName = "CardImage";

// =============================================================================
// CARD COMPONENT
// =============================================================================

const AirbnbCard = memo(
  ({
    estabelecimento,
    priority = false,
    userLocation,
    index,
    onImpression,
  }: {
    estabelecimento: Estabelecimento;
    priority?: boolean;
    userLocation?: { lat: number; lng: number } | null;
    index: number;
    onImpression?: (id: string) => void;
  }) => {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [isAnimating, setIsAnimating] = useState(false);
    const lastTapRef = useRef<number>(0);
    const reducedMotion = useReducedMotion();

    // Intersection Observer para lazy load e analytics
    const { ref, hasBeenInView } = useInView();

    const est = estabelecimento;
    const isFavorited = isFavorite(est.id);

    // Track impression quando entra em view
    useEffect(() => {
      if (hasBeenInView && onImpression) {
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
      navigate(url);
    }, [navigate, url]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(url);
        }
      },
      [navigate, url],
    );

    // Prefetch on hover
    const handleMouseEnter = useCallback(() => {
      // Preload da imagem em alta qualidade se existir
      if (fotoUrl) preloadImage(fotoUrl);
    }, [fotoUrl]);

    // Double tap to favorite (mobile)
    const handleTouchEnd = useCallback(() => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double tap detected
        handleFavoriteToggle();
      }
      lastTapRef.current = now;
    }, []);

    const handleFavoriteToggle = useCallback(
      (e?: React.MouseEvent) => {
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
      },
      [est.id, isFavorited, toggleFavorite, reducedMotion],
    );

    return (
      <article
        ref={ref as React.RefObject<HTMLElement>}
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
          "transform-gpu", // GPU acceleration
          !reducedMotion && "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
        )}
        style={{
          willChange: "transform",
          // Stagger animation on mount
          animationDelay: reducedMotion ? "0ms" : `${index * 50}ms`,
        }}
      >
        <div
          className={cn(
            "relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800",
            !reducedMotion && "transition-shadow duration-300",
            "group-hover:shadow-xl group-focus-visible:shadow-xl",
          )}
        >
          {/* Só renderiza imagem se já foi visível */}
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

          {/* Overlay gradient para contraste */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            aria-hidden="true"
          />

          {/* Botão Favorito */}
          <button
            onClick={handleFavoriteToggle}
            aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={isFavorited}
            className={cn(
              "absolute top-3 right-3 z-10 p-2 rounded-full",
              "bg-black/20 backdrop-blur-sm",
              "transition-all duration-200",
              "hover:bg-black/40 hover:scale-110",
              "active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5 drop-shadow-lg",
                "transition-all duration-200",
                isFavorited ? "text-red-500 fill-red-500" : "text-white fill-white/20",
                isAnimating && !reducedMotion && "animate-[heartBounce_0.6s_ease-out]",
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          {/* Badge de Benefício */}
          {temBeneficio && (
            <div
              className={cn(
                "absolute bottom-3 left-3 px-2.5 py-1.5",
                "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
                "rounded-full shadow-lg",
                "text-xs font-semibold text-purple-700 dark:text-purple-300",
                "flex items-center gap-1.5",
                "transform-gpu",
                !reducedMotion && "transition-transform duration-200 group-hover:scale-105",
              )}
            >
              <Gift className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Benefício</span>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="space-y-1 pr-4">
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 truncate leading-tight">
            {nomeDisplay}
          </h3>

          <p className="text-[14px] text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
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

          <p className="text-[14px] text-gray-500 dark:text-gray-500 truncate">{categoria || "Estabelecimento"}</p>

          {temBeneficio && (
            <p className="text-[14px] text-purple-700 dark:text-purple-400 font-medium flex items-center gap-1">
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
// POSITION INDICATOR (Dots)
// =============================================================================

const PositionIndicator = memo(
  ({ total, current, visible = 5 }: { total: number; current: number; visible?: number }) => {
    if (total <= visible) {
      return (
        <div className="flex items-center justify-center gap-1.5 py-3" role="tablist" aria-label="Posição no carrossel">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              role="tab"
              aria-selected={i === current}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                i === current ? "w-4 bg-purple-600 dark:bg-purple-400" : "bg-gray-300 dark:bg-gray-600",
              )}
            />
          ))}
        </div>
      );
    }

    // Para muitos itens, mostra barra de progresso
    const progress = (current / (total - 1)) * 100;

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
  },
);

PositionIndicator.displayName = "PositionIndicator";

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

    // Preload próximas imagens
    useEffect(() => {
      if (!estabelecimentos.length) return;

      const nextItems = estabelecimentos.slice(currentIndex + 4, currentIndex + 7);
      nextItems.forEach((est) => {
        const url = getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria);
        if (url) preloadImage(url);
      });
    }, [currentIndex, estabelecimentos]);

    const checkScrollPosition = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const cardWidth = 316; // 300px + 16px gap

      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
      setCurrentIndex(Math.round(scrollLeft / cardWidth));
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

        const cardWidth = 316;
        const visibleCards = Math.floor(el.clientWidth / cardWidth);
        const scrollAmount = cardWidth * Math.max(1, visibleCards - 1);

        el.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [reducedMotion],
    );

    // Keyboard navigation no carrossel
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

    const handleScrollLeft = useCallback(() => scrollByAmount("left"), [scrollByAmount]);
    const handleScrollRight = useCallback(() => scrollByAmount("right"), [scrollByAmount]);

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
          className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-12 xl:px-20 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
          aria-busy="true"
          aria-label="Carregando estabelecimentos"
        >
          {Array.from({ length: 6 }).map((_, i) => (
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
        {/* Botão Esquerda */}
        <button
          onClick={handleScrollLeft}
          aria-label="Ver estabelecimentos anteriores"
          disabled={!showLeftArrow}
          className={cn(
            "absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20",
            "w-11 h-11 sm:w-12 sm:h-12 rounded-full",
            "bg-white dark:bg-gray-800",
            "shadow-lg border border-gray-200 dark:border-gray-700",
            "flex items-center justify-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
            "disabled:opacity-0 disabled:pointer-events-none",
            !reducedMotion && "transition-all duration-200 hover:scale-105 active:scale-95",
            "opacity-0 group-hover/carousel:opacity-100 sm:opacity-100",
            !showLeftArrow && "!opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-200" aria-hidden="true" />
        </button>

        {/* Botão Direita */}
        <button
          onClick={handleScrollRight}
          aria-label="Ver próximos estabelecimentos"
          disabled={!showRightArrow}
          className={cn(
            "absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20",
            "w-11 h-11 sm:w-12 sm:h-12 rounded-full",
            "bg-white dark:bg-gray-800",
            "shadow-lg border border-gray-200 dark:border-gray-700",
            "flex items-center justify-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
            "disabled:opacity-0 disabled:pointer-events-none",
            !reducedMotion && "transition-all duration-200 hover:scale-105 active:scale-95",
            "opacity-0 group-hover/carousel:opacity-100 sm:opacity-100",
            !showRightArrow && "!opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-200" aria-hidden="true" />
        </button>

        {/* Fade esquerdo */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24",
            "bg-gradient-to-r from-white dark:from-gray-900 to-transparent",
            "z-10 pointer-events-none",
            !reducedMotion && "transition-opacity duration-300",
            showLeftArrow ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />

        {/* Fade direito */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24",
            "bg-gradient-to-l from-white dark:from-gray-900 to-transparent",
            "z-10 pointer-events-none",
            !reducedMotion && "transition-opacity duration-300",
            showRightArrow ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-2",
            "snap-x snap-mandatory",
            "touch-pan-x",
            "scrollbar-hide",
            reducedMotion ? "scroll-auto" : "scroll-smooth",
          )}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          role="list"
          aria-label="Lista de estabelecimentos"
          tabIndex={0}
        >
          {estabelecimentos.map((est, index) => (
            <AirbnbCard
              key={est.id}
              estabelecimento={est}
              priority={index < 4}
              userLocation={userLocation}
              index={index}
              onImpression={handleImpression}
            />
          ))}
        </div>

        {/* Indicador de posição */}
        {totalCards > 4 && <PositionIndicator total={totalCards} current={currentIndex} />}

        {/* Live region para screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Mostrando item {currentIndex + 1} de {totalCards}
        </div>
      </div>
    );
  },
);

AirbnbCardGrid.displayName = "AirbnbCardGrid";
