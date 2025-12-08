import { useMemo, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIAS } from '@/constants/categories';
import { 
  Sparkles,
  Dumbbell,
  Beer,
  Scissors,
  Coffee,
  PartyPopper,
  Cake,
  Clapperboard,
  Hotel,
  ShoppingBag,
  UtensilsCrossed,
  Sparkle,
  Wrench,
  IceCream,
  Store,
  ChevronLeft,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';

// Mapeamento categoria ID → ícone + cores
interface CategoryStyle {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  activeGlow: string;
}

const CATEGORIA_STYLES: Record<string, CategoryStyle> = {
  'todos': {
    icon: Sparkles,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/15',
    borderColor: 'border-violet-500/40',
    activeGlow: 'shadow-violet-500/30'
  },
  'academia': {
    icon: Dumbbell,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/40',
    activeGlow: 'shadow-orange-500/30'
  },
  'bar': {
    icon: Beer,
    color: 'text-red-400',
    bgColor: 'bg-red-500/15',
    borderColor: 'border-red-500/40',
    activeGlow: 'shadow-red-500/30'
  },
  'barbearia': {
    icon: Scissors,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/40',
    activeGlow: 'shadow-blue-500/30'
  },
  'cafeteria': {
    icon: Coffee,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/40',
    activeGlow: 'shadow-amber-500/30'
  },
  'casa-noturna': {
    icon: PartyPopper,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/40',
    activeGlow: 'shadow-purple-500/30'
  },
  'confeitaria': {
    icon: Cake,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/15',
    borderColor: 'border-pink-500/40',
    activeGlow: 'shadow-pink-500/30'
  },
  'entretenimento': {
    icon: Clapperboard,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/40',
    activeGlow: 'shadow-cyan-500/30'
  },
  'hospedagem': {
    icon: Hotel,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/15',
    borderColor: 'border-teal-500/40',
    activeGlow: 'shadow-teal-500/30'
  },
  'loja': {
    icon: ShoppingBag,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/40',
    activeGlow: 'shadow-emerald-500/30'
  },
  'restaurante': {
    icon: UtensilsCrossed,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/15',
    borderColor: 'border-yellow-500/40',
    activeGlow: 'shadow-yellow-500/30'
  },
  'salao': {
    icon: Sparkle,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/40',
    activeGlow: 'shadow-rose-500/30'
  },
  'servicos': {
    icon: Wrench,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/15',
    borderColor: 'border-slate-500/40',
    activeGlow: 'shadow-slate-500/30'
  },
  'sorveteria': {
    icon: IceCream,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/40',
    activeGlow: 'shadow-sky-500/30'
  },
  'outros': {
    icon: Store,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/15',
    borderColor: 'border-gray-500/40',
    activeGlow: 'shadow-gray-500/30'
  },
};

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFadeLeft, setShowFadeLeft] = useState(false);
  const [showFadeRight, setShowFadeRight] = useState(true);

  // Verifica scroll position pra mostrar/esconder fades
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowFadeLeft(scrollLeft > 10);
    setShowFadeRight(scrollLeft < scrollWidth - clientWidth - 10);
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
  }, [estabelecimentos]);

  // Scroll pro item selecionado
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const selectedEl = scrollRef.current.querySelector(`[data-categoria="${categoriaAtiva ?? 'todos'}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [categoriaAtiva]);

  // Scroll com botões (desktop)
  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollAmount = 300;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };
  
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
  
  // Mapear categorias do sistema com estilos
  const categoriasConfig = useMemo(() => {
    const configs: Array<{ 
      id: string | null; 
      categoryId: string;
      nome: string; 
      style: CategoryStyle;
    }> = [
      { 
        id: null, 
        categoryId: 'todos',
        nome: 'Todos', 
        style: CATEGORIA_STYLES['todos']
      },
      ...CATEGORIAS.map(cat => ({
        id: cat.label,
        categoryId: cat.id,
        nome: cat.plural,
        style: CATEGORIA_STYLES[cat.id] || CATEGORIA_STYLES['outros']
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
      {/* Botão esquerda - Desktop */}
      <button
        onClick={() => scrollBy('left')}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex",
          "w-9 h-9 items-center justify-center rounded-full",
          "bg-slate-800/90 border border-white/10 shadow-lg",
          "hover:bg-slate-700 hover:scale-110 transition-all duration-200",
          showFadeLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll para esquerda"
      >
        <ChevronLeft size={18} className="text-white" />
      </button>

      {/* Fade esquerda */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-12 sm:w-16 z-10 pointer-events-none",
          "bg-gradient-to-r from-background via-background/80 to-transparent",
          "transition-opacity duration-300",
          showFadeLeft ? "opacity-100" : "opacity-0"
        )} 
      />
      
      {/* Scroll container - Com padding inicial para não cortar "Todos" */}
      <div 
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto py-4 pl-4 pr-4 md:pl-14 md:pr-14 scrollbar-hide scroll-smooth snap-x snap-proximity"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categoriasConfig.map((cat, index) => {
          const isActive = categoriaAtiva === cat.id;
          const IconComponent = cat.style.icon;
          const style = cat.style;
          
          return (
            <button
              key={cat.id || 'todos'}
              data-categoria={cat.id ?? 'todos'}
              onClick={() => onCategoriaChange(cat.id)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={cn(
                'category-chip group flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[80px] px-3 py-3 rounded-xl border transition-all duration-300 snap-start',
                'animate-fade-in flex-shrink-0',
                isActive
                  ? `${style.bgColor} ${style.borderColor} scale-105 shadow-lg ${style.activeGlow}`
                  : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
              )}
            >
              {/* Ícone SEMPRE iluminado com cor individual */}
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300',
                isActive 
                  ? style.bgColor
                  : `${style.bgColor} group-hover:scale-110`
              )}>
                <IconComponent 
                  size={22} 
                  strokeWidth={1.5} 
                  className={cn(
                    'transition-all duration-300',
                    style.color,
                    isActive && 'drop-shadow-lg'
                  )}
                />
              </div>
              
              {/* Label */}
              <span className={cn(
                'text-xs font-medium whitespace-nowrap transition-colors duration-300',
                isActive 
                  ? 'text-white' 
                  : 'text-slate-400 group-hover:text-slate-300'
              )}>
                {cat.nome}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Fade direita */}
      <div 
        className={cn(
          "absolute right-0 top-0 bottom-0 w-12 sm:w-16 z-10 pointer-events-none",
          "bg-gradient-to-l from-background via-background/80 to-transparent",
          "transition-opacity duration-300",
          showFadeRight ? "opacity-100" : "opacity-0"
        )} 
      />

      {/* Botão direita - Desktop */}
      <button
        onClick={() => scrollBy('right')}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex",
          "w-9 h-9 items-center justify-center rounded-full",
          "bg-slate-800/90 border border-white/10 shadow-lg",
          "hover:bg-slate-700 hover:scale-110 transition-all duration-200",
          showFadeRight ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll para direita"
      >
        <ChevronRight size={18} className="text-white" />
      </button>
    </div>
  );
};