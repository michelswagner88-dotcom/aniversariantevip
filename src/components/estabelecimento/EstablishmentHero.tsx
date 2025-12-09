// EstablishmentHero.tsx - Vitrine Premium Clean

import { ArrowLeft, Heart, Share2, MapPin, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EstablishmentHeroProps {
  establishment: {
    nome_fantasia: string;
    photo_url: string | null;
    categoria: string[] | null;
    bairro: string | null;
    cidade: string | null;
    especialidades?: string[];
    is_verified?: boolean;
  };
  onBack: () => void;
  onFavorite: () => void;
  onShare: () => void;
  isFavorited?: boolean;
}

const EstablishmentHero = ({
  establishment,
  onBack,
  onFavorite,
  onShare,
  isFavorited = false,
}: EstablishmentHeroProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const categoria = establishment.categoria?.[0] || "Estabelecimento";
  const inicialNome = (establishment.nome_fantasia || "E").charAt(0).toUpperCase();
  const temFoto = establishment.photo_url && !imageError;

  // Ícone da categoria
  const getCategoriaIcon = (cat: string): string => {
    const icons: Record<string, string> = {
      Restaurante: "🍽️",
      Bar: "🍺",
      Academia: "💪",
      "Salão de Beleza": "💇‍♀️",
      Barbearia: "💈",
      Cafeteria: "☕",
      "Casa Noturna": "🎉",
      Confeitaria: "🍰",
      Sorveteria: "🍦",
      Entretenimento: "🎬",
      Hospedagem: "🏨",
      Loja: "🛍️",
      Serviços: "🔧",
    };
    return icons[cat] || "📍";
  };

  return (
    <div className="bg-white">
      {/* ===== FOTO DE CAPA ===== */}
      {/* Mobile: 56vw de altura (~250px) | Tablet+: aspect ratio maior */}
      <div className="relative w-full h-[56vw] sm:h-auto sm:aspect-[16/10] md:aspect-[2.2/1] max-h-[45vh] overflow-hidden bg-slate-100">
        {/* Skeleton enquanto carrega */}
        {!imageLoaded && temFoto && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}

        {/* Imagem */}
        {temFoto ? (
          <img
            src={establishment.photo_url!}
            alt={establishment.nome_fantasia}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`
              w-full h-full object-cover
              transition-opacity duration-500
              ${imageLoaded ? "opacity-100" : "opacity-0"}
            `}
          />
        ) : (
          /* Fallback elegante sem foto */
          <div className="w-full h-full bg-gradient-to-br from-[#240046] to-[#3C096C] flex items-center justify-center">
            <span className="text-8xl sm:text-9xl font-bold text-white/20">{inicialNome}</span>
          </div>
        )}

        {/* Gradiente sutil no topo para os botões */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />

        {/* ===== NAVEGAÇÃO ===== */}
        {/* Safe area top para iPhones com notch */}
        <div className="absolute top-0 left-0 right-0 pt-[max(1rem,env(safe-area-inset-top))] px-4 pb-4 flex justify-between items-start">
          {/* Voltar - 44px mínimo para touch */}
          <button
            onClick={onBack}
            className="
              w-11 h-11 
              rounded-full
              bg-white
              shadow-lg
              flex items-center justify-center
              transition-transform duration-200
              active:scale-95
            "
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-[#222222]" />
          </button>

          {/* Ações */}
          <div className="flex gap-2">
            <button
              onClick={onShare}
              className="
                w-11 h-11 
                rounded-full
                bg-white
                shadow-lg
                flex items-center justify-center
                transition-transform duration-200
                active:scale-95
              "
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5 text-[#222222]" />
            </button>

            <button
              onClick={onFavorite}
              className="
                w-11 h-11 
                rounded-full
                bg-white
                shadow-lg
                flex items-center justify-center
                transition-transform duration-200
                active:scale-95
              "
              aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart
                className={`
                  w-5 h-5 
                  transition-colors duration-200
                  ${isFavorited ? "fill-red-500 text-red-500" : "text-[#222222]"}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ===== INFORMAÇÕES DO ESTABELECIMENTO ===== */}
      {/* Padding menor no mobile para caber mais na primeira dobra */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#EBEBEB]">
        <div className="max-w-3xl mx-auto">
          {/* Nome - menor no mobile */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#240046] leading-tight">
            {establishment.nome_fantasia}
          </h1>

          {/* Categoria + Localização */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
            <span className="text-[15px] text-[#240046] font-medium">
              {getCategoriaIcon(categoria)} {categoria}
            </span>

            {(establishment.bairro || establishment.cidade) && (
              <>
                <span className="text-[#DDDDDD]">•</span>
                <span className="text-[15px] text-[#3C096C]">{establishment.bairro || establishment.cidade}</span>
              </>
            )}
          </div>

          {/* Especialidades/Tags */}
          {establishment.especialidades && establishment.especialidades.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {establishment.especialidades.slice(0, 4).map((spec, index) => (
                <span
                  key={index}
                  className="
                    px-3 py-1 
                    rounded-full 
                    text-sm 
                    bg-[#240046]/5
                    text-[#3C096C]
                    border border-[#240046]/10
                  "
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Badge Verificado */}
          {establishment.is_verified && (
            <div className="flex items-center gap-1.5 mt-3 text-[#240046]">
              <div className="w-5 h-5 rounded-full bg-[#240046] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">Estabelecimento verificado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstablishmentHero;
