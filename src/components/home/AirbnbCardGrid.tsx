import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from '@/lib/photoUtils';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';
import { getCategoriaIcon, getCategoriaSingular, getSubcategoriaBadgeData, getCategoriaById } from '@/constants/categories';

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
  
  // Tenta pegar subcategoria primeiro, senão usa categoria
  const especialidades = est.especialidades || [];
  const primeiraSubcategoria = especialidades[0];
  
  // Se tem subcategoria, usa ela; senão usa categoria
  let badgeIcon: string;
  let badgeLabel: string;
  
  if (primeiraSubcategoria && categoria) {
    const subData = getSubcategoriaBadgeData(categoria, primeiraSubcategoria);
    badgeIcon = subData.icon;
    badgeLabel = subData.label;
  } else {
    badgeIcon = getCategoriaIcon(categoria);
    badgeLabel = getCategoriaSingular(categoria) || categoria || 'Estabelecimento';
  }
  
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
        
        {/* Badge subcategoria/categoria - canto superior esquerdo */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
          <span className="text-xs">{badgeIcon}</span>
          <span className="text-xs font-medium text-white">
            {badgeLabel}
          </span>
        </div>
        
        {/* Coração de favoritar - canto superior direito */}
        <button 
          onClick={handleFavorite}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorited}
          className="absolute top-2 right-2 z-10 transition-transform duration-200 hover:scale-110 active:scale-95"
        >
          <Heart 
            className={cn(
              "w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200",
              isFavorited 
                ? "fill-red-500 text-red-500" 
                : "text-white fill-white/30",
              isAnimating && "animate-[heart-pop_0.4s_ease]"
            )} 
          />
        </button>
      </div>
    
      {/* Info do estabelecimento */}
      <div className="pt-3 space-y-1">
        {/* Nome COMPLETO (sem truncar) */}
        <h3 className="font-semibold text-base leading-tight text-foreground">
          {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
        </h3>
        
        {/* Bairro */}
        <p className="text-sm text-muted-foreground">
          {est.bairro || est.cidade}
        </p>
        
        {/* Benefício - estilizado */}
        {temBeneficio && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="p-1 rounded-md bg-purple-500/20">
              <Gift size={14} className="text-purple-400" />
            </div>
            <span className="text-sm font-medium text-purple-400">
              Tem benefício
            </span>
          </div>
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
