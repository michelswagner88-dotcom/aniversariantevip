import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export const ShimmerButton = ({
  children,
  className = '',
  ...props
}: ShimmerButtonProps) => {
  return (
    <button
      className={cn(
        'group relative overflow-hidden font-semibold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-fuchsia-500/25',
        'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500',
        'rounded-xl',
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-violet-400/20 via-fuchsia-400/20 to-pink-400/20" />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};
