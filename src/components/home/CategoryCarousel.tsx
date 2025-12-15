import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { cn } from "@/lib/utils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { CATEGORIAS } from "@/constants/categories";

// =============================================================================
// CONSTANTS
// =============================================================================

const FAVORITES_KEY = "aniversariantevip_favorites";
const RESIZE_DEBOUNCE = 150;
const HEART_ANIMATION_DURATION = 400;
const HAPTIC_LIGHT = 5;
const HAPTIC_MEDIUM: number[] = [10, 50, 10];

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

const GRID_COLS_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
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
  logo_url?: string;
  galeria_fotos?: string[];
}

interface CategoryCarouselProps {
  title: string;
  subtitle?: string;
  estabelecimentos: Estabelecimento[];
  sectionId?: string;
  isLoading?: boolean;
  onUserInteraction?: (sectionId: string) => void;
}

interface CarouselCardProps {
  estabelecimento: Estabelecimento;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  reducedMotion: boolean;
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

const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      } catch {
        // Storage full or disabled
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { toggleFavorite, isFavorite };
};

const useCardsPerPage = (): number => {
  const [cardsPerPage, setCardsPerPage] = useState(4);

  useEffect(() => {
    const calculateCardsPerPage = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.sm) setCardsPerPage(1);
      else if (width < BREAKPOINTS.md) setCardsPerPage(2);
      else if (width < BREAKPOINTS.lg) setCardsPerPage(3);
      else if (width < BREAKPOINTS.xl) setCardsPerPage(4);
      else if (width < BREAKPOINTS["2xl"]) setCardsPerPage(5);
      else setCardsPerPage(6);
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedCalculate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateCardsPerPage, RESIZE_DEBOUNCE);
    };

    calculateCardsPerPage();
    window.addEventListener("resize", debouncedCalculate);

    return () => {
      window.removeEventListener("resize", debouncedCalculate);
      clearTimeout(timeoutId);
    };
  }, []);

  return cardsPerPage;
};

// =============================================================================
// UTILS
// =============================================================================

const getCategoriaLabel = (categoria: string): string => {
  if (!categoria) return "Estabelecimento";

  const cat = CATEGORIAS.find(
    (c) =>
      c.label.toLowerCase() === categoria.toLowerCase() ||
      c.plural.toLowerCase() === categoria.toLowerCase() ||
      c.id === categoria.toLowerCase(),
  );

  return cat?.label || categoria;
};

const haptic = (pattern: number | number[] = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

// =============================================================================
// SKELETON
// =============================================================================

const CardSkeleton = memo(() => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="w-full" role="status" aria-label="Carregando">
      <div className={cn("aspect-square rounded-xl bg-muted mb-3", !reducedMotion && "animate-pulse")} />
      <div className="space-y-2">
        <div className={cn("h-4 bg-muted rounded w-3/4", !reducedMotion && "animate-pulse")} />
        <div className={cn("h-4 bg-muted rounded w-1/2", !reducedMotion && "animate-pulse")} />
        <div className={cn("h-4 bg-muted rounded w-2/3", !reducedMotion && "animate-pulse")} />
      </div>
      <span className="sr-only">Carregando...</span>
    </div>
  );
});

CardSkeleton.displayName = "CardSkeleton";

// =============================================================================
// CARD
// =============================================================================

