import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  background?: string;
  className?: string;
}

export const ShimmerButton = ({
  children,
  shimmerColor = 'rgba(255,255,255,0.3)',
  shimmerSize = '150px',
  borderRadius = '12px',
  background = 'linear-gradient(90deg, #8b5cf6, #d946ef, #ec4899)',
  className = '',
  ...props
}: ShimmerButtonProps) => {
  return (
    <button
      className={cn(
        'group relative overflow-hidden font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95',
        className
      )}
      style={{
        background,
        borderRadius,
      }}
      {...props}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/30 to-transparent"
        style={{
          width: shimmerSize,
        }}
      />
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
