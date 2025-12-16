import { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Gift, Star, Flame, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export interface EstablishmentData {
  id: string;
  slug?: string;
  nome_fantasia?: string;
  name?: string;
  razao_social?: string;
  logo_url?: string;
  galeria_fotos?: string[];
  photo_url?: string;
  categoria?: string | string[];
  category?: string;
  especialidades?: string[];
  subcategory?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  descricao_beneficio?: string;
  benefit_description?: string;
  benefit_summary?: string;
  created_at?: string;
  is_new?: boolean;
  is_popular?: boolean;
  is_verificado?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface EstablishmentCardProps {
  establishment: EstablishmentData;
  index?: number;
  priority?: boolean;
  fullWidth?: boolean;
  onImpression?: (id: string) => void;
  onFavoriteChange?: (id: string, isFavorited: boolean) => void;
  onClick?: (id: string) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DOUBLE_TAP_DELAY = 300;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Restaurante: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30" },
  Bar: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30" },
  Cafeteria: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30" },
  "Salão de Beleza": { bg: "bg-pink-500/20", text: "text-pink-300", border: "border-pink-500/30" },
  Academia: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30" },
  Barbearia: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30" },
  Confeitaria: { bg: "bg-pink-500/20", text: "text-pink-300", border: "border-pink-500/30" },
  Sorveteria: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30" },
  Entretenimento: { bg: "bg-violet-500/20", text: "text-violet-300", border: "border-violet-500/30" },
  "Casa Noturna": { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30" },
  Hospedagem: { bg: "bg-teal-500/20", text: "text-teal-300", border: "border-teal-500/30" },
  Loja: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
  "Saúde e Suplementos": { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30" },
  Serviços: { bg: "bg-sky-500/20", text: "text-sky-300", border: "border-sky-500/30" },
  "Outros Comércios": { bg: "bg-gray-500/20", text: "text-gray-300", border: "border-gray-500/30" },
  default: { bg: "bg-gray-500/20", text: "text-gray-300", border: "border-gray-500/30" },
};

// =============================================================================
// HOOKS
// =============================================================================

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useInView = () => {
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, hasBeenInView };
};

// =============================================================================
// UTILS
// =============================================================================

const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
};

const extractBenefitSummary = (description?: string): string | null => {
  if (!description) return null;

  const patterns = [
    /(\d+%\s*(de\s*)?(off|desconto|desc))/i,
    /(grátis|gratuito|free|cortesia)/i,
    /(\d+\s*reais?\s*(de\s*)?(desconto|off))/i,
    /(sobremesa|drink|entrada|prato)\s*(grátis|cortesia)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
    }
  }

  if (description.length < 40) return description;
  return "Benefício especial";
};

const checkIsNew = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < THIRTY_DAYS_MS;
};

const preloadImage = (src: string): void => {
  const img = new Image();
  img.src = src;
};

// =============================================================================
// CARD IMAGE COMPONENT
// =============================================================================

interface CardImageProps {
  src: string;
  fallback: string;
  alt: string;
  priority: boolean;
  reducedMotion: boolean;
  isHovered: boolean;
}

const CardImage = memo(({ src, fallback, alt, priority, reducedMotion, isHovered }: CardImageProps) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(priority ? "loaded" : "loading");
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => setStatus("loaded"), []);

  const handleError = useCallback(() => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    } else {
      setStatus("error");
    }
  }, [currentSrc, fallback]);

  return (
    <div className="relative w-full h-full">
      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* Image */}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          !reducedMotion && "transition-all duration-700 ease-out",
          isHovered && !reducedMotion ? "scale-110" : "scale-100",
          status === "loading" && "opacity-0",
          status === "loaded" && "opacity-100",
          status === "error" && "opacity-50"
        )}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        draggable={false}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <AlertCircle className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      
      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]" />
    </div>
  );
});

CardImage.displayName = "CardImage";

