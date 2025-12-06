import { useState, useEffect, useRef } from 'react';

interface UseScrollHeaderOptions {
  threshold?: number;
  sensitivity?: number;
}

export const useScrollHeader = (options: UseScrollHeaderOptions = {}) => {
  const { threshold = 100, sensitivity = 10 } = options;
  
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  
  useEffect(() => {
    let ticking = false;
    
    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;
      
      setIsAtTop(currentScrollY < 10);
      
      if (currentScrollY > threshold) {
        // Só muda se scrollou mais que a sensibilidade
        if (Math.abs(scrollDiff) > sensitivity) {
          setIsVisible(scrollDiff < 0); // Pra cima = visível
        }
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, sensitivity]);
  
  return { isVisible, isAtTop };
};
