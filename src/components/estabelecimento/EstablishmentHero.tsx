// EstablishmentHero.tsx - Hero Premium 2025
// Tendências: Fullscreen, Parallax, Glassmorphism, Bold Typography

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, BadgeCheck, MapPin, ChevronRight } from "lucide-react";
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
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.5);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div
      ref={heroRef}
      className="relative w-full h-[70vh] sm:h-[75vh] md:h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden"
    >
      {/* Background Image com Parallax */}
      <motion.div className="absolute inset-0 w-full h-[120%]" style={{ y: -scrollY }}>
        {establishment.photo_url ? (
          <img
            src={establishment.photo_url}
            alt={establishment.nome_fantasia}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-700",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#7C3AED]" />
        )}
      </motion.div>

      {/* Placeholder enquanto carrega */}
      {!imageLoaded && establishment.photo_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#7C3AED] animate-pulse" />
      )}

      {/* Gradient Overlay - Premium */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, 
              rgba(0,0,0,0.85) 0%, 
              rgba(0,0,0,0.4) 40%, 
              rgba(0,0,0,0.1) 70%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Top Navigation - Glassmorphism */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between p-4 sm:p-6">
          {/* Botão Voltar */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onBack}
            aria-label="Voltar"
            className="
              w-12 h-12 rounded-full
              bg-white/15 backdrop-blur-xl
              border border-white/20
              flex items-center justify-center
              hover:bg-white/25 active:scale-95
              transition-all duration-300
              shadow-lg shadow-black/20
            "
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>

          {/* Ações */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            {/* Compartilhar */}
            <button
              onClick={onShare}
              aria-label="Compartilhar"
              className="
                w-12 h-12 rounded-full
                bg-white/15 backdrop-blur-xl
                border border-white/20
                flex items-center justify-center
                hover:bg-white/25 active:scale-95
                transition-all duration-300
                shadow-lg shadow-black/20
              "
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>

            {/* Favoritar */}
            <button
              onClick={onFavorite}
              aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className="
                w-12 h-12 rounded-full
                bg-white/15 backdrop-blur-xl
                border border-white/20
                flex items-center justify-center
                hover:bg-white/25 active:scale-95
                transition-all duration-300
                shadow-lg shadow-black/20
              "
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isFavorited ? "fill-red-500 text-red-500 scale-110" : "text-white",
                )}
              />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Content - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Badge Verificado */}
          {establishment.is_verified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="
                inline-flex items-center gap-2 
                px-4 py-2 rounded-full 
                bg-white/15 backdrop-blur-xl
                border border-white/20
                mb-4
              "
            >
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Estabelecimento Verificado</span>
            </motion.div>
          )}

          {/* Nome - Typography Bold 2025 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="
              text-3xl sm:text-4xl md:text-5xl lg:text-6xl
              font-bold text-white
              leading-tight tracking-tight
              mb-3
              drop-shadow-2xl
            "
          >
            {establishment.nome_fantasia}
          </motion.h1>

          {/* Info Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center gap-3 text-white/90"
          >
            {/* Categoria */}
            {categoriaDisplay && (
              <span className="flex items-center gap-1.5 text-base sm:text-lg">
                <span>{getCategoriaIcon(categoriaDisplay)}</span>
                <span className="font-medium capitalize">{categoriaDisplay}</span>
              </span>
            )}

            {/* Separador */}
            {categoriaDisplay && establishment.bairro && <span className="w-1.5 h-1.5 rounded-full bg-white/50" />}

            {/* Localização */}
            {establishment.bairro && (
              <span className="flex items-center gap-1.5 text-base sm:text-lg">
                <MapPin className="w-4 h-4" />
                <span>
                  {establishment.bairro}
                  {establishment.cidade && `, ${establishment.cidade}`}
                </span>
              </span>
            )}
          </motion.div>

          {/* Especialidades Tags */}
          {establishment.especialidades && establishment.especialidades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {establishment.especialidades.slice(0, 4).map((esp, index) => (
                <span
                  key={index}
                  className="
                    px-3 py-1.5 rounded-full
                    bg-white/10 backdrop-blur-sm
                    border border-white/20
                    text-sm text-white/90
                    hover:bg-white/20 transition-colors
                  "
                >
                  {esp}
                </span>
              ))}
              {establishment.especialidades.length > 4 && (
                <span
                  className="
                  px-3 py-1.5 rounded-full
                  bg-white/10 backdrop-blur-sm
                  border border-white/20
                  text-sm text-white/90
                  flex items-center gap-1
                "
                >
                  +{establishment.especialidades.length - 4}
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-2.5 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EstablishmentHero;
