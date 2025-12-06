export const GaleriaGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div 
          key={i} 
          className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden animate-in fade-in duration-300"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
      ))}
    </div>
  );
};
