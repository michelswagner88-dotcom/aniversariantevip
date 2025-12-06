import { useNavigate } from 'react-router-dom';
import { Heart, Gift, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { cn } from '@/lib/utils';
import { TiltCard } from '@/components/ui/tilt-card';

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

// Skeleton Card premium com shimmer
const AirbnbCardSkeleton = () => (
  <div className="space-y-3">
    <div className="relative aspect-square rounded-xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 overflow-hidden">
      <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
        }}
      />
    </div>
    <div className="space-y-2">
      <div className="relative h-4 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-full w-3/4 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
      </div>
      <div className="relative h-3 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-full w-1/2 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] delay-100" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
      </div>
      <div className="relative h-3 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-full w-1/3 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] delay-200" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
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
  
  return (
    <TiltCard 
      tiltAmount={8} 
      shadowAmount={15}
      className="group cursor-pointer"
    >
      <article
        onClick={handleClick}
        className="transition-all duration-300"
      >
        {/* Container da imagem com glassmorphism */}
        <div className="relative aspect-square overflow-hidden rounded-2xl mb-3 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-300 ring-1 ring-white/10 dark:ring-white/5 backdrop-blur-sm bg-white/5 dark:bg-slate-800/30">
        <SafeImage
          src={est.logo_url || est.galeria_fotos?.[0]}
          alt={est.nome_fantasia || 'Estabelecimento'}
          className="w-full h-full"
          enableParallax
        />
        
        {/* Badge de benefício estilo Airbnb "Guest favorite" com pulse e glow no hover */}
        {temBeneficio && (
          <div className="absolute top-3 left-3">
            <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:ring-2 group-hover:ring-violet-400/50">
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-violet-400/30 animate-ping" />
              <Gift className="relative w-3.5 h-3.5 text-violet-600 animate-pulse" />
              <span className="relative text-xs font-semibold text-slate-900 dark:text-white">
                Tem benefício
              </span>
            </div>
          </div>
        )}
        
        {/* Coração de favoritar */}
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
        >
          <Heart className="w-6 h-6 text-white drop-shadow-md hover:fill-white/50 transition-colors" />
        </button>
      </div>
      
      {/* Info do estabelecimento */}
      <div className="space-y-1">
        {/* Linha 1: Nome + Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-slate-900 dark:text-white line-clamp-1">
            {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
          </h3>
          {/* Rating placeholder - quando tiver dados reais */}
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-slate-900 dark:fill-white text-slate-900 dark:text-white" />
            <span className="text-sm text-slate-900 dark:text-white">Novo</span>
          </div>
        </div>
        
        {/* Linha 2: Localização */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm line-clamp-1">
            {est.bairro || est.cidade}
          </span>
        </div>
        
        {/* Linha 3: Categoria */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {categoria || 'Estabelecimento'}
        </p>
        
        {/* Linha 4: Benefício preview (se houver) */}
        {temBeneficio && (
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400 line-clamp-1">
            {est.descricao_beneficio}
          </p>
        )}
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
        <motion.div key={est.id} variants={cardVariants}>
          <AirbnbCard estabelecimento={est} />
        </motion.div>
      ))}
    </motion.div>
  );
};