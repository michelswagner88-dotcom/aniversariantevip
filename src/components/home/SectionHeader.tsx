import { memo, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSectionTitle as getTitle, getCategoryTitle, getCategorySubtitle } from "@/utils/sectionTitles";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  linkHref?: string;
  linkText?: string;
  id?: string;
}

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

export const SectionHeader = memo(
  ({ title, subtitle, count, linkHref, linkText = "Ver todos", id }: SectionHeaderProps) => {
    const reducedMotion = useReducedMotion();

    const handleLinkClick = useCallback(() => {
      if (navigator.vibrate) navigator.vibrate(10);
    }, []);

    const headingId = id || `section-heading-${title.toLowerCase().replace(/\s+/g, "-")}`;
    const countText = count !== undefined && count > 0 ? `${count} ${count === 1 ? "lugar" : "lugares"}` : null;

    return (
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div className="flex flex-col gap-1">
          <h2 id={headingId} className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground leading-tight">
            {title}
          </h2>
          {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
          {!subtitle && countText && <span className="text-sm text-muted-foreground tabular-nums">{countText}</span>}
        </div>

        {linkHref && (
          <Link
            to={linkHref}
            onClick={handleLinkClick}
            aria-label={`${linkText} - ${title}`}
            className={cn(
              "group flex items-center gap-1 text-sm font-semibold",
              "text-muted-foreground",
              "rounded-md px-2 py-1 -mx-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              !reducedMotion && "transition-colors hover:text-foreground",
            )}
          >
            <span className="relative">
              {linkText}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 right-0 h-0.5 bg-current scale-x-0 origin-left",
                  !reducedMotion && "transition-transform duration-200 group-hover:scale-x-100",
                )}
                aria-hidden="true"
              />
            </span>
            <ChevronRight
              size={16}
              className={cn(!reducedMotion && "transition-transform duration-200 group-hover:translate-x-1")}
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    );
  },
);

SectionHeader.displayName = "SectionHeader";

// Re-exports para compatibilidade
export const getSectionTitle = (categoria: string, cidade?: string | null): string => {
  return getCategoryTitle(categoria, cidade || undefined);
};

export const getDestaquesTitle = (cidade?: string | null): string => {
  return getTitle("destaques", cidade || undefined).titulo;
};

export default SectionHeader;
