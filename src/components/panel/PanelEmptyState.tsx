// =============================================================================
// PANEL EMPTY STATE - Estado vazio padronizado
// Design neutro, sem cores berrantes
// =============================================================================

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Gift, Search, MapPin, Image, BarChart3 } from "lucide-react";

type IconType = "gift" | "search" | "location" | "photos" | "analytics";

interface PanelEmptyStateProps {
  icon?: IconType;
  customIcon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const ICONS: Record<IconType, React.ComponentType<{ className?: string }>> = {
  gift: Gift,
  search: Search,
  location: MapPin,
  photos: Image,
  analytics: BarChart3,
};

export function PanelEmptyState({
  icon = "gift",
  customIcon,
  title = "Nenhum resultado",
  description = "Tente ajustar os filtros",
  action,
  className,
}: PanelEmptyStateProps) {
  const IconComponent = ICONS[icon];

  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#F7F7F8] border border-[#E7E7EA] flex items-center justify-center mx-auto mb-4">
        {customIcon || (
          <IconComponent className="w-7 h-7 text-[#9CA3AF]" />
        )}
      </div>

      {/* Text */}
      <p className="text-[#111827] font-medium text-base">{title}</p>
      <p className="text-[#6B7280] text-sm mt-1 max-w-sm mx-auto">
        {description}
      </p>

      {/* Action */}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default PanelEmptyState;
