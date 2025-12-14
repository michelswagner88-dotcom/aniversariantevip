import { memo, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import EstablishmentCard from "../EstablishmentCard";
import { cn } from "@/lib/utils";

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

const useReducedMotion = (): boolean => {
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

const useDebounce = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
  const timeoutRef = useRef<number>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  ) as T;
};

const useInView = (options?: IntersectionObserverInit) => {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options },
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return { ref: setRef, isInView };
};

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

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

    useEffect(() => {
      if (isInView && onSectionView) {
        onSectionView(title);
      }
    }, [isInView, title, onSectionView]);

    const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    const debouncedCheckScroll = useDebounce(checkScroll, 16);

    useEffect(() => {
      checkScroll();
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }, [checkScroll, establishments]);

    const scroll = useCallback(
      (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;

        if (navigator.vibrate) navigator.vibrate(5);

        const scrollAmount = SCROLL_AMOUNTS[variant];
        el.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [variant, reducedMotion],
    );

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

    const handleScrollLeft = useCallback(() => scroll("left"), [scroll]);
    const handleScrollRight = useCallback(() => scroll("right"), [scroll]);

    const cardWidth = CARD_WIDTHS[variant];

    const mappedEstablishments = useMemo(() => {
      return establishments.map((est, index) => {
        const isNew = est.created_at ? Date.now() - new Date(est.created_at).getTime() < SEVEN_DAYS_MS : false;

        return {
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
            is_new: isNew,
            is_popular: index < 3 && variant === "featured",
          },
          index,
        };
      });
    }, [establishments, variant]);

    if (!establishments || establishments.length === 0) {
      return null;
    }

    return (
      <section
        ref={sectionRef}
        className={cn(
          "py-8",
          !reducedMotion && "transition-all duration-700 ease-out",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          reducedMotion && "opacity-100 translate-y-0",
        )}
        aria-labelledby={`section-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div className="max-w-lg">
              <h2
                id={`section-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-2xl sm:text-3xl font-bold text-foreground"
              >
                {title}
              </h2>
              {subtitle && <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>}
            </div>

            {viewAllLink && (
              <Link
                to={viewAllLink}
                className={cn(
                  "hidden sm:flex items-center gap-1.5",
                  "text-primary font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded",
                  !reducedMotion && "transition-all duration-300 hover:text-primary/80 group",
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

          <div className="relative group/carousel">
            <button
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              aria-label="Ver estabelecimentos anteriores"
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20",
                "w-12 h-12 rounded-full",
                "bg-background/90 backdrop-blur-md",
                "border border-border shadow-lg",
                "flex items-center justify-center",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "disabled:opacity-0 disabled:pointer-events-none",
                !reducedMotion &&
                  "transition-all duration-300 hover:bg-background hover:scale-110 hover:border-primary/30 active:scale-95",
                canScrollLeft ? "opacity-0 group-hover/carousel:opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              <ChevronLeft className="w-6 h-6 text-foreground" aria-hidden="true" />
            </button>

            <div
              ref={scrollRef}
              onScroll={debouncedCheckScroll}
              className={cn(
                "flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mb-4",
                "snap-x snap-mandatory touch-pan-x",
                reducedMotion ? "scroll-auto" : "scroll-smooth",
              )}
              style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
              role="list"
              aria-label={`Lista de ${title}`}
            >
              {mappedEstablishments.map(({ original, mapped, index }) => (
                <div
                  key={original.id || index}
                  role="listitem"
                  className={cn("flex-shrink-0 snap-start", cardWidth)}
                  style={{
                    opacity: reducedMotion || isInView ? 1 : 0,
                    transform: reducedMotion || isInView ? "translateY(0)" : "translateY(20px)",
                    transition: reducedMotion ? "none" : `all 0.5s ease-out ${index * 0.08}s`,
                  }}
                >
                  <EstablishmentCard establishment={mapped} index={index} />
                </div>
              ))}

              {showViewMoreCard && viewAllLink && (
                <Link
                  to={viewAllLink}
                  role="listitem"
                  aria-label={`Ver todos os ${title}`}
                  className={cn(
                    "flex-shrink-0 snap-start",
                    cardWidth,
                    "aspect-[4/3]",
                    "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10",
                    "border border-primary/20 rounded-2xl",
                    "flex flex-col items-center justify-center gap-4",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    !reducedMotion &&
                      "transition-all duration-300 hover:from-primary/20 hover:via-accent/10 hover:to-primary/20 hover:border-primary/40 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 group",
                  )}
                  style={{
                    opacity: reducedMotion || isInView ? 1 : 0,
                    transform: reducedMotion || isInView ? "translateY(0)" : "translateY(20px)",
                    transition: reducedMotion ? "none" : `all 0.5s ease-out ${establishments.length * 0.08}s`,
                  }}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl",
                      "bg-gradient-to-br from-primary/20 to-accent/20",
                      "flex items-center justify-center",
                      !reducedMotion && "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                    )}
                  >
                    <ArrowRight className="w-8 h-8 text-primary" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <p className="text-primary font-semibold">Ver todos</p>
                    <p className="text-muted-foreground text-sm">Explorar categoria</p>
                  </div>
                </Link>
              )}
            </div>

            <button
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              aria-label="Ver próximos estabelecimentos"
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20",
                "w-12 h-12 rounded-full",
                "bg-background/90 backdrop-blur-md",
                "border border-border shadow-lg",
                "flex items-center justify-center",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "disabled:opacity-0 disabled:pointer-events-none",
                !reducedMotion &&
                  "transition-all duration-300 hover:bg-background hover:scale-110 hover:border-primary/30 active:scale-95",
                canScrollRight ? "opacity-0 group-hover/carousel:opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              <ChevronRight className="w-6 h-6 text-foreground" aria-hidden="true" />
            </button>

            <div
              className={cn(
                "absolute left-0 top-0 bottom-4 w-8 z-10 pointer-events-none",
                "bg-gradient-to-r from-background to-transparent",
                !reducedMotion && "transition-opacity duration-300",
                canScrollLeft ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />
            <div
              className={cn(
                "absolute right-0 top-0 bottom-4 w-8 z-10 pointer-events-none",
                "bg-gradient-to-l from-background to-transparent",
                !reducedMotion && "transition-opacity duration-300",
                canScrollRight ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />
          </div>

          {viewAllLink && (
            <Link
              to={viewAllLink}
              className={cn(
                "sm:hidden flex items-center justify-center gap-2",
                "mt-4 py-3",
                "text-primary font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded",
                !reducedMotion && "transition-colors hover:text-primary/80",
              )}
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
        </div>

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

export default EstablishmentsSection;
