import { memo } from "react";

// Skeleton Card Estilo Airbnb - Limpo
export const AirbnbCardSkeleton = memo(function AirbnbCardSkeleton() {
  return (
    <div className="group" role="article" aria-hidden="true">
      {/* Imagem skeleton */}
      <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
        <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse motion-reduce:animate-none" />
      </div>

      {/* Texto skeleton */}
      <div className="space-y-2">
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse motion-reduce:animate-none" />
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse motion-reduce:animate-none" />
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse motion-reduce:animate-none" />
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1 animate-pulse motion-reduce:animate-none" />
      </div>
    </div>
  );
});

interface AirbnbCardGridSkeletonProps {
  count?: number;
}

export const AirbnbCardGridSkeleton = memo(function AirbnbCardGridSkeleton({ count = 6 }: AirbnbCardGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
      role="status"
      aria-label="Carregando estabelecimentos"
      aria-busy="true"
    >
      <span className="sr-only">Carregando...</span>
      {Array.from({ length: count }).map((_, i) => (
        <AirbnbCardSkeleton key={i} />
      ))}
    </div>
  );
});
