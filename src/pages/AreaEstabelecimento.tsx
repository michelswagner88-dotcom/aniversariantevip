// =============================================================================
// ÁREA DO ESTABELECIMENTO - PREMIUM v2.0
// Dashboard moderno estilo Stripe/Vercel
// Sem sistema de cupons - foco em presença e engajamento
// =============================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  // Chart data from useEstabelecimentoAnalytics hook
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

  // Use the analytics hook for real data
  const { data: hookAnalytics, isLoading: analyticsLoading } = useEstabelecimentoAnalytics(userId || undefined);

  // Transform hook data to component format
  const analytics: AnalyticsData | null = hookAnalytics ? {
    visualizacoes: hookAnalytics.visualizacoesPerfil,
    visualizacoes7d: hookAnalytics.views7d,
    cliquesWhatsapp: hookAnalytics.cliquesWhatsApp,
    cliquesWhatsapp7d: 0, // Not tracked separately in hook
    cliquesTelefone: hookAnalytics.cliquesTelefone,
    cliquesInstagram: hookAnalytics.cliquesInstagram,
    cliquesSite: hookAnalytics.cliquesSite,
    favoritos: hookAnalytics.favoritosAdicionados,
    posicaoRanking: 0,
    chartData: hookAnalytics.engajamentoPorDia,
  } : null;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // =========================================================================
  // AUTH CHECK
  // =========================================================================

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/login/estabelecimento", { replace: true });
          return;
        }

        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);

        const isEstabelecimento = roles?.some((r) => r.role === "estabelecimento");

        if (!isEstabelecimento) {
          navigate("/", { replace: true });
          return;
        }

        setAuthState("authorized");
        setUserId(session.user.id);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/login/estabelecimento", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // =========================================================================
  // LOAD DATA
  // =========================================================================

  useEffect(() => {
    if (authState !== "authorized" || !userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load estabelecimento data
        const { data: estab, error: estabError } = await supabase
          .from("estabelecimentos")
          .select("*")
          .eq("id", userId)
          .single();

        if (estabError) throw estabError;

        // Get email from auth
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setEstabelecimento({
          ...estab,
          email: session?.user.email || null,
        });

        // Analytics is now loaded via useEstabelecimentoAnalytics hook
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados");
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
      const { error } = await supabase.from("estabelecimentos").update(updates).eq("id", userId);

      if (error) throw error;

      setEstabelecimento((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success("Dados atualizados!");
      return true;
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Erro ao salvar");
      return false;
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
  // LOADING STATE
  // =========================================================================

  if (authState !== "authorized") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-screen bg-slate-950 flex">
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
        <div className="p-4 lg:p-8">
          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <EstablishmentDashboard
              estabelecimento={estabelecimento}
              analytics={analytics}
              loading={loading}
              onNavigate={handleNavigate}
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
          <EstablishmentAnalytics estabelecimentoId={userId || ""} analytics={analytics} loading={loading || analyticsLoading} />
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
