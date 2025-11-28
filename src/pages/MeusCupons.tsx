import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Gift, Ticket, Clock } from "lucide-react";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";

interface Cupom {
  id: string;
  codigo: string;
  usado: boolean;
  data_emissao: string;
  data_validade: string | null;
  data_uso: string | null;
  estabelecimento_id: string;
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
      navigate("/auth");
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
  const cuponsHistorico = cupons.filter(c => c.usado || (c.data_validade && new Date(c.data_validade) <= new Date()));

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

  const getTimeRemaining = (dataValidade: string) => {
    const now = new Date();
    const expiry = new Date(dataValidade);
    const hoursRemaining = differenceInHours(expiry, now);
    const minutesRemaining = differenceInMinutes(expiry, now) % 60;
    
    if (hoursRemaining < 0) return null;
    if (hoursRemaining < 24) {
      return `⏰ Expira em ${hoursRemaining.toString().padStart(2, '0')}:${minutesRemaining.toString().padStart(2, '0')}h`;
    }
    return null;
  };

  const CupomCard = ({ cupom }: { cupom: Cupom }) => {
    const timeWarning = cupom.data_validade && !cupom.usado ? getTimeRemaining(cupom.data_validade) : null;
    const isExpired = cupom.data_validade && new Date(cupom.data_validade) <= new Date();
    
    return (
      <motion.div variants={itemVariants}>
        <Card 
          onClick={() => navigate(`/emitir-cupom?estabelecimento=${cupom.estabelecimento_id}`)}
          className="bg-slate-900/50 border-white/10 hover:border-violet-500/30 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_-12px_rgba(139,92,246,0.4)]"
        >
          <div className="flex items-center gap-4 p-4">
            
            {/* Lado Esquerdo - Imagem */}
            <div className="flex-shrink-0">
              {cupom.estabelecimento.logo_url ? (
                <img
                  src={cupom.estabelecimento.logo_url}
                  alt={cupom.estabelecimento.nome_fantasia}
                  className="w-20 h-20 object-cover rounded-xl"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Gift className="w-10 h-10 text-slate-600" />
                </div>
              )}
            </div>

            {/* Centro - Informações */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white truncate mb-1">
                {cupom.estabelecimento.nome_fantasia}
              </h3>
              
              <p className="text-sm text-slate-300 truncate mb-2">
                {cupom.estabelecimento.descricao_beneficio || "Benefício exclusivo"}
              </p>
              
              {/* Status */}
              {!cupom.usado && !isExpired && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">
                    Pronto para uso
                  </span>
                </div>
              )}
              
              {cupom.usado && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-500 rounded-full" />
                  <span className="text-xs text-slate-400 font-medium">
                    Usado em {format(new Date(cupom.data_uso!), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
              
              {isExpired && !cupom.usado && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-xs text-red-400 font-medium">
                    Expirado
                  </span>
                </div>
              )}

              {/* Aviso de Urgência */}
              {timeWarning && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-3 py-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-300 font-medium">
                    {timeWarning}
                  </span>
                </div>
              )}
            </div>

            {/* Lado Direito - Ação */}
            <div className="flex-shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-400"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

          </div>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative">
        <Header />
        
        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="mb-6">
            <BackButton />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Cabeçalho */}
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                Minha Carteira <Ticket className="w-8 h-8 text-violet-400" />
              </h1>
              <p className="text-slate-400">
                Todos os seus benefícios em um só lugar
              </p>
            </div>

            {/* Abas de Navegação */}
            <Tabs defaultValue="ativos" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-900/50 border border-white/10 p-1">
                <TabsTrigger 
                  value="ativos"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:via-fuchsia-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] text-slate-400"
                >
                  Ativos ({cuponsAtivos.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="historico"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:via-fuchsia-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] text-slate-400"
                >
                  Histórico ({cuponsHistorico.length})
                </TabsTrigger>
              </TabsList>

              {/* Aba Ativos */}
              <TabsContent value="ativos">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {cuponsAtivos.length === 0 ? (
                    <Card className="bg-slate-900/50 border-white/10 p-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                          <Ticket className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum cupom ativo</h3>
                        <p className="text-slate-400 mb-6 max-w-sm">
                          Você ainda não emitiu nenhum cupom. Explore os estabelecimentos e garanta seus benefícios!
                        </p>
                        <Button 
                          onClick={() => navigate("/explorar")}
                          className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 text-white"
                        >
                          Explorar Benefícios
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    cuponsAtivos.map(cupom => <CupomCard key={cupom.id} cupom={cupom} />)
                  )}
                </motion.div>
              </TabsContent>

              {/* Aba Histórico */}
              <TabsContent value="historico">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {cuponsHistorico.length === 0 ? (
                    <Card className="bg-slate-900/50 border-white/10 p-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                          <Clock className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum histórico</h3>
                        <p className="text-slate-400 max-w-sm">
                          Você ainda não tem cupons usados ou expirados
                        </p>
                      </div>
                    </Card>
                  ) : (
                    cuponsHistorico.map(cupom => <CupomCard key={cupom.id} cupom={cupom} />)
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
