import { ArrowLeft, MapPin, Clock, Phone, Instagram, FileText, Lock, CheckCircle, Ticket, Loader2, UserPlus, UserCheck, Calendar, Grid3x3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { BackButton } from "@/components/BackButton";
import { NavigationButtons } from "@/components/NavigationButtons";
import { useFollowers } from "@/hooks/useFollowers";
import { useStories } from "@/hooks/useStories";
import { usePosts } from "@/hooks/usePosts";
import { StoryViewer } from "@/components/StoryViewer";

interface Estabelecimento {
  id: string;
  nome_fantasia: string;
  descricao_beneficio: string;
  regras_utilizacao: string | null;
  categoria: string[] | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  horario_funcionamento: string | null;
  link_cardapio: string | null;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function EstabelecimentoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [estabelecimento, setEstabelecimento] = useState<Estabelecimento | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  // Hooks sociais
  const { isFollowing, followersCount, follow, unfollow, isFollowLoading } = useFollowers(id);
  const { stories } = useStories(id);
  const { posts } = usePosts(id);

  const hasActiveStories = stories.length > 0;

  // Buscar dados do estabelecimento
  useEffect(() => {
    const fetchEstabelecimento = async () => {
      if (!id) {
        toast({
          title: "Erro",
          description: "ID do estabelecimento não encontrado",
          variant: "destructive",
        });
        navigate("/explorar");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("estabelecimentos")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Erro",
            description: "Estabelecimento não encontrado",
            variant: "destructive",
          });
          navigate("/explorar");
          return;
        }

        setEstabelecimento(data);
      } catch (error) {
        console.error("Erro ao buscar estabelecimento:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do estabelecimento",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEstabelecimento();
  }, [id, navigate, toast]);

  // Check if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleWhatsApp = () => {
    if (!estabelecimento?.whatsapp) return;
    const numero = estabelecimento.whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}`, "_blank");
  };

  const handleInstagram = () => {
    if (!estabelecimento?.instagram) return;
    const username = estabelecimento.instagram.replace("@", "");
    window.open(`https://instagram.com/${username}`, "_blank");
  };

  const handleCardapio = () => {
    if (!estabelecimento?.link_cardapio) return;
    window.open(estabelecimento.link_cardapio, "_blank");
  };

  const handleEntrarParaVer = () => {
    navigate("/auth");
  };

  const handleEmitirCupom = () => {
    if (!id) return;
    navigate(`/emitir-cupom?estabelecimento=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!estabelecimento) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Glow Effects */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative pb-28">
        {/* Hero Section */}
        <div className="relative h-[50vh] min-h-[400px]">
          {/* Image */}
          <img
            src={estabelecimento.logo_url || "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80"}
            alt={estabelecimento.nome_fantasia}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-6 left-6 z-10">
            <BackButton to="/explorar" label="" className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 p-0" />
          </div>

          {/* Avatar & Title Section */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
            <div className="flex items-end gap-4">
              {/* Avatar com Anel de Story */}
              <button
                onClick={() => hasActiveStories && setShowStoryViewer(true)}
                className={`relative shrink-0 ${hasActiveStories ? 'cursor-pointer' : 'cursor-default'}`}
                disabled={!hasActiveStories}
              >
                <div className={`w-24 h-24 rounded-full p-[3px] ${
                  hasActiveStories 
                    ? 'bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-pink-500' 
                    : 'bg-white/20'
                }`}>
                  <img
                    src={estabelecimento.logo_url || 'https://via.placeholder.com/96'}
                    alt={estabelecimento.nome_fantasia}
                    className="w-full h-full rounded-full object-cover border-4 border-slate-950"
                  />
                </div>
              </button>

              {/* Title & Follow Button */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                      {(() => {
                        const cat = estabelecimento.categoria?.[0];
                        const found = CATEGORIAS_ESTABELECIMENTO.find(c => c.value === cat);
                        return found ? `${found.icon} ${found.label}` : "🏪 Estabelecimento";
                      })()}
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                      {estabelecimento.nome_fantasia}
                    </h1>
                  </div>
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Aberto
                  </div>
                </div>

                {/* Followers & Follow Button */}
                {isLoggedIn && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-white">
                      <span className="font-bold">{followersCount}</span> {followersCount === 1 ? 'seguidor' : 'seguidores'}
                    </div>
                    <Button
                      onClick={() => isFollowing ? unfollow(id!) : follow(id!)}
                      disabled={isFollowLoading}
                      size="sm"
                      className={
                        isFollowing
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          : 'bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white'
                      }
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck size={14} className="mr-1" />
                          Seguindo
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} className="mr-1" />
                          Seguir
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {estabelecimento.whatsapp && (
              <Button
                onClick={handleWhatsApp}
                className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-md shrink-0"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            )}
            {estabelecimento.instagram && (
              <Button
                onClick={handleInstagram}
                className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 hover:from-purple-500/20 hover:via-pink-500/20 hover:to-orange-500/20 text-white border border-white/10 backdrop-blur-md shrink-0"
                size="sm"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            )}
            {estabelecimento.link_cardapio && (
              <Button
                onClick={handleCardapio}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md shrink-0"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Cardápio
              </Button>
            )}
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <Tabs defaultValue="sobre" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 mb-6">
              <TabsTrigger value="sobre" className="flex items-center gap-2">
                <FileText size={16} />
                Sobre
              </TabsTrigger>
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Grid3x3 size={16} />
                Feed VIP
              </TabsTrigger>
              <TabsTrigger value="agenda" className="flex items-center gap-2">
                <Calendar size={16} />
                Agenda
              </TabsTrigger>
            </TabsList>

            {/* Aba Sobre */}
            <TabsContent value="sobre" className="space-y-6">
          {/* Benefit Box - Conditional (Locked/Unlocked) */}
          <div className="relative rounded-2xl bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20 to-pink-500/20 p-[1px] overflow-hidden">
            {/* Animated Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 opacity-50 blur-xl" />
            
            <div className="relative rounded-2xl bg-slate-950/90 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎁</div>
                <div className="flex-1 space-y-3">
                  {isLoggedIn ? (
                    <>
                      {/* UNLOCKED STATE */}
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-xl font-bold text-white">
                          🎉 Ganhe: {estabelecimento.descricao_beneficio}
                        </h2>
                        <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                      </div>
                      
                      {/* Clear Content - No Blur */}
                      <div className="space-y-2">
                        <p className="text-slate-300 text-sm">
                          {estabelecimento.regras_utilizacao || "Confira as regras no estabelecimento"}
                        </p>
                      </div>
                      
                      <div className="pt-2 flex items-center gap-2 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>Benefício desbloqueado! Emita seu cupom abaixo</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* LOCKED STATE */}
                      <h2 className="text-xl font-bold text-white">
                        Benefício Exclusivo
                      </h2>
                      
                      {/* Blurred Content Simulation */}
                      <div className="space-y-2 relative">
                        <div className="blur-md select-none pointer-events-none">
                          <p className="text-slate-300 text-sm">
                            Válido para aniversariante e acompanhantes
                          </p>
                          <p className="text-slate-300 text-sm mt-1">
                            Apresente documento com foto na data
                          </p>
                        </div>
                        
                        {/* Lock Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-slate-950/80 backdrop-blur-sm rounded-full p-3 border border-white/10">
                            <Lock className="w-6 h-6 text-violet-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                        <Lock className="w-3 h-3" />
                        <span>Faça login para ver os detalhes</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Essential Information */}
          <Accordion type="single" collapsible className="space-y-3">
            {/* Address */}
            {estabelecimento.endereco && (
              <AccordionItem value="endereco" className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-white">
                    <MapPin className="w-5 h-5 text-violet-400" />
                    <span className="font-semibold">Endereço</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-slate-300 text-sm mb-4">
                    {estabelecimento.endereco}
                    {estabelecimento.cidade && `, ${estabelecimento.cidade}`}
                    {estabelecimento.estado && ` - ${estabelecimento.estado}`}
                  </p>
                  
                  {/* Botões de Navegação - Só aparecem se tiver coordenadas */}
                  {estabelecimento.latitude && estabelecimento.longitude && (
                    <NavigationButtons
                      establishmentId={estabelecimento.id}
                      establishmentName={estabelecimento.nome_fantasia}
                      address={`${estabelecimento.endereco}, ${estabelecimento.cidade} - ${estabelecimento.estado}`}
                      latitude={estabelecimento.latitude}
                      longitude={estabelecimento.longitude}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Hours */}
            {estabelecimento.horario_funcionamento && (
              <AccordionItem value="horarios" className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-white">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold">Horários de Funcionamento</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <p className="text-slate-300 text-sm whitespace-pre-line">
                    {estabelecimento.horario_funcionamento}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Rules */}
            {estabelecimento.regras_utilizacao && (
              <AccordionItem value="regras" className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-white">
                    <FileText className="w-5 h-5 text-pink-400" />
                    <span className="font-semibold">Regras de Utilização</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-4">
                  <p className="text-slate-300 text-sm whitespace-pre-line">
                    {estabelecimento.regras_utilizacao}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
            </TabsContent>

            {/* Aba Feed VIP */}
            <TabsContent value="feed" className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <Grid3x3 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400">Nenhum post ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {posts.map((post: any) => (
                    <div key={post.id} className="aspect-square">
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Aba Agenda */}
            <TabsContent value="agenda" className="space-y-4">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">Nenhum evento agendado</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Story Viewer */}
      {showStoryViewer && hasActiveStories && (
        <StoryViewer
          stories={stories}
          establishmentName={estabelecimento.nome_fantasia}
          establishmentLogo={estabelecimento.logo_url || undefined}
          onClose={() => setShowStoryViewer(false)}
        />
      )}

      {/* Sticky Footer - Conditional Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 backdrop-blur-xl bg-slate-950/90 border-t border-white/10">
        {isLoggedIn ? (
          <Button
            onClick={handleEmitirCupom}
            className="w-full h-14 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-violet-500/30"
          >
            <Ticket className="w-5 h-5 mr-2" />
            EMITIR CUPOM 🎟️
          </Button>
        ) : (
          <Button
            onClick={handleEntrarParaVer}
            className="w-full h-14 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-violet-500/30"
          >
            <Lock className="w-5 h-5 mr-2" />
            ENTRAR PARA VER 🔒
          </Button>
        )}
      </div>
    </div>
  );
}
