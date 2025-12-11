import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
}

type RedirectReason = "no_session" | "not_estabelecimento" | "not_found" | "incomplete_registration" | "error" | null;

export const ProtectedEstabelecimentoRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectReason, setRedirectReason] = useState<RedirectReason>(null);
  const location = useLocation();

  // Ref para controlar se toast já foi mostrado
  const toastShownRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // 1. Verificar sessão
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (mounted) {
            setRedirectReason("no_session");
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 2. Verificar role do usuário
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!roleData || roleData.role !== "estabelecimento") {
          if (mounted) {
            setRedirectReason("not_estabelecimento");
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 3. CRÍTICO: Verificar se estabelecimento existe E cadastro está completo
        const { data: estabelecimento, error: estabError } = await supabase
          .from("estabelecimentos")
          .select("id, ativo, cadastro_completo, cnpj, nome_fantasia")
          .eq("id", session.user.id)
          .maybeSingle();

        if (estabError || !estabelecimento) {
          if (mounted) {
            setRedirectReason("not_found");
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 4. Verificar campos obrigatórios
        if (!estabelecimento.cadastro_completo || !estabelecimento.cnpj || !estabelecimento.nome_fantasia) {
          if (mounted) {
            setRedirectReason("incomplete_registration");
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 5. Tudo OK
        if (mounted) {
          setIsAuthorized(true);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setRedirectReason("error");
          setIsAuthorized(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listener para mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        if (mounted) {
          setIsAuthorized(false);
          setRedirectReason("no_session");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Toast em useEffect separado para evitar múltiplos disparos
  useEffect(() => {
    if (!isAuthorized && !loading && redirectReason && !toastShownRef.current) {
      toastShownRef.current = true;

      switch (redirectReason) {
        case "no_session":
          toast.error("Faça login para acessar esta página");
          break;
        case "incomplete_registration":
        case "not_found":
          toast.error("Complete seu cadastro para acessar esta página");
          break;
        case "not_estabelecimento":
          // Silencioso - redireciona sem toast
          break;
        case "error":
          toast.error("Erro ao verificar permissões");
          break;
      }
    }
  }, [isAuthorized, loading, redirectReason]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" aria-hidden="true" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
        <span className="sr-only">Verificando permissões de estabelecimento...</span>
      </div>
    );
  }

  // Não autorizado - redirecionar para login
  if (!isAuthorized) {
    return <Navigate to="/login/estabelecimento" state={{ from: location }} replace />;
  }

  // Autorizado - renderizar conteúdo
  return <>{children}</>;
};

export default ProtectedEstabelecimentoRoute;
