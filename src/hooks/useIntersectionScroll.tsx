import { useEffect, useState, useRef, RefObject } from 'react';

interface UseIntersectionScrollReturn {
  isScrolled: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
}

export function useIntersectionScroll(): UseIntersectionScrollReturn {
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      console.log("[useIntersectionScroll] Sentinel não encontrado");
      return;
    }

    console.log("[useIntersectionScroll] Observando sentinel");

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Quando a sentinela SAI da tela, isScrolled = true
        const scrolled = !entry.isIntersecting;
        console.log("[useIntersectionScroll] isScrolled:", scrolled);
        setIsScrolled(scrolled);
      },
      { 
        root: null, // viewport
        threshold: 0,
        rootMargin: '-80px 0px 0px 0px' // dispara 80px antes de sair totalmente
      }
    );

    observer.observe(sentinel);

    return () => {
      console.log("[useIntersectionScroll] Desconectando observer");
      observer.disconnect();
    };
  }, []);

  return { isScrolled, sentinelRef };
}
