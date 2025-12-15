import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "./CardSkeleton";

/**
 * Skeleton para página inteira durante carregamento inicial
 */
export const PageSkeleton = memo(function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background" role="status" aria-label="Carregando página" aria-busy="true">
      <span className="sr-only">Carregando página...</span>

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
});

/**
 * Skeleton para carrossel horizontal
 */
export const CarouselSkeleton = memo(function CarouselSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Carregando carrossel" aria-busy="true">
      <span className="sr-only">Carregando...</span>

      {/* Título */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Cards do carrossel */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] md:w-[300px]" aria-hidden="true">
            <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-pulse motion-reduce:animate-none" />
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
});

interface ListSkeletonProps {
  count?: number;
}

/**
 * Skeleton para lista de itens
 */
export const ListSkeleton = memo(function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Carregando lista" aria-busy="true">
      <span className="sr-only">Carregando...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl animate-in fade-in duration-300 motion-reduce:animate-none"
          style={{ animationDelay: `${i * 50}ms` }}
          aria-hidden="true"
        >
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
});

interface InlineSkeletonProps {
  width?: string;
  height?: string;
}

/**
 * Skeleton inline para botões ou badges
 */
export const InlineSkeleton = memo(function InlineSkeleton({ width = "w-20", height = "h-6" }: InlineSkeletonProps) {
  return <Skeleton className={`${width} ${height} rounded-full`} aria-hidden="true" />;
});

/**
 * Skeleton para perfil/avatar
 */
export const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <div
      className="flex flex-col items-center text-center space-y-4"
      role="status"
      aria-label="Carregando perfil"
      aria-busy="true"
    >
      <span className="sr-only">Carregando perfil...</span>
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    </div>
  );
});

interface FormSkeletonProps {
  fields?: number;
}

/**
 * Skeleton para formulário
 */
export const FormSkeleton = memo(function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando formulário" aria-busy="true">
      <span className="sr-only">Carregando formulário...</span>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2" aria-hidden="true">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
});
