import { cn } from '@/lib/utils';

export const AirbnbCardSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[300px]">
      <div className="rounded-2xl overflow-hidden bg-card/50 border border-border/30">
        {/* Imagem skeleton com shimmer premium */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          {/* Placeholder favorito */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          
          {/* Placeholder badge categoria */}
          <div className="absolute bottom-3 left-3 w-20 h-6 rounded-lg bg-black/30 animate-pulse" />
        </div>
        
        {/* Conteúdo skeleton */}
        <div className="p-3 space-y-2.5">
          {/* Nome */}
          <div className="h-5 w-3/4 bg-muted rounded-md overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
          
          {/* Localização */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded-md overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
          </div>
          
          {/* Benefício */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-pink-500/20 animate-pulse" />
              <div className="h-3.5 w-24 bg-muted rounded-md overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AirbnbCardGridSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="flex gap-4 overflow-hidden px-4 md:px-8">
      {Array.from({ length: count }).map((_, i) => (
        <AirbnbCardSkeleton key={i} />
      ))}
    </div>
  );
};
