import { Home, Search, Zap, User, Newspaper } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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

  // Buscar dados do aniversariante para verificar se cadastro está completo
  const { data: aniversarianteData } = useQuery({
    queryKey: ['aniversariante', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data } = await supabase
        .from('aniversariantes')
        .select('cpf, data_nascimento')
        .eq('id', userId)
        .single();
      
      return data;
    },
    enabled: !!userId,
  });

  // Verificar se o cadastro está completo
  const cadastroCompleto = aniversarianteData?.cpf && aniversarianteData?.data_nascimento;

  // Não renderizar se:
  // - Está em uma rota oculta
  // - Usuário não está logado
  // - Cadastro não está completo
  if (shouldHide || !userId || !cadastroCompleto) {
    return null;
  }

  const navItems = [
    {
      icon: Home,
      label: "Início",
      path: "/",
      activeColor: "text-violet-400",
    },
    {
      icon: Search,
      label: "Explorar",
      path: "/explorar",
      activeColor: "text-violet-400",
    },
    {
      icon: Newspaper,
      label: "Feed",
      path: "/feed",
      activeColor: "text-violet-400",
    },
    {
      icon: Zap,
      label: "Ofertas",
      path: "/flash-deals",
      activeColor: "text-orange-400",
      highlight: true,
    },
    {
      icon: User,
      label: "Perfil",
      path: "/area-aniversariante",
      activeColor: "text-violet-400",
    },
  ];

  const handleNavClick = (path: string) => {
    // Vibração sutil no mobile (se suportado)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    navigate(path);
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

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
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
                      item.highlight
                        ? "bg-gradient-to-r from-orange-400 to-violet-400"
                        : "bg-violet-500"
                    )}
                  />
                )}
              </AnimatePresence>
              
              {/* Container do ícone */}
              <div className={cn(
                "relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200",
                isActive 
                  ? item.highlight 
                    ? "bg-gradient-to-br from-orange-500/15 to-violet-500/15 shadow-[0_0_15px_rgba(251,146,60,0.2)]" 
                    : "bg-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  : "bg-transparent"
              )}>
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive 
                      ? item.highlight
                        ? "text-orange-400"
                        : "text-violet-400"
                      : "text-slate-400"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Badge de destaque para Ofertas */}
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 text-[10px]">🔥</span>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200 tracking-tight",
                isActive 
                  ? item.highlight
                    ? "text-orange-400 font-semibold"
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
