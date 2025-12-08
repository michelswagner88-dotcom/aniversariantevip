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

// Card individual Premium
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group cursor-pointer h-full flex flex-col",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10",
        "active:scale-[0.98]",
        "rounded-2xl overflow-hidden",
        "bg-card/50 backdrop-blur-sm border border-border/50",
        "hover:border-purple-500/30"
      )}
    >
      {/* Container da imagem - PROPORÇÃO 4:3 */}
      <div className="relative w-full overflow-hidden bg-muted">
        <SafeImage
          src={fotoUrl}
          alt={est.nome_fantasia || 'Estabelecimento'}
          fallbackSrc={fallbackUrl}
          aspectRatio="4:3"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradiente na base para uniformizar */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Badges no topo esquerdo */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
          {/* Badge de categoria com cor */}
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md",
            categoryColor.bg,
            categoryColor.text,
            "border border-white/10"
          )}>
            <span>{badgeIcon}</span>
            {badgeLabel}
          </span>
          
          {/* Badge de Benefício */}
          {temBeneficio && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-white/20">
              <Gift className="w-3 h-3" />
              Benefício
            </span>
          )}
        </div>
        
        {/* Badge especial (Novo) - canto superior direito antes do coração */}
        {isNew && (
          <div className="absolute top-3 right-12 z-10">
            <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm animate-pulse">
              ✨ Novo
            </span>
          </div>
        )}
        
        {/* Botão Favoritar Premium */}
        <button 
          onClick={handleFavorite}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorited}
          className={cn(
            "absolute top-3 right-3 z-10",
            "w-8 h-8 rounded-full",
            "bg-black/40 backdrop-blur-md",
            "flex items-center justify-center",
            "transition-all duration-300",
            "hover:bg-black/60 hover:scale-110",
            "active:scale-95",
            isFavorited && "bg-pink-500/20"
          )}
        >
          <Heart 
            className={cn(
              "w-4 h-4 transition-all duration-300",
              isFavorited 
                ? "fill-pink-500 text-pink-500 scale-110" 
                : "text-white",
              isAnimating && "animate-[heart-pop_0.4s_ease]"
            )} 
          />
        </button>

        {/* Preview do Benefício (aparece no hover) */}
        {temBeneficio && (
          <div className={cn(
            "absolute bottom-3 left-3 right-3 z-10",
            "bg-black/70 backdrop-blur-md rounded-xl",
            "px-3 py-2 border border-white/10",
            "transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Gift className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-white font-medium line-clamp-1">
                {est.descricao_beneficio || 'Benefício exclusivo'}
              </span>
            </div>
          </div>
        )}
      </div>
    
      {/* Info do estabelecimento */}
      <div className="p-4 space-y-1.5">
        {/* Nome com hover effect */}
        <h3 className="font-semibold text-base leading-tight text-foreground group-hover:text-purple-400 transition-colors line-clamp-2">
          {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
        </h3>
        
        {/* Localização */}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {est.bairro || est.cidade}
            {distancia && <span className="text-purple-400 ml-1">• {distancia}</span>}
          </span>
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
