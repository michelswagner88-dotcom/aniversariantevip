// =============================================================================
// SECTIONHEADER.TSX - ANIVERSARIANTE VIP
// Design System: Top 1% Mundial
// =============================================================================

import { memo, useCallback, useId } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  linkHref?: string;
  linkText?: string;
  id?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const SectionHeader = memo(
  ({ title, subtitle, count, linkHref, linkText = "Ver todos", id }: SectionHeaderProps) => {
    const generatedId = useId();
    const headingId = id || `section-heading-${generatedId}`;

    const countText = count !== undefined && count > 0 ? `${count} ${count === 1 ? "lugar" : "lugares"}` : null;

    return (
      <header className="flex justify-between items-start sm:items-center gap-4 mb-5 sm:mb-6">
        {/* Title & Subtitle */}
        <div className="flex-1 min-w-0">
          <h2
            id={headingId}
            className={cn(
              "text-lg sm:text-xl lg:text-2xl",
              "font-semibold",
              "text-gray-900",
              "leading-tight",
              "truncate sm:whitespace-normal",
            )}
          >
            {title}
          </h2>

          {subtitle && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{subtitle}</p>}

          {!subtitle && countText && <p className="text-sm text-gray-500 mt-0.5 tabular-nums">{countText}</p>}
        </div>

        {/* Link */}
        {linkHref && (
          <Link
            to={linkHref}
            aria-label={`${linkText} - ${title}`}
            className={cn(
              "group flex items-center gap-1",
              "text-sm font-semibold",
              "text-gray-600 hover:text-gray-900",
              "rounded-lg px-3 py-2 -mr-3",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
              "flex-shrink-0",
              // Touch target mínimo
              "min-h-[44px] min-w-[44px]",
              "flex items-center justify-center",
            )}
          >
            <span className="hidden sm:inline">{linkText}</span>
            <ChevronRight
              size={18}
              className="transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </header>
    );
  },
);

SectionHeader.displayName = "SectionHeader";
export default SectionHeader;
