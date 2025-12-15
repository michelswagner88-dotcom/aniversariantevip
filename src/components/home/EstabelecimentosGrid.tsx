import { memo, useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Gift, Heart, Search } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { CardSkeleton } from "@/components/skeletons";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { getCategoriaIcon } from "@/lib/constants";
import { getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { cn } from "@/lib/utils";

const FAVORITES_KEY = "aniversariantevip_favorites";
const SKELETON_COUNT = 8;
const HEART_ANIMATION_DURATION = 400;
const HAPTIC_LIGHT = 10;
const HAPTIC_MEDIUM: number[] = [10, 50, 10];

interface Estabelecimento {
  id: string;
  nome_fantasia?: string;
  razao_social?: string;
  estado: string;
  cidade: string;
  bairro?: string;
  slug?: string;
  categoria?: string | string[];
  especialidades?: string[];
  descricao_beneficio?: string;
  logo_url?: string;
  galeria_fotos?: string[];
}

interface EstabelecimentosGridProps {
  estabelecimentos: Estabelecimento[];
  isLoading: boolean;
  emptyMessage?: string;
  onClearFilters?: () => void;
}

interface GridCardProps {
  estabelecimento: Estabelecimento;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  reducedMotion: boolean;
}

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
      } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { toggleFavorite, isFavorite };
};

const getCategoryBadgeInfo = (est: Estabelecimento) => {
  const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
  const icon = getCategoriaIcon(categoria || "");
  const subcategoria = est.especialidades?.[0];

  return {
    icon,
    label: subcategoria || categoria || "Estabelecimento",
  };
};

const haptic = (pattern: number | number[] = HAPTIC_LIGHT) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const GridCard = memo(
  ({ estabelecimento, isFavorite: isFavorited, onToggleFavorite, reducedMotion }: GridCardProps) => {
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);
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

    const badgeInfo = useMemo(() => getCategoryBadgeInfo(est), [est]);
    const nomeDisplay = est.nome_fantasia || est.razao_social || "Estabelecimento";
    const temBeneficio = Boolean(est.descricao_beneficio);

    const imageSrc = useMemo(() => {
      if (est.logo_url) return est.logo_url;
      if (est.galeria_fotos?.[0]) return est.galeria_fotos[0];
      return getPlaceholderPorCategoria(est.categoria);
    }, [est.logo_url, est.galeria_fotos, est.categoria]);

    const handleClick = useCallback(() => {
      haptic(HAPTIC_LIGHT);
      navigate(url);
    }, [navigate, url]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          haptic(HAPTIC_LIGHT);
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

    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
        aria-label={`Ver ${nomeDisplay}${temBeneficio ? ", possui benefício" : ""}`}
        className={cn(
          "group cursor-pointer rounded-2xl overflow-hidden",
          "bg-white border border-violet-100",
          "outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2",
          !reducedMotion && [
            "transition-all duration-200",
            "hover:border-[#7C3AED]/30 hover:scale-[1.02]",
            "hover:shadow-xl hover:shadow-violet-500/10",
          ],
        )}
      >
        <div className="relative overflow-hidden">
          <SafeImage
            src={imageSrc}
            alt={nomeDisplay}
            aspectRatio="4:3"
            className={cn(!reducedMotion && "transition-transform duration-500 group-hover:scale-110")}
          />

          <button
            onClick={handleFavorite}
            aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={isFavorited}
            className={cn(
              "absolute top-3 right-3 z-10 p-2 rounded-full",
              "bg-black/50 backdrop-blur-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              !reducedMotion && "transition-transform hover:scale-110 active:scale-95",
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4",
                !reducedMotion && "transition-all duration-200",
                isFavorited ? "text-red-500 fill-red-500" : "text-white fill-white/20",
                isAnimating && !reducedMotion && "animate-bounce",
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          {temBeneficio && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7C3AED] backdrop-blur-sm">
                <Gift className="w-3 h-3 text-white" aria-hidden="true" />
                <span className="text-[10px] font-semibold text-white">Benefício</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm">
              <span className="text-sm" aria-hidden="true">
                {badgeInfo.icon}
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[120px]">{badgeInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3
            className={cn(
              "font-semibold text-[#240046] text-lg mb-1 truncate",
              !reducedMotion && "transition-colors group-hover:text-[#7C3AED]",
            )}
          >
            {nomeDisplay}
          </h3>

          <div className="flex items-center gap-1.5 text-[#7C3AED] text-sm">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{est.bairro || est.cidade}</span>
          </div>
        </div>
      </article>
    );
  },
);

GridCard.displayName = "GridCard";

interface EmptyStateProps {
  message: string;
  onClearFilters?: () => void;
}

const EmptyState = memo(({ message, onClearFilters }: EmptyStateProps) => (
  <div
    className="flex flex-col items-center justify-center py-16 text-center"
    role="status"
    aria-label="Nenhum resultado encontrado"
  >
    <div className="w-16 h-16 rounded-full mb-4 bg-violet-100 flex items-center justify-center" aria-hidden="true">
      <Search className="w-8 h-8 text-[#7C3AED]" />
    </div>

    <h3 className="text-xl font-semibold text-[#240046] mb-2">Nenhum resultado encontrado</h3>

    <p className="text-[#7C3AED] max-w-md mb-6">{message}</p>

    {onClearFilters && (
      <button
        onClick={onClearFilters}
        className="px-4 py-2 rounded-full bg-[#7C3AED] text-white font-medium transition-all hover:bg-[#6D28D9] active:scale-95"
      >
        Limpar filtros
      </button>
    )}
  </div>
));

EmptyState.displayName = "EmptyState";

export const EstabelecimentosGrid = memo(
  ({
    estabelecimentos,
    isLoading,
    emptyMessage = "Tente ajustar os filtros ou buscar por outro termo.",
    onClearFilters,
  }: EstabelecimentosGridProps) => {
    const reducedMotion = useReducedMotion();
    const { toggleFavorite, isFavorite } = useFavorites();

    if (isLoading) {
      return (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          aria-busy="true"
          aria-label="Carregando estabelecimentos"
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <CardSkeleton key={`skeleton-${i}`} variant="detailed" />
          ))}
        </div>
      );
    }

    if (estabelecimentos.length === 0) {
      return <EmptyState message={emptyMessage} onClearFilters={onClearFilters} />;
    }

    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        role="list"
        aria-label="Lista de estabelecimentos"
      >
        {estabelecimentos.map((est) => (
          <div key={est.id} role="listitem">
            <GridCard
              estabelecimento={est}
              isFavorite={isFavorite(est.id)}
              onToggleFavorite={toggleFavorite}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}
      </div>
    );
  },
);

EstabelecimentosGrid.displayName = "EstabelecimentosGrid";
