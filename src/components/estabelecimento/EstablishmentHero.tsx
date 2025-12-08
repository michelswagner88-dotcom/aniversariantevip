// EstablishmentHero.tsx - Hero Section Premium

import { ArrowLeft, Heart, Share2, MapPin, Shield, Zap, Gift, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
  const coverImage = establishment.photo_url || '/placeholder-estabelecimento.png';
  const categoria = establishment.categoria?.[0] || 'Estabelecimento';
  const inicialNome = (establishment.nome_fantasia || 'E').charAt(0).toUpperCase();

  return (
    <>
      <div className="relative">
        {/* ========== FOTO DE CAPA ========== */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
          {/* Skeleton enquanto carrega */}
          {!imageLoaded && (
            <div className="absolute inset-0 img-skeleton" />
          )}
          
          {/* Imagem com animação de respiração */}
          {establishment.photo_url ? (
            <img 
              src={coverImage} 
              alt={establishment.nome_fantasia}
              onLoad={() => setImageLoaded(true)}
              className={`
                w-full h-full object-cover
                transition-all duration-1000 ease-out
                ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
              `}
              style={{
                animation: imageLoaded ? 'breathe 8s ease-in-out infinite' : 'none'
              }}
            />
          ) : (
            /* Fallback: gradient abstrato premium se não tiver foto */
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
              <div 
                className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-40 animate-float"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
              />
              <div 
                className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-30 animate-glow-pulse"
                style={{ background: 'radial-gradient(circle, hsl(280, 80%, 60%) 0%, transparent 70%)' }}
              />
            </div>
          )}
          
          {/* Gradiente suave - apenas topo escuro para botões legíveis */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          {/* Transição suave para o fundo */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 via-20% to-transparent" />

          {/* ========== BOTÕES GLASSMORPHISM (dentro da capa) ========== */}
          {/* Botão Voltar */}
          <button 
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
          </button>
          
          {/* Botões Favoritar e Compartilhar */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
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
          </div>
        </div>

        {/* ========== FOTO DE PERFIL - CLICÁVEL ========== */}
        <div className="flex justify-center -mt-14 relative z-10">
          <button 
            onClick={() => establishment.photo_url && setShowFullImage(true)}
            className="relative animate-fade-in-scale cursor-pointer group" 
            style={{ animationDelay: '0.3s' }}
            aria-label="Ver foto em tela cheia"
          >
            {/* Anel gradiente animado (estilo Instagram Stories) */}
            <div 
              className="
                absolute -inset-1 
                bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400
                rounded-2xl
                animate-ring-pulse
                opacity-90
                group-hover:opacity-100
                transition-opacity
              "
            />
            
            {/* Glow por trás */}
            <div 
              className="
                absolute -inset-2
                bg-gradient-to-tr from-purple-500/40 via-pink-500/40 to-orange-400/40
                rounded-2xl
                blur-lg
                animate-glow-pulse
                group-hover:opacity-80
                transition-opacity
              "
            />
            
            {/* Container da foto */}
            <div className="
              relative 
              w-24 h-24 sm:w-28 sm:h-28
              rounded-2xl 
              border-4 border-background 
              overflow-hidden 
              shadow-xl
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
                  <span className="text-3xl font-bold text-white drop-shadow-lg">{inicialNome}</span>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* ========== INFORMAÇÕES DO ESTABELECIMENTO - ABAIXO DA FOTO ========== */}
        <div className="mt-4 pb-2 text-center px-4">
          {/* Nome com entrada animada */}
          <h1 
            className="
              text-2xl sm:text-3xl 
              font-bold 
              text-foreground 
              tracking-tight
              animate-fade-in-up
              opacity-0
            "
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            {establishment.nome_fantasia}
          </h1>
          
          {/* Categoria e Localização - animação sequencial */}
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            {/* Badge de Categoria */}
            <span 
              className="
                inline-flex items-center gap-1.5 
                bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                text-purple-300 
                px-4 py-1.5 
                rounded-full 
                text-sm 
                font-medium
                border border-purple-500/30
                backdrop-blur-sm
                animate-fade-in-up
                opacity-0
              "
              style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
            >
              {categoria}
            </span>
            
            {/* Localização */}
            <span 
              className="
                inline-flex items-center gap-1.5 
                text-muted-foreground 
                text-sm
                animate-fade-in-up
                opacity-0
              "
              style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
            >
              <MapPin className="w-4 h-4 text-pink-400" />
              {establishment.bairro || establishment.cidade}
            </span>
          </div>
          
          {/* Indicadores de Confiança - animação sequencial individual */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span 
              className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in-up opacity-0"
              style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
            >
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Shield className="w-3 h-3 text-green-400" />
              </div>
              Verificado
            </span>
            <span 
              className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in-up opacity-0"
              style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
            >
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-3 h-3 text-blue-400" />
              </div>
              Responde rápido
            </span>
            <span 
              className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in-up opacity-0"
              style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}
            >
              <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Gift className="w-3 h-3 text-pink-400" />
              </div>
              Benefício ativo
            </span>
          </div>
        </div>
      </div>

      {/* ========== MODAL FULLSCREEN DA FOTO ========== */}
      <AnimatePresence>
        {showFullImage && establishment.photo_url && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            {/* Botão fechar */}
            <button 
              onClick={() => setShowFullImage(false)}
              className="
                absolute top-4 right-4 z-50
                w-11 h-11 
                rounded-full
                bg-white/10 hover:bg-white/20
                flex items-center justify-center
                transition-all duration-300
              "
              aria-label="Fechar"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Imagem expandida */}
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              src={coverImage} 
              alt={establishment.nome_fantasia}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Nome do estabelecimento */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-8 left-0 right-0 text-center"
            >
              <h2 className="text-xl font-bold text-white">{establishment.nome_fantasia}</h2>
              <p className="text-sm text-white/60 mt-1">{establishment.bairro}, {establishment.cidade}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EstablishmentHero;
