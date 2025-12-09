// Skeleton Card Estilo Airbnb - Limpo
export const AirbnbCardSkeleton = () => {
  return (
    <div className="group">
      {/* Imagem skeleton */}
      <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
        <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
      </div>
      {/* Texto skeleton - solto, estilo Airbnb */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-[15px] bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1" />
      </div>
    </div>
  );
};

export const AirbnbCardGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AirbnbCardSkeleton key={i} />
      ))}
    </div>
  );
};
