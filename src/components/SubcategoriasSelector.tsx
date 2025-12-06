import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CATEGORIAS, 
  getCategoriaByLabel, 
  getCategoriaById,
  type Subcategoria 
} from '@/constants/categories';

interface Props {
  categoria: string; // Pode ser label ou id
  selected: string[];
  onChange: (subcategorias: string[]) => void;
  maxSelection?: number;
  useLabels?: boolean; // Se true, usa labels ao invés de ids
}

const SubcategoriasSelector = ({ 
  categoria, 
  selected, 
  onChange, 
  maxSelection = 3,
  useLabels = true
}: Props) => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  useEffect(() => {
    if (!categoria) {
      setSubcategorias([]);
      return;
    }

    // Buscar categoria por label ou id
    const cat = getCategoriaByLabel(categoria) || getCategoriaById(categoria);
    
    if (cat) {
      setSubcategorias(cat.subcategorias);
    } else {
      setSubcategorias([]);
    }
  }, [categoria]);

  const toggleSubcategoria = (sub: Subcategoria) => {
    const value = useLabels ? sub.label : sub.id;
    
    if (selected.includes(value)) {
      // Remover
      onChange(selected.filter(s => s !== value));
    } else if (selected.length < maxSelection) {
      // Adicionar
      onChange([...selected, value]);
    }
  };

  const isSelected = (sub: Subcategoria) => {
    return selected.includes(sub.label) || selected.includes(sub.id);
  };

  if (!categoria) {
    return (
      <p className="text-muted-foreground text-sm">
        Selecione uma categoria primeiro
      </p>
    );
  }

  if (subcategorias.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhuma subcategoria disponível para esta categoria
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Subcategorias (selecione até {maxSelection})
        </label>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          selected.length === maxSelection 
            ? "bg-green-500/20 text-green-400" 
            : "bg-muted text-muted-foreground"
        )}>
          {selected.length}/{maxSelection}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {subcategorias.map((sub) => {
          const selected_ = isSelected(sub);
          const isDisabled = !selected_ && selected.length >= maxSelection;

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => toggleSubcategoria(sub)}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                selected_
                  ? "bg-primary/20 border-primary text-primary"
                  : isDisabled
                  ? "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              <span>{sub.icon}</span>
              <span className="text-sm">{sub.label}</span>
              {selected_ && (
                <Check className="w-4 h-4" />
              )}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 A primeira subcategoria selecionada será exibida no card do estabelecimento
        </p>
      )}
    </div>
  );
};

export default SubcategoriasSelector;
