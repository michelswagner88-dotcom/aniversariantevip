import { SkeletonShimmer } from '@/components/ui/skeleton-shimmer';

export const GaleriaGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonShimmer 
          key={i} 
          variant="image" 
          className="w-full aspect-square" 
        />
      ))}
    </div>
  );
};
