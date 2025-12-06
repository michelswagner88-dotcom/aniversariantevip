// src/constants/categorySubcategories.ts
// DEPRECATED: Usar src/constants/categories.ts para o novo sistema
// Este arquivo mantém compatibilidade com código existente

import { CATEGORIAS, type Subcategoria } from './categories';

// Re-exportar tipo
export type { Subcategoria };

// Converter novo formato para o antigo (por label de categoria)
export const CATEGORY_SUBCATEGORIES: Record<string, Subcategoria[]> = CATEGORIAS.reduce((acc, cat) => {
  acc[cat.label] = cat.subcategorias;
  return acc;
}, {} as Record<string, Subcategoria[]>);

// Helper para obter subcategorias de uma categoria (retorna array de objetos)
export const getSubcategoriesForCategory = (category: string): Subcategoria[] => {
  // Buscar por label ou id
  const cat = CATEGORIAS.find(c => 
    c.label === category || 
    c.id === category ||
    c.label.toLowerCase() === category.toLowerCase()
  );
  return cat?.subcategorias || [];
};

// Helper para obter apenas os labels (para compatibilidade com código existente)
export const getSubcategoryLabels = (category: string): string[] => {
  const subs = getSubcategoriesForCategory(category);
  return subs.map(s => s.label);
};

// Helper para obter ícone de uma subcategoria pelo label ou id
export const getSubcategoryIcon = (category: string, subcategoryLabelOrId: string): string => {
  const subs = getSubcategoriesForCategory(category);
  const found = subs.find(s => 
    s.label === subcategoryLabelOrId || 
    s.id === subcategoryLabelOrId ||
    s.label.toLowerCase() === subcategoryLabelOrId.toLowerCase()
  );
  return found?.icon || '📍';
};

// Helper para validar se uma subcategoria pertence à categoria
export const isValidSubcategory = (category: string, subcategory: string): boolean => {
  const validSubcategories = getSubcategoriesForCategory(category);
  return validSubcategories.some(s => 
    s.label === subcategory || 
    s.id === subcategory ||
    s.label.toLowerCase() === subcategory.toLowerCase()
  );
};

// Lista de todas as categorias (labels)
export const CATEGORIES = CATEGORIAS.map(c => c.label);

// Contagem total de subcategorias
export const TOTAL_SUBCATEGORIES = CATEGORIAS.reduce((acc, cat) => acc + cat.subcategorias.length, 0);
