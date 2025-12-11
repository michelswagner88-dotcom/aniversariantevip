import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

// Verificar se usuário é admin usando função has_role (SECURITY DEFINER)
const checkIsAdmin = async (
  userId: string,
): Promise<{
  isAdmin: boolean;
  nivel?: string;
}> => {
  try {
    // Usar função has_role que bypassa RLS
    const { data: isAdmin, error: adminError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (adminError) {
      // Erro silencioso em produção
    }

    if (isAdmin) {
      return { isAdmin: true, nivel: "admin" };
    }

    // Verificar se é colaborador
    const { data: isColaborador, error: colabError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "colaborador",
    });

    if (colabError) {
      // Erro silencioso em produção
    }

    if (isColaborador) {
      return { isAdmin: true, nivel: "colaborador" };
    }

    return { isAdmin: false };
  } catch {
    return { isAdmin: false };
  }
};

export const ProtectedAdminRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Ref para o interval - permite cleanup correto
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError || !session) {
          setError("Acesso não autorizado");
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const user = session.user;

        // Verificar se é admin (role + tabela admins)
        const adminCheck = await checkIsAdmin(user.id);

        if (!isMounted) return;

        if (!adminCheck.isAdmin) {
          // Log de tentativa de acesso não autorizado
          try {
            await supabase.from("admin_access_logs").insert({
              user_id: user.id,
              email: user.email || "",
              action: "access_denied",
              endpoint: location.pathname,
              authorized: false,
              metadata: {
                reason: "missing_admin_role",
                timestamp: new Date().toISOString(),
              },
            });
          } catch {
            // Silencioso
          }

          setError("Você não tem permissão para acessar esta área");
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // Atualizar último acesso
        try {
          await supabase.rpc("update_admin_last_access", {
            admin_user_id: user.id,
          });
        } catch {
          // Silencioso
        }

        // Log de acesso autorizado
        try {
          await supabase.from("admin_access_logs").insert({
            user_id: user.id,
            email: user.email || "",
            action: "access_authorized",
            endpoint: location.pathname,
            authorized: true,
            metadata: {
              nivel: adminCheck.nivel,
              timestamp: new Date().toISOString(),
            },
          });
        } catch {
          // Silencioso
        }

        if (!isMounted) return;

        setIsAuthorized(true);
        setLoading(false);

        // Verificação periódica de role a cada 5 minutos
        intervalRef.current = setInterval(
          async () => {
            if (!isMounted) return;

            const stillAdmin = await checkIsAdmin(user.id);

            if (!stillAdmin.isAdmin) {
              // Log role removida
              try {
                await supabase.from("admin_access_logs").insert({
                  user_id: user.id,
                  email: user.email || "",
                  action: "role_revoked",
                  endpoint: location.pathname,
                  authorized: false,
                  metadata: { reason: "permissions_removed_during_session" },
                });
              } catch {
                // Silencioso
              }

              // Forçar logout
              await supabase.auth.signOut();

              if (isMounted) {
                setIsAuthorized(false);
                setError("Suas permissões foram removidas. Faça login novamente.");
              }
            }
          },
          5 * 60 * 1000,
        ); // 5 minutos
      } catch {
        if (isMounted) {
          setError("Erro ao verificar permissões");
          setIsAuthorized(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && isMounted) {
        setIsAuthorized(false);
        setError("Sessão encerrada");
      }
    });

    // Cleanup correto
    return () => {
      isMounted = false;
      subscription.unsubscribe();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [location.pathname]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Não autorizado
  if (!isAuthorized) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center p-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-gray-400 mb-6">{error || "Você não tem permissão para acessar esta área."}</p>
          <Button onClick={() => (window.location.href = "/")} variant="secondary" className="w-full min-h-[44px]">
            Voltar ao Início
          </Button>
          <p className="text-xs text-gray-500 mt-3">
            Se você deveria ter acesso, entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
