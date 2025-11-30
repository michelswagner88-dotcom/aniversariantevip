import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({ 
  value, 
  duration = 2, 
  delay = 0,
  prefix = '',
  suffix = '',
  className = '' 
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [hasStarted, setHasStarted] = useState(false);

  const spring = useSpring(0, {
    bounce: 0,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (latest) => 
    prefix + Math.floor(latest).toLocaleString('pt-BR') + suffix
  );

  useEffect(() => {
    if (isInView && !hasStarted) {
      const timer = setTimeout(() => {
        spring.set(value);
        setHasStarted(true);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, value, spring, delay, hasStarted]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
};
