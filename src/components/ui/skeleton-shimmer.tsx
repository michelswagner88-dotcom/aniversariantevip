import { cn } from '@/lib/utils';

interface SkeletonShimmerProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'image';
}

export const SkeletonShimmer = ({ 
  className, 
  variant = 'default' 
}: SkeletonShimmerProps) => {
  const variantClasses = {
    default: 'rounded-md',
    card: 'rounded-xl',
    text: 'rounded h-4',
    avatar: 'rounded-full',
    image: 'rounded-lg aspect-square',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-800/50',
        variantClasses[variant],
        className
      )}
    >
      {/* Shimmer gradient animado */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
    </div>
  );
};
