// =============================================================================
// EMPTYSTATEBANNER.TSX - ANIVERSARIANTE VIP
// Design: Discreto, branco, não compete com a ação principal
// =============================================================================

import { memo, useState } from "react";
import { MapPin, Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface EmptyStateBannerProps {
  cidade: string;
  onNotifyMe?: () => void;
}

// =============================================================================
// MAIN
// =============================================================================

export const EmptyStateBanner = memo(function EmptyStateBanner({ cidade, onNotifyMe }: EmptyStateBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={cn("flex items-center gap-3", "p-3", "bg-gray-50", "border border-gray-200", "rounded-xl")}>
      {/* Icon */}
      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <MapPin className="w-4 h-4 text-gray-500" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">Ainda não chegamos em {cidade}</p>
        <p className="text-xs text-gray-500">Mostrando outros lugares</p>
      </div>

      {/* Actions */}
      <button
        onClick={onNotifyMe}
        className="h-8 px-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0 flex items-center gap-1.5"
      >
        <Bell className="w-3.5 h-3.5" />
        Avise-me
      </button>

      <button
        onClick={() => setDismissed(true)}
        className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center flex-shrink-0"
        aria-label="Fechar"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
});

export default EmptyStateBanner;
