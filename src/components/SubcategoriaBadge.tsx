import { cn } from '@/lib/utils';
import { 
  getSubcategoriaBadgeData, 
  getCategoriaById,
  getCategoriaByLabel 
} from '@/constants/categories';
import { getSubcategoryIcon } from '@/constants/categorySubcategories';

interface SubcategoriaBadgeProps {
  categoria?: string | string[] | null;
  subcategorias?: string[] | null;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Exibe a primeira subcategoria como badge no card do estabelecimento
 * Se não tiver subcategoria, exibe a categoria
 */
export const SubcategoriaBadge = ({
  categoria,
  subcategorias,
  className,
  showIcon = true,
  size = 'sm'
}: SubcategoriaBadgeProps) => {
  // Determinar categoria principal
  const primaryCategoria = Array.isArray(categoria) ? categoria[0] : categoria;
  
  if (!primaryCategoria) return null;

  // Determinar o que exibir
  let icon = '';
  let label = '';

  if (subcategorias && subcategorias.length > 0) {
    // Usar primeira subcategoria
    const firstSub = subcategorias[0];
    
    // Tentar buscar do novo sistema
    const cat = getCategoriaByLabel(primaryCategoria) || getCategoriaById(primaryCategoria);
    if (cat) {
      const sub = cat.subcategorias.find(s => 
        s.label === firstSub || 
        s.id === firstSub ||
        s.label.toLowerCase() === firstSub.toLowerCase()
      );
      if (sub) {
        icon = sub.icon;
        label = sub.label;
      }
    }
    
    // Fallback para sistema antigo
    if (!label) {
      icon = getSubcategoryIcon(primaryCategoria, firstSub);
      label = firstSub;
    }
  } else {
    // Usar categoria
    const cat = getCategoriaByLabel(primaryCategoria) || getCategoriaById(primaryCategoria);
    if (cat) {
      icon = cat.icon;
      label = cat.label;
    } else {
      // Fallback
      label = primaryCategoria;
      icon = '📍';
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full',
        'bg-primary/10 text-primary border border-primary/20',
        'font-medium whitespace-nowrap',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

/**
 * Lista todas as subcategorias como badges
 */
export const SubcategoriasListBadges = ({
  categoria,
  subcategorias,
  className,
  maxShow = 3
}: SubcategoriaBadgeProps & { maxShow?: number }) => {
  const primaryCategoria = Array.isArray(categoria) ? categoria[0] : categoria;
  
  if (!primaryCategoria || !subcategorias || subcategorias.length === 0) {
    return null;
  }

  const cat = getCategoriaByLabel(primaryCategoria) || getCategoriaById(primaryCategoria);
  
  const visibleSubs = subcategorias.slice(0, maxShow);
  const remaining = subcategorias.length - maxShow;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {visibleSubs.map((subId, index) => {
        const sub = cat?.subcategorias.find(s => 
          s.label === subId || 
          s.id === subId ||
          s.label.toLowerCase() === subId.toLowerCase()
        );
        
        const icon = sub?.icon || getSubcategoryIcon(primaryCategoria, subId);
        const label = sub?.label || subId;

        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
          >
            <span>{icon}</span>
            <span>{label}</span>
          </span>
        );
      })}
      
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground px-1">
          +{remaining}
        </span>
      )}
    </div>
  );
};

export default SubcategoriaBadge;
