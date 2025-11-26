import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Users, Building2, Ticket, TrendingUp, Shield, Upload } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { GerenciarColaboradores } from "@/components/colaborador/GerenciarColaboradores";
import { GerenciarAniversariantes } from "@/components/colaborador/GerenciarAniversariantes";
import { GerenciarEstabelecimentos } from "@/components/colaborador/GerenciarEstabelecimentos";
import { ImportarEstabelecimentos } from "@/components/colaborador/ImportarEstabelecimentos";

const AreaColaborador = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    totalAniversariantes: 0,
    totalEstabelecimentos: 0,
    totalCupons: 0,
    cuponsPorEstabelecimento: [] as any[]
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login/colaborador");
        return;
      }

      // Verificar se é admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login/colaborador");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const carregarMetricas = async () => {
    try {
      // Contar aniversariantes (profiles com role aniversariante)
      const { count: aniversariantes } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'aniversariante');

      // Contar estabelecimentos
      const { count: estabelecimentos } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'estabelecimento');

      // Contar cupons
      const { count: cupons } = await supabase
        .from('cupons')
        .select('*', { count: 'exact', head: true });

      // Cupons por estabelecimento
      const { data: cuponsPorEstab } = await supabase
        .from('cupons')
        .select('estabelecimento_id')
        .eq('usado', false);

      setMetricas({
        totalAniversariantes: aniversariantes || 0,
        totalEstabelecimentos: estabelecimentos || 0,
        totalCupons: cupons || 0,
        cuponsPorEstabelecimento: cuponsPorEstab || []
      });
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Colaborador</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aniversariantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.totalAniversariantes}</div>
              <p className="text-xs text-muted-foreground">Total cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estabelecimentos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.totalEstabelecimentos}</div>
              <p className="text-xs text-muted-foreground">Total cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cupons Emitidos</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.totalCupons}</div>
              <p className="text-xs text-muted-foreground">Total no sistema</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="metricas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="metricas">
              <TrendingUp className="mr-2 h-4 w-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="aniversariantes">
              <Users className="mr-2 h-4 w-4" />
              Aniversariantes
            </TabsTrigger>
            <TabsTrigger value="estabelecimentos">
              <Building2 className="mr-2 h-4 w-4" />
              Estabelecimentos
            </TabsTrigger>
            <TabsTrigger value="importar">
              <Upload className="mr-2 h-4 w-4" />
              Importar em Massa
            </TabsTrigger>
            <TabsTrigger value="colaboradores">
              <Shield className="mr-2 h-4 w-4" />
              Colaboradores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metricas">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalhadas</CardTitle>
                <CardDescription>Visão geral do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Métricas detalhadas serão implementadas em breve...
                </p>
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
