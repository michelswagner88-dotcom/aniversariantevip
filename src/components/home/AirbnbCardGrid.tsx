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

// Skeleton Card Premium com shimmer
const AirbnbCardSkeleton = () => (
  <div className="h-full flex flex-col rounded-2xl overflow-hidden bg-card/50 border border-border/50">
    <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      {/* Badge skeletons */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div className="w-20 h-6 bg-white/10 rounded-lg animate-pulse" />
        <div className="w-16 h-6 bg-violet-500/20 rounded-lg animate-pulse" />
      </div>
      {/* Favorite button skeleton */}
      <div className="absolute top-3 right-3 w-9 h-9 bg-white/10 rounded-full animate-pulse" />
    </div>
    <div className="p-4 space-y-2">
      <div className="h-5 bg-muted rounded-lg w-3/4 animate-pulse" />
      <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
    </div>
  </div>
);

// Cores por categoria para badges
const categoryColors: Record<string, { bg: string; text: string; glow: string }> = {
  'Restaurante': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
  'Bar': { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/30' },
  'Cafeteria': { bg: 'bg-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
  'Salão de Beleza': { bg: 'bg-rose-500/20', text: 'text-rose-400', glow: 'shadow-rose-500/30' },
  'Academia': { bg: 'bg-orange-500/20', text: 'text-orange-400', glow: 'shadow-orange-500/30' },
  'Serviços': { bg: 'bg-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
  'Barbearia': { bg: 'bg-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  'Casa Noturna': { bg: 'bg-violet-500/20', text: 'text-violet-400', glow: 'shadow-violet-500/30' },
  'Confeitaria': { bg: 'bg-pink-500/20', text: 'text-pink-400', glow: 'shadow-pink-500/30' },
  'Entretenimento': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
  'Hospedagem': { bg: 'bg-teal-500/20', text: 'text-teal-400', glow: 'shadow-teal-500/30' },
  'Loja': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
  'Sorveteria': { bg: 'bg-sky-500/20', text: 'text-sky-400', glow: 'shadow-sky-500/30' },
  'Saúde e Suplementos': { bg: 'bg-lime-500/20', text: 'text-lime-400', glow: 'shadow-lime-500/30' },
  'default': { bg: 'bg-gray-500/20', text: 'text-gray-400', glow: 'shadow-gray-500/30' },
};

// Card individual Premium - Design LIMPO estilo Airbnb
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
  const [isHovered, setIsHovered] = useState(false);
  
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
  const categoryColor = categoryColors[categoria] || categoryColors['default'];
  
  // Verificar se é novo (menos de 30 dias)
  const isNew = est.created_at && 
    (Date.now() - new Date(est.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000;
  
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
  
  // Badge: Categoria label limpo
  const badgeLabel = categoria || 'Estabelecimento';
  
  return (
    <article
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group cursor-pointer h-full flex flex-col",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20",
        "active:scale-[0.98]",
        "rounded-2xl overflow-hidden",
        "bg-card/30"
      )}
    >
      {/* Container da imagem - PROPORÇÃO 4:3 */}
      <div className="relative w-full overflow-hidden rounded-xl">
        {/* Imagem com zoom no hover */}
        <div className={cn(
          "transition-transform duration-700 ease-out",
          isHovered && "scale-105"
        )}>
          <SafeImage
            src={fotoUrl}
            alt={est.nome_fantasia || 'Estabelecimento'}
            fallbackSrc={fallbackUrl}
            aspectRatio="4:3"
            priority={priority}
          />
        </div>
        
        {/* Gradiente sutil na base */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        
        {/* Botão Favoritar - ÚNICO elemento no topo direito */}
        <button 
          onClick={handleFavorite}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorited}
          className={cn(
            "absolute top-3 right-3 z-10",
            "w-8 h-8 rounded-full",
            "flex items-center justify-center",
            "transition-all duration-300 ease-out",
            "active:scale-95",
            isFavorited 
              ? "bg-white text-pink-500" 
              : "bg-black/30 text-white hover:bg-black/50",
            isHovered && "scale-110"
          )}
        >
          <Heart 
            className={cn(
              "w-4 h-4 transition-all duration-300",
              isFavorited && "fill-current",
              isAnimating && "animate-[heart-pop_0.4s_ease]"
            )} 
          />
        </button>

        {/* Badge de categoria - ÚNICO badge, posição inferior esquerda */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className={cn(
            "inline-flex items-center",
            "bg-black/60 backdrop-blur-sm",
            "text-white text-xs font-medium",
            "px-2.5 py-1 rounded-lg"
          )}>
            {badgeLabel}
          </span>
        </div>
      </div>
    
      {/* Info do estabelecimento - FORA DA FOTO */}
      <div className="px-1 pt-3 pb-1 space-y-1">
        {/* Nome com hover effect */}
        <h3 className={cn(
          "font-semibold text-base leading-tight line-clamp-1 transition-colors duration-300",
          isHovered ? "text-violet-300" : "text-foreground"
        )}>
          {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
        </h3>
        
        {/* Localização */}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground line-clamp-1">
            {est.bairro || est.cidade}
            {distancia && <span className="text-muted-foreground/70 ml-1">• {distancia}</span>}
          </span>
        </div>
        
        {/* Linha de benefício + novo (sutil, integrado) */}
        <div className="flex items-center justify-between pt-1">
          {/* Indicador de benefício */}
          {temBeneficio && (
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs text-pink-400 font-medium">
                Benefício disponível
              </span>
            </div>
          )}
          
          {/* Tag "Novo" sutil como texto */}
          {isNew && (
            <span className="text-xs text-emerald-400 font-medium ml-auto">
              Novo
            </span>
          )}
        </div>
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
