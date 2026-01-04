// =============================================================================
// PANEL LAYOUT - Shell principal do painel do estabelecimento
// Tema Light Premium estilo Stripe/Linear
// =============================================================================

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PanelLayout({ children, className }: PanelLayoutProps) {
  return (
    <div
      className={cn(
        // Base: Light theme premium
        "min-h-screen",
        "bg-[#F7F7F8]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default PanelLayout;
