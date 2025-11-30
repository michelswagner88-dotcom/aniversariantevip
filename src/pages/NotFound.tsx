import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Gradient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="text-center relative z-10 px-6">
        {/* 404 com gradiente */}
        <h1 className="mb-4 text-8xl font-plus-jakarta font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          404
        </h1>
        
        <p className="mb-2 text-2xl font-bold text-white">
          Ops! Página não encontrada
        </p>
        
        <p className="mb-8 text-slate-400 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold transition-all shadow-lg shadow-violet-500/20"
          >
            <Home size={18} />
            Voltar para o início
          </a>
          
          <a 
            href="/explorar" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
          >
            <Search size={18} />
            Explorar estabelecimentos
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
