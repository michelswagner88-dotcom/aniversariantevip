// =============================================================================
// AIRBNBCARDGRID.TSX - ANIVERSARIANTE VIP
// Design: Cards compactos estilo Airbnb
// =============================================================================

import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Gift } from "lucide-react";
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
  latitude?: number;
  longitude?: number;
}

interface AirbnbCardGridProps {
  estabelecimentos: Estabelecimento[];
  isLoading?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  variant?: "grid" | "carousel";
}

interface AirbnbCardProps {
  estabelecimento: Estabelecimento;
  onClick?: () => void;
}

// =============================================================================
// CARD COMPONENT - Tamanho compacto igual Airbnb
// =============================================================================

const AirbnbCard = memo(({ estabelecimento, onClick }: AirbnbCardProps) => {
  const categoria = Array.isArray(estabelecimento.categoria) ? estabelecimento.categoria[0] : estabelecimento.categoria;

  const imageUrl = estabelecimento.imagem_url || estabelecimento.logo_url;

  return (
    <article onClick={onClick} className="cursor-pointer group">
      {/* Imagem - Proporção 1:1 (quadrada) igual Airbnb */}
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
            <Gift className="w-10 h-10 text-violet-300" />
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: implementar favorito
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center"
          aria-label="Adicionar aos favoritos"
        >
          <Heart className="w-6 h-6 text-white drop-shadow-md hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Info - Compacta */}
      <div className="space-y-0.5">
        {/* Nome */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
          {estabelecimento.nome_fantasia || "Estabelecimento"}
        </h3>

        {/* Categoria + Bairro */}
        <p className="text-gray-500 text-xs line-clamp-1">
          {categoria && <span className="capitalize">{categoria}</span>}
          {categoria && estabelecimento.bairro && <span> · </span>}
          {estabelecimento.bairro && <span>{estabelecimento.bairro}</span>}
        </p>

        {/* Benefício */}
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
AirbnbCard.displayName = "AirbnbCard";

// =============================================================================
// SKELETON
// =============================================================================

const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-square rounded-xl bg-gray-200 mb-2" />
    <div className="space-y-1.5">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const AirbnbCardGrid = memo(function AirbnbCardGrid({
  estabelecimentos,
  isLoading = false,
  userLocation,
  variant = "grid",
}: AirbnbCardGridProps) {
  const navigate = useNavigate();

  const handleCardClick = (est: Estabelecimento) => {
    const url = getEstabelecimentoUrl({
      estado: est.estado || "",
      cidade: est.cidade || "",
      slug: est.slug || null,
      id: est.id,
    });
    navigate(url);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!estabelecimentos || estabelecimentos.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Nenhum estabelecimento encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {estabelecimentos.map((est) => (
        <AirbnbCard key={est.id} estabelecimento={est} onClick={() => handleCardClick(est)} />
      ))}
    </div>
  );
});

export default AirbnbCardGrid;
