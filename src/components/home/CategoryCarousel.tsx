import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { cn } from "@/lib/utils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { CATEGORIAS } from "@/constants/categories";

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
  variant?: "default" | "featured" | "compact";
  sectionId?: string;
  isLoading?: boolean;
  onUserInteraction?: (sectionId: string) => void;
}

const FAVORITES_KEY = "aniversariantevip_favorites";

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
      } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { toggleFavorite, isFavorite };
};

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

const CardSkeleton = memo(() => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="w-full" role="status" aria-label="Carregando">
      <div className={cn("aspect-square rounded-xl bg-gray-200 mb-3", !reducedMotion && "animate-pulse")} />
      <div className="space-y-2">
        <div className={cn("h-4 bg-gray-200 rounded w-3/4", !reducedMotion && "animate-pulse")} />
        <div className={cn("h-4 bg-gray-200 rounded w-1/2", !reducedMotion && "animate-pulse")} />
        <div className={cn("h-4 bg-gray-200 rounded w-2/3", !reducedMotion && "animate-pulse")} />
      </div>
      <span className="sr-only">Carregando...</span>
    </div>
  );
});

CardSkeleton.displayName = "CardSkeleton";

interface CarouselCardProps {
  estabelecimento: Estabelecimento;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  reducedMotion: boolean;
}

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

        if (navigator.vibrate) {
          navigator.vibrate(isFavorited ? [10] : [10, 50, 10]);
        }

        if (!reducedMotion) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 400);
        }

        onToggleFavorite(est.id);
      },
      [est.id, isFavorited, onToggleFavorite, reducedMotion],
    );

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

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

    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
        aria-label={`Ver ${nomeDisplay}${temBeneficio ? ", possui benefício" : ""}`}
        className={cn(
          "group cursor-pointer w-full",
          "outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl",
        )}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100">
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
            onError={handleImageError}
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
                isAnimating && !reducedMotion && "animate-[heartBounce_0.4s_ease-out]",
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="space-y-0.5">
          <h3 className="font-semibold text-[15px] text-[#240046] truncate">{nomeDisplay}</h3>
          <p className="text-[15px] text-[#3C096C] truncate">{est.bairro || est.cidade}</p>
          <p className="text-[15px] text-[#3C096C]">{categoria}</p>
          {temBeneficio && (
            <p className="text-[15px] text-[#3C096C] mt-1">
              <span className="font-semibold text-[#240046]" aria-hidden="true">
                🎁
              </span>{" "}
              <span className="font-semibold text-[#240046]">Benefício</span> no aniversário
            </p>
          )}
        </div>
      </article>
    );
  },
);

CarouselCard.displayName = "CarouselCard";

export const CategoryCarousel = memo(
  ({
    title,
    subtitle,
    estabelecimentos,
    variant = "default",
    sectionId,
    isLoading = false,
    onUserInteraction,
  }: CategoryCarouselProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [cardsPerPage, setCardsPerPage] = useState(4);
    const reducedMotion = useReducedMotion();
    const { toggleFavorite, isFavorite } = useFavorites();

    const notifyInteraction = useCallback(() => {
      if (sectionId && onUserInteraction) {
        onUserInteraction(sectionId);
      }
    }, [sectionId, onUserInteraction]);

    useEffect(() => {
      const calculateCardsPerPage = () => {
        const width = window.innerWidth;
        if (width < 640) setCardsPerPage(1);
        else if (width < 768) setCardsPerPage(2);
        else if (width < 1024) setCardsPerPage(3);
        else if (width < 1280) setCardsPerPage(4);
        else if (width < 1536) setCardsPerPage(5);
        else setCardsPerPage(6);
      };

      let timeoutId: NodeJS.Timeout;
      const debouncedCalculate = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(calculateCardsPerPage, 150);
      };

      calculateCardsPerPage();
      window.addEventListener("resize", debouncedCalculate);

      return () => {
        window.removeEventListener("resize", debouncedCalculate);
        clearTimeout(timeoutId);
      };
    }, []);

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

    const canScrollLeft = currentPage > 0;
    const canScrollRight = currentPage < totalPages - 1;

    const scroll = useCallback(
      (direction: "left" | "right") => {
        if (navigator.vibrate) navigator.vibrate(5);
        notifyInteraction();

        setCurrentPage((prev) => {
          if (direction === "right") {
            return prev < totalPages - 1 ? prev + 1 : 0;
          }
          return prev > 0 ? prev - 1 : totalPages - 1;
        });
      },
      [notifyInteraction, totalPages],
    );

    const goToPage = useCallback(
      (page: number) => {
        if (navigator.vibrate) navigator.vibrate(5);
        notifyInteraction();
        setCurrentPage(page);
      },
      [notifyInteraction],
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

    const gridClasses = useMemo(
      () =>
        cn(
          "grid gap-6",
          !reducedMotion && "transition-opacity duration-300",
          cardsPerPage === 1 && "grid-cols-1",
          cardsPerPage === 2 && "grid-cols-2",
          cardsPerPage === 3 && "grid-cols-3",
          cardsPerPage === 4 && "grid-cols-4",
          cardsPerPage === 5 && "grid-cols-5",
          cardsPerPage === 6 && "grid-cols-6",
        ),
      [cardsPerPage, reducedMotion],
    );

    if (!isLoading && estabelecimentos.length === 0) return null;

    return (
      <section aria-label={title} className="relative" onKeyDown={handleKeyDown} tabIndex={0} role="region">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[22px] font-semibold text-[#240046]">{title}</h2>
            {subtitle && <p className="text-sm text-[#3C096C] mt-0.5">{subtitle}</p>}
          </div>

          {totalPages > 1 && (
            <div className="text-sm text-[#3C096C] tabular-nums" aria-live="polite">
              {currentPage + 1} / {totalPages}
            </div>
          )}
        </div>

        <div className="relative" ref={containerRef}>
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Página anterior"
            className={cn(
              "absolute -left-4 top-1/3 -translate-y-1/2 z-10",
              "w-10 h-10 bg-white rounded-full",
              "shadow-lg border border-[#DDDDDD] flex items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              !reducedMotion && "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
              !canScrollLeft && "hover:scale-100",
            )}
          >
            <ChevronLeft className="w-5 h-5 text-[#240046]" aria-hidden="true" />
          </button>

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

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Próxima página"
            className={cn(
              "absolute -right-4 top-1/3 -translate-y-1/2 z-10",
              "w-10 h-10 bg-white rounded-full",
              "shadow-lg border border-[#DDDDDD] flex items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              !reducedMotion && "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
              !canScrollRight && "hover:scale-100",
            )}
          >
            <ChevronRight className="w-5 h-5 text-[#240046]" aria-hidden="true" />
          </button>
        </div>

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
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                  !reducedMotion && "transition-all duration-300",
                  currentPage === i ? "bg-[#240046] w-4" : "bg-[#DDDDDD] w-2 hover:bg-[#3C096C]",
                )}
              />
            ))}
          </div>
        )}

        <div role="status" aria-live="polite" className="sr-only">
          Página {currentPage + 1} de {totalPages}
        </div>
      </section>
    );
  },
);

CategoryCarousel.displayName = "CategoryCarousel";
