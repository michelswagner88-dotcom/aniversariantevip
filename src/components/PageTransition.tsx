import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useNavigationDirection } from '@/hooks/useNavigationDirection';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const direction = useNavigationDirection();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: direction > 0 ? 30 : -30,
      scale: 0.98,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: {
      opacity: 0,
      x: direction < 0 ? 30 : -30,
      scale: 0.98,
      filter: 'blur(4px)',
    },
  };

  const pageTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
