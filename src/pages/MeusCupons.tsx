import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, Clock, Gift, MapPin, Ticket } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Cupom {
  id: string;
  codigo: string;
  usado: boolean;
  data_emissao: string;
  data_validade: string | null;
  data_uso: string | null;
  estabelecimento: {
    nome_fantasia: string;
    logo_url: string | null;
    descricao_beneficio: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
  };
}

export default function MeusCupons() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para ver seus cupons",
        variant: "destructive",
      });
      navigate("/login-aniversariante");
      return;
    }

    setUser(user);
    await loadCupons(user.id);
  };

  const loadCupons = async (userId: string) => {
    try {
      const { data: aniversariante } = await supabase
        .from("aniversariantes")
        .select("id")
        .eq("id", userId)
        .single();

      if (!aniversariante) {
        setLoading(false);
        return;
      }

      const { data: cuponsData, error: cuponsError } = await supabase
        .from("cupons")
        .select("*")
        .eq("aniversariante_id", aniversariante.id)
        .order("data_emissao", { ascending: false });

      if (cuponsError) throw cuponsError;

      if (!cuponsData || cuponsData.length === 0) {
        setCupons([]);
        setLoading(false);
        return;
      }

      // Get unique estabelecimento IDs
      const estabelecimentoIds = [...new Set(cuponsData.map(c => c.estabelecimento_id))];

      // Fetch estabelecimentos
      const { data: estabelecimentos, error: estabError } = await supabase
        .from("estabelecimentos")
        .select("id, nome_fantasia, logo_url, descricao_beneficio, endereco, cidade, estado")
        .in("id", estabelecimentoIds);

      if (estabError) throw estabError;

      // Create a map for quick lookup
      const estabMap = new Map(estabelecimentos?.map(e => [e.id, e]) || []);

      // Combine data
      const cuponsComEstabelecimentos = cuponsData.map(cupom => ({
        ...cupom,
        estabelecimento: estabMap.get(cupom.estabelecimento_id) || {
          nome_fantasia: "Estabelecimento não encontrado",
          logo_url: null,
          descricao_beneficio: null,
          endereco: null,
          cidade: null,
          estado: null,
        }
      }));

      setCupons(cuponsComEstabelecimentos);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus cupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cuponsAtivos = cupons.filter(c => !c.usado && (!c.data_validade || new Date(c.data_validade) > new Date()));
  const cuponsUsados = cupons.filter(c => c.usado);
  const cuponsExpirados = cupons.filter(c => !c.usado && c.data_validade && new Date(c.data_validade) <= new Date());

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const CupomCard = ({ cupom }: { cupom: Cupom }) => (
    <motion.div variants={itemVariants}>
      <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {cupom.estabelecimento.logo_url ? (
              <img
                src={cupom.estabelecimento.logo_url}
                alt={cupom.estabelecimento.nome_fantasia}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <Gift className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{cupom.estabelecimento.nome_fantasia}</h3>
            
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-primary" />
              <code className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                {cupom.codigo}
              </code>
              {cupom.usado && (
                <Badge variant="secondary" className="ml-auto">
                  <Check className="w-3 h-3 mr-1" />
                  Usado
                </Badge>
              )}
              {!cupom.usado && cupom.data_validade && new Date(cupom.data_validade) <= new Date() && (
                <Badge variant="destructive" className="ml-auto">
                  <Clock className="w-3 h-3 mr-1" />
                  Expirado
                </Badge>
              )}
            </div>

            {cupom.estabelecimento.descricao_beneficio && (
              <p className="text-sm text-muted-foreground mb-3">
                {cupom.estabelecimento.descricao_beneficio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Emitido: {format(new Date(cupom.data_emissao), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              
              {cupom.data_validade && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Validade: {format(new Date(cupom.data_validade), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
              
              {cupom.usado && cupom.data_uso && (
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Usado: {format(new Date(cupom.data_uso), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
              
              {cupom.estabelecimento.cidade && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {cupom.estabelecimento.cidade}/{cupom.estabelecimento.estado}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Meus Cupons</h1>
          <p className="text-muted-foreground mb-8">
            Gerencie todos os seus cupons de aniversário em um só lugar
          </p>

          <Tabs defaultValue="ativos" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="ativos">
                Ativos ({cuponsAtivos.length})
              </TabsTrigger>
              <TabsTrigger value="usados">
                Usados ({cuponsUsados.length})
              </TabsTrigger>
              <TabsTrigger value="expirados">
                Expirados ({cuponsExpirados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ativos">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {cuponsAtivos.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum cupom ativo</h3>
                    <p className="text-muted-foreground">
                      Você ainda não tem cupons ativos. Navegue pelos estabelecimentos parceiros e emita seus cupons!
                    </p>
                  </Card>
                ) : (
                  cuponsAtivos.map(cupom => <CupomCard key={cupom.id} cupom={cupom} />)
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="usados">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {cuponsUsados.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Check className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum cupom usado</h3>
                    <p className="text-muted-foreground">
                      Você ainda não usou nenhum cupom
                    </p>
                  </Card>
                ) : (
                  cuponsUsados.map(cupom => <CupomCard key={cupom.id} cupom={cupom} />)
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="expirados">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {cuponsExpirados.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum cupom expirado</h3>
                    <p className="text-muted-foreground">
                      Você não tem cupons expirados
                    </p>
                  </Card>
                ) : (
                  cuponsExpirados.map(cupom => <CupomCard key={cupom.id} cupom={cupom} />)
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
