import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getSubcategoriesForCategory } from '@/constants/categorySubcategories';
import { X } from 'lucide-react';

interface SubcategoryFilterProps {
  category: string | null;
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
}

export const SubcategoryFilter = ({
  category,
  selectedSubcategories,
  onSubcategoriesChange,
}: SubcategoryFilterProps) => {
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      setAvailableSubcategories(getSubcategoriesForCategory(category));
    } else {
      setAvailableSubcategories([]);
    }
  }, [category]);

  // Se não tem categoria selecionada ou não há subcategorias, não mostra
  if (!category || availableSubcategories.length === 0) {
    return null;
  }

  const toggleSubcategory = (subcategory: string) => {
    if (selectedSubcategories.includes(subcategory)) {
      onSubcategoriesChange(selectedSubcategories.filter(s => s !== subcategory));
    } else {
      onSubcategoriesChange([...selectedSubcategories, subcategory]);
    }
  };

  const clearAll = () => {
    onSubcategoriesChange([]);
  };

  return (
    <div className="w-full animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm text-slate-400">Filtrar por tipo:</span>
        {selectedSubcategories.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar filtros
          </button>
        )}
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2 px-1">
          {availableSubcategories.map((subcategory) => {
            const isSelected = selectedSubcategories.includes(subcategory);
            return (
              <Badge
                key={subcategory}
                variant={isSelected ? "default" : "outline"}
                className={`
                  cursor-pointer shrink-0 transition-all duration-200 text-xs py-1.5 px-3
                  ${isSelected 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-transparent shadow-lg shadow-violet-500/20' 
                    : 'bg-transparent hover:bg-violet-600/20 text-slate-300 border-slate-600 hover:border-violet-500'
                  }
                `}
                onClick={() => toggleSubcategory(subcategory)}
              >
                {subcategory}
              </Badge>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default SubcategoryFilter;
