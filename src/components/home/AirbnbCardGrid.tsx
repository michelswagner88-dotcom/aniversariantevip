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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EstablishmentCard, EstablishmentCardSkeleton, type EstablishmentData } from "@/components/cards";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

// =============================================================================
// CONSTANTS
// =============================================================================

const CARD_WIDTH_MOBILE = 160;
const CARD_WIDTH_DESKTOP = 220;
const CARD_GAP = 12;
const SKELETON_COUNT = 6;

const SCROLL_HIDE_STYLES: CSSProperties = {
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

// =============================================================================
// TYPES
// =============================================================================

interface AirbnbCardGridProps {
  estabelecimentos: EstablishmentData[];
  isLoading: boolean;
  userLocation?: { lat: number; lng: number } | null;
  onCardClick?: (id: string) => void;
  onFavoriteChange?: (id: string, isFavorited: boolean) => void;
  onImpression?: (ids: string[]) => void;
  variant?: "carousel" | "grid";
}

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

// =============================================================================
// UTILS
// =============================================================================

const getCardWidth = (): number => {
  if (typeof window === "undefined") return CARD_WIDTH_DESKTOP;
  return window.innerWidth < 640 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
};

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
        "bg-white",
        "shadow-lg border border-violet-200",
        "flex items-center justify-center",
        "opacity-0 group-hover/carousel:opacity-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:opacity-100",
        !reducedMotion && "transition-all duration-200 hover:scale-110 hover:shadow-xl",
      )}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#240046]" aria-hidden="true" />
    </button>
  );
});

NavButton.displayName = "NavButton";

// =============================================================================
// MAIN GRID COMPONENT
// =============================================================================

export const AirbnbCardGrid = memo(
  ({ estabelecimentos, isLoading, onCardClick, onFavoriteChange, onImpression, variant = "carousel" }: AirbnbCardGridProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const reducedMotion = useReducedMotion();
    const isGrid = variant === "grid";

    const checkScrollPosition = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;

      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }, []);

    const debouncedCheckScroll = useDebounce(checkScrollPosition, 50);

    useEffect(() => {
      if (isGrid) return; // Skip scroll listeners for grid mode
      
      const el = scrollRef.current;
      if (!el) return;

      checkScrollPosition();
      el.addEventListener("scroll", debouncedCheckScroll, { passive: true });
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        el.removeEventListener("scroll", debouncedCheckScroll);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }, [checkScrollPosition, debouncedCheckScroll, estabelecimentos, isGrid]);

    // Scroll by 1 card at a time
    const scrollByAmount = useCallback(
      (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;

        const cardTotalWidth = getCardWidth() + CARD_GAP;

        el.scrollBy({
          left: direction === "left" ? -cardTotalWidth : cardTotalWidth,
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

    // Loading - Grid mode
    if (isLoading && isGrid) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <EstablishmentCardSkeleton key={`skeleton-${i}`} fullWidth />
          ))}
        </div>
      );
    }

    // Loading - Carousel mode
    if (isLoading) {
      return (
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-6" style={SCROLL_HIDE_STYLES} aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <EstablishmentCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      );
    }

    // Empty
    if (!estabelecimentos.length) {
      return <EmptyState type="geral" />;
    }

    // GRID MODE
    if (isGrid) {
      return (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
          role="region"
          aria-label={`${estabelecimentos.length} estabelecimentos`}
        >
          {estabelecimentos.map((est, index) => (
            <EstablishmentCard
              key={est.id}
              establishment={est}
              priority={index < 6}
              index={index}
              onImpression={handleImpression}
              onFavoriteChange={onFavoriteChange}
              onClick={onCardClick}
              fullWidth
            />
          ))}
        </div>
      );
    }

    // CAROUSEL MODE (default)
    return (
      <div
        className="relative group/carousel px-4 sm:px-6"
        role="region"
        aria-label={`${estabelecimentos.length} estabelecimentos`}
        onKeyDown={handleKeyDown}
      >
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
            <div key={est.id} className="flex-shrink-0 w-[160px] sm:w-[220px] snap-start">
              <EstablishmentCard
                establishment={est}
                priority={index < 4}
                index={index}
                onImpression={handleImpression}
                onFavoriteChange={onFavoriteChange}
                onClick={onCardClick}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
);

AirbnbCardGrid.displayName = "AirbnbCardGrid";
