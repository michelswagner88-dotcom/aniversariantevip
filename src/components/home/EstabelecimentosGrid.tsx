import { memo, useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Gift, Heart } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { EstabelecimentoCardSkeleton } from "@/components/skeletons/EstabelecimentoCardSkeleton";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { getCategoriaIcon } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

const getCategoryBadgeInfo = (est: Estabelecimento) => {
  const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
  const icon = getCategoriaIcon(categoria || "");
  const subcategoria = est.especialidades?.[0];

  return {
    icon,
    label: subcategoria || categoria || "Estabelecimento",
  };
};

interface GridCardProps {
  estabelecimento: Estabelecimento;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  reducedMotion: boolean;
}

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
    const imageSrc = est.logo_url || est.galeria_fotos?.[0];

    const handleClick = useCallback(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      navigate(url);
    }, [navigate, url]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (navigator.vibrate) navigator.vibrate(10);
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

    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
        aria-label={`Ver ${nomeDisplay}${temBeneficio ? ", possui benefício" : ""}`}
        className={cn(
          "group cursor-pointer bg-white/5 rounded-2xl overflow-hidden",
          "border border-white/5",
          "outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          !reducedMotion &&
            "transition-all hover:border-violet-500/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10",
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
              "absolute top-3 left-3 z-10 p-2 rounded-full",
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
                isAnimating && !reducedMotion && "animate-[heartBounce_0.4s_ease-out]",
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
              <span className="text-sm" aria-hidden="true">
                {badgeInfo.icon}
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[120px]">{badgeInfo.label}</span>
            </div>
          </div>

          {temBeneficio && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 backdrop-blur-sm rounded-lg">
                <Gift className="w-3 h-3 text-white" aria-hidden="true" />
                <span className="text-[10px] font-semibold text-white">Benefício</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3
            className={cn(
              "font-semibold text-white text-lg mb-1 line-clamp-1",
              !reducedMotion && "transition-colors group-hover:text-violet-400",
            )}
          >
            {nomeDisplay}
          </h3>

          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{est.bairro || est.cidade}</span>
          </div>
        </div>
      </article>
    );
  },
);

GridCard.displayName = "GridCard";

const EmptyState = memo(({ message }: { message: string }) => (
  <div
    className="flex flex-col items-center justify-center py-16 text-center"
    role="status"
    aria-label="Nenhum resultado encontrado"
  >
    <div className="text-6xl mb-4" aria-hidden="true">
      🔍
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">Nenhum resultado encontrado</h3>
    <p className="text-slate-400 max-w-md">{message}</p>
  </div>
));

EmptyState.displayName = "EmptyState";

export const EstabelecimentosGrid = memo(
  ({
    estabelecimentos,
    isLoading,
    emptyMessage = "Tente ajustar os filtros ou buscar por outro termo.",
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
          {Array.from({ length: 8 }).map((_, i) => (
            <EstabelecimentoCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      );
    }

    if (estabelecimentos.length === 0) {
      return <EmptyState message={emptyMessage} />;
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
