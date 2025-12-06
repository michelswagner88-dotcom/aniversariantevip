import { useNavigate } from 'react-router-dom';
import { MapPin, Gift, Star } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';
import { EstabelecimentoCardSkeleton } from '@/components/skeletons/EstabelecimentoCardSkeleton';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';

interface EstabelecimentosGridProps {
  estabelecimentos: any[];
  isLoading: boolean;
}

export const EstabelecimentosGrid = ({
  estabelecimentos,
  isLoading
}: EstabelecimentosGridProps) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <EstabelecimentoCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (estabelecimentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-slate-400 max-w-md">
          Tente ajustar os filtros ou buscar por outro termo.
        </p>
      </div>
    );
  }

  const handleCardClick = (est: any) => {
    const url = getEstabelecimentoUrl({
      estado: est.estado,
      cidade: est.cidade,
      slug: est.slug,
      id: est.id
    });
    navigate(url);
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {estabelecimentos.map((est) => (
        <article
          key={est.id}
          onClick={() => handleCardClick(est)}
          className="group cursor-pointer bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10"
        >
          {/* Imagem */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <SafeImage
              src={est.logo_url || est.galeria_fotos?.[0]}
              alt={est.nome_fantasia || 'Estabelecimento'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Badge de categoria */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                {Array.isArray(est.categoria) ? est.categoria[0] : est.categoria || 'Estabelecimento'}
              </span>
            </div>
            
            {/* Badge de benefício */}
            {est.descricao_beneficio && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 backdrop-blur-sm rounded-lg">
                  <Gift className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-medium text-white truncate">
                    Tem benefício!
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Conteúdo */}
          <div className="p-4">
            <h3 className="font-semibold text-white text-lg mb-1 line-clamp-1 group-hover:text-violet-400 transition-colors">
              {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
            </h3>
            
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{est.bairro || est.cidade}</span>
            </div>
            
            {/* Especialidades */}
            {est.especialidades && est.especialidades.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {est.especialidades.slice(0, 2).map((esp: string, idx: number) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full"
                  >
                    {esp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};