const CarouselCard = memo(
  ({ estabelecimento, isFavorite: isFavorited, onToggleFavorite, reducedMotion }: CarouselCardProps) => {
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);
    const [imageError, setImageError] = useState(false);
    const est = estabelecimento;

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

    const handleFavorite = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        haptic(isFavorited ? HAPTIC_LIGHT : HAPTIC_MEDIUM);

        if (!reducedMotion) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), HEART_ANIMATION_DURATION);
        }

        onToggleFavorite(est.id);
      },
      [est.id, isFavorited, onToggleFavorite, reducedMotion],
    );

    const categoriaRaw = useMemo(
      () => (Array.isArray(est.categoria) ? est.categoria[0] : est.categoria),
      [est.categoria],
    );

    const categoria = useMemo(() => getCategoriaLabel(categoriaRaw || ""), [categoriaRaw]);
    const temBeneficio = Boolean(est.descricao_beneficio);

    const fotoUrl = useMemo(
      () => getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria),
      [est.logo_url, est.galeria_fotos, est.categoria],
    );

    const fallbackUrl = useMemo(() => getPlaceholderPorCategoria(est.categoria), [est.categoria]);
    const imageSrc = imageError ? fallbackUrl : fotoUrl || fallbackUrl;

    // CORRIGIDO: Garantir que nomeDisplay nunca seja undefined/vazio
    const nomeDisplay = est.nome_fantasia || est.razao_social || "Estabelecimento";
    const bairroDisplay = est.bairro || est.cidade || "";

    // DEBUG - Log no render para ver valores exatos
    console.log("🔴 RENDER:", {
      id: est.id?.substring(0, 8),
      nome_fantasia: est.nome_fantasia,
      razao_social: est.razao_social,
      nomeDisplay,
      bairro: est.bairro,
      bairroDisplay,
      keys: Object.keys(est),
    });

    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
        aria-label={`Ver ${nomeDisplay}${temBeneficio ? ", possui benefício" : ""}`}
        className={cn(
          "group cursor-pointer w-full",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl",
        )}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-muted">
          <img
            src={imageSrc}
            alt={nomeDisplay}
            className={cn(
              "w-full h-full object-cover",
              !reducedMotion && "transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105",
            )}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setImageError(true)}
          />

          <button
            onClick={handleFavorite}
            aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={isFavorited}
            className={cn(
              "absolute top-3 right-3 z-10 p-1.5 rounded-full",
              "bg-black/20 backdrop-blur-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              !reducedMotion && "transition-transform hover:scale-110 active:scale-95",
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5 drop-shadow-md",
                !reducedMotion && "transition-all duration-200",
                isFavorited ? "text-red-500 fill-red-500" : "text-white fill-white/20",
                isAnimating && !reducedMotion && "animate-bounce",
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* CONTEÚDO DO CARD - Com debug visual */}
        <div className="space-y-0.5">
          {/* LINHA 1: Nome do estabelecimento */}
          <h3 className="font-semibold text-[15px] text-foreground truncate">
            {nomeDisplay || `[VAZIO: ${est.nome_fantasia}]`}
          </h3>

          {/* LINHA 2: Bairro */}
          <p className="text-[15px] text-muted-foreground truncate">{bairroDisplay}</p>

          {/* LINHA 3: Categoria */}
          <p className="text-[15px] text-muted-foreground">{categoria}</p>

          {/* LINHA 4: Benefício */}
          {temBeneficio && (
            <p className="text-[15px] text-muted-foreground mt-1">
              <span aria-hidden="true">🎁</span> <span className="font-semibold text-foreground">Benefício</span> no
              aniversário
            </p>
          )}
        </div>
      </article>
    );
  },
);

