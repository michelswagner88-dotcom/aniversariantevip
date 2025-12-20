import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Componente que reseta o scroll para o topo quando a rota muda.
 * Deve ser colocado dentro do BrowserRouter no App.tsx
 *
 * IMPORTANTE: Depende APENAS de pathname, não de search/hash/key
 * para evitar scroll indesejado quando query params mudam.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Só faz scroll se o pathname realmente mudou
    if (prevPathname.current !== pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
