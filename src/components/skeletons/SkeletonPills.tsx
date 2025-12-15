import { memo } from "react";
import { CardSkeleton } from "./CardSkeleton";

interface SkeletonGridProps {
  count?: number;
  staggerDelay?: number;
}

export const SkeletonGrid = memo(function SkeletonGrid({ count = 8, staggerDelay = 50 }: SkeletonGridProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      role="status"
      aria-label="Carregando conteúdo"
      aria-busy="true"
    >
      <span className="sr-only">Carregando...</span>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} style={{ animationDelay: `${index * staggerDelay}ms` }} />
      ))}
    </div>
  );
});
