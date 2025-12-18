// =============================================================================
// EMPTYSTATE.TSX - ANIVERSARIANTE VIP
// =============================================================================

import { memo } from "react";
import { Gift, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface EmptyStateProps {
  icon?: "gift" | "search" | "location";
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const EmptyState = memo(function EmptyState({
  icon = "gift",
  title = "Nenhum resultado",
  description = "Tente ajustar os filtros",
  action,
  className,
}: EmptyStateProps) {
  const Icon = {
    gift: Gift,
    search: Search,
    location: MapPin,
  }[icon];

  return (
    <div className={cn("text-center py-16", className)}>
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-900 font-medium">{title}</p>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
});

export default EmptyState;
