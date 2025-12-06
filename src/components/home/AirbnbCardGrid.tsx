import { useNavigate } from 'react-router-dom';
import { Heart, Gift, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { TiltCard } from '@/components/ui/tilt-card';
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from '@/lib/photoUtils';
import { EstablishmentBadge, getEstablishmentBadges, getPrimaryBadge } from '@/components/ui/establishment-badge';

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
  
  const handleClick = () => {
    const url = getEstabelecimentoUrl({
      estado: est.estado,
      cidade: est.cidade,
      slug: est.slug,
      id: est.id
    });
    navigate(url);
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
          
          {/* Coração de favoritar - aparece no hover (desktop), sempre visível no mobile */}
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                       hover:bg-black/60 hover:scale-110 
                       transition-all duration-200"
          >
            <Heart className="w-[18px] h-[18px] text-white transition-colors hover:fill-white/50" />
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
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🎂</div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Tente ajustar os filtros ou buscar por outro termo.
        </p>
      </div>
    );
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