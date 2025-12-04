import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que reseta o scroll para o topo quando a rota muda.
 * Deve ser colocado dentro do BrowserRouter no App.tsx
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll instantâneo para o topo sempre que a rota ou query mudar
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
