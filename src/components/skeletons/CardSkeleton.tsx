import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type CardSkeletonVariant = 'simple' | 'detailed';

interface CardSkeletonProps {
  variant?: CardSkeletonVariant;
  className?: string;
  style?: React.CSSProperties;
}

export const CardSkeleton = memo(function CardSkeleton({ 
  variant = 'simple',
  className,
  style 
}: CardSkeletonProps) {
  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden animate-in fade-in duration-300 motion-reduce:animate-none",
        className
      )}
      style={style}
      role="article"
      aria-hidden="true"
    >
      {/* Imagem */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-pulse motion-reduce:animate-none" />
      </div>
      
      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {variant === 'detailed' && (
          <Skeleton className="w-24 h-5 rounded-full" />
        )}
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        {variant === 'detailed' && (
          <>
            <div className="flex gap-2">
              <Skeleton className="w-16 h-5 rounded-full" />
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            <Skeleton className="w-full h-10 rounded-xl" />
          </>
        )}
        {variant === 'simple' && (
          <Skeleton className="h-10 w-full" />
        )}
      </div>
    </div>
  );
});

interface CardGridSkeletonProps {
  count?: number;
  variant?: CardSkeletonVariant;
}

export const CardGridSkeleton = memo(function CardGridSkeleton({ 
  count = 6,
  variant = 'simple'
}: CardGridSkeletonProps) {
  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
      role="status"
      aria-label="Carregando estabelecimentos"
      aria-busy="true"
    >
      <span className="sr-only">Carregando...</span>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
});
