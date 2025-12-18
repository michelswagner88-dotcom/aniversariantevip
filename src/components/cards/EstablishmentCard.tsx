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
  data?: EstablishmentData;
  establishment?: EstablishmentData; // Compatibilidade com código existente
  index?: number; // Ignorado, mas aceito para compatibilidade
  onClick?: () => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const EstablishmentCard = memo(function EstablishmentCard({
  data,
  establishment,
  index: _index, // Ignorado
  onClick,
  onFavorite,
  isFavorite = false,
}: EstablishmentCardProps) {
  // Aceita tanto "data" quanto "establishment"
  const item = data || establishment;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Se não tiver dados, não renderiza
  if (!item) return null;

  // Suporta tanto o formato antigo (name, photo_url, benefit_description) quanto o novo
  const nome = item.nome_fantasia || (item as any).name || "Estabelecimento";
  const categoria = Array.isArray(item.categoria) ? item.categoria[0] : item.categoria || (item as any).category;
  const imageUrl = item.imagem_url || item.logo_url || (item as any).photo_url;
  const beneficio = item.descricao_beneficio || (item as any).benefit_description;
  const bairro = item.bairro;
  const showFallback = !imageUrl || imgError;

  return (
    <article onClick={onClick} className="cursor-pointer group">
      {/* Imagem - Aspect 4:5 */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-2">
        {!showFallback && (
          <img
            src={imageUrl}
            alt={nome}
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
        {beneficio && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/95 backdrop-blur-sm text-[10px] font-semibold text-zinc-700 rounded-full shadow-sm">
              <Gift className="w-2.5 h-2.5 text-violet-600" />
              <span className="max-w-[80px] truncate">{beneficio}</span>
            </span>
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(item.id);
          }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center"
          aria-label={isFavorite ? "Remover favorito" : "Adicionar favorito"}
        >
          <Heart
            className={cn(
              "w-3.5 h-3.5 drop-shadow transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "fill-black/30 text-white",
            )}
          />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">{nome}</h3>
        <p className="text-gray-500 text-xs line-clamp-1">
          {categoria && <span className="capitalize">{categoria}</span>}
          {categoria && bairro && " · "}
          {bairro}
        </p>
      </div>
    </article>
  );
});

// Alias para compatibilidade
export const EstabelecimentoCard = EstablishmentCard;

export default EstablishmentCard;