CarouselCard.displayName = "CarouselCard";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CategoryCarousel = memo(
  ({ title, subtitle, estabelecimentos, sectionId, isLoading = false, onUserInteraction }: CategoryCarouselProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const reducedMotion = useReducedMotion();
    const { toggleFavorite, isFavorite } = useFavorites();
    const cardsPerPage = useCardsPerPage();

    // DEBUG - Log dos dados recebidos
    useEffect(() => {
      if (estabelecimentos.length > 0) {
        console.log(`🟡 [CategoryCarousel "${title}"]`, {
          total: estabelecimentos.length,
          primeiroItem: estabelecimentos[0],
          temNomeFantasia: "nome_fantasia" in estabelecimentos[0],
          valorNomeFantasia: estabelecimentos[0].nome_fantasia,
          chavesDoItem: Object.keys(estabelecimentos[0]),
        });
      }
    }, [estabelecimentos, title]);

    // Notify interaction
    const notifyInteraction = useCallback(() => {
      if (sectionId && onUserInteraction) {
        onUserInteraction(sectionId);
      }
    }, [sectionId, onUserInteraction]);

    // Reset page when cards per page changes
    useEffect(() => {
      setCurrentPage(0);
    }, [cardsPerPage]);

    const totalPages = useMemo(
      () => Math.ceil(estabelecimentos.length / cardsPerPage),
      [estabelecimentos.length, cardsPerPage],
    );

    const visibleCards = useMemo(() => {
      const startIndex = currentPage * cardsPerPage;
      return estabelecimentos.slice(startIndex, startIndex + cardsPerPage);
    }, [estabelecimentos, currentPage, cardsPerPage]);

    // Preload next page images
    useEffect(() => {
      if (currentPage < totalPages - 1) {
        const nextStartIndex = (currentPage + 1) * cardsPerPage;
        const nextCards = estabelecimentos.slice(nextStartIndex, nextStartIndex + cardsPerPage);
        nextCards.forEach((est) => {
          const url = getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria);
          if (url) preloadImage(url);
        });
      }
    }, [currentPage, cardsPerPage, estabelecimentos, totalPages]);

    const canScrollLeft = currentPage > 0;
    const canScrollRight = currentPage < totalPages - 1;

    const scroll = useCallback(
      (direction: "left" | "right") => {
        haptic(HAPTIC_LIGHT);
        notifyInteraction();

        setCurrentPage((prev) => {
          return direction === "right" ? prev + 1 : prev - 1;
        });
      },
      [notifyInteraction],
    );

    const goToPage = useCallback(
      (page: number) => {
        haptic(HAPTIC_LIGHT);
        notifyInteraction();
        setCurrentPage(page);
      },
      [notifyInteraction],
    );

    const gridClasses = useMemo(
      () =>
        cn(
          "grid gap-6",
          !reducedMotion && "transition-opacity duration-300",
          GRID_COLS_MAP[cardsPerPage] || "grid-cols-4",
        ),
      [cardsPerPage, reducedMotion],
    );

    if (!isLoading && estabelecimentos.length === 0) return null;

    return (
      <section aria-label={title} className="relative" role="region">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[22px] font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>

          {totalPages > 1 && (
            <div className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {currentPage + 1} / {totalPages}
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative" ref={containerRef}>
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Página anterior"
            className={cn(
              "absolute -left-4 top-1/3 -translate-y-1/2 z-10",
              "w-10 h-10 bg-background rounded-full",
              "shadow-lg border border-border",
              "flex items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              !reducedMotion && "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
              !canScrollLeft && "hover:scale-100",
            )}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" aria-hidden="true" />
          </button>

          {/* Grid */}
          <div className={gridClasses} role="list">
            {isLoading
              ? Array.from({ length: cardsPerPage }).map((_, i) => (
                  <div key={`skeleton-${i}`} role="listitem">
                    <CardSkeleton />
                  </div>
                ))
              : visibleCards.map((est) => (
                  <div key={est.id} role="listitem">
                    <CarouselCard
                      estabelecimento={est}
                      isFavorite={isFavorite(est.id)}
                      onToggleFavorite={toggleFavorite}
                      reducedMotion={reducedMotion}
                    />
                  </div>
                ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Próxima página"
            className={cn(
              "absolute -right-4 top-1/3 -translate-y-1/2 z-10",
              "w-10 h-10 bg-background rounded-full",
              "shadow-lg border border-border",
              "flex items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              !reducedMotion && "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
              !canScrollRight && "hover:scale-100",
            )}
          >
            <ChevronRight className="w-5 h-5 text-foreground" aria-hidden="true" />
          </button>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 mt-4"
            role="tablist"
            aria-label="Navegação por páginas"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                role="tab"
                aria-selected={currentPage === i}
                aria-label={`Página ${i + 1}`}
                className={cn(
                  "h-2 rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  !reducedMotion && "transition-all duration-300",
                  currentPage === i ? "bg-foreground w-4" : "bg-muted w-2 hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
        )}

        {/* Live region */}
        <div role="status" aria-live="polite" className="sr-only">
          Página {currentPage + 1} de {totalPages}
        </div>
      </section>
    );
  },
);

CategoryCarousel.displayName = "CategoryCarousel";
