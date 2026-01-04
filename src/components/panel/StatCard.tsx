// =============================================================================
// STAT CARD - KPI card redesenhado para tema light
// Ícone neutro, valor em destaque, hover elegante
// =============================================================================

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, HelpCircle, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconClassName?: string;
  loading?: boolean;
  onClick?: () => void;
  tooltip?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconClassName,
  loading = false,
  onClick,
  tooltip,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  if (loading) {
    return (
      <div
        className={cn(
          "bg-white border border-[#E7E7EA] rounded-2xl p-5",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
          className
        )}
      >
        <Skeleton className="h-4 w-20 mb-3 bg-[#E7E7EA]" />
        <Skeleton className="h-8 w-24 mb-2 bg-[#E7E7EA]" />
        <Skeleton className="h-3 w-16 bg-[#E7E7EA]" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        // Base styling
        "bg-white border border-[#E7E7EA] rounded-2xl p-5",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        "transition-all duration-150 ease-out",
        // Hover & Interactive
        onClick && "cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-[#D1D1D6]",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2 rounded-xl bg-[#F7F7F8]", iconClassName)}>
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {tooltip && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[200px] text-xs bg-[#111827] text-white border-0"
                >
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onClick && <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />}
        </div>
      </div>

      {/* Title */}
      <p className="text-sm text-[#6B7280] mb-1">{title}</p>

      {/* Value */}
      <p className="text-2xl font-bold text-[#111827]">{value}</p>

      {/* Change indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          {isPositive && <ArrowUpRight className="w-3 h-3 text-emerald-600" />}
          {isNegative && <ArrowDownRight className="w-3 h-3 text-red-500" />}
          <span
            className={cn(
              isPositive && "text-emerald-600",
              isNegative && "text-red-500",
              !isPositive && !isNegative && "text-[#9CA3AF]"
            )}
          >
            {isPositive && "+"}
            {change}%
          </span>
          {changeLabel && (
            <span className="text-[#9CA3AF] ml-1">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