// =============================================================================
// MAIN CARD COMPONENT
// =============================================================================

export const EstablishmentCard = memo(
  ({
    establishment,
    index = 0,
    priority = false,
    fullWidth = false,
    onImpression,
    onFavoriteChange,
    onClick,
  }: EstablishmentCardProps) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const lastTapRef = useRef<number>(0);
    const impressionTrackedRef = useRef(false);
    const reducedMotion = useReducedMotion();
    const { ref, hasBeenInView } = useInView();

    const est = establishment;

    // ==========================================================================
    // NORMALIZED DATA
    // ==========================================================================

    const name = est.nome_fantasia || est.name || est.razao_social || "Estabelecimento";
    const categoria = useMemo(
      () => (Array.isArray(est.categoria) ? est.categoria[0] : est.categoria) || est.category || "Outros",
      [est.categoria, est.category]
    );
    const subcategory = est.especialidades?.[0] || est.subcategory;
    const bairro = est.bairro || "";
    const cidade = est.cidade || "";
    const estado = est.estado || "";
    const slug = est.slug || est.id;
    const benefitDescription = est.descricao_beneficio || est.benefit_description;

    const fotoUrl = useMemo(
      () =>
        getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria) ||
        est.galeria_fotos?.[0] ||
        est.logo_url ||
        est.photo_url ||
        "",
      [est.logo_url, est.galeria_fotos, est.categoria, est.photo_url]
    );

    const fallbackUrl = useMemo(
      () => getPlaceholderPorCategoria(est.categoria) || "/placeholder-estabelecimento.png",
      [est.categoria]
    );

    const categoryColor = getCategoryColor(categoria);
    const benefitSummary = est.benefit_summary || extractBenefitSummary(benefitDescription);
    const isNew = est.is_new ?? checkIsNew(est.created_at);
    const isPopular = est.is_popular ?? false;
    const hasBenefit = Boolean(benefitDescription || benefitSummary);

    const url = useMemo(
      () =>
        getEstabelecimentoUrl({
          estado,
          cidade,
          slug,
          id: est.id,
        }),
      [estado, cidade, slug, est.id]
    );

    const locationText = bairro && cidade ? `${bairro}, ${cidade}` : cidade || bairro || "Ver localização";

    // ==========================================================================
    // FAVORITES (Supabase sync)
    // ==========================================================================

    useEffect(() => {
      const checkFavorite = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await supabase
            .from("favoritos")
            .select("id")
            .eq("usuario_id", user.id)
            .eq("estabelecimento_id", est.id)
            .maybeSingle();
          setIsFavorited(!!data);
        }
      };
      checkFavorite();
    }, [est.id]);

    const toggleFavorite = useCallback(async () => {
      if (!userId) {
        toast.error("Faça login para favoritar");
        return;
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(isFavorited ? [10] : [10, 50, 10]);
      }

      // Animation
      if (!reducedMotion) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }

      const newState = !isFavorited;
      setIsFavorited(newState);

      try {
        if (newState) {
          await supabase.from("favoritos").insert({ usuario_id: userId, estabelecimento_id: est.id });
        } else {
          await supabase.from("favoritos").delete().eq("usuario_id", userId).eq("estabelecimento_id", est.id);
        }
        onFavoriteChange?.(est.id, newState);
      } catch {
        // Revert on error
        setIsFavorited(!newState);
        toast.error("Erro ao atualizar favorito");
      }
    }, [userId, isFavorited, est.id, reducedMotion, onFavoriteChange]);

    // ==========================================================================
    // IMPRESSION TRACKING
    // ==========================================================================

    useEffect(() => {
      if (hasBeenInView && onImpression && !impressionTrackedRef.current) {
        impressionTrackedRef.current = true;
        onImpression(est.id);
      }
    }, [hasBeenInView, est.id, onImpression]);

    // ==========================================================================
    // EVENT HANDLERS
    // ==========================================================================

    const handleClick = useCallback(() => {
      onClick?.(est.id);
      navigate(url);
    }, [navigate, url, onClick, est.id]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      },
      [handleClick]
    );

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
      if (fotoUrl) preloadImage(fotoUrl);
    }, [fotoUrl]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    const handleFavoriteClick = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite();
      },
      [toggleFavorite]
    );

    const handleTouchEnd = useCallback(
      (e: React.TouchEvent) => {
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          e.preventDefault();
          toggleFavorite();
        }
        lastTapRef.current = now;
      },
      [toggleFavorite]
    );

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
      <article
        ref={ref as React.RefObject<HTMLElement>}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        role="link"
        aria-label={`Ver ${name}`}
        data-index={index}
        className={cn(
          "group cursor-pointer",
          fullWidth ? "w-full" : "flex-shrink-0",
          "outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-2xl"
        )}
      >
        <div
          className={cn(
            "relative rounded-2xl overflow-hidden",
            "bg-card/50 border border-border/50",
            "transition-all duration-500 ease-out",
            isHovered && !reducedMotion
              ? "transform -translate-y-2 shadow-2xl shadow-[#240046]/20 border-[#240046]/30"
              : "shadow-lg shadow-black/20"
          )}
        >
          {/* Image container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {hasBeenInView || priority ? (
              <CardImage
                src={fotoUrl || fallbackUrl}
                fallback={fallbackUrl}
                alt={`Foto de ${name}`}
                priority={priority}
                reducedMotion={reducedMotion}
                isHovered={isHovered}
              />
            ) : (
              <div className="w-full h-full bg-muted animate-pulse" />
            )}

            {/* Category badge - top left */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[60%]">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  categoryColor.bg,
                  categoryColor.text,
                  categoryColor.border,
                  "border px-2.5 py-1.5 rounded-lg",
                  "text-xs sm:text-sm font-medium",
                  "backdrop-blur-md shadow-sm"
                )}
              >
                {subcategory || categoria}
              </span>
            </div>

            {/* Special badges (New / Popular) - bottom left */}
            {(isNew || isPopular) && (
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {isNew && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-green-500/30">
                    <Star className="w-3.5 h-3.5" />
                    Novo
                  </span>
                )}
                {isPopular && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/30">
                    <Flame className="w-3.5 h-3.5" />
                    Popular
                  </span>
                )}
              </div>
            )}

            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className={cn(
                "absolute top-2 right-2 w-11 h-11 rounded-full",
                "flex items-center justify-center",
                "transition-all duration-300 ease-out",
                "backdrop-blur-md border z-10",
                isFavorited
                  ? "bg-pink-500/90 border-pink-400/50 shadow-lg shadow-pink-500/30"
                  : "bg-black/40 border-white/10 hover:bg-black/60 hover:border-white/20 active:bg-black/70",
                isHovered && !reducedMotion ? "scale-110" : "scale-100",
                "active:scale-95"
              )}
              aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              aria-pressed={isFavorited}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isFavorited ? "text-white fill-white" : "text-white",
                  isAnimating && "scale-125"
                )}
              />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Name */}
            <h3
              className={cn(
                "text-base sm:text-lg font-semibold line-clamp-1",
                "transition-colors duration-300",
                isHovered ? "text-[#240046] dark:text-[#A78BFA]" : "text-foreground"
              )}
            >
              {name}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground line-clamp-1">{locationText}</span>
            </div>

            {/* Benefit */}
            {hasBenefit && benefitSummary && (
              <div className="flex items-center gap-2 mt-3 p-2.5 bg-[#240046]/5 dark:bg-[#240046]/20 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#240046]/20 to-[#3C096C]/20 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Benefício</p>
                  <p className="text-sm font-semibold text-[#240046] dark:text-[#A78BFA] truncate">
                    {benefitSummary}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }
);

EstablishmentCard.displayName = "EstablishmentCard";

export default EstablishmentCard;
