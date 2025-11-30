import { SkeletonShimmer } from '@/components/ui/skeleton-shimmer';

export const EstabelecimentoCardSkeleton = () => {
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Imagem skeleton */}
      <SkeletonShimmer variant="image" className="w-full h-48" />
      
      <div className="p-4 space-y-3">
        {/* Badge categoria */}
        <SkeletonShimmer variant="text" className="w-24 h-5" />
        
        {/* Nome do estabelecimento */}
        <SkeletonShimmer variant="text" className="w-full h-6" />
        
        {/* Bairro/Cidade */}
        <SkeletonShimmer variant="text" className="w-3/4 h-4" />
        
        {/* Botão */}
        <SkeletonShimmer variant="card" className="w-full h-10 mt-4" />
      </div>
    </div>
  );
};
