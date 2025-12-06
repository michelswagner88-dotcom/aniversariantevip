import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';
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

// Mapeamento categoria → ícone Lucide
const CATEGORIA_ICONS: Record<string, LucideIcon> = {
  'Academia': Dumbbell,
  'Bar': Beer,
  'Barbearia': Scissors,
  'Cafeteria': Coffee,
  'Casa Noturna': PartyPopper,
  'Confeitaria': Cake,
  'Entretenimento': Clapperboard,
  'Hospedagem': Hotel,
  'Loja': ShoppingBag,
  'Restaurante': UtensilsCrossed,
  'Salão de Beleza': Sparkle,
  'Serviços': Wrench,
  'Sorveteria': IceCream,
  'Outros': Store,
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
    const configs: Array<{ id: string | null; nome: string; Icon: LucideIcon }> = [
      { id: null, nome: 'Todos', Icon: Sparkles },
      ...CATEGORIAS_ESTABELECIMENTO.map(cat => ({
        id: cat.value,
        nome: cat.label,
        Icon: CATEGORIA_ICONS[cat.value] || Store
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
      <div className="flex gap-6 sm:gap-8 overflow-x-auto py-4 scrollbar-hide scroll-smooth">
        {categoriasConfig.map((cat, index) => {
          const isActive = categoriaAtiva === cat.id;
          const IconComponent = cat.Icon;
          
          return (
            <button
              key={cat.id || 'todos'}
              onClick={() => onCategoriaChange(cat.id)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={cn(
                'group flex flex-col items-center gap-2 min-w-[72px] px-2 pb-3 border-b-2 transition-all duration-200 btn-press',
                'animate-fade-in',
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
      
      {/* Fade nas bordas */}
      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
    </div>
  );
};
