import { SkeletonCard } from './SkeletonCard';

interface SkeletonGridProps {
  count?: number;
}

export const SkeletonGrid = ({ count = 8 }: SkeletonGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard 
          key={index} 
          className="animate-in fade-in duration-300"
          style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
