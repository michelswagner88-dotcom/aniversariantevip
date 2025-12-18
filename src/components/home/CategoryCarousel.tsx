// =============================================================================
// CARDCAROUSEL.TSX - ANIVERSARIANTE VIP
// Design: Snap scroll, ~1.5 cards visíveis no mobile
// =============================================================================

import { memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { EstablishmentCard } from "@/components/cards/EstablishmentCard";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { cn } from "@/lib/utils";

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

interface CardCarouselProps {
  title: string;
  subtitle?: string;
  items: Estabelecimento[];
  seeAllHref?: string;
}

// =============================================================================
// MAIN
// =============================================================================

export const CardCarousel = memo(function CardCarousel({ title, subtitle, items, seeAllHref }: CardCarouselProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = (est: Estabelecimento) => {
    const url = getEstabelecimentoUrl({
      estado: est.estado || "",
      cidade: est.cidade || "",
      slug: est.slug || null,
      id: est.id,
    });
    navigate(url);
  };

  if (!items || items.length === 0) return null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-violet-600 mt-0.5">{subtitle}</p>}
        </div>

        {seeAllHref && (
          <button
            onClick={() => navigate(seeAllHref)}
            className="flex items-center gap-0.5 text-sm font-medium text-gray-900 hover:underline flex-shrink-0"
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className={cn("flex gap-3", "overflow-x-auto", "snap-x snap-mandatory", "scrollbar-hide", "-mx-4 px-4")}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((est) => (
          <div
            key={est.id}
            className="snap-start flex-shrink-0"
            style={{ width: "calc(50% - 6px)" }} // ~2 cards visíveis
          >
            <EstablishmentCard data={est} onClick={() => handleClick(est)} />
          </div>
        ))}
      </div>
    </section>
  );
});

export default CardCarousel;
