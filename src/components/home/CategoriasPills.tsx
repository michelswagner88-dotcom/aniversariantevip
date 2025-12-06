import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';

interface CategoriasPillsProps {
  categoriaAtiva: string | null;
  onCategoriaChange: (categoria: string | null) => void;
  estabelecimentos: any[];
}

export const CategoriasPills = ({
  categoriaAtiva,
  onCategoriaChange,
  estabelecimentos
}: CategoriasPillsProps) => {
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
      { id: null, nome: 'Todos', icon: '🚀' },
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
    <div className="relative -mx-4 px-4">
      {/* Scroll horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categoriasConfig.map((cat) => {
          const isActive = categoriaAtiva === cat.id;
          const count = cat.id === null ? contagens.todos : (contagens[cat.id] || 0);
          
          return (
            <button
              key={cat.id || 'todos'}
              onClick={() => onCategoriaChange(cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-full whitespace-nowrap transition-all duration-200',
                'border text-sm font-medium active:scale-[0.97] [-webkit-tap-highlight-color:transparent]',
                isActive
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              )}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.nome}</span>
              {count > 0 && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-white/20' : 'bg-white/10'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Fade nas bordas */}
      <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
};
