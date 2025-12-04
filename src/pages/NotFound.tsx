import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, Gift } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Countdown para redirecionamento automático
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Ícone animado */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse">
            404
          </div>
          <Gift className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-violet-400 opacity-30" />
        </div>

        {/* Título */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ops! Página não encontrada
        </h1>

        {/* Descrição */}
        <p className="text-gray-400 mb-2">
          A página <span className="text-violet-400 font-mono">{location.pathname}</span> não existe.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Mas não se preocupe! Você será redirecionado para a home em{' '}
          <span className="text-violet-400 font-bold">{countdown}</span> segundos.
        </p>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Home
          </Button>
          
          <Button
            onClick={() => navigate('/explorar')}
            variant="outline"
            className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
          >
            <Search className="w-4 h-4 mr-2" />
            Explorar
          </Button>
        </div>

        {/* Sugestões */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-500 text-sm mb-4">Páginas populares:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Como Funciona', path: '/como-funciona' },
              { label: 'Seja Parceiro', path: '/seja-parceiro' },
              { label: 'FAQ', path: '/faq' },
              { label: 'Feed', path: '/feed' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-full hover:bg-violet-500/20 hover:text-violet-300 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
