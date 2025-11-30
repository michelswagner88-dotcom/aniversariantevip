import { Suspense, ReactNode, useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const PageLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    'Preparando magia...',
    'Quase lá...',
    'Carregando experiência VIP...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-6">
        {/* Logo animado */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 mx-auto animate-pulse" />
          <Sparkles className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* Shimmer bar */}
        <div className="relative w-48 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">
          <div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        </div>
        
        {/* Mensagem rotativa */}
        <p className="text-slate-400 text-sm animate-fade-in">
          {messages[messageIndex]}
        </p>
      </div>
    </div>
  );
};

export const LazyRoute = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);
