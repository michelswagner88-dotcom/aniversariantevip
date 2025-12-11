import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "colaborador" | "aniversariante" | "estabelecimento";
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, requiredRole, redirectTo = "/auth" }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Verificar sessão
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(session.user);

        // Se não precisa verificar role, já está autenticado
        if (!requiredRole) {
          setHasRole(true);
          setLoading(false);
          return;
        }

        // Verificar role específica
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", requiredRole)
          .maybeSingle();

        if (roleError) throw roleError;

        if (!mounted) return;

        setHasRole(!!roleData);
        setLoading(false);
      } catch {
        if (mounted) {
          setUser(null);
          setHasRole(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setHasRole(false);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session.user);

        if (!requiredRole) {
          setHasRole(true);
          setLoading(false);
          return;
        }

        // Defer role check para permitir que triggers do banco executem
        setTimeout(async () => {
          try {
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", requiredRole)
              .maybeSingle();

            if (mounted) {
              setHasRole(!!roleData);
              setLoading(false);
            }
          } catch {
            if (mounted) {
              setHasRole(false);
              setLoading(false);
            }
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" aria-hidden="true" />
          <p className="text-sm text-slate-400">Verificando acesso...</p>
        </div>
        <span className="sr-only">Verificando permissões de acesso...</span>
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Autenticado mas sem a role necessária
  if (requiredRole && !hasRole) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-950 p-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldX className="w-10 h-10 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso Negado</h1>
          <p className="text-slate-400">Você não tem permissão para acessar esta área.</p>
          <Button onClick={() => window.history.back()} variant="default" className="mt-6 min-h-[44px] px-6">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // Autenticado e com permissão
  return <>{children}</>;
};
