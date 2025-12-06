import { Skeleton } from '@/components/ui/skeleton';

export const PostCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in fade-in duration-300">
      <div className="p-4">
        {/* Header: Avatar + Nome */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>

        {/* Imagem do post com shimmer */}
        <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>

        {/* Ações: curtir, comentar, compartilhar */}
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="w-14 h-8 rounded-full" />
          <Skeleton className="w-14 h-8 rounded-full" />
          <Skeleton className="w-10 h-8 rounded-full ml-auto" />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-4/5 h-4" />
        </div>
      </div>
    </div>
  );
};
