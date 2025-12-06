import { Home, Search, Heart, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);

  // Páginas onde a barra NÃO deve aparecer
  const hiddenRoutes = [
    '/auth',
    '/selecionar-perfil',
    '/cadastro/aniversariante',
    '/cadastro/estabelecimento',
    '/login/aniversariante',
    '/login/estabelecimento',
    '/login/colaborador',
    '/admin',
    '/admin/dashboard',
    '/admin/import',
    '/setup-admin',
    '/forgot-password',
    '/update-password',
    '/area-estabelecimento',
    '/area-colaborador',
  ];

  // Verificar se está em uma rota onde a barra não deve aparecer
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Não renderizar se está em uma rota oculta
  if (shouldHide) {
    return null;
  }

  // Itens que requerem login
  const requiresAuth = ['favoritos', 'perfil'];

  const navItems = [
    {
      id: 'inicio',
      icon: Home,
      label: "Início",
      path: "/",
      activeColor: "text-violet-400",
    },
    {
      id: 'explorar',
      icon: Search,
      label: "Explorar",
      path: "/explorar",
      activeColor: "text-violet-400",
    },
    {
      id: 'favoritos',
      icon: Heart,
      label: "Favoritos",
      path: "/meus-favoritos",
      activeColor: "text-rose-400",
      requiresAuth: true,
    },
    {
      id: 'perfil',
      icon: User,
      label: "Perfil",
      path: "/area-aniversariante",
      activeColor: "text-violet-400",
      requiresAuth: true,
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    // Vibração sutil no mobile (se suportado)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Se requer auth e não está logado, redireciona para login
    if (item.requiresAuth && !userId) {
      navigate('/auth');
      return;
    }
    
    navigate(item.path);
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 50
      }}
    >
      <div className="flex items-center justify-around px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
          const isFavorite = item.id === 'favoritos';

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-2 px-3 transition-all duration-200",
                "active:scale-95 touch-manipulation",
                "-webkit-tap-highlight-color: transparent",
                isActive && "scale-[1.02]"
              )}
              style={{ minWidth: '56px', minHeight: '56px' }}
            >
              {/* Indicador ativo superior */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    className={cn(
                      "absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-b-full",
                      isFavorite
                        ? "bg-gradient-to-r from-rose-400 to-pink-400"
                        : "bg-violet-500"
                    )}
                  />
                )}
              </AnimatePresence>
              
              {/* Container do ícone */}
              <div className={cn(
                "relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200",
                isActive 
                  ? isFavorite 
                    ? "bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.2)]" 
                    : "bg-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  : "bg-transparent"
              )}>
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive 
                      ? isFavorite
                        ? "text-rose-400"
                        : "text-violet-400"
                      : "text-slate-400"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isFavorite && isActive ? 'currentColor' : 'none'}
                />
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200 tracking-tight",
                isActive 
                  ? isFavorite
                    ? "text-rose-400 font-semibold"
                    : "text-violet-400 font-semibold"
                  : "text-slate-500"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
