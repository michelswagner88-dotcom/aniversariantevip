import { Skeleton } from '@/components/ui/skeleton';

export const EstabelecimentoCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in fade-in duration-300">
      {/* Imagem skeleton com shimmer */}
      <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
      </div>
      
      <div className="p-4 space-y-3">
        {/* Badge categoria */}
        <Skeleton className="w-24 h-5 rounded-full" />
        
        {/* Nome do estabelecimento */}
        <Skeleton className="w-full h-6" />
        
        {/* Bairro/Cidade */}
        <Skeleton className="w-3/4 h-4" />
        
        {/* Especialidades */}
        <div className="flex gap-2">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-20 h-5 rounded-full" />
        </div>
        
        {/* Botão benefício */}
        <Skeleton className="w-full h-10 mt-2 rounded-xl" />
      </div>
    </div>
  );
};
