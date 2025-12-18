// =============================================================================
// CATEGORYCAROUSEL.TSX - ANIVERSARIANTE VIP
// Design: Carrossel com cards compactos estilo Airbnb
// =============================================================================

import { memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";

// =============================================================================
// TYPES
// =============================================================================

interface Estabelecimento {
  id: string;
  nome_fantasia?: string;
  categoria?: string | string[];
  bairro?: string;
  cidade?: string;
  estado?: string;
  logo_url?: string;
  imagem_url?: string;
  descricao_beneficio?: string;
  slug?: string;
}

interface CategoryCarouselProps {
  title: string;
  subtitle?: string;
  estabelecimentos: Estabelecimento[];
  sectionId?: string;
}

// =============================================================================
// CARD COMPONENT - Compacto para carrossel
// =============================================================================

interface CarouselCardProps {
  estabelecimento: Estabelecimento;
  onClick?: () => void;
}

const CarouselCard = memo(({ estabelecimento, onClick }: CarouselCardProps) => {
  const categoria = Array.isArray(estabelecimento.categoria) ? estabelecimento.categoria[0] : estabelecimento.categoria;

  const imageUrl = estabelecimento.imagem_url || estabelecimento.logo_url;

  return (
    <article onClick={onClick} className="cursor-pointer group flex-shrink-0 w-[160px] sm:w-[180px]">
      {/* Imagem - Proporção 1:1 */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={estabelecimento.nome_fantasia || "Estabelecimento"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-fuchsia-100">
            <Gift className="w-8 h-8 text-violet-300" />
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2 right-2"
          aria-label="Adicionar aos favoritos"
        >
          <Heart className="w-5 h-5 text-white drop-shadow-md hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
          {estabelecimento.nome_fantasia || "Estabelecimento"}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-1">
          {categoria && <span className="capitalize">{categoria}</span>}
          {categoria && estabelecimento.bairro && <span> · </span>}
          {estabelecimento.bairro && <span>{estabelecimento.bairro}</span>}
        </p>
        {estabelecimento.descricao_beneficio && (
          <p className="text-xs text-violet-600 font-medium line-clamp-1 flex items-center gap-1">
            <Gift className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{estabelecimento.descricao_beneficio}</span>
          </p>
        )}
      </div>
    </article>
  );
});
CarouselCard.displayName = "CarouselCard";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CategoryCarousel = memo(function CategoryCarousel({
  title,
  subtitle,
  estabelecimentos,
  sectionId,
}: CategoryCarouselProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (est: Estabelecimento) => {
    const url = getEstabelecimentoUrl({
      estado: est.estado || "",
      cidade: est.cidade || "",
      slug: est.slug || null,
      id: est.id,
    });
    navigate(url);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!estabelecimentos || estabelecimentos.length === 0) {
    return null;
  }

  return (
    <section className="relative" id={sectionId}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-violet-600 mt-0.5">{subtitle}</p>}
        </div>

        {/* Arrows - Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Carrossel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {estabelecimentos.map((est) => (
          <CarouselCard key={est.id} estabelecimento={est} onClick={() => handleCardClick(est)} />
        ))}
      </div>
    </section>
  );
});

export default CategoryCarousel;
