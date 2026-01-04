// =============================================================================
// PANEL SECTION - Card de seção padronizado
// Background branco, borda sutil, sombra leve
// =============================================================================

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelSectionProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PanelSection({
  title,
  description,
  icon,
  actions,
  children,
  className,
  noPadding = false,
}: PanelSectionProps) {
  return (
    <div
      className={cn(
        // Base card styling - Light theme
        "bg-white",
        "border border-[#E7E7EA]",
        "rounded-2xl",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        "transition-shadow duration-200",
        "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {/* Header */}
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E7EA]">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F7F7F8] flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-semibold text-[#111827]">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-[#6B7280] mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Content */}
      <div className={cn(!noPadding && "p-6")}>{children}</div>
    </div>
  );
}

export default PanelSection;
