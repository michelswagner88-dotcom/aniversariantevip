import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from '@/lib/photoUtils';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';
import { getCategoriaIcon, getCategoriaSingular } from '@/lib/constants';

// Variantes de animação para o grid
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  }
};

interface AirbnbCardGridProps {
  estabelecimentos: any[];
  isLoading: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

// Calcular distância entre dois pontos (Haversine)
const calcularDistancia = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Skeleton Card limpo estilo Airbnb
const AirbnbCardSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="relative w-full aspect-[4/3] rounded-xl bg-muted overflow-hidden">
      <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
        }}
      />
    </div>
    <div className="pt-3 space-y-2">
      <div className="h-5 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-4 bg-muted rounded w-2/3" />
    </div>
  </div>
);

// Card individual estilo Airbnb - LIMPO
const AirbnbCard = ({ 
  estabelecimento, 
  priority = false,
  userLocation 
}: { 
  estabelecimento: any; 
  priority?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}) => {
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
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setIsFavorited(!isFavorited);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
  const temBeneficio = !!est.descricao_beneficio;
  
  // Badge de categoria - usa SINGULAR
  const categoriaIcon = getCategoriaIcon(categoria);
  const categoriaSingular = getCategoriaSingular(categoria) || categoria || 'Estabelecimento';
  
  // Calcular distância se tiver localização do usuário
  let distancia: string | null = null;
  if (userLocation && est.latitude && est.longitude) {
    const dist = calcularDistancia(
      userLocation.lat,
      userLocation.lng,
      est.latitude,
      est.longitude
    );
    distancia = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  }
  
  // Obter a melhor foto com fallback
  const fotoUrl = getFotoEstabelecimento(
    est.logo_url,
    null,
    est.galeria_fotos,
    est.categoria
  );
  const fallbackUrl = getPlaceholderPorCategoria(est.categoria);
  
  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer h-full flex flex-col transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Container da imagem - PROPORÇÃO 4:3 */}
      <div className="relative w-full overflow-hidden rounded-xl bg-muted">
        <SafeImage
          src={fotoUrl}
          alt={est.nome_fantasia || 'Estabelecimento'}
          fallbackSrc={fallbackUrl}
          aspectRatio="4:3"
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badge categoria - canto superior esquerdo */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-sm">
          <span className="text-sm">{categoriaIcon}</span>
          <span className="text-sm font-medium text-foreground">
            {categoriaSingular}
          </span>
        </div>
        
        {/* Coração de favoritar - canto superior direito */}
        <button 
          onClick={handleFavorite}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorited}
          className={cn(
            "absolute top-3 right-3 z-10 rounded-full",
            "flex items-center justify-center",
            "w-9 h-9",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
            "transition-all duration-200",
            "hover:bg-white dark:hover:bg-slate-900 hover:scale-110",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <Heart 
            className={cn(
              "w-5 h-5 transition-all duration-200",
              isFavorited 
                ? "fill-red-500 text-red-500" 
                : "text-muted-foreground",
              isAnimating && "animate-[heart-pop_0.4s_ease]"
            )} 
          />
        </button>
      </div>
    
      {/* Info do estabelecimento */}
      <div className="pt-3 flex flex-col gap-1">
        {/* Nome */}
        <h3 className="font-semibold text-base leading-snug truncate text-foreground">
          {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
        </h3>
        
        {/* Localização */}
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{est.bairro || est.cidade}</span>
          {distancia && (
            <span className="flex-shrink-0">• {distancia}</span>
          )}
        </p>
        
        {/* Benefício - discreto */}
        {temBeneficio && (
          <p className="text-sm text-primary flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" />
            <span>Tem benefício exclusivo</span>
          </p>
        )}
      </div>
    </article>
  );
};

export const AirbnbCardGrid = ({
  estabelecimentos,
  isLoading,
  userLocation
}: AirbnbCardGridProps) => {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {estabelecimentos.map((est, index) => (
        <motion.div key={est.id} variants={cardVariants} className="h-full">
          <AirbnbCard 
            estabelecimento={est} 
            priority={index < 6} 
            userLocation={userLocation}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
