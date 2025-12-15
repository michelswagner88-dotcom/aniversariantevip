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
const HEART_ANIMATION_DURATION = 400;
const HAPTIC_LIGHT = 5;
const HAPTIC_MEDIUM: number[] = [10, 50, 10];

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

// =============================================================================
// SKELETON
// =============================================================================

const CardSkeleton = memo(() => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex-shrink-0 w-[280px]" role="status" aria-label="Carregando">
      <div className={cn("aspect-square rounded-xl bg-violet-100 mb-3", !reducedMotion && "animate-pulse")} />
      <div className="space-y-2">
        <div className={cn("h-4 bg-violet-100 rounded w-3/4", !reducedMotion && "animate-pulse")} />
        <div className={cn("h-4 bg-violet-100 rounded w-1/2", !reducedMotion && "animate-pulse")} />
        <div className={cn("h-4 bg-violet-100 rounded w-2/3", !reducedMotion && "animate-pulse")} />
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

    const nomeDisplay = est.nome_fantasia || est.razao_social || "Estabelecimento";
    const bairroDisplay = est.bairro || est.cidade || "";

    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
        aria-label={`Ver ${nomeDisplay}${temBeneficio ? ", possui benefício" : ""}`}
        className={cn(
          "flex-shrink-0 w-[280px] group cursor-pointer",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl",
        )}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-violet-50">
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

        {/* CONTEÚDO DO CARD - Cores roxas */}
        <div className="space-y-0.5">
          {/* Nome do estabelecimento - Roxo escuro */}
          <h3 className="font-semibold text-[15px] text-[#240046] truncate">{nomeDisplay}</h3>

          {/* Bairro - Roxo claro */}
          <p className="text-[15px] text-[#7C3AED] truncate">{bairroDisplay}</p>

          {/* Categoria - Roxo claro */}
          <p className="text-[15px] text-[#7C3AED]">{categoria}</p>

          {/* Benefício */}
          {temBeneficio && (
            <p className="text-[15px] text-[#7C3AED] mt-1">
              <span aria-hidden="true">🎁</span> <span className="font-semibold text-[#240046]">Benefício</span> no
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
// MAIN COMPONENT - SCROLL CONTÍNUO ESTILO AIRBNB
// =============================================================================

export const CategoryCarousel = memo(
  ({ title, subtitle, estabelecimentos, sectionId, isLoading = false, onUserInteraction }: CategoryCarouselProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const reducedMotion = useReducedMotion();
    const { toggleFavorite, isFavorite } = useFavorites();

    // Verifica posição do scroll
    const checkScrollPosition = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    // Monitora scroll
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      checkScrollPosition();
      el.addEventListener("scroll", checkScrollPosition, { passive: true });
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        el.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }, [checkScrollPosition, estabelecimentos]);

    // Scroll por card (não por página)
    const scroll = useCallback(
      (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;

        haptic(HAPTIC_LIGHT);

        if (sectionId && onUserInteraction) {
          onUserInteraction(sectionId);
        }

        // Scroll de 1 card por vez (280px + 24px gap = 304px)
        const cardWidth = 304;
        const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

        el.scrollBy({
          left: scrollAmount,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [reducedMotion, sectionId, onUserInteraction],
    );

    if (!isLoading && estabelecimentos.length === 0) return null;

    return (
      <section aria-label={title} className="relative group/carousel" role="region">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[22px] font-semibold text-[#240046]">{title}</h2>
            {subtitle && <p className="text-sm text-[#7C3AED] mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Anterior"
              className={cn(
                "absolute left-0 top-1/3 -translate-y-1/2 z-10",
                "w-10 h-10 bg-white rounded-full",
                "shadow-lg border border-violet-200",
                "flex items-center justify-center",
                "opacity-0 group-hover/carousel:opacity-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:opacity-100",
                !reducedMotion && "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
              )}
            >
              <ChevronLeft className="w-5 h-5 text-[#240046]" aria-hidden="true" />
            </button>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className={cn(
              "flex gap-6 overflow-x-auto pb-2 -mb-2",
              "scrollbar-hide",
              reducedMotion ? "scroll-auto" : "scroll-smooth",
            )}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={`skeleton-${i}`} />)
              : estabelecimentos.map((est) => (
                  <CarouselCard
                    key={est.id}
                    estabelecimento={est}
                    isFavorite={isFavorite(est.id)}
                    onToggleFavorite={toggleFavorite}
                    reducedMotion={reducedMotion}
                  />
                ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Próximo"
              className={cn(
                "absolute right-0 top-1/3 -translate-y-1/2 z-10",
                "w-10 h-10 bg-white rounded-full",
                "shadow-lg border border-violet-200",
                "flex items-center justify-center",
                "opacity-0 group-hover/carousel:opacity-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:opacity-100",
                !reducedMotion && "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
              )}
            >
              <ChevronRight className="w-5 h-5 text-[#240046]" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    );
  },
);

CategoryCarousel.displayName = "CategoryCarousel";
