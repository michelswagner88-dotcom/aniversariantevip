import { memo } from "react";

interface GaleriaGridSkeletonProps {
  count?: number;
}

export const GaleriaGridSkeleton = memo(function GaleriaGridSkeleton({ count = 4 }: GaleriaGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-2" role="status" aria-label="Carregando galeria de imagens" aria-busy="true">
      <span className="sr-only">Carregando imagens...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden animate-in fade-in duration-300 motion-reduce:animate-none"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-pulse motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
});
