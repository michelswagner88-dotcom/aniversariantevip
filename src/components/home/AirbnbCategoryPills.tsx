import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';

interface AirbnbCategoryPillsProps {
  categoriaAtiva: string | null;
  onCategoriaChange: (categoria: string | null) => void;
  estabelecimentos: any[];
}

export const AirbnbCategoryPills = ({
  categoriaAtiva,
  onCategoriaChange,
  estabelecimentos
}: AirbnbCategoryPillsProps) => {
  // Contar estabelecimentos por categoria
  const contagens = useMemo(() => {
    const counts: Record<string, number> = { todos: estabelecimentos.length };
    
    estabelecimentos.forEach(est => {
      const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
      cats.forEach((cat: string) => {
        if (cat) {
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
    });
    
    return counts;
  }, [estabelecimentos]);
  
  // Mapear categorias do sistema
  const categoriasConfig = useMemo(() => {
    const configs = [
      { id: null, nome: 'Todos', icon: '✨' },
      ...CATEGORIAS_ESTABELECIMENTO.map(cat => ({
        id: cat.value,
        nome: cat.label,
        icon: cat.icon
      }))
    ];
    
    // Filtrar apenas categorias com estabelecimentos
    return configs.filter(cat => {
      if (cat.id === null) return true;
      return contagens[cat.id] > 0;
    });
  }, [contagens]);
  
  return (
    <div className="relative">
      {/* Scroll horizontal estilo Airbnb */}
      <div className="flex gap-8 overflow-x-auto py-4 scrollbar-hide">
        {categoriasConfig.map((cat) => {
          const isActive = categoriaAtiva === cat.id;
          
          return (
            <button
              key={cat.id || 'todos'}
              onClick={() => onCategoriaChange(cat.id)}
              className={cn(
                'flex flex-col items-center gap-2 min-w-[56px] pb-3 border-b-2 transition-all',
                isActive
                  ? 'border-violet-500 opacity-100'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-600'
              )}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
              )}>
                {cat.nome}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Fade nas bordas */}
      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white dark:from-slate-950 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-white dark:from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
};