import { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

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

  // Verificar scroll position para mostrar/esconder fades
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftFade(scrollLeft > 10);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categoriasConfig]);

  // Auto-scroll para pill ativa
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const activeEl = el.querySelector(`[data-category="${categoriaAtiva ?? 'todos'}"]`) as HTMLElement;
    if (activeEl) {
      const containerRect = el.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const scrollLeft = activeRect.left - containerRect.left - (containerRect.width / 2) + (activeRect.width / 2);
      
      el.scrollBy({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [categoriaAtiva]);

  // Scroll com botões (desktop)
  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollAmount = 200;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="relative">
      {/* Botão scroll esquerda (desktop) */}
      <button 
        onClick={() => scrollBy('left')}
        aria-label="Scroll esquerda"
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex',
          'w-9 h-9 items-center justify-center rounded-full',
          'bg-slate-800/90 border border-white/10 text-white',
          'hover:bg-slate-700 hover:scale-105 transition-all duration-200',
          'opacity-0 pointer-events-none',
          showLeftFade && 'opacity-100 pointer-events-auto'
        )}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Fade esquerda - só aparece quando há scroll */}
      <div 
        className={cn(
          'absolute left-0 top-0 bottom-0 w-8 z-[5]',
          'bg-gradient-to-r from-slate-950 to-transparent',
          'pointer-events-none transition-opacity duration-300',
          showLeftFade ? 'opacity-100' : 'opacity-0'
        )} 
      />

      {/* Container scrollável */}
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto py-2 px-4 scroll-smooth scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categoriasConfig.map((cat, index) => {
          const isActive = categoriaAtiva === cat.id;
          const count = cat.id === null ? contagens.todos : (contagens[cat.id] || 0);
          
          return (
            <button
              key={cat.id || 'todos'}
              data-category={cat.id ?? 'todos'}
              onClick={() => onCategoriaChange(cat.id)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full whitespace-nowrap',
                'border text-sm font-medium flex-shrink-0',
                'transition-all duration-200 active:scale-[0.97] [-webkit-tap-highlight-color:transparent]',
                'animate-fade-in opacity-0 [animation-fill-mode:forwards]',
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/30 scale-[1.02]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
              )}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.nome}</span>
              {count > 0 && (
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center',
                  isActive ? 'bg-white/25' : 'bg-white/10'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        {/* Padding extra no final */}
        <div className="w-4 flex-shrink-0" aria-hidden="true" />
      </div>

      {/* Fade direita */}
      <div 
        className={cn(
          'absolute right-0 top-0 bottom-0 w-8 z-[5]',
          'bg-gradient-to-l from-slate-950 to-transparent',
          'pointer-events-none transition-opacity duration-300',
          showRightFade ? 'opacity-100' : 'opacity-0'
        )} 
      />

      {/* Botão scroll direita (desktop) */}
      <button 
        onClick={() => scrollBy('right')}
        aria-label="Scroll direita"
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex',
          'w-9 h-9 items-center justify-center rounded-full',
          'bg-slate-800/90 border border-white/10 text-white',
          'hover:bg-slate-700 hover:scale-105 transition-all duration-200',
          'opacity-0 pointer-events-none',
          showRightFade && 'opacity-100 pointer-events-auto'
        )}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
