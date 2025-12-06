import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getSectionTitle as getTitle, getCategoryTitle, getCategorySubtitle } from '@/utils/sectionTitles';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  linkHref?: string;
  linkText?: string;
}

const SectionHeader = ({ 
  title, 
  subtitle,
  count,
  linkHref, 
  linkText = 'Ver todos' 
}: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6 sm:mb-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground leading-tight">
          {title}
        </h2>
        {subtitle && (
          <span className="text-sm text-muted-foreground">
            {subtitle}
          </span>
        )}
        {!subtitle && count !== undefined && count > 0 && (
          <span className="text-sm text-muted-foreground">
            {count} {count === 1 ? 'lugar' : 'lugares'}
          </span>
        )}
      </div>
      {linkHref && (
        <Link 
          to={linkHref} 
          className="group flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors animated-underline"
        >
          {linkText}
          <ChevronRight 
            size={16} 
            className="transition-transform duration-200 group-hover:translate-x-1" 
          />
        </Link>
      )}
    </div>
  );
};

// Re-export from centralized utility for backwards compatibility
export const getSectionTitle = (categoria: string, cidade?: string | null): string => {
  return getCategoryTitle(categoria, cidade || undefined);
};

export const getDestaquesTitle = (cidade?: string | null): string => {
  return getTitle('destaques', cidade || undefined).titulo;
};

export default SectionHeader;
