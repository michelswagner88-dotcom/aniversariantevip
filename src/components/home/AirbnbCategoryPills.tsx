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
  type LucideIcon
} from 'lucide-react';

// Mapeamento categoria ID → ícone Lucide
const CATEGORIA_ICONS: Record<string, LucideIcon> = {
  'academia': Dumbbell,
  'bar': Beer,
  'barbearia': Scissors,
  'cafeteria': Coffee,
  'casa-noturna': PartyPopper,
  'confeitaria': Cake,
  'entretenimento': Clapperboard,
  'hospedagem': Hotel,
  'loja': ShoppingBag,
  'restaurante': UtensilsCrossed,
  'salao': Sparkle,
  'servicos': Wrench,
  'sorveteria': IceCream,
  'outros': Store,
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
  
  // Mapear categorias do sistema - usando PLURAL para filtros
  const categoriasConfig = useMemo(() => {
    const configs: Array<{ id: string | null; nome: string; Icon: LucideIcon }> = [
      { id: null, nome: 'Todos', Icon: Sparkles },
      ...CATEGORIAS.map(cat => ({
        id: cat.label, // Usa label para filtrar (compatibilidade com dados)
        nome: cat.plural, // PLURAL para exibição nos pills
        Icon: CATEGORIA_ICONS[cat.id] || Store
      }))
    ];
    
    // Filtrar apenas categorias com estabelecimentos
    return configs.filter(cat => {
      if (cat.id === null) return true;
      return contagens[cat.id] > 0;
    });
  }, [contagens]);
  
  return (
    <div className="relative -mx-4 sm:-mx-6">
      {/* Fade esquerda - dinâmico */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-8 sm:w-12 z-10 pointer-events-none",
          "bg-gradient-to-r from-background to-transparent",
          "transition-opacity duration-300",
          showFadeLeft ? "opacity-100" : "opacity-0"
        )} 
      />
      
      {/* Scroll container */}
      <div 
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto py-4 px-4 sm:px-6 scrollbar-hide scroll-smooth snap-x snap-proximity"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categoriasConfig.map((cat, index) => {
          const isActive = categoriaAtiva === cat.id;
          const IconComponent = cat.Icon;
          
          return (
            <button
              key={cat.id || 'todos'}
              data-categoria={cat.id ?? 'todos'}
              onClick={() => onCategoriaChange(cat.id)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={cn(
                'group flex flex-col items-center gap-2 min-w-[68px] sm:min-w-[72px] px-2 pb-3 border-b-2 transition-all duration-200 btn-press snap-start',
                'animate-fade-in flex-shrink-0',
                isActive
                  ? 'border-foreground'
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              {/* Ícone com container */}
              <div className={cn(
                'flex items-center justify-center w-6 h-6 transition-colors',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground group-hover:text-foreground'
              )}>
                <IconComponent size={24} strokeWidth={1.5} />
              </div>
              
              {/* Label */}
              <span className={cn(
                'text-xs font-medium whitespace-nowrap transition-colors',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {cat.nome}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Fade direita - dinâmico */}
      <div 
        className={cn(
          "absolute right-0 top-0 bottom-0 w-8 sm:w-12 z-10 pointer-events-none",
          "bg-gradient-to-l from-background to-transparent",
          "transition-opacity duration-300",
          showFadeRight ? "opacity-100" : "opacity-0"
        )} 
      />
    </div>
  );
};
