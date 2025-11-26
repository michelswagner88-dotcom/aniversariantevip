import { Home, Search, Zap, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 active:scale-95",
                isActive && "scale-105"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                isActive 
                  ? item.highlight 
                    ? "bg-gradient-to-br from-orange-500/20 to-violet-500/20 shadow-lg shadow-orange-500/20" 
                    : "bg-violet-500/20 shadow-lg shadow-violet-500/20"
                  : "bg-transparent"
              )}>
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive 
                      ? item.highlight
                        ? "text-orange-400"
                        : "text-violet-400"
                      : "text-slate-400"
                  )}
                />
                {item.highlight && isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-300",
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