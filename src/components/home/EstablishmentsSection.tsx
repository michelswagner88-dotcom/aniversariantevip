import { memo, useRef, useState, useEffect, useCallback, useMemo, useId } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { EstablishmentCard } from "@/components/cards";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS
// =============================================================================

const SCROLL_THRESHOLD = 10;
const STAGGER_DELAY = 0.08;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const HAPTIC_LIGHT = 5;
const INTERSECTION_THRESHOLD = 0.1;

const CARD_WIDTHS = {
  featured: "w-[300px] sm:w-[350px]",
  compact: "w-[220px] sm:w-[260px]",
  default: "w-[260px] sm:w-[300px]",
} as const;

const SCROLL_AMOUNTS = {
  featured: 366,
  compact: 276,
  default: 316,
} as const;

// =============================================================================
// TYPES
// =============================================================================

interface Establishment {
  id: string;
  slug?: string;
  nome_fantasia?: string;
  logo_url?: string;
  galeria_fotos?: string[];
  categoria?: string[];
  especialidades?: string[];
  bairro?: string;
  cidade?: string;
  descricao_beneficio?: string;
  created_at?: string;
}

interface EstablishmentsSectionProps {
  title: string;
  subtitle?: string;
  establishments: Establishment[];
  viewAllLink?: string;
  variant?: "default" | "featured" | "compact";
  showViewMoreCard?: boolean;
  onSectionView?: (title: string) => void;
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

const useInView = (threshold = INTERSECTION_THRESHOLD) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
};

// =============================================================================
// UTILS
// =============================================================================

const haptic = (pattern: number = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const isNewEstablishment = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < SEVEN_DAYS_MS;
};

// =============================================================================
// STAGGER ANIMATION WRAPPER
// =============================================================================

interface StaggerItemProps {
  index: number;
  isInView: boolean;
  reducedMotion: boolean;
  children: React.ReactNode;
  className?: string;
}

const StaggerItem = memo(({ index, isInView, reducedMotion, children, className }: StaggerItemProps) => (
  <div
    className={className}
    style={{
      opacity: reducedMotion || isInView ? 1 : 0,
      transform: reducedMotion || isInView ? "translateY(0)" : "translateY(20px)",
      transition: reducedMotion ? "none" : `all 0.5s ease-out ${index * STAGGER_DELAY}s`,
    }}
  >
    {children}
  </div>
));

StaggerItem.displayName = "StaggerItem";

// =============================================================================
// NAV BUTTON
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

  return (
    <button
      onClick={onClick}
      disabled={!visible}
      aria-label={isLeft ? "Ver estabelecimentos anteriores" : "Ver próximos estabelecimentos"}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-20",
        isLeft ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
        "w-12 h-12 rounded-full",
        "bg-white/90 backdrop-blur-md",
        "border border-violet-200 shadow-lg",
        "flex items-center justify-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]",
        "disabled:opacity-0 disabled:pointer-events-none",
        !reducedMotion && [
          "transition-all duration-300",
          "hover:bg-white hover:scale-110 hover:border-[#7C3AED]/30",
          "active:scale-95",
        ],
        visible ? "opacity-0 group-hover/carousel:opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <Icon className="w-6 h-6 text-[#240046]" aria-hidden="true" />
    </button>
  );
});

NavButton.displayName = "NavButton";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EstablishmentsSection = memo(
  ({
    title,
    subtitle,
    establishments,
    viewAllLink,
    variant = "default",
    showViewMoreCard = true,
    onSectionView,
  }: EstablishmentsSectionProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const reducedMotion = useReducedMotion();
    const { ref: sectionRef, isInView } = useInView();
    const titleId = useId();

    // Track section view
    useEffect(() => {
      if (isInView && onSectionView) {
        onSectionView(title);
      }
    }, [isInView, title, onSectionView]);

    // Check scroll position
    const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > SCROLL_THRESHOLD);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - SCROLL_THRESHOLD);
    }, []);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      let rafId: number;
      const debouncedCheck = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(checkScroll);
      };

      checkScroll();
      el.addEventListener("scroll", debouncedCheck, { passive: true });
      window.addEventListener("resize", checkScroll);

      return () => {
        el.removeEventListener("scroll", debouncedCheck);
        window.removeEventListener("resize", checkScroll);
        cancelAnimationFrame(rafId);
      };
    }, [checkScroll, establishments]);

    // Scroll handler
    const scroll = useCallback(
      (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;

        haptic();

        const scrollAmount = SCROLL_AMOUNTS[variant];
        el.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [variant, reducedMotion],
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft" && canScrollLeft) {
          e.preventDefault();
          scroll("left");
        } else if (e.key === "ArrowRight" && canScrollRight) {
          e.preventDefault();
          scroll("right");
        }
      },
      [scroll, canScrollLeft, canScrollRight],
    );

    // Mapped establishments
    const mappedEstablishments = useMemo(() => {
      return establishments.map((est, index) => ({
        original: est,
        mapped: {
          id: est.id,
          slug: est.slug || est.id,
          name: est.nome_fantasia || "Estabelecimento",
          photo_url: est.galeria_fotos?.[0] || est.logo_url || "",
          category: est.categoria?.[0] || "",
          subcategory: est.especialidades?.[0],
          bairro: est.bairro || "",
          cidade: est.cidade,
          benefit_description: est.descricao_beneficio,
          is_new: isNewEstablishment(est.created_at),
          is_popular: index < 3 && variant === "featured",
        },
        index,
      }));
    }, [establishments, variant]);

    const cardWidth = CARD_WIDTHS[variant];

    if (!establishments || establishments.length === 0) {
      return null;
    }

    return (
      <section
        ref={sectionRef as React.RefObject<HTMLElement>}
        className={cn(
          "py-8 bg-white",
          !reducedMotion && "transition-all duration-700 ease-out",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          reducedMotion && "opacity-100 translate-y-0",
        )}
        aria-labelledby={titleId}
        role="region"
      >
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div className="max-w-lg">
              <h2 id={titleId} className="text-2xl sm:text-3xl font-bold text-[#240046]">
                {title}
              </h2>
              {subtitle && <p className="text-[#7C3AED] mt-1 text-sm sm:text-base">{subtitle}</p>}
            </div>

            {viewAllLink && (
              <Link
                to={viewAllLink}
                className={cn(
                  "hidden sm:flex items-center gap-1.5",
                  "text-[#7C3AED] font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 rounded",
                  !reducedMotion && "transition-all duration-300 hover:text-[#6D28D9] group",
                )}
              >
                <span>Ver todos</span>
                <ArrowRight
                  className={cn(
                    "w-4 h-4",
                    !reducedMotion && "transition-transform duration-300 group-hover:translate-x-1",
                  )}
                  aria-hidden="true"
                />
              </Link>
            )}
          </div>

          {/* Carousel */}
          <div className="relative group/carousel">
            {/* Left Arrow */}
            <NavButton
              direction="left"
              onClick={() => scroll("left")}
              visible={canScrollLeft}
              reducedMotion={reducedMotion}
            />

            {/* Scroll Container */}
            {/*
             * CORRIGIDO: snap-mandatory → snap-proximity
             * snap-mandatory pode confundir o iOS Safari quando o scroll
             * vertical atinge o final da página, causando "pulos" para o topo.
             * snap-proximity é menos agressivo e mais seguro.
             */}
            <div
              ref={scrollRef}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              className={cn(
                "flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mb-4",
                "snap-x snap-proximity touch-pan-x",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 rounded-lg",
                reducedMotion ? "scroll-auto" : "scroll-smooth",
              )}
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              role="list"
              aria-label={`Lista de ${title}`}
            >
              {mappedEstablishments.map(({ original, mapped, index }) => (
                <StaggerItem
                  key={original.id || index}
                  index={index}
                  isInView={isInView}
                  reducedMotion={reducedMotion}
                  className={cn("flex-shrink-0 snap-start", cardWidth)}
                >
                  <div role="listitem">
                    <EstablishmentCard establishment={mapped} index={index} />
                  </div>
                </StaggerItem>
              ))}

              {/* View More Card */}
              {showViewMoreCard && viewAllLink && (
                <StaggerItem
                  index={establishments.length}
                  isInView={isInView}
                  reducedMotion={reducedMotion}
                  className={cn("flex-shrink-0 snap-start", cardWidth)}
                >
                  <Link
                    to={viewAllLink}
                    role="listitem"
                    aria-label={`Ver todos os ${title}`}
                    className={cn(
                      "block aspect-[4/3]",
                      "bg-violet-50",
                      "border border-[#7C3AED]/20 rounded-2xl",
                      "flex flex-col items-center justify-center gap-4",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2",
                      !reducedMotion && [
                        "transition-all duration-300",
                        "hover:bg-violet-100",
                        "hover:border-[#7C3AED]/40 hover:scale-[1.02]",
                        "hover:shadow-xl hover:shadow-violet-500/10",
                        "group",
                      ],
                    )}
                  >
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl",
                        "bg-violet-100",
                        "flex items-center justify-center",
                        !reducedMotion && "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                      )}
                    >
                      <ArrowRight className="w-8 h-8 text-[#7C3AED]" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                      <p className="text-[#7C3AED] font-semibold">Ver todos</p>
                      <p className="text-[#240046]/60 text-sm">Explorar categoria</p>
                    </div>
                  </Link>
                </StaggerItem>
              )}
            </div>

            {/* Right Arrow */}
            <NavButton
              direction="right"
              onClick={() => scroll("right")}
              visible={canScrollRight}
              reducedMotion={reducedMotion}
            />

            {/* Left Fade */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-4 w-8 z-10 pointer-events-none",
                "bg-gradient-to-r from-white to-transparent",
                !reducedMotion && "transition-opacity duration-300",
                canScrollLeft ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />

            {/* Right Fade */}
            <div
              className={cn(
                "absolute right-0 top-0 bottom-4 w-8 z-10 pointer-events-none",
                "bg-gradient-to-l from-white to-transparent",
                !reducedMotion && "transition-opacity duration-300",
                canScrollRight ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />
          </div>

          {/* Mobile View All Link */}
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className={cn(
                "sm:hidden flex items-center justify-center gap-2",
                "mt-4 py-3",
                "text-[#7C3AED] font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded",
                !reducedMotion && "transition-colors hover:text-[#6D28D9]",
              )}
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* Live region */}
        <div role="status" aria-live="polite" className="sr-only">
          {canScrollLeft && canScrollRight
            ? "Use as setas para navegar"
            : canScrollRight
              ? "Início da lista"
              : "Fim da lista"}
        </div>
      </section>
    );
  },
);

EstablishmentsSection.displayName = "EstablishmentsSection";
