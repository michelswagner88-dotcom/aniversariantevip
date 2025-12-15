import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonPillsProps {
  count?: number;
}

export const SkeletonPills = memo(function SkeletonPills({ count = 8 }: SkeletonPillsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="status"
      aria-label="Carregando categorias"
      aria-busy="true"
    >
      <span className="sr-only">Carregando categorias...</span>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-9 w-24 rounded-full flex-shrink-0"
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
});
