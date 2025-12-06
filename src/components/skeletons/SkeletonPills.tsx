const PILL_WIDTHS = [70, 110, 80, 120, 90, 100, 85, 95];

export const SkeletonPills = () => {
  return (
    <div className="flex gap-2 py-4 overflow-hidden">
      {PILL_WIDTHS.map((width, index) => (
        <div 
          key={index} 
          className="relative h-11 rounded-full bg-muted flex-shrink-0 overflow-hidden animate-in fade-in duration-300"
          style={{ 
            width: `${width}px`,
            animationDelay: `${index * 30}ms`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
      ))}
    </div>
  );
};
