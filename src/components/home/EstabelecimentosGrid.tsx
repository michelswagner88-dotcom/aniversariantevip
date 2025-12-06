import { useNavigate } from 'react-router-dom';
import { MapPin, Gift } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';
import { EstabelecimentoCardSkeleton } from '@/components/skeletons/EstabelecimentoCardSkeleton';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { getCategoriaIcon } from '@/lib/constants';

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

  // Helper para pegar a categoria principal e sua primeira especialidade
  const getCategoryBadgeInfo = (est: any) => {
    const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
    const icon = getCategoriaIcon(categoria);
    const subcategoria = est.especialidades?.[0];
    
    return {
      icon,
      label: subcategoria || categoria || 'Estabelecimento'
    };
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {estabelecimentos.map((est) => {
        const badgeInfo = getCategoryBadgeInfo(est);
        
        return (
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
              
              {/* Badge de categoria + subcategoria */}
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                  <span className="text-sm">{badgeInfo.icon}</span>
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {badgeInfo.label}
                  </span>
                </div>
              </div>
              
              {/* Badge de benefício */}
              {est.descricao_beneficio && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 backdrop-blur-sm rounded-lg">
                    <Gift className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-semibold text-white">
                      Benefício
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
              
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{est.bairro || est.cidade}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};