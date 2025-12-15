// EstablishmentHero.tsx - Clean Premium Design
// Mobile-first, sem parallax pesado, touch-friendly

import { useState } from "react";
import { ArrowLeft, Heart, Share2, BadgeCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface EstablishmentHeroProps {
  establishment: {
    nome_fantasia: string;
    photo_url?: string | null;
    categoria?: string[];
    bairro?: string;
    cidade?: string;
    especialidades?: string[];
    is_verified?: boolean;
  };
  onBack: () => void;
  onFavorite: () => void;
  onShare: () => void;
  isFavorited: boolean;
}

const EstablishmentHero = ({ establishment, onBack, onFavorite, onShare, isFavorited }: EstablishmentHeroProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const categoriaDisplay = Array.isArray(establishment.categoria)
    ? establishment.categoria[0]
    : establishment.categoria;

  const getCategoriaIcon = (cat?: string) => {
    const icons: Record<string, string> = {
      restaurante: "🍽️",
      bar: "🍺",
      academia: "💪",
      barbearia: "💈",
      cafeteria: "☕",
      confeitaria: "🎂",
      sorveteria: "🍦",
      hospedagem: "🏨",
      entretenimento: "🎭",
      loja: "🛍️",
      salao: "💇",
      servicos: "⚙️",
    };
    return icons[cat?.toLowerCase() || ""] || "🎁";
  };

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[60vh]">
      {/* Imagem */}
      <div className="absolute inset-0">
        {establishment.photo_url ? (
          <img
            src={establishment.photo_url}
            alt={establishment.nome_fantasia}
            className={cn(
              "w-full h-full object-cover",
              "transition-opacity duration-500",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#240046] to-[#3C096C]" />
        )}

        {/* Placeholder */}
        {!imageLoaded && establishment.photo_url && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        {/* Voltar */}
        <button
          onClick={onBack}
          aria-label="Voltar"
          className={cn(
            "w-11 h-11 rounded-full",
            "bg-black/30 backdrop-blur-sm",
            "flex items-center justify-center",
            "active:scale-95 transition-transform",
          )}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            aria-label="Compartilhar"
            className={cn(
              "w-11 h-11 rounded-full",
              "bg-black/30 backdrop-blur-sm",
              "flex items-center justify-center",
              "active:scale-95 transition-transform",
            )}
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={onFavorite}
            aria-label={isFavorited ? "Remover dos favoritos" : "Favoritar"}
            className={cn(
              "w-11 h-11 rounded-full",
              "bg-black/30 backdrop-blur-sm",
              "flex items-center justify-center",
              "active:scale-95 transition-transform",
            )}
          >
            <Heart
              className={cn("w-5 h-5 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-white")}
            />
          </button>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Badge Verificado */}
        {establishment.is_verified && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5",
              "px-3 py-1.5 rounded-full",
              "bg-white/20 backdrop-blur-sm",
              "mb-3",
            )}
          >
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-white">Verificado</span>
          </div>
        )}

        {/* Nome */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">{establishment.nome_fantasia}</h1>

        {/* Info */}
        <div className="flex flex-wrap items-center gap-2 text-white/90 text-sm">
          {categoriaDisplay && (
            <span className="flex items-center gap-1">
              <span>{getCategoriaIcon(categoriaDisplay)}</span>
              <span className="capitalize">{categoriaDisplay}</span>
            </span>
          )}

          {categoriaDisplay && establishment.bairro && <span className="w-1 h-1 rounded-full bg-white/50" />}

          {establishment.bairro && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {establishment.bairro}
            </span>
          )}
        </div>

        {/* Tags */}
        {establishment.especialidades && establishment.especialidades.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {establishment.especialidades.slice(0, 3).map((esp, index) => (
              <span
                key={index}
                className={cn("px-3 py-1 rounded-full", "bg-white/15 backdrop-blur-sm", "text-xs text-white/90")}
              >
                {esp}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstablishmentHero;
