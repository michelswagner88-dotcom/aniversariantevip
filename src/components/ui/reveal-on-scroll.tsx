import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  amount?: number;
}

export const RevealOnScroll = ({ 
  children, 
  className = '',
  delay = 0,
  duration = 0.5,
  direction = 'up',
  amount = 0.3
}: RevealOnScrollProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount });

  const directionOffset = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...directionOffset[direction]
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0,
        y: 0
      } : {}}
      transition={{ 
        duration,
        delay,
        ease: 'easeOut'
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
