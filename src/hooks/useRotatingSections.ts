import { useState, useEffect, useMemo, useCallback } from 'react';
import type { HomeSection } from '@/types/homeCategories';

interface UseRotatingSectionsOptions {
  rotatingCount?: number; // Quantas seções rotativas mostrar (default: 5)
  rotationInterval?: number; // Intervalo em ms (default: 60000 = 1 min)
  rotateOnMount?: boolean; // Embaralhar no mount (default: true)
}

// Função para embaralhar array (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useRotatingSections = (
  allSections: HomeSection[],
  options: UseRotatingSectionsOptions = {}
) => {
  const {
    rotatingCount = 5,
    rotationInterval = 60000, // 1 minuto
    rotateOnMount = true,
  } = options;

  // Separar seções fixas e rotativas
  const fixedSections = useMemo(
    () => allSections.filter(s => s.priority === 'fixed'),
    [allSections]
  );
  
  const rotatingSections = useMemo(
    () => allSections.filter(s => s.priority === 'rotating'),
    [allSections]
  );

  // Estado das seções selecionadas
  const [selectedRotating, setSelectedRotating] = useState<HomeSection[]>(() => {
    if (rotateOnMount) {
      return shuffleArray(rotatingSections).slice(0, rotatingCount);
    }
    return rotatingSections.slice(0, rotatingCount);
  });

  // Key para forçar re-render com animação
  const [animationKey, setAnimationKey] = useState(0);

  // Rotação automática
  useEffect(() => {
    if (rotationInterval <= 0) return;

    const interval = setInterval(() => {
      setSelectedRotating(prev => {
        // Pegar seções que NÃO estão sendo exibidas
        const currentIds = new Set(prev.map(s => s.id));
        const available = rotatingSections.filter(s => !currentIds.has(s.id));
        
        if (available.length === 0) {
          // Se não tem mais disponíveis, embaralhar todas
          return shuffleArray(rotatingSections).slice(0, rotatingCount);
        }
        
        // Substituir uma seção aleatória por uma nova
        const newSections = [...prev];
        const indexToReplace = Math.floor(Math.random() * newSections.length);
        const newSection = available[Math.floor(Math.random() * available.length)];
        newSections[indexToReplace] = newSection;
        
        return newSections;
      });
      setAnimationKey(k => k + 1);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [rotatingSections, rotatingCount, rotationInterval]);

  // Combinar fixas + rotativas selecionadas
  const visibleSections = useMemo(() => {
    return [...fixedSections, ...selectedRotating];
  }, [fixedSections, selectedRotating]);

  // Função para forçar rotação manual
  const forceRotate = useCallback(() => {
    setSelectedRotating(shuffleArray(rotatingSections).slice(0, rotatingCount));
    setAnimationKey(k => k + 1);
  }, [rotatingSections, rotatingCount]);

  return {
    sections: visibleSections,
    forceRotate,
    isRotating: rotationInterval > 0,
    animationKey,
  };
};
