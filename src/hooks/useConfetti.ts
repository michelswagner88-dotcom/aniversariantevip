import { useState, useCallback } from 'react';

export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false);

  const fireConfetti = useCallback(() => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 4000); // 4 segundos
  }, []);

  return { isActive, fireConfetti };
};
