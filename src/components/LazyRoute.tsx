import { Suspense, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-4" />
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  </div>
);

export const LazyRoute = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);
