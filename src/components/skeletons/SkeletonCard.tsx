import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonCard = ({ className, style }: SkeletonCardProps) => {
  return (
    <div className={cn("flex flex-col gap-3 animate-in fade-in duration-300", className)} style={style}>
      {/* Imagem */}
      <div className="relative w-full aspect-[4/3] rounded-xl bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
      </div>
      
      {/* Info */}
      <div className="flex flex-col gap-2 px-1">
        {/* Badge categoria */}
        <div className="relative h-5 w-20 rounded-full bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
        
        {/* Título */}
        <div className="relative h-5 w-3/4 rounded-md bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
        
        {/* Subtítulo */}
        <div className="relative h-4 w-1/2 rounded-md bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
