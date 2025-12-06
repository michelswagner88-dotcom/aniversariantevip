import { useNavigate } from 'react-router-dom';
import { Heart, Gift, MapPin, Star } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { cn } from '@/lib/utils';

interface AirbnbCardGridProps {
  estabelecimentos: any[];
  isLoading: boolean;
}

// Skeleton Card estilo Airbnb
const AirbnbCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 mb-3" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
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
    <article
      onClick={handleClick}
      className="group cursor-pointer"
    >
      {/* Container da imagem */}
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
        <SafeImage
          src={est.logo_url || est.galeria_fotos?.[0]}
          alt={est.nome_fantasia || 'Estabelecimento'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badge de benefício estilo Airbnb "Guest favorite" */}
        {temBeneficio && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full shadow-md">
              <Gift className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {estabelecimentos.map((est) => (
        <AirbnbCard key={est.id} estabelecimento={est} />
      ))}
    </div>
  );
};