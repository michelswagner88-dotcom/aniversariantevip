import { memo } from "react";
import { SkeletonGrid } from "./SkeletonGrid";

interface SkeletonSectionProps {
  cardCount?: number;
}

export const SkeletonSection = memo(function SkeletonSection({ cardCount = 4 }: SkeletonSectionProps) {
  return (
    <section className="mb-12 md:mb-16" role="status" aria-label="Carregando seção" aria-busy="true">
      <span className="sr-only">Carregando seção...</span>

      {/* Header da seção */}
      <div className="flex justify-between items-center mb-6">
        {/* Título */}
        <div className="relative h-7 w-48 rounded-lg bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-pulse motion-reduce:animate-none" />
        </div>

        {/* Link "Ver todos" */}
        <div className="relative h-5 w-20 rounded-md bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-pulse motion-reduce:animate-none" />
        </div>
      </div>

      {/* Grid de cards */}
      <SkeletonGrid count={cardCount} />
    </section>
  );
});
