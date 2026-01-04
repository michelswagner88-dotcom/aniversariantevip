// =============================================================================
// ÁREA DO ESTABELECIMENTO - PREMIUM LIGHT v3.0
// Tema Light estilo Stripe/Linear
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Components
import { EstablishmentSidebar } from "@/components/estabelecimento/EstablishmentSidebar";
import { EstablishmentDashboard } from "@/components/estabelecimento/EstablishmentDashboard";
import { EstablishmentProfile } from "@/components/estabelecimento/EstablishmentProfile";
import { EstablishmentBenefit } from "@/components/estabelecimento/EstablishmentBenefit";
import { EstablishmentPhotos } from "@/components/estabelecimento/EstablishmentPhotos";
import { EstablishmentAnalytics } from "@/components/estabelecimento/EstablishmentAnalytics";
import { EstablishmentPreview } from "@/components/estabelecimento/EstablishmentPreview";
import { EstablishmentSettings } from "@/components/estabelecimento/EstablishmentSettings";

// Hooks
import { useEstabelecimentoAnalytics } from "@/hooks/useEstabelecimentoAnalytics";
import { useEstabelecimentoMutations } from "@/hooks/useEstabelecimentoMutations";

// =============================================================================
// TYPES
// =============================================================================

import type { Json } from "@/integrations/supabase/types";

export interface EstabelecimentoData {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  bio: string | null;
  logo_url: string | null;
  fotos: Json | null;
  categoria: string[] | null;
  especialidades: string[] | null;
  cep: string | null;
  estado: string | null;
  cidade: string | null;
  bairro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  horario_funcionamento: string | null;
  descricao_beneficio: string | null;
  tipo_beneficio: string | null;
  periodo_validade_beneficio: string | null;
  regras_utilizacao: string | null;
  ativo: boolean;
  plan_status: string | null;
  slug: string | null;
  created_at: string;
}

export interface AnalyticsData {
  visualizacoes: number;
  visualizacoes7d: number;
  cliquesWhatsapp: number;
  cliquesWhatsapp7d: number;
  cliquesTelefone: number;
  cliquesInstagram: number;
  cliquesSite: number;
  favoritos: number;
  posicaoRanking: number;
  chartData?: Array<{ date: string; views: number; clicks: number }>;
}

