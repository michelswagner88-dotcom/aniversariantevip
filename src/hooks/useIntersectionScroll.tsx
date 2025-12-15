// src/hooks/useIntersectionScroll.tsx
import { useEffect, useState, useRef, RefObject } from "react";

interface UseIntersectionScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

interface UseIntersectionScrollReturn {
  isScrolled: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
}

export function useIntersectionScroll(options: UseIntersectionScrollOptions = {}): UseIntersectionScrollReturn {
  const { threshold = 0, rootMargin = "0px 0px 0px 0px" } = options;
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      console.log("[useIntersectionScroll] Sentinel não encontrado - aguardando...");
      return;
    }

    console.log("[useIntersectionScroll] Observando sentinel:", sentinel);

    // Encontra o container que realmente scrolla
    const findScrollContainer = (): Element | null => {
      let element: HTMLElement | null = sentinel.parentElement;
      while (element) {
        const style = getComputedStyle(element);
        const overflowY = style.overflowY;
        const isScrollable = overflowY === "auto" || overflowY === "scroll";
        const hasScroll = element.scrollHeight > element.clientHeight;

        if (isScrollable && hasScroll) {
          console.log("[useIntersectionScroll] Container de scroll encontrado:", element.tagName, element.className);
          return element;
        }
        element = element.parentElement;
      }
      console.log("[useIntersectionScroll] Usando document como root");
      return null; // Usa viewport
    };

    const scrollContainer = findScrollContainer();

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Quando a sentinela SAI da tela, isScrolled = true
        const scrolled = !entry.isIntersecting;
        console.log("[useIntersectionScroll] isIntersecting:", entry.isIntersecting, "-> isScrolled:", scrolled);
        setIsScrolled(scrolled);
      },
      {
        root: scrollContainer, // Usa o container de scroll como root
        threshold: threshold,
        rootMargin: rootMargin,
      },
    );

    observer.observe(sentinel);

    return () => {
      console.log("[useIntersectionScroll] Desconectando observer");
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { isScrolled, sentinelRef };
}
