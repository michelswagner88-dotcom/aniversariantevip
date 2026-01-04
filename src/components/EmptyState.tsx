// =============================================================================
// EMPTYSTATE.TSX - ANIVERSARIANTE VIP
// Light theme version
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
      <div className="w-16 h-16 rounded-2xl bg-[#F7F7F8] border border-[#E7E7EA] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[#9CA3AF]" />
      </div>
      <p className="text-[#111827] font-medium">{title}</p>
      <p className="text-[#6B7280] text-sm mt-1">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
});

export default EmptyState;
