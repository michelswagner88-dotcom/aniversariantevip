import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const PostCardSkeleton = memo(function PostCardSkeleton() {
  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden animate-in fade-in duration-300 motion-reduce:animate-none"
      role="article"
      aria-hidden="true"
    >
      <div className="p-4">
        {/* Header: Avatar + Nome */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>

        {/* Imagem do post */}
        <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-pulse motion-reduce:animate-none" />
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
});

interface PostCardGridSkeletonProps {
  count?: number;
}

export const PostCardGridSkeleton = memo(function PostCardGridSkeleton({ count = 3 }: PostCardGridSkeletonProps) {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando posts" aria-busy="true">
      <span className="sr-only">Carregando posts...</span>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
});
