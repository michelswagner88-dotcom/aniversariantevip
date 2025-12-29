// =============================================================================
// PROTECTED ESTABELECIMENTO ROUTE - V2.0
// CORREÇÕES:
// - P0.1: Fix "Verificando acesso..." travando após cadastro
// - Refresh de sessão para garantir dados atualizados
// - Verificação mais flexível (cadastro_completo OU campos essenciais)
// - Melhor tratamento de race conditions
// =============================================================================

import { useEffect, useState, useRef, useCallback } from "react";
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

  // Refs para controle
  const toastShownRef = useRef(false);
  const checkInProgressRef = useRef(false);

  const checkAuth = useCallback(async () => {
    // Evitar verificações simultâneas
    if (checkInProgressRef.current) return;
    checkInProgressRef.current = true;

    try {
      // 1. Refresh da sessão para garantir dados atualizados
      // Isso é crucial após o cadastro para evitar cache stale
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[Guard] Erro ao obter sessão:", sessionError);
        setRedirectReason("error");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (!session) {
        console.log("[Guard] Sem sessão ativa");
        setRedirectReason("no_session");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      console.log("[Guard] Sessão encontrada:", session.user.id);

      // 2. Verificar role do usuário
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "estabelecimento")
        .maybeSingle();

      if (roleError) {
        console.error("[Guard] Erro ao verificar role:", roleError);
        setRedirectReason("error");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (!roleData) {
        console.log("[Guard] Usuário não tem role de estabelecimento");
        setRedirectReason("not_estabelecimento");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // 3. Verificar se estabelecimento existe
      const { data: estabelecimento, error: estabError } = await supabase
        .from("estabelecimentos")
        .select("id, ativo, cadastro_completo, cnpj, nome_fantasia, razao_social")
        .eq("id", session.user.id)
        .maybeSingle();

      if (estabError) {
        console.error("[Guard] Erro ao buscar estabelecimento:", estabError);
        setRedirectReason("error");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (!estabelecimento) {
        console.log("[Guard] Estabelecimento não encontrado para user:", session.user.id);
        setRedirectReason("not_found");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // 4. VERIFICAÇÃO FLEXÍVEL - Aceita se:
      //    - cadastro_completo = true, OU
      //    - Tem CNPJ E (nome_fantasia OU razao_social)
      const hasCadastroCompleto = estabelecimento.cadastro_completo === true;
      const hasEssentialFields = !!(
        estabelecimento.cnpj &&
        (estabelecimento.nome_fantasia || estabelecimento.razao_social)
      );

      const isComplete = hasCadastroCompleto || hasEssentialFields;

      console.log("[Guard] Verificação:", {
        cadastro_completo: estabelecimento.cadastro_completo,
        cnpj: !!estabelecimento.cnpj,
        nome_fantasia: !!estabelecimento.nome_fantasia,
        razao_social: !!estabelecimento.razao_social,
        isComplete,
      });

      if (!isComplete) {
        console.log("[Guard] Cadastro incompleto");
        setRedirectReason("incomplete_registration");
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // 5. Tudo OK - Autorizado!
      console.log("[Guard] ✅ Autorizado!");
      setIsAuthorized(true);
      setRedirectReason(null);
      setLoading(false);
    } catch (error) {
      console.error("[Guard] Erro inesperado:", error);
      setRedirectReason("error");
      setIsAuthorized(false);
      setLoading(false);
    } finally {
      checkInProgressRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Verificação inicial
    checkAuth();

    // Listener para mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Guard] Auth event:", event);

      if (event === "SIGNED_OUT") {
        setIsAuthorized(false);
        setRedirectReason("no_session");
        setLoading(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Re-verificar quando há login ou refresh de token
        // Isso garante que após o cadastro, a verificação seja refeita
        setLoading(true);
        toastShownRef.current = false; // Reset toast
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  // Toast em useEffect separado para evitar múltiplos disparos
  useEffect(() => {
    if (!isAuthorized && !loading && redirectReason && !toastShownRef.current) {
      toastShownRef.current = true;

      switch (redirectReason) {
        case "no_session":
          toast.error("Faça login para acessar esta página");
          break;
        case "incomplete_registration":
          toast.error("Complete seu cadastro para acessar esta página");
          break;
        case "not_found":
          toast.error("Estabelecimento não encontrado. Complete o cadastro.");
          break;
        case "not_estabelecimento":
          // Silencioso - usuário pode ser aniversariante tentando acessar área errada
          break;
        case "error":
          toast.error("Erro ao verificar permissões. Tente novamente.");
          break;
      }
    }
  }, [isAuthorized, loading, redirectReason]);

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" aria-hidden="true" />
          <p className="text-zinc-500">Verificando acesso...</p>
        </div>
        <span className="sr-only">Verificando permissões de estabelecimento...</span>
      </div>
    );
  }

  // Não autorizado - redirecionar
  if (!isAuthorized) {
    // Determinar destino do redirect baseado no motivo
    const redirectTo =
      redirectReason === "incomplete_registration" || redirectReason === "not_found"
        ? "/cadastro-estabelecimento"
        : "/login/estabelecimento";

    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Autorizado - renderizar conteúdo
  return <>{children}</>;
};

export default ProtectedEstabelecimentoRoute;
