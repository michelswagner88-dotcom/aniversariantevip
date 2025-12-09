import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from '@/lib/photoUtils';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';

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

// Skeleton Card Estilo Airbnb - Limpo
const AirbnbCardSkeleton = () => (
  <div className="group">
    {/* Imagem skeleton */}
    <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
    </div>
    {/* Texto skeleton */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-10" />
      </div>
      <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1" />
    </div>
  </div>
);

// Card individual - Estilo Airbnb LIMPO (sem box/sombra/borda)
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
      className="group cursor-pointer"
    >
      {/* IMAGEM - apenas rounded, com favorito */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img 
          src={fotoUrl || fallbackUrl}
          alt={est.nome_fantasia || 'Estabelecimento'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading={priority ? "eager" : "lazy"}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackUrl) {
              target.src = fallbackUrl;
            }
          }}
        />
        
        {/* Botão favorito - canto superior direito */}
        <button 
          onClick={handleFavorite}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="absolute top-3 right-3 z-10"
        >
          <Heart 
            className={cn(
              "w-6 h-6 drop-shadow-md hover:scale-110 transition-transform",
              isFavorited 
                ? "text-red-500 fill-red-500" 
                : "text-white",
              isAnimating && "animate-[heart-pop_0.4s_ease]"
            )} 
            strokeWidth={1.5}
          />
        </button>
      </div>
      
      {/* TEXTO - solto no fundo branco, SEM box */}
      <div className="space-y-0.5">
        {/* Linha 1: Nome + Nota (se tiver) */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[15px] text-[#222222] dark:text-white truncate pr-2">
            {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
          </h3>
          {/* Placeholder para nota futura */}
        </div>
        
        {/* Linha 2: Bairro/Localização */}
        <p className="text-[15px] text-[#717171] dark:text-gray-400 truncate">
          {est.bairro || est.cidade}
          {distancia && <span className="ml-1">• {distancia}</span>}
        </p>
        
        {/* Linha 3: Categoria */}
        <p className="text-[15px] text-[#717171] dark:text-gray-400">
          {categoria || 'Estabelecimento'}
        </p>
        
        {/* Linha 4: Benefício (destaque) */}
        {temBeneficio && (
          <p className="text-[15px] text-[#222222] dark:text-white mt-1">
            <span className="font-semibold">🎁 Benefício</span> no aniversário
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
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
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {estabelecimentos.map((est, index) => (
        <motion.div key={est.id} variants={cardVariants}>
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
