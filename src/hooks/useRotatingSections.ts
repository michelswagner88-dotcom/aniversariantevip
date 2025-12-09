import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { HomeSection } from "@/types/homeCategories";
import { FEATURED_SECTIONS } from "@/types/homeCategories";

interface UseRotatingSectionsOptions {
  rotatingCount?: number;
  rotationInterval?: number;
  featuredRotationInterval?: number;
  rotateOnMount?: boolean;
  lockDuration?: number;
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

export const useRotatingSections = (allSections: HomeSection[], options: UseRotatingSectionsOptions = {}) => {
  const {
    rotatingCount = 5,
    rotationInterval = 30000,
    featuredRotationInterval = 10000,
    rotateOnMount = true,
    lockDuration = 10000,
  } = options;

  // Refs para valores estáveis (evita re-criar intervals)
  const lockDurationRef = useRef(lockDuration);
  lockDurationRef.current = lockDuration;

  // Separar seções rotativas - memoizado com referência estável
  const rotatingSections = useMemo(() => allSections.filter((s) => s.priority === "rotating"), [allSections]);
  const rotatingSectionsRef = useRef(rotatingSections);
  rotatingSectionsRef.current = rotatingSections;

  // Estado da seção FEATURED atual (primeira posição)
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  // Estado das seções rotativas selecionadas
  const [selectedRotating, setSelectedRotating] = useState<HomeSection[]>(() => {
    if (rotateOnMount) {
      return shuffleArray(rotatingSections).slice(0, rotatingCount);
    }
    return rotatingSections.slice(0, rotatingCount);
  });

  // Key para forçar re-render com animação
  const [animationKey, setAnimationKey] = useState(0);

  // === SISTEMA DE TRAVA POR INTERAÇÃO ===
  const lockedSectionsRef = useRef<Map<string, number>>(new Map());
  const [lockedCount, setLockedCount] = useState(0);

  // Função para travar uma seção (estável com useCallback)
  const lockSection = useCallback((sectionId: string) => {
    lockedSectionsRef.current.set(sectionId, Date.now());
    setLockedCount(lockedSectionsRef.current.size);

    // Auto-destrava após lockDuration
    setTimeout(() => {
      const lockTime = lockedSectionsRef.current.get(sectionId);
      if (lockTime && Date.now() - lockTime >= lockDurationRef.current - 100) {
        lockedSectionsRef.current.delete(sectionId);
        setLockedCount(lockedSectionsRef.current.size);
      }
    }, lockDurationRef.current);
  }, []); // Sem dependências - usa refs

  // Verifica se uma seção está travada (função pura, não precisa de useCallback)
  const checkIfLocked = (sectionId: string): boolean => {
    const lockTime = lockedSectionsRef.current.get(sectionId);
    if (!lockTime) return false;
    const isLocked = Date.now() - lockTime < lockDurationRef.current;
    if (!isLocked) {
      lockedSectionsRef.current.delete(sectionId);
    }
    return isLocked;
  };

  // Rotação automática da seção FEATURED
  useEffect(() => {
    // Early return robusto
    if (!featuredRotationInterval || featuredRotationInterval <= 0) return;

    const interval = setInterval(() => {
      // Verifica se featured está travada
      setCurrentFeaturedIndex((prev) => {
        const featuredId = FEATURED_SECTIONS[prev]?.id;
        if (featuredId && checkIfLocked(featuredId)) {
          return prev; // Pula esta rotação
        }
        return (prev + 1) % FEATURED_SECTIONS.length;
      });
      setAnimationKey((k) => k + 1);
    }, featuredRotationInterval);

    return () => clearInterval(interval);
  }, [featuredRotationInterval]); // APENAS featuredRotationInterval como dependência

  // Rotação automática das outras seções
  useEffect(() => {
    // Early return robusto
    if (!rotationInterval || rotationInterval <= 0) return;

    const interval = setInterval(() => {
      setSelectedRotating((prev) => {
        const currentRotatingSections = rotatingSectionsRef.current;

        // Encontra índices das seções NÃO travadas
        const unlockableIndices = prev
          .map((section, index) => ({ section, index }))
          .filter(({ section }) => !checkIfLocked(section.id))
          .map(({ index }) => index);

        // Se todas estão travadas, não faz nada
        if (unlockableIndices.length === 0) {
          return prev;
        }

        // IDs atuais para não repetir
        const currentIds = new Set(prev.map((s) => s.id));
        const available = currentRotatingSections.filter((s) => !currentIds.has(s.id));

        // Se não tem disponíveis, embaralha tudo (exceto travadas)
        if (available.length === 0) {
          const newSections = [...prev];
          const shuffled = shuffleArray(currentRotatingSections);
          let shuffledIndex = 0;

          for (const idx of unlockableIndices) {
            if (shuffledIndex < shuffled.length) {
              newSections[idx] = shuffled[shuffledIndex];
              shuffledIndex++;
            }
          }
          return newSections;
        }

        // Substitui UMA seção não-travada aleatória
        const newSections = [...prev];
        const indexToReplace = unlockableIndices[Math.floor(Math.random() * unlockableIndices.length)];
        const newSection = available[Math.floor(Math.random() * available.length)];
        newSections[indexToReplace] = newSection;

        return newSections;
      });
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [rotationInterval, rotatingCount]); // APENAS rotationInterval e rotatingCount

  // Seção featured atual
  const currentFeatured = FEATURED_SECTIONS[currentFeaturedIndex];

  // Combinar featured + rotativas selecionadas
  const visibleSections = useMemo(() => {
    return [currentFeatured, ...selectedRotating];
  }, [currentFeatured, selectedRotating]);

  // Função para forçar rotação manual
  const forceRotate = useCallback(() => {
    setCurrentFeaturedIndex((prev) => (prev + 1) % FEATURED_SECTIONS.length);
    setSelectedRotating(shuffleArray(rotatingSectionsRef.current).slice(0, rotatingCount));
    setAnimationKey((k) => k + 1);
  }, [rotatingCount]);

  // Wrapper estável para isSectionLocked (para uso externo)
  const isSectionLocked = useCallback((sectionId: string): boolean => {
    return checkIfLocked(sectionId);
  }, []);

  return {
    sections: visibleSections,
    currentFeatured,
    forceRotate,
    isRotating: rotationInterval > 0 || featuredRotationInterval > 0,
    animationKey,
    lockSection,
    isSectionLocked,
    lockedCount,
  };
};
