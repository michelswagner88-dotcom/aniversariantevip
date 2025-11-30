import { SkeletonShimmer } from '@/components/ui/skeleton-shimmer';

export const PostCardSkeleton = () => {
  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-4">
        {/* Header: Avatar + Nome */}
        <div className="flex items-center gap-3 mb-4">
          <SkeletonShimmer variant="avatar" className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <SkeletonShimmer variant="text" className="w-32 h-4" />
            <SkeletonShimmer variant="text" className="w-24 h-3" />
          </div>
        </div>

        {/* Imagem do post */}
        <SkeletonShimmer variant="image" className="w-full aspect-square mb-4" />

        {/* Ações: curtir, comentar, compartilhar */}
        <div className="flex items-center gap-4 mb-3">
          <SkeletonShimmer variant="default" className="w-12 h-8 rounded-full" />
          <SkeletonShimmer variant="default" className="w-12 h-8 rounded-full" />
          <SkeletonShimmer variant="default" className="w-12 h-8 rounded-full" />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <SkeletonShimmer variant="text" className="w-full h-3" />
          <SkeletonShimmer variant="text" className="w-4/5 h-3" />
        </div>
      </div>
    </div>
  );
};
