import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook que detecta a direção da navegação (forward/back)
 * Retorna: 1 para navegação forward, -1 para navegação back
 */
export const useNavigationDirection = () => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef(1);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;

    // Heurística simples: se o path ficou mais curto, provavelmente voltou
    // Ex: /explorar/detalhes -> /explorar (voltou)
    if (currentPath.length < prevPath.length && currentPath === prevPath.substring(0, currentPath.length)) {
      directionRef.current = -1;
    } else {
      directionRef.current = 1;
    }

    prevPathRef.current = currentPath;
  }, [location.pathname]);

  return directionRef.current;
};
