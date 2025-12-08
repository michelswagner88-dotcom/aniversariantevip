// EstablishmentHero.tsx - Hero Section Premium World-Class

import { ArrowLeft, Heart, Share2, MapPin, Shield, Zap, Gift, X, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { TiltCard } from '@/components/ui/tilt-card';

interface EstablishmentHeroProps {
  establishment: {
    nome_fantasia: string;
    photo_url: string | null;
    categoria: string[] | null;
    bairro: string | null;
    cidade: string | null;
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
  isFavorited = false 
}: EstablishmentHeroProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const coverImage = establishment.photo_url || '/placeholder-estabelecimento.png';
  const categoria = establishment.categoria?.[0] || 'Estabelecimento';
  const inicialNome = (establishment.nome_fantasia || 'E').charAt(0).toUpperCase();

  // Parallax effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* ========== FOTO DE CAPA - MAIOR E COM PARALLAX ========== */}
        <div className="relative w-full h-56 sm:h-64 md:h-80 overflow-hidden">
          {/* Skeleton enquanto carrega */}
          {!imageLoaded && (
            <div className="absolute inset-0 img-skeleton" />
          )}
          
          {/* Imagem com parallax */}
          {establishment.photo_url ? (
            <motion.img 
              src={coverImage} 
              alt={establishment.nome_fantasia}
              onLoad={() => setImageLoaded(true)}
              style={{ y, scale }}
              className={`
                w-full h-full object-cover
                transition-opacity duration-1000 ease-out
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
            />
          ) : (
            /* Fallback: gradient abstrato premium se não tiver foto */
            <motion.div 
              style={{ scale }}
              className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative"
            >
              <div 
                className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-40 animate-float"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
              />
              <div 
                className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-30 animate-glow-pulse"
                style={{ background: 'radial-gradient(circle, hsl(280, 80%, 60%) 0%, transparent 70%)' }}
              />
            </motion.div>
          )}
          
          {/* Gradiente TOPO - sutil para botões */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
          
          {/* Gradiente BASE - transição suave */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />

          {/* ========== BOTÕES GLASSMORPHISM ========== */}
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onBack}
            className="
              absolute top-4 left-4 z-20
              w-11 h-11 
              rounded-full
              glass-dark
              flex items-center justify-center
              transition-all duration-300 ease-out
              hover:scale-110 hover:bg-black/50
              active:scale-95
              group
            "
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-white drop-shadow-lg transition-transform group-hover:-translate-x-0.5" />
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 right-4 z-20 flex gap-2"
          >
            <button 
              onClick={onFavorite}
              className="
                w-11 h-11 
                rounded-full
                glass-dark
                flex items-center justify-center
                transition-all duration-300 ease-out
                hover:scale-110
                active:scale-95
                group
              "
              aria-label="Favoritar"
            >
              <Heart 
                className={`
                  w-5 h-5 drop-shadow-lg
                  transition-all duration-300
                  ${isFavorited 
                    ? 'text-pink-500 fill-pink-500 scale-110' 
                    : 'text-white group-hover:text-pink-400'
                  }
                `} 
              />
            </button>
            
            <button 
              onClick={onShare}
              className="
                w-11 h-11 
                rounded-full
                glass-dark
                flex items-center justify-center
                transition-all duration-300 ease-out
                hover:scale-110
                active:scale-95
                group
              "
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5 text-white drop-shadow-lg transition-transform group-hover:rotate-12" />
            </button>
          </motion.div>
        </div>

        {/* ========== FOTO DE PERFIL - HOLOGRÁFICA ========== */}
        <div className="flex justify-center -mt-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 20 }}
          >
            <TiltCard
              tiltAmount={12}
              shadowAmount={25}
              enableHolographic={true}
              className="cursor-pointer group"
            >
              <button 
                onClick={() => establishment.photo_url && setShowFullImage(true)}
                aria-label="Ver foto em tela cheia"
                className="relative"
              >
                {/* Glow pulsante por trás */}
                <div 
                  className="
                    absolute -inset-3
                    bg-gradient-to-tr from-violet-500/50 via-fuchsia-500/50 to-pink-500/50
                    rounded-2xl
                    blur-xl
                    animate-glow-pulse
                    opacity-60
                    group-hover:opacity-80
                    transition-opacity
                  "
                />
                
                {/* Borda holográfica animada */}
                <div 
                  className="
                    absolute -inset-1 
                    bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-500
                    rounded-2xl
                    animate-ring-pulse
                    opacity-90
                  "
                  style={{
                    background: 'linear-gradient(135deg, hsl(270, 80%, 60%), hsl(320, 80%, 60%), hsl(350, 80%, 60%), hsl(270, 80%, 60%))',
                    backgroundSize: '300% 300%',
                    animation: 'gradientFlow 4s ease infinite, ring-pulse 2s ease-in-out infinite'
                  }}
                />
                
                {/* Container da foto */}
                <div className="
                  relative 
                  w-28 h-28 sm:w-32 sm:h-32
                  rounded-2xl 
                  border-4 border-background 
                  overflow-hidden 
                  shadow-2xl
                  bg-background
                  transition-transform duration-300
                  group-hover:scale-105
                ">
                  {establishment.photo_url ? (
                    <img 
                      src={coverImage} 
                      alt={establishment.nome_fantasia}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white drop-shadow-lg">{inicialNome}</span>
                    </div>
                  )}
                </div>

                {/* Sparkles flutuantes */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </button>
            </TiltCard>
          </motion.div>
        </div>

        {/* ========== INFORMAÇÕES DO ESTABELECIMENTO ========== */}
        <div className="mt-5 pb-2 text-center px-4">
          {/* Nome com gradiente sutil */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="
              text-3xl sm:text-4xl 
              font-bold 
              text-foreground 
              tracking-tight
              bg-clip-text
            "
          >
            {establishment.nome_fantasia}
          </motion.h1>
          
          {/* Categoria e Localização */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-3 mt-4 flex-wrap"
          >
            {/* Badge de Categoria Premium */}
            <span 
              className="
                inline-flex items-center gap-1.5 
                bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20
                text-violet-300 
                px-5 py-2 
                rounded-full 
                text-sm 
                font-semibold
                border border-violet-500/40
                backdrop-blur-md
                shadow-lg shadow-violet-500/10
              "
            >
              {categoria}
            </span>
            
            {/* Localização com ícone animado */}
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <MapPin className="w-4 h-4 text-pink-400" />
              </motion.div>
              {establishment.bairro || establishment.cidade}
            </span>
          </motion.div>
          
          {/* Indicadores de Confiança - Cards Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-3 mt-5"
          >
            {[
              { icon: Shield, label: 'Verificado', color: 'green', delay: 0.7 },
              { icon: Zap, label: 'Responde rápido', color: 'blue', delay: 0.8 },
              { icon: Gift, label: 'Benefício ativo', color: 'pink', delay: 0.9 },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: item.delay }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`
                  flex items-center gap-2 
                  px-3 py-2 
                  rounded-xl
                  bg-${item.color}-500/10
                  border border-${item.color}-500/20
                  backdrop-blur-sm
                  cursor-default
                  transition-all duration-300
                  hover:bg-${item.color}-500/20
                  hover:shadow-lg hover:shadow-${item.color}-500/10
                `}
              >
                <div className={`
                  w-6 h-6 
                  rounded-full 
                  bg-${item.color}-500/20 
                  flex items-center justify-center
                `}>
                  <item.icon className={`w-3.5 h-3.5 text-${item.color}-400`} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ========== MODAL FULLSCREEN DA FOTO ========== */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-fuchsia-900/20 pointer-events-none" />
            
            {/* Botão fechar */}
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowFullImage(false)}
              className="
                absolute top-4 right-4 z-50
                w-12 h-12 
                rounded-full
                bg-white/10 hover:bg-white/20
                backdrop-blur-md
                flex items-center justify-center
                transition-all duration-300
                border border-white/10
              "
              aria-label="Fechar"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Conteúdo expandido */}
            {establishment.photo_url ? (
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                src={coverImage} 
                alt={establishment.nome_fantasia}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-7xl sm:text-8xl font-bold text-white drop-shadow-lg">{inicialNome}</span>
              </motion.div>
            )}

            {/* Nome flutuante */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-8 left-0 right-0 text-center"
            >
              <h2 className="text-xl font-bold text-white">{establishment.nome_fantasia}</h2>
              <p className="text-sm text-white/60 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {establishment.bairro}, {establishment.cidade}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EstablishmentHero;