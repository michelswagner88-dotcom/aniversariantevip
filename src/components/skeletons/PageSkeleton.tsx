import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton para página inteira durante carregamento inicial
 */
export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg py-4">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton genérico para cards
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in duration-300">
      {/* Imagem */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
      </div>
      
      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};

/**
 * Skeleton para carrossel horizontal
 */
export const CarouselSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      
      {/* Cards do carrossel */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] md:w-[300px]">
            <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
            </div>
            <div className="pt-3 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton para lista de itens
 */
export const ListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl animate-in fade-in duration-300" style={{ animationDelay: `${i * 50}ms` }}>
          <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton inline para botões ou badges
 */
export const InlineSkeleton = ({ width = 'w-20', height = 'h-6' }: { width?: string; height?: string }) => {
  return <Skeleton className={`${width} ${height} rounded-full`} />;
};

/**
 * Skeleton para perfil/avatar
 */
export const ProfileSkeleton = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    </div>
  );
};

/**
 * Skeleton para formulário
 */
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
};
