// =============================================================================
// ESTABLISHMENTCARD.TSX v2.0 - ANIVERSARIANTE VIP
// MELHORIAS:
// - Usa tipo_beneficio do banco (cortesia, brinde, desconto, bonus, gratis)
// - Suporta novas URLs de foto (fotos[].urls.card)
// - Fallback para logo_url legado
// - Badge com emoji + label padronizado
// - 100% compatível com formato antigo
// =============================================================================

import { memo, useState, useMemo } from "react";
import { Heart, Gift, Store } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface PhotoUrls {
  thumb?: string;
  card?: string;
  gallery?: string;
}

interface PhotoItem {
  id: string;
  order: number;
  isCover: boolean;
  urls: PhotoUrls;
}

export interface EstablishmentData {
  id: string;
  nome_fantasia?: string;
  razao_social?: string;
  categoria?: string | string[];
  bairro?: string;
  cidade?: string;
  estado?: string;
  logo_url?: string;
  imagem_url?: string;
  descricao_beneficio?: string;
  tipo_beneficio?: string; // NOVO: cortesia, brinde, desconto, bonus, gratis
  fotos?: PhotoItem[] | string; // NOVO: array de fotos ou JSON string
  slug?: string;
  distancia?: number | null;
  // Compatibilidade com formato antigo
  name?: string;
  category?: string;
  photo_url?: string;
  benefit_description?: string;
}

export interface EstablishmentCardProps {
  data?: EstablishmentData;
  establishment?: EstablishmentData;
  index?: number;
  onClick?: () => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  showDistance?: boolean;
}

// =============================================================================
// CONSTANTS - Mapeamento de tipo_beneficio
// =============================================================================

const BENEFICIO_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  cortesia: { emoji: "🎁", label: "Cortesia", color: "text-violet-700" },
  brinde: { emoji: "🎀", label: "Brinde", color: "text-pink-700" },
  desconto: { emoji: "💰", label: "Desconto", color: "text-emerald-700" },
  bonus: { emoji: "⭐", label: "Bônus", color: "text-amber-700" },
  gratis: { emoji: "🆓", label: "Grátis", color: "text-blue-700" },
};

// Fallback: inferir tipo pelo texto da descrição
const inferBenefitType = (descricao?: string): { emoji: string; label: string; color: string } => {
  if (!descricao) return { emoji: "🎁", label: "Presente", color: "text-violet-700" };

  const text = descricao.toLowerCase();

  if (text.includes("%") || text.includes("desconto") || text.includes("off")) {
    return BENEFICIO_CONFIG.desconto;
  }
  if (text.includes("grátis") || text.includes("gratis") || text.includes("free")) {
    return BENEFICIO_CONFIG.gratis;
  }
  if (text.includes("brinde") || text.includes("presente") || text.includes("mimo") || text.includes("surpresa")) {
    return BENEFICIO_CONFIG.brinde;
  }
  if (text.includes("cortesia")) {
    return BENEFICIO_CONFIG.cortesia;
  }
  if (text.includes("bônus") || text.includes("bonus") || text.includes("extra")) {
    return BENEFICIO_CONFIG.bonus;
  }

  return { emoji: "🎁", label: "Presente", color: "text-violet-700" };
};

// =============================================================================
// HELPER: Extrair URL da foto de capa
// =============================================================================

const getCoverPhotoUrl = (fotos?: PhotoItem[] | string, logoUrl?: string, imagemUrl?: string): string | null => {
  // 1. Tentar fotos array (novo formato)
  if (fotos) {
    let fotosArray: PhotoItem[] = [];

    // Parse se for string JSON
    if (typeof fotos === "string") {
      try {
        fotosArray = JSON.parse(fotos);
      } catch {
        fotosArray = [];
      }
    } else if (Array.isArray(fotos)) {
      fotosArray = fotos;
    }

    if (fotosArray.length > 0) {
      // Buscar foto de capa
      const cover = fotosArray.find((f) => f.isCover) || fotosArray[0];
      if (cover?.urls?.card) return cover.urls.card;
      if (cover?.urls?.thumb) return cover.urls.thumb;
    }
  }

  // 2. Fallback para campos legados
  if (imagemUrl) return imagemUrl;
  if (logoUrl) return logoUrl;

  return null;
};

