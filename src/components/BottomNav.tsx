import { Home, Search, Zap, User, Newspaper } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
      highlight: true, // Destaque especial para flash deals
    },
    {
      icon: User,
      label: "Perfil",
      path: "/area-aniversariante",
      activeColor: "text-violet-400",
    },
  ];

  return (
    <div 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/[0.08]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-180 active:scale-95",
                isActive && "scale-[1.02]"
              )}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <div className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-180",
                isActive 
                  ? item.highlight 
                    ? "bg-gradient-to-br from-orange-500/15 to-violet-500/15 shadow-premium-sm shadow-orange-500/20" 
                    : "bg-violet-500/15 shadow-premium-sm shadow-violet-500/20"
                  : "bg-transparent"
              )}>
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-180",
                    isActive 
                      ? item.highlight
                        ? "text-orange-400"
                        : "text-violet-400"
                      : "text-slate-400"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.highlight && isActive && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-180 tracking-tight",
                isActive 
                  ? item.highlight
                    ? "text-orange-400 font-bold"
                    : "text-violet-400 font-bold"
                  : "text-slate-400"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;