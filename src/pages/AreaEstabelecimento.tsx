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

// =============================================================================
// TYPES
// =============================================================================

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
  fotos: any[] | null;
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
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

        // Load analytics
        await loadAnalytics(userId);
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
  // LOAD ANALYTICS
  // =========================================================================

  const loadAnalytics = async (estabelecimentoId: string) => {
    try {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      // Visualizações totais
      const { count: visualizacoes } = await supabase
        .from("estabelecimento_analytics")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estabelecimentoId)
        .eq("tipo_evento", "visualizacao");

      // Visualizações 7 dias
      const { count: visualizacoes7d } = await supabase
        .from("estabelecimento_analytics")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estabelecimentoId)
        .eq("tipo_evento", "visualizacao")
        .gte("created_at", seteDiasAtras.toISOString());

      // Cliques WhatsApp
      const { count: cliquesWhatsapp } = await supabase
        .from("estabelecimento_analytics")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estabelecimentoId)
        .eq("tipo_evento", "clique_whatsapp");

      // Cliques WhatsApp 7d
      const { count: cliquesWhatsapp7d } = await supabase
        .from("estabelecimento_analytics")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estabelecimentoId)
        .eq("tipo_evento", "clique_whatsapp")
        .gte("created_at", seteDiasAtras.toISOString());

      // Outros cliques
      const { count: cliquesTelefone } = await supabase
        .from("estabelecimento_analytics")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estabelecimentoId)
        .eq("tipo_evento", "clique_telefone");

      const { count: cliquesInstagram } = await supabase
        .from("estabelecimento_analytics")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estabelecimentoId)
        .eq("tipo_evento", "clique_instagram");

      const { count: cliquesSite } = await supabase
        .from("estabelecimento_analytics")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estabelecimentoId)
        .eq("tipo_evento", "clique_site");

      // Favoritos
      const { count: favoritos } = await supabase
        .from("favoritos")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estabelecimentoId);

      setAnalytics({
        visualizacoes: visualizacoes || 0,
        visualizacoes7d: visualizacoes7d || 0,
        cliquesWhatsapp: cliquesWhatsapp || 0,
        cliquesWhatsapp7d: cliquesWhatsapp7d || 0,
        cliquesTelefone: cliquesTelefone || 0,
        cliquesInstagram: cliquesInstagram || 0,
        cliquesSite: cliquesSite || 0,
        favoritos: favoritos || 0,
        posicaoRanking: 0, // Calcular depois
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

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
            <EstablishmentAnalytics estabelecimentoId={userId || ""} analytics={analytics} loading={loading} />
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
