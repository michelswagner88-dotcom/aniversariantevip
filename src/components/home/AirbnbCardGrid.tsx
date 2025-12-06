import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { TiltCard } from '@/components/ui/tilt-card';
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from '@/lib/photoUtils';
import { EstablishmentBadge, getEstablishmentBadges, getPrimaryBadge } from '@/components/ui/establishment-badge';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';

// Variantes de animação para o grid
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const
    }
  }
};

interface AirbnbCardGridProps {
  estabelecimentos: any[];
  isLoading: boolean;
}

// Skeleton Card premium com shimmer - compacto estilo Airbnb
const AirbnbCardSkeleton = () => (
  <div className="h-full flex flex-col">
    {/* Container da foto - ALTURA FIXA com aspect-ratio 4:3 */}
    <div className="relative w-full aspect-[4/3] rounded-xl bg-slate-800 overflow-hidden">
      <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
        }}
      />
    </div>
    {/* Info compacta */}
    <div className="pt-3 space-y-1.5">
      <div className="relative h-4 bg-slate-800 rounded-full w-4/5 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
      </div>
      <div className="relative h-3 bg-slate-800 rounded-full w-1/2 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] delay-100" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
      </div>
    </div>
  </div>
);

// Card individual estilo Airbnb
const AirbnbCard = ({ estabelecimento }: { estabelecimento: any }) => {
  const navigate = useNavigate();
  const est = estabelecimento;
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleClick = () => {
    const url = getEstabelecimentoUrl({
      estado: est.estado,
      cidade: est.cidade,
      slug: est.slug,
      id: est.id
    });
    navigate(url);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Feedback tátil no mobile (se suportado)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setIsFavorited(!isFavorited);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
  const temBeneficio = !!est.descricao_beneficio;
  
  // Obter badges do estabelecimento
  const badges = getEstablishmentBadges({
    is_verificado: est.is_verificado,
    is_parceiro: est.is_parceiro,
    is_destaque: est.is_destaque,
    created_at: est.created_at,
    descricao_beneficio: est.descricao_beneficio,
  });
  const primaryBadge = getPrimaryBadge(badges);
  
  // Obter a melhor foto com fallback inteligente
  const fotoUrl = getFotoEstabelecimento(
    est.logo_url,
    null,
    est.galeria_fotos,
    est.categoria
  );
  const fallbackUrl = getPlaceholderPorCategoria(est.categoria);
  
  return (
    <TiltCard 
      tiltAmount={8} 
      shadowAmount={15}
      className="group cursor-pointer h-full"
    >
      <article
        onClick={handleClick}
        className="h-full flex flex-col transition-all duration-300 active:scale-[0.98]"
      >
        {/* Container da imagem - PROPORÇÃO FIXA 4:3 - Foto domina o card */}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-slate-800 shadow-lg shadow-black/20 transition-all duration-300 ring-1 ring-white/5 group-hover:shadow-xl group-hover:shadow-violet-500/15">
          <SafeImage
            src={fotoUrl}
            alt={est.nome_fantasia || 'Estabelecimento'}
            fallbackSrc={fallbackUrl}
            className="w-full h-full object-cover object-center transition-transform duration-400 ease-out group-hover:scale-[1.08]"
            enableParallax
          />
          
          {/* Overlay gradient sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          
          {/* Badge de status (canto superior esquerdo) */}
          {primaryBadge && (
            <div className="absolute top-3 left-3 z-10">
              <EstablishmentBadge type={primaryBadge} size="sm" />
            </div>
          )}
          
          {/* Badge de benefício - posição inferior esquerda, estilo Airbnb */}
          {temBeneficio && (
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg transition-all duration-300 group-hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)]">
                <Gift className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-white">
                  Tem benefício
                </span>
              </div>
            </div>
          )}
          
          {/* Coração de favoritar - SEMPRE visível no mobile, hover no desktop */}
          <button 
            onClick={handleFavorite}
            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={isFavorited}
            className={cn(
              // Base - posição e tamanho
              "absolute top-2 right-2 z-10 rounded-full",
              "flex items-center justify-center",
              // Visual - fundo com blur
              "bg-black/50 backdrop-blur-sm",
              "border border-white/10",
              // Transições
              "transition-all duration-200",
              // Touch target - área mínima de 44x44 no mobile
              "w-11 h-11 md:w-9 md:h-9",
              // MOBILE: sempre visível (opacity-100)
              // DESKTOP: escondido por padrão, aparece no hover do grupo
              "opacity-100 scale-100",
              "md:opacity-0 md:scale-90",
              "md:group-hover:opacity-100 md:group-hover:scale-100",
              // Se favoritado: sempre visível em ambos
              isFavorited && "!opacity-100 !scale-100 bg-black/60",
              // Hover no próprio botão
              "hover:bg-black/70 hover:scale-110 md:group-hover:hover:scale-110",
              // Active state
              "active:scale-95",
              // Focus visible para acessibilidade
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            )}
          >
            <Heart 
              className={cn(
                "w-5 h-5 md:w-[18px] md:h-[18px] transition-all duration-200",
                isFavorited 
                  ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                  : "text-white",
                isAnimating && "animate-[heart-pop_0.4s_ease]"
              )} 
            />
          </button>
        </div>
      
        {/* Info do estabelecimento - Hierarquia clara */}
        <div className="pt-3 flex flex-col gap-1">
          {/* Nome - Hierarquia 1 (mais importante) */}
          <h3 className="font-semibold text-base sm:text-[16px] leading-snug text-slate-900 dark:text-white truncate transition-colors duration-200 group-hover:text-violet-600 dark:group-hover:text-violet-400">
            {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
          </h3>
          
          {/* Bairro - Hierarquia 2 (secundário) */}
          <p className="text-sm text-muted-foreground truncate">
            {est.bairro || est.cidade}
          </p>
        </div>
      </article>
    </TiltCard>
  );
};

export const AirbnbCardGrid = ({
  estabelecimentos,
  isLoading
}: AirbnbCardGridProps) => {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <AirbnbCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (estabelecimentos.length === 0) {
    return <EmptyState type="geral" />;
  }
  
  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {estabelecimentos.map((est) => (
        <motion.div key={est.id} variants={cardVariants} className="h-full">
          <AirbnbCard estabelecimento={est} />
        </motion.div>
      ))}
    </motion.div>
  );
};