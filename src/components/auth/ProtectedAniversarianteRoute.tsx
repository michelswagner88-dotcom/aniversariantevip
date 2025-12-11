import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
}

type RedirectReason = "no_session" | "not_aniversariante" | "incomplete_registration" | "error" | null;

export const ProtectedAniversarianteRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [redirectReason, setRedirectReason] = useState<RedirectReason>(null);
  const location = useLocation();

  // Ref para controlar se toast já foi mostrado
  const toastShownRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // 1. Verificar se tem sessão
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (mounted) {
            setRedirectTo("/auth");
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

        if (!roleData || roleData.role !== "aniversariante") {
          if (mounted) {
            setRedirectTo("/");
            setRedirectReason("not_aniversariante");
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 3. CRÍTICO: Verificar se cadastro está COMPLETO com TODOS os campos obrigatórios
        const { data: aniversariante, error: anivError } = await supabase
          .from("aniversariantes")
          .select("id, cadastro_completo, cpf, data_nascimento, telefone, cidade, estado, cep, logradouro, bairro")
          .eq("id", session.user.id)
          .maybeSingle();

        if (anivError || !aniversariante) {
          if (mounted) {
            setRedirectTo("/auth");
            setRedirectReason("incomplete_registration");
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 4. Verificar flag cadastro_completo E campos obrigatórios
        const camposObrigatorios = {
          cpf: aniversariante.cpf,
          data_nascimento: aniversariante.data_nascimento,
          telefone: aniversariante.telefone,
          cidade: aniversariante.cidade,
          estado: aniversariante.estado,
          cep: aniversariante.cep,
          logradouro: aniversariante.logradouro,
          bairro: aniversariante.bairro,
        };

        const camposFaltando = Object.entries(camposObrigatorios)
          .filter(([, value]) => !value || value === "")
          .map(([key]) => key);

        if (!aniversariante.cadastro_completo || camposFaltando.length > 0) {
          if (mounted) {
            // Redirecionar para completar cadastro com flag
            sessionStorage.setItem("needsCompletion", "true");
            sessionStorage.setItem("forceStep2", "true");
            setRedirectTo("/auth");
            setRedirectReason("incomplete_registration");
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 5. Tudo OK - autorizado
        if (mounted) {
          setIsAuthorized(true);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setRedirectTo("/auth");
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
          setRedirectTo("/auth");
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
    if (redirectTo && !toastShownRef.current && redirectReason) {
      toastShownRef.current = true;

      switch (redirectReason) {
        case "no_session":
          toast.error("Faça login para acessar esta página");
          break;
        case "incomplete_registration":
          toast.error("Complete seu cadastro para acessar esta página");
          break;
        case "not_aniversariante":
          // Sem toast - redireciona silenciosamente
          break;
        case "error":
          toast.error("Erro ao verificar permissões");
          break;
      }
    }
  }, [redirectTo, redirectReason]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" aria-hidden="true" />
        <span className="sr-only">Verificando permissões...</span>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAniversarianteRoute;
