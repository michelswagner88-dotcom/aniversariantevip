import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlowTextProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export const GlowText = ({ 
  children, 
  className = '',
  glowColor = 'violet'
}: GlowTextProps) => {
  const glowColors = {
    violet: 'text-violet-400 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]',
    fuchsia: 'text-fuchsia-400 drop-shadow-[0_0_30px_rgba(217,70,239,0.5)]',
    pink: 'text-pink-400 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]',
    cyan: 'text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]',
  };

  return (
    <span 
      className={cn(
        'animate-glow-pulse',
        glowColors[glowColor as keyof typeof glowColors] || glowColors.violet,
        className
      )}
    >
      {children}
    </span>
  );
};
