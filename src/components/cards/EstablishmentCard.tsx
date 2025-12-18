// =============================================================================
// ESTABLISHMENTCARD.TSX - ANIVERSARIANTE VIP
// Re-export com nome correto para compatibilidade
// =============================================================================

import { memo, useState } from "react";
import { Heart, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export interface EstablishmentData {
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

export interface EstablishmentCardProps {
  data: EstablishmentData;
  onClick?: () => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const EstablishmentCard = memo(function EstablishmentCard({
  data,
  onClick,
  onFavorite,
  isFavorite = false,
}: EstablishmentCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const categoria = Array.isArray(data.categoria) ? data.categoria[0] : data.categoria;
  const imageUrl = data.imagem_url || data.logo_url;
  const showFallback = !imageUrl || imgError;

  return (
    <article onClick={onClick} className="cursor-pointer group">
      {/* Imagem - Aspect 4:5 */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-2">
        {!showFallback && (
          <img
            src={imageUrl}
            alt={data.nome_fantasia || ""}
            className={cn(
              "w-full h-full object-cover",
              "group-hover:scale-105 transition-transform duration-300",
              imgLoaded ? "opacity-100" : "opacity-0",
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {showFallback && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-fuchsia-100">
            <Gift className="w-10 h-10 text-violet-300" />
          </div>
        )}

        {!showFallback && !imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

        {/* Benefício */}
        {data.descricao_beneficio && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-900 rounded-md shadow-sm">
              <Gift className="w-3 h-3 text-violet-600" />
              <span className="max-w-[90px] truncate">{data.descricao_beneficio}</span>
            </span>
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(data.id);
          }}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center"
          aria-label={isFavorite ? "Remover favorito" : "Adicionar favorito"}
        >
          <Heart
            className={cn(
              "w-5 h-5 drop-shadow transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "fill-black/30 text-white",
            )}
          />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
          {data.nome_fantasia || "Estabelecimento"}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-1">
          {categoria && <span className="capitalize">{categoria}</span>}
          {categoria && data.bairro && " · "}
          {data.bairro}
        </p>
      </div>
    </article>
  );
});

// Alias para compatibilidade
export const EstabelecimentoCard = EstablishmentCard;

export default EstablishmentCard;
