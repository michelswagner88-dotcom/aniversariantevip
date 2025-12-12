import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LogOut, Users, Building2, Ticket, TrendingUp, Shield, Upload, Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { GerenciarColaboradores } from "@/components/colaborador/GerenciarColaboradores";
import { GerenciarAniversariantes } from "@/components/colaborador/GerenciarAniversariantes";
import { GerenciarEstabelecimentos } from "@/components/colaborador/GerenciarEstabelecimentos";
import { ImportarEstabelecimentos } from "@/components/colaborador/ImportarEstabelecimentos";

// Tipos
interface Metricas {
  totalAniversariantes: number;
  totalEstabelecimentos: number;
  totalCupons: number;
}

// Skeleton para métricas
const MetricasLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const AreaColaborador = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<Metricas>({
    totalAniversariantes: 0,
    totalEstabelecimentos: 0,
    totalCupons: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login/colaborador");
        return;
      }

      // Verificar se é admin ou colaborador
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .in("role", ["admin", "colaborador"])
        .maybeSingle();

      if (!roles) {
        toast.error("Acesso negado");
        await supabase.auth.signOut();
        navigate("/login/colaborador");
        return;
      }

      setSession(session);
      await carregarMetricas();
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login/colaborador");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const carregarMetricas = async () => {
    try {
      // Contar aniversariantes
      const { count: aniversariantes } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "aniversariante");

      // Contar estabelecimentos (da tabela estabelecimentos, não de roles)
      const { count: estabelecimentos } = await supabase
        .from("estabelecimentos")
        .select("*", { count: "exact", head: true });

      // Contar cupons
      const { count: cupons } = await supabase.from("cupons").select("*", { count: "exact", head: true });

      setMetricas({
        totalAniversariantes: aniversariantes || 0,
        totalEstabelecimentos: estabelecimentos || 0,
        totalCupons: cupons || 0,
      });
    } catch {
      toast.error("Erro ao carregar métricas");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <MetricasLoading />
          <Skeleton className="h-12 w-full max-w-2xl mb-4" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Colaborador</h1>
          <Button onClick={handleLogout} variant="outline" className="min-h-[44px]">
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aniversariantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.totalAniversariantes}</div>
              <p className="text-xs text-muted-foreground">Total cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estabelecimentos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.totalEstabelecimentos}</div>
              <p className="text-xs text-muted-foreground">Total cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cupons Emitidos</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.totalCupons}</div>
              <p className="text-xs text-muted-foreground">Total no sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="estabelecimentos" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="metricas" className="min-h-[44px]">
              <TrendingUp className="mr-2 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="aniversariantes" className="min-h-[44px]">
              <Users className="mr-2 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Aniversariantes</span>
            </TabsTrigger>
            <TabsTrigger value="estabelecimentos" className="min-h-[44px]">
              <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Estabelecimentos</span>
            </TabsTrigger>
            <TabsTrigger value="importar" className="min-h-[44px]">
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Importar</span>
            </TabsTrigger>
            <TabsTrigger value="colaboradores" className="min-h-[44px]">
              <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Colaboradores</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metricas">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalhadas</CardTitle>
                <CardDescription>Visão geral do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                    <p className="text-2xl font-bold">
                      {metricas.totalAniversariantes > 0
                        ? ((metricas.totalCupons / metricas.totalAniversariantes) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">Cupons / Aniversariantes</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Média por Estabelecimento</p>
                    <p className="text-2xl font-bold">
                      {metricas.totalEstabelecimentos > 0
                        ? (metricas.totalCupons / metricas.totalEstabelecimentos).toFixed(1)
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Cupons / Estabelecimento</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Crescimento</p>
                    <p className="text-2xl font-bold text-green-500">+12%</p>
                    <p className="text-xs text-muted-foreground">vs mês anterior</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aniversariantes">
            <GerenciarAniversariantes />
          </TabsContent>

          <TabsContent value="estabelecimentos">
            <GerenciarEstabelecimentos onUpdate={carregarMetricas} />
          </TabsContent>

          <TabsContent value="importar">
            <ImportarEstabelecimentos />
          </TabsContent>

          <TabsContent value="colaboradores">
            <GerenciarColaboradores />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AreaColaborador;
