import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollHeaderOptions {
  /** Distância mínima do topo para começar a esconder */
  threshold?: number;
  /** Sensibilidade - quanto precisa scrollar pra mudar estado */
  sensitivity?: number;
}

export const useScrollHeader = (options: UseScrollHeaderOptions = {}) => {
  const { threshold = 80, sensitivity = 15 } = options;
  
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  
  const updateHeader = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDiff = currentScrollY - lastScrollY.current;
    
    // Verifica se está no topo
    const atTop = currentScrollY < 10;
    setIsAtTop(atTop);
    
    // Se está no topo, sempre visível
    if (atTop) {
      setIsVisible(true);
      setScrollDirection(null);
      lastScrollY.current = currentScrollY;
      ticking.current = false;
      return;
    }
    
    // Só atualiza se scrollou mais que a sensibilidade
    if (Math.abs(scrollDiff) < sensitivity) {
      ticking.current = false;
      return;
    }
    
    // Determina direção do scroll
    const direction = scrollDiff > 0 ? 'down' : 'up';
    
    if (direction !== scrollDirection) {
      setScrollDirection(direction);
    }
    
    // Só esconde se passou do threshold
    if (currentScrollY > threshold) {
      setIsVisible(direction === 'up');
    } else {
      setIsVisible(true);
    }
    
    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold, sensitivity, scrollDirection]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    };
    
    // Inicializa com posição atual
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < 10);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateHeader]);
  
  return { isVisible, isAtTop, scrollDirection };
};