// =============================================================================
// COMPONENT
// =============================================================================

export const EstablishmentCard = memo(function EstablishmentCard({
  data,
  establishment,
  index: _index,
  onClick,
  onFavorite,
  isFavorite = false,
  showDistance = true,
}: EstablishmentCardProps) {
  const item = data || establishment;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!item) return null;

  // Extrair dados - suporta formato novo E antigo
  const nome = item.nome_fantasia || item.razao_social || item.name || "Estabelecimento";
  const categoria = Array.isArray(item.categoria) ? item.categoria[0] : item.categoria || item.category;
  const bairro = item.bairro;
  const beneficio = item.descricao_beneficio || item.benefit_description;

  // Foto: prioriza novo formato (fotos[]), fallback para campos legados
  const imageUrl = useMemo(
    () => getCoverPhotoUrl(item.fotos, item.logo_url, item.imagem_url) || item.photo_url,
    [item.fotos, item.logo_url, item.imagem_url, item.photo_url],
  );

  // Benefício: prioriza tipo_beneficio do banco, fallback para inferência
  const benefitConfig = useMemo(() => {
    if (item.tipo_beneficio && BENEFICIO_CONFIG[item.tipo_beneficio]) {
      return BENEFICIO_CONFIG[item.tipo_beneficio];
    }
    return inferBenefitType(beneficio);
  }, [item.tipo_beneficio, beneficio]);

  // Distância formatada
  const distanciaFormatada = useMemo(() => {
    if (!showDistance || item.distancia === null || item.distancia === undefined) return null;
    if (item.distancia < 1) return `${Math.round(item.distancia * 1000)}m`;
    return `${item.distancia.toFixed(1)}km`;
  }, [item.distancia, showDistance]);

  const showFallback = !imageUrl || imgError;

  return (
    <article onClick={onClick} className="cursor-pointer group">
      {/* Imagem - Aspect 4:5 */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100 mb-2.5">
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
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Fallback */}
        {showFallback && (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
            <Store className="w-12 h-12 text-violet-300" />
          </div>
        )}

        {/* Skeleton loading */}
        {!showFallback && !imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        )}

        {/* Badge Benefício - Usa tipo_beneficio do banco ou infere do texto */}
        {(item.tipo_beneficio || beneficio) && (
          <div className="absolute top-2.5 left-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1",
                "bg-white/95 backdrop-blur-sm text-[11px] font-bold rounded-full",
                "shadow-md border border-zinc-100",
                benefitConfig.color,
              )}
            >
              <span>{benefitConfig.emoji}</span>
              <span>{benefitConfig.label}</span>
            </span>
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(item.id);
          }}
          className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center hover:scale-110 transition-transform"
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className={cn(
              "w-5 h-5 stroke-2 drop-shadow-md transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "fill-black/30 text-white",
            )}
          />
        </button>
      </div>

      {/* Info */}
      <div className="px-0.5">
        <h3 className="font-semibold text-zinc-900 text-sm leading-tight line-clamp-1 group-hover:text-violet-700 transition-colors">
          {nome}
        </h3>
        <p className="text-zinc-500 text-sm line-clamp-1 mt-0.5">
          {categoria && <span className="capitalize">{categoria}</span>}
          {categoria && bairro && " · "}
          {bairro}
          {distanciaFormatada && ` · ${distanciaFormatada}`}
        </p>
      </div>
    </article>
  );
});

// Alias para compatibilidade
export const EstabelecimentoCard = EstablishmentCard;

export default EstablishmentCard;
