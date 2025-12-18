// =============================================================================
// EMPTYSTATEBANNER.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial
// =============================================================================
// FEATURES:
// ✅ Compacto - não empurra conteúdo
// ✅ Estilo toast/inline - discreto
// ✅ Ações úteis: Me avise, Ver capitais, Indicar lugar
// ✅ Fechável (dismissable)
// =============================================================================

import { memo, useState } from "react";
import { X, Bell, MapPin, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

interface EmptyStateBannerProps {
  cidade: string;
  onNotifyMe?: () => void;
  onViewCities?: () => void;
  onSuggestPlace?: () => void;
  variant?: "inline" | "card";
}

// =============================================================================
// INLINE VARIANT - Ultra compacto (tipo toast)
// =============================================================================

const InlineBanner = memo(
  ({ cidade, onNotifyMe, onDismiss }: { cidade: string; onNotifyMe?: () => void; onDismiss: () => void }) => {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2.5",
          "bg-gradient-to-r from-[#240046]/90 to-[#5A189A]/90",
          "rounded-xl",
          "backdrop-blur-sm",
        )}
      >
        {/* Ícone */}
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-violet-300" />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">Ainda não chegamos em {cidade}</p>
          <p className="text-white/60 text-xs">Mostrando outros lugares disponíveis</p>
        </div>

        {/* Ação principal */}
        <Button
          size="sm"
          onClick={onNotifyMe}
          className={cn(
            "h-8 px-3 rounded-lg",
            "bg-white text-[#240046]",
            "hover:bg-white/90",
            "font-medium text-xs",
            "flex-shrink-0",
          )}
        >
          <Bell className="w-3 h-3 mr-1" />
          Avise-me
        </Button>

        {/* Close */}
        <button
          onClick={onDismiss}
          className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>
    );
  },
);
InlineBanner.displayName = "InlineBanner";

// =============================================================================
// CARD VARIANT - Com múltiplas ações
// =============================================================================

const CardBanner = memo(
  ({
    cidade,
    onNotifyMe,
    onViewCities,
    onSuggestPlace,
    onDismiss,
  }: {
    cidade: string;
    onNotifyMe?: () => void;
    onViewCities?: () => void;
    onSuggestPlace?: () => void;
    onDismiss: () => void;
  }) => {
    return (
      <div
        className={cn("relative overflow-hidden", "bg-gradient-to-br from-[#240046] to-[#5A189A]", "rounded-xl", "p-4")}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        {/* Close */}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-violet-300" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-white font-semibold text-sm">Ainda não chegamos em {cidade}</p>
              <p className="text-white/60 text-xs mt-0.5">
                Mostrando lugares de outras cidades. Em breve teremos novidades!
              </p>
            </div>
          </div>

          {/* Actions - Grid compacto */}
          <div className="grid grid-cols-3 gap-2">
            {/* Me avise */}
            <button
              onClick={onNotifyMe}
              className={cn(
                "flex flex-col items-center gap-1 p-2.5",
                "bg-white/10 hover:bg-white/20",
                "rounded-lg transition-colors",
                "group",
              )}
            >
              <Bell className="w-4 h-4 text-violet-300 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-white font-medium">Me avise</span>
            </button>

            {/* Ver capitais */}
            <button
              onClick={onViewCities}
              className={cn(
                "flex flex-col items-center gap-1 p-2.5",
                "bg-white/10 hover:bg-white/20",
                "rounded-lg transition-colors",
                "group",
              )}
            >
              <MapPin className="w-4 h-4 text-violet-300 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-white font-medium">Capitais</span>
            </button>

            {/* Indicar lugar */}
            <button
              onClick={onSuggestPlace}
              className={cn(
                "flex flex-col items-center gap-1 p-2.5",
                "bg-white/10 hover:bg-white/20",
                "rounded-lg transition-colors",
                "group",
              )}
            >
              <Plus className="w-4 h-4 text-violet-300 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-white font-medium">Indicar</span>
            </button>
          </div>
        </div>
      </div>
    );
  },
);
CardBanner.displayName = "CardBanner";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EmptyStateBanner = memo(function EmptyStateBanner({
  cidade,
  onNotifyMe,
  onViewCities,
  onSuggestPlace,
  variant = "inline",
}: EmptyStateBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => setDismissed(true);

  if (variant === "card") {
    return (
      <CardBanner
        cidade={cidade}
        onNotifyMe={onNotifyMe}
        onViewCities={onViewCities}
        onSuggestPlace={onSuggestPlace}
        onDismiss={handleDismiss}
      />
    );
  }

  return <InlineBanner cidade={cidade} onNotifyMe={onNotifyMe} onDismiss={handleDismiss} />;
});

EmptyStateBanner.displayName = "EmptyStateBanner";
export default EmptyStateBanner;
