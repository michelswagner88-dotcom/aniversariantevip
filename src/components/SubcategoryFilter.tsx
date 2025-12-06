import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useAvailableSubcategories } from '@/hooks/useAvailableSubcategories';
import { getSubcategoryIcon } from '@/constants/categorySubcategories';
import { X, Loader2 } from 'lucide-react';

interface SubcategoryFilterProps {
  category: string | null;
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
  cidade?: string | null;
  estado?: string | null;
}

export const SubcategoryFilter = ({
  category,
  selectedSubcategories,
  onSubcategoriesChange,
  cidade,
  estado,
}: SubcategoryFilterProps) => {
  // Buscar subcategorias dinamicamente do banco de dados
  const { subcategorias: availableSubcategories, loading } = useAvailableSubcategories({
    cidade,
    estado,
    categoria: category,
  });

  // Se não tem categoria selecionada, não mostra
  if (!category) {
    return null;
  }

  // Se está carregando, mostra loader
  if (loading) {
    return (
      <div className="w-full flex items-center gap-2 py-2 px-1">
        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
        <span className="text-sm text-slate-400">Carregando filtros...</span>
      </div>
    );
  }

  // Se não há subcategorias disponíveis, não mostra o filtro
  if (availableSubcategories.length === 0) {
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
        <span className="text-sm text-slate-400">
          Filtrar por tipo{cidade ? ` em ${cidade}` : ''}:
        </span>
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
            const icon = getSubcategoryIcon(category, subcategory);
            
            return (
              <Badge
                key={subcategory}
                variant={isSelected ? "default" : "outline"}
                className={`
                  cursor-pointer shrink-0 transition-all duration-200 text-xs py-1.5 px-3 flex items-center gap-1.5
                  ${isSelected 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-transparent shadow-lg shadow-violet-500/20' 
                    : 'bg-transparent hover:bg-violet-600/20 text-slate-300 border-slate-600 hover:border-violet-500'
                  }
                `}
                onClick={() => toggleSubcategory(subcategory)}
              >
                <span className="text-sm">{icon}</span>
                <span>{subcategory}</span>
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
