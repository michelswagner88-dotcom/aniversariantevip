import { useState, useEffect, useMemo, useCallback } from "react";
import type { HomeSection } from "@/types/homeCategories";
import { FEATURED_SECTIONS } from "@/types/homeCategories";

interface UseRotatingSectionsOptions {
  rotatingCount?: number;
  rotationInterval?: number;
  featuredRotationInterval?: number; // Intervalo para rotação da seção destaque
  rotateOnMount?: boolean;
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
    rotationInterval = 0, // Desativado por padrão
    featuredRotationInterval = 10000, // 10 segundos para featured
    rotateOnMount = true,
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

  // Rotação automática da seção FEATURED
  useEffect(() => {
    if (featuredRotationInterval <= 0) return;

    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % FEATURED_SECTIONS.length);
      setAnimationKey((k) => k + 1);
    }, featuredRotationInterval);

    return () => clearInterval(interval);
  }, [featuredRotationInterval]);

  // Rotação automática das outras seções
  useEffect(() => {
    if (rotationInterval <= 0) return;

    const interval = setInterval(() => {
      setSelectedRotating((prev) => {
        const currentIds = new Set(prev.map((s) => s.id));
        const available = rotatingSections.filter((s) => !currentIds.has(s.id));

        if (available.length === 0) {
          return shuffleArray(rotatingSections).slice(0, rotatingCount);
        }

        const newSections = [...prev];
        const indexToReplace = Math.floor(Math.random() * newSections.length);
        const newSection = available[Math.floor(Math.random() * available.length)];
        newSections[indexToReplace] = newSection;

        return newSections;
      });
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [rotatingSections, rotatingCount, rotationInterval]);

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
  };
};
