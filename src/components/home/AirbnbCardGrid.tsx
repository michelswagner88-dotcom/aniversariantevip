import { useState, useMemo, useCallback, useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

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
}

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

const AirbnbCardSkeleton = memo(() => (
  <div className="flex-shrink-0 w-[280px] sm:w-[300px]" role="status" aria-label="Carregando">
    <div className="aspect-[4/3] rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3 relative">
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite linear",
        }}
      />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    </div>
    <span className="sr-only">Carregando...</span>
  </div>
));

AirbnbCardSkeleton.displayName = "AirbnbCardSkeleton";

const AirbnbCard = memo(
  ({
    estabelecimento,
    priority = false,
    userLocation,
  }: {
    estabelecimento: Estabelecimento;
    priority?: boolean;
    userLocation?: { lat: number; lng: number } | null;
  }) => {
    const navigate = useNavigate();
    const [isFavorited, setIsFavorited] = useState(false);
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

    const categoria = useMemo(() => (Array.isArray(est.categoria) ? est.categoria[0] : est.categoria), [est.categoria]);

    const distancia = useMemo(() => {
      if (!userLocation || !est.latitude || !est.longitude) return null;
      const dist = calcularDistancia(userLocation.lat, userLocation.lng, est.latitude, est.longitude);
      return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
    }, [userLocation, est.latitude, est.longitude]);

    const fotoUrl = useMemo(
      () => getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria),
      [est.logo_url, est.galeria_fotos, est.categoria],
    );

    const fallbackUrl = useMemo(() => getPlaceholderPorCategoria(est.categoria), [est.categoria]);

    const temBeneficio = Boolean(est.descricao_beneficio);

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

    const handleFavorite = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      setIsFavorited((prev) => !prev);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    const imageSrc = imageError ? fallbackUrl : fotoUrl || fallbackUrl;

    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
        aria-label={`Ver ${est.nome_fantasia || "estabelecimento"}`}
        className="flex-shrink-0 w-[280px] sm:w-[300px] group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl snap-start"
      >
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
          <img
            src={imageSrc}
            alt={est.nome_fantasia || "Estabelecimento"}
            className="w-full h-full object-cover group-hover:scale-105 group-focus-visible:scale-105 transition-transform duration-300"
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            draggable={false}
            onError={handleImageError}
          />

          <button
            onClick={handleFavorite}
            aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={isFavorited}
            className="absolute top-3 right-3 z-10 p-1.5 hover:scale-110 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full bg-black/20 backdrop-blur-sm"
          >
            <Heart
              className={cn(
                "w-5 h-5 drop-shadow-lg transition-all duration-200",
                isFavorited ? "text-red-500 fill-red-500" : "text-white fill-white/30",
                isAnimating && "scale-125",
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          {temBeneficio && (
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Gift className="w-3 h-3" aria-hidden="true" />
              <span>Benefício</span>
            </div>
          )}
        </div>

        <div className="space-y-0.5 pr-4">
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 truncate">
            {est.nome_fantasia || est.razao_social || "Estabelecimento"}
          </h3>

          <p className="text-[14px] text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{est.bairro || est.cidade}</span>
            {distancia && (
              <>
                <span aria-hidden="true">•</span>
                <span className="flex-shrink-0">{distancia}</span>
              </>
            )}
          </p>

          <p className="text-[14px] text-gray-500 dark:text-gray-500">{categoria || "Estabelecimento"}</p>

          {temBeneficio && (
            <p className="text-[14px] text-purple-700 dark:text-purple-400 font-medium pt-0.5">
              🎁 Benefício disponível
            </p>
          )}
        </div>
      </article>
    );
  },
);

AirbnbCard.displayName = "AirbnbCard";

export const AirbnbCardGrid = memo(({ estabelecimentos, isLoading, userLocation }: AirbnbCardGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  }, []);

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

  const scrollByAmount = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 316;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleScrollLeft = useCallback(() => scrollByAmount("left"), [scrollByAmount]);
  const handleScrollRight = useCallback(() => scrollByAmount("right"), [scrollByAmount]);

  if (isLoading) {
    return (
      <div
        className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-12 xl:px-20 scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <AirbnbCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (!estabelecimentos.length) {
    return <EmptyState type="geral" />;
  }

  return (
    <div className="relative group/carousel">
      <button
        onClick={handleScrollLeft}
        aria-label="Ver anteriores"
        className={cn(
          "absolute left-2 sm:left-4 lg:left-8 top-[100px] z-20",
          "w-10 h-10 sm:w-11 sm:h-11 rounded-full",
          "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700",
          "flex items-center justify-center",
          "hover:scale-105 active:scale-95 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
          "opacity-0 group-hover/carousel:opacity-100",
          !showLeftArrow && "!opacity-0 pointer-events-none",
        )}
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" aria-hidden="true" />
      </button>

      <button
        onClick={handleScrollRight}
        aria-label="Ver próximos"
        className={cn(
          "absolute right-2 sm:right-4 lg:right-8 top-[100px] z-20",
          "w-10 h-10 sm:w-11 sm:h-11 rounded-full",
          "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700",
          "flex items-center justify-center",
          "hover:scale-105 active:scale-95 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
          "opacity-0 group-hover/carousel:opacity-100",
          !showRightArrow && "!opacity-0 pointer-events-none",
        )}
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" aria-hidden="true" />
      </button>

      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none transition-opacity duration-300",
          showLeftArrow ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none transition-opacity duration-300",
          showRightArrow ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-12 xl:px-20 py-2 snap-x snap-mandatory touch-pan-x"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="list"
      >
        {estabelecimentos.map((est, index) => (
          <AirbnbCard key={est.id} estabelecimento={est} priority={index < 4} userLocation={userLocation} />
        ))}
      </div>
    </div>
  );
});

AirbnbCardGrid.displayName = "AirbnbCardGrid";
