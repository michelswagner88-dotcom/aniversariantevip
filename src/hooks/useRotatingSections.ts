import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { HomeSection } from "@/types/homeCategories";
import { FEATURED_SECTIONS } from "@/types/homeCategories";

interface UseRotatingSectionsOptions {
  rotatingCount?: number;
  rotationInterval?: number;
  featuredRotationInterval?: number;
  rotateOnMount?: boolean;
  lockDuration?: number; // Tempo que a seção fica travada após interação (ms)
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
    rotationInterval = 30000, // 30 segundos padrão
    featuredRotationInterval = 10000,
    rotateOnMount = true,
    lockDuration = 10000, // 10 segundos de trava após interação
  } = options;

  // Separar seções rotativas
  const rotatingSections = useMemo(() => allSections.filter((s) => s.priority === "rotating"), [allSections]);

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
  // Map de sectionId -> timestamp da última interação
  const lockedSectionsRef = useRef<Map<string, number>>(new Map());

  // Estado para forçar re-render quando locks mudam (opcional, para debug)
  const [lockedCount, setLockedCount] = useState(0);

  // Função para travar uma seção (chamada pelo carrossel)
  const lockSection = useCallback(
    (sectionId: string) => {
      lockedSectionsRef.current.set(sectionId, Date.now());
      setLockedCount(lockedSectionsRef.current.size);

      // Auto-destrava após lockDuration
      setTimeout(() => {
        const lockTime = lockedSectionsRef.current.get(sectionId);
        // Só remove se não teve nova interação
        if (lockTime && Date.now() - lockTime >= lockDuration - 100) {
          lockedSectionsRef.current.delete(sectionId);
          setLockedCount(lockedSectionsRef.current.size);
        }
      }, lockDuration);
    },
    [lockDuration],
  );

  // Verifica se uma seção está travada
  const isSectionLocked = useCallback(
    (sectionId: string): boolean => {
      const lockTime = lockedSectionsRef.current.get(sectionId);
      if (!lockTime) return false;

      // Verifica se ainda está dentro do período de trava
      const isLocked = Date.now() - lockTime < lockDuration;
      if (!isLocked) {
        lockedSectionsRef.current.delete(sectionId);
      }
      return isLocked;
    },
    [lockDuration],
  );

  // Rotação automática da seção FEATURED (só se não estiver travada)
  useEffect(() => {
    if (featuredRotationInterval <= 0) return;

    const interval = setInterval(() => {
      // Verifica se featured está travada
      const featuredId = FEATURED_SECTIONS[currentFeaturedIndex]?.id;
      if (featuredId && isSectionLocked(featuredId)) {
        return; // Pula esta rotação
      }

      setCurrentFeaturedIndex((prev) => (prev + 1) % FEATURED_SECTIONS.length);
      setAnimationKey((k) => k + 1);
    }, featuredRotationInterval);

    return () => clearInterval(interval);
  }, [featuredRotationInterval, currentFeaturedIndex, isSectionLocked]);

  // Rotação automática das outras seções (pula as travadas)
  useEffect(() => {
    if (rotationInterval <= 0) return;

    const interval = setInterval(() => {
      setSelectedRotating((prev) => {
        // Encontra índices das seções NÃO travadas
        const unlockableIndices = prev
          .map((section, index) => ({ section, index }))
          .filter(({ section }) => !isSectionLocked(section.id))
          .map(({ index }) => index);

        // Se todas estão travadas, não faz nada
        if (unlockableIndices.length === 0) {
          return prev;
        }

        // IDs atuais para não repetir
        const currentIds = new Set(prev.map((s) => s.id));
        const available = rotatingSections.filter((s) => !currentIds.has(s.id));

        // Se não tem disponíveis, embaralha tudo (exceto travadas)
        if (available.length === 0) {
          const newSections = [...prev];
          const shuffled = shuffleArray(rotatingSections);
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
  }, [rotatingSections, rotatingCount, rotationInterval, isSectionLocked]);

  // Seção featured atual
  const currentFeatured = FEATURED_SECTIONS[currentFeaturedIndex];

  // Combinar featured + rotativas selecionadas
  const visibleSections = useMemo(() => {
    return [currentFeatured, ...selectedRotating];
  }, [currentFeatured, selectedRotating]);

  // Função para forçar rotação manual
  const forceRotate = useCallback(() => {
    setCurrentFeaturedIndex((prev) => (prev + 1) % FEATURED_SECTIONS.length);
    setSelectedRotating(shuffleArray(rotatingSections).slice(0, rotatingCount));
    setAnimationKey((k) => k + 1);
  }, [rotatingSections, rotatingCount]);

  return {
    sections: visibleSections,
    currentFeatured,
    forceRotate,
    isRotating: rotationInterval > 0 || featuredRotationInterval > 0,
    animationKey,
    // Novas funções para controle de trava
    lockSection,
    isSectionLocked,
    lockedCount, // Para debug se quiser mostrar quantas estão travadas
  };
};