type ActiveTab = "dashboard" | "profile" | "benefit" | "photos" | "analytics" | "preview" | "settings";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AreaEstabelecimento() {
  const navigate = useNavigate();

  // Auth state
  const [authState, setAuthState] = useState<"checking" | "authorized" | "unauthorized">("checking");
  const [userId, setUserId] = useState<string | null>(null);

  // Data state
  const [estabelecimento, setEstabelecimento] = useState<EstabelecimentoData | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Use the analytics hook for real data
  const { data: hookAnalytics, isLoading: analyticsLoading } = useEstabelecimentoAnalytics(userId || undefined);

  // Use mutations hook for cache invalidation
  const mutations = useEstabelecimentoMutations();

  // Transform hook data to component format
  const analytics: AnalyticsData | null = hookAnalytics
    ? {
        visualizacoes: hookAnalytics.visualizacoesPerfil,
        visualizacoes7d: hookAnalytics.views7d,
        cliquesWhatsapp: hookAnalytics.cliquesWhatsApp,
        cliquesWhatsapp7d: 0,
        cliquesTelefone: hookAnalytics.cliquesTelefone,
        cliquesInstagram: hookAnalytics.cliquesInstagram,
        cliquesSite: hookAnalytics.cliquesSite,
        favoritos: hookAnalytics.favoritosAdicionados,
        posicaoRanking: 0,
        chartData: hookAnalytics.engajamentoPorDia,
      }
    : null;

  // =========================================================================
  // AUTH CHECK
  // =========================================================================

  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        navigate("/login/estabelecimento", { replace: true });
        return;
      }

      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/login/estabelecimento", { replace: true });
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (rolesError) {
        console.error("Roles error:", rolesError);
        navigate("/login/estabelecimento", { replace: true });
        return;
      }

      const isEstabelecimento = roles?.some((r) => r.role === "estabelecimento");

      if (!isEstabelecimento) {
        console.log("User is not estabelecimento, redirecting");
        toast.error("Acesso não autorizado para este painel");
        await supabase.auth.signOut();
        navigate("/login/estabelecimento", { replace: true });
        return;
      }

      setAuthState("authorized");
      setUserId(session.user.id);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login/estabelecimento", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_OUT") {
        setAuthState("unauthorized");
        setUserId(null);
        navigate("/login/estabelecimento", { replace: true });
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        checkAuth();
      } else if (event === "INITIAL_SESSION") {
        if (!session) {
          navigate("/login/estabelecimento", { replace: true });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, checkAuth]);

  // =========================================================================
  // LOAD DATA
  // =========================================================================

  useEffect(() => {
    if (authState !== "authorized" || !userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data: estab, error: estabError } = await supabase
          .from("estabelecimentos")
          .select("*")
          .eq("id", userId)
          .single();

        if (estabError) {
          console.error("Error loading estabelecimento:", estabError);
          throw estabError;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        setEstabelecimento({
          ...estab,
          email: session?.user.email || null,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados do estabelecimento");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authState, userId]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleUpdateEstabelecimento = async (updates: Partial<EstabelecimentoData>) => {
    if (!userId) return false;

    try {
      await mutations.updateAsync({ id: userId, data: updates });
      setEstabelecimento((prev) => (prev ? { ...prev, ...updates } : null));
      return true;
    } catch (error) {
      console.error("Error updating:", error);
      return false;
    }
  };

  const handleToggleAtivo = async (ativo: boolean) => {
    if (!userId) return;
    try {
      await mutations.updateAsync({ id: userId, data: { ativo } });
      setEstabelecimento((prev) => (prev ? { ...prev, ativo } : null));
    } catch (error) {
      console.error("Error toggling ativo:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  // =========================================================================
  // LOADING STATE - Light theme
  // =========================================================================

  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#240046] animate-spin" />
          <p className="text-[#6B7280] text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (authState === "unauthorized") {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#240046] animate-spin" />
          <p className="text-[#6B7280] text-sm">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER - Light theme
  // =========================================================================

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex">
      {/* Sidebar */}
      <EstablishmentSidebar
        estabelecimento={estabelecimento}
        activeTab={activeTab}
        collapsed={sidebarCollapsed}
        onNavigate={handleNavigate}
        onCollapsedChange={setSidebarCollapsed}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main
        className={cn("flex-1 min-h-screen transition-all duration-200", sidebarCollapsed ? "lg:ml-16" : "lg:ml-64")}
      >
        <div className="p-4 lg:p-8 max-w-7xl">
          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <EstablishmentDashboard
              estabelecimento={estabelecimento}
              analytics={analytics}
              loading={loading}
              onNavigate={handleNavigate}
              onToggleAtivo={handleToggleAtivo}
            />
          )}

          {activeTab === "profile" && (
            <EstablishmentProfile
              estabelecimento={estabelecimento}
              loading={loading}
              onUpdate={handleUpdateEstabelecimento}
            />
          )}

          {activeTab === "benefit" && (
            <EstablishmentBenefit
              estabelecimento={estabelecimento}
              loading={loading}
              onUpdate={handleUpdateEstabelecimento}
            />
          )}

          {activeTab === "photos" && (
            <EstablishmentPhotos
              estabelecimento={estabelecimento}
              loading={loading}
              onUpdate={handleUpdateEstabelecimento}
            />
          )}

          {activeTab === "analytics" && (
            <EstablishmentAnalytics
              estabelecimentoId={userId || ""}
              analytics={analytics}
              loading={loading || analyticsLoading}
            />
          )}

          {activeTab === "preview" && <EstablishmentPreview estabelecimento={estabelecimento} />}

          {activeTab === "settings" && (
            <EstablishmentSettings
              estabelecimento={estabelecimento}
              onUpdate={handleUpdateEstabelecimento}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>
    </div>
  );
}
