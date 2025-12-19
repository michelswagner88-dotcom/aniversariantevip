// =============================================================================
// CATEGORIASPILLS.TSX - ANIVERSARIANTE VIP
// Design: Ícones Lucide, underline ativo, scroll horizontal
// =============================================================================

import { memo, useRef } from "react";
import {
  Sparkles,
  Dumbbell,
  Beer,
  Scissors,
  Coffee,
  PartyPopper,
  Gamepad2,
  Hotel,
  Store,
  Paintbrush,
  Utensils,
  IceCream,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// DATA
// =============================================================================

const CATEGORIES = [
  { id: "all", label: "Todos", icon: Sparkles },
  { id: "academia", label: "Academia", icon: Dumbbell },
  { id: "bar", label: "Bar", icon: Beer },
  { id: "barbearia", label: "Barbearia", icon: Scissors },
  { id: "cafeteria", label: "Cafeteria", icon: Coffee },
  { id: "casa noturna", label: "Casa Noturna", icon: PartyPopper },
  { id: "entretenimento", label: "Entretenimento", icon: Gamepad2 },
  { id: "hospedagem", label: "Hospedagem", icon: Hotel },
  { id: "loja", label: "Loja", icon: Store },
  { id: "restaurante", label: "Restaurante", icon: Utensils },
  { id: "salao", label: "Salão", icon: Paintbrush },
  { id: "sorveteria", label: "Sorveteria", icon: IceCream },
];

// =============================================================================
// TYPES
// =============================================================================

interface CategoriasPillsProps {
  selected: string;
  onSelect: (id: string) => void;
  onFilterClick?: () => void;
  filterCount?: number;
}

// =============================================================================
// MAIN
// =============================================================================

export const CategoriasPills = memo(function CategoriasPills({
  selected,
  onSelect,
  onFilterClick,
  filterCount = 0,
}: CategoriasPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-[#240046] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 py-2">
          {/* Categories */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selected === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    "min-w-[60px] px-2 py-2",
                    "relative",
                    "transition-colors",
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-[11px] font-medium whitespace-nowrap text-white"
                  >
                    {cat.label}
                  </span>

                  {/* Underline */}
                  {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          {onFilterClick && <div className="w-px h-8 bg-white/20 flex-shrink-0" />}

          {/* Filter Button */}
          {onFilterClick && (
            <button
              onClick={onFilterClick}
              className={cn(
                "flex items-center gap-2",
                "h-9 px-3",
                "bg-white/10 hover:bg-white/20",
                "rounded-lg",
                "transition-colors",
                "flex-shrink-0",
              )}
            >
              <SlidersHorizontal className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Filtros</span>
              {filterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#240046] text-xs font-bold flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default CategoriasPills;
