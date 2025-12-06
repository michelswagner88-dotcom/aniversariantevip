export const SkeletonEstablishmentPage = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Cover */}
      <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
      </div>
      
      {/* Header */}
      <div className="flex gap-4 p-5 -mt-10 relative z-10">
        {/* Logo/Foto */}
        <div className="relative w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 border-4 border-background shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
        
        {/* Info */}
        <div className="flex-1 pt-11 flex flex-col gap-2">
          {/* Nome */}
          <div className="relative h-6 w-3/5 rounded-md bg-muted overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
          </div>
          
          {/* Localização */}
          <div className="relative h-4 w-2/5 rounded-md bg-muted overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
      
      {/* Card de benefício */}
      <div className="mx-5 mt-2">
        <div className="relative h-24 rounded-xl bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="flex gap-3 px-5 mt-4">
        <div className="relative flex-1 h-12 rounded-xl bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
        <div className="relative flex-1 h-12 rounded-xl bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
      </div>
      
      {/* Seção de fotos */}
      <div className="px-5 mt-8">
        <div className="relative h-6 w-32 rounded-md bg-muted overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="relative aspect-square rounded-lg bg-muted overflow-hidden"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Seção de mapa */}
      <div className="px-5 mt-8 pb-8">
        <div className="relative h-6 w-28 rounded-md bg-muted overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
        <div className="relative h-48 rounded-xl bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
