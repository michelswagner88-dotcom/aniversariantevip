import { ArrowLeft, MapPin, Clock, Phone, Instagram, FileText, Lock, Smartphone, Navigation, CheckCircle, Ticket } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

// Mock data - substituir por dados reais do Supabase
const mockEstabelecimento = {
  id: "1",
  nome: "Sushi House Premium",
  categoria: "Sushi Bar",
  imagem: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
  aberto: true,
  beneficio: {
    titulo: "Rodízio Grátis",
    regra: "Válido para aniversariante + 1 pagante",
  },
  contato: {
    whatsapp: "47999999999",
    instagram: "@sushihouse",
    cardapio: "https://example.com/cardapio",
  },
  endereco: {
    completo: "Rua das Flores, 123 - Centro, Florianópolis - SC",
    lat: -27.5954,
    lng: -48.5480,
  },
  horarios: [
    { dia: "Segunda a Quinta", horario: "18:00 - 23:00" },
    { dia: "Sexta e Sábado", horario: "18:00 - 00:00" },
    { dia: "Domingo", horario: "18:00 - 22:00" },
  ],
  regras: [
    "Válido apenas no mês do aniversário",
    "Necessário apresentar documento com foto",
    "Não acumulativo com outras promoções",
    "Sujeito a disponibilidade de mesa",
    "Bebidas não inclusas",
  ],
};

export default function EstabelecimentoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  // TODO: Buscar dados reais do estabelecimento usando o id

  const handleWhatsApp = () => {
    window.open(`https://wa.me/55${mockEstabelecimento.contato.whatsapp}`, "_blank");
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${mockEstabelecimento.contato.instagram.replace("@", "")}`, "_blank");
  };

  const handleCardapio = () => {
    window.open(mockEstabelecimento.contato.cardapio, "_blank");
  };

  const handleUber = () => {
    window.open(`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${mockEstabelecimento.endereco.lat}&dropoff[longitude]=${mockEstabelecimento.endereco.lng}`, "_blank");
  };

  const handleWaze = () => {
    window.open(`https://waze.com/ul?ll=${mockEstabelecimento.endereco.lat},${mockEstabelecimento.endereco.lng}&navigate=yes`, "_blank");
  };

  const handleMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${mockEstabelecimento.endereco.lat},${mockEstabelecimento.endereco.lng}`, "_blank");
  };

  const handleEntrarParaVer = () => {
    navigate("/login-aniversariante");
  };

  const handleEmitirCupom = () => {
    navigate("/emitir-cupom");
  };

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
            src={mockEstabelecimento.imagem}
            alt={mockEstabelecimento.nome}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Title & Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Badge variant="secondary" className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                  {mockEstabelecimento.categoria}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {mockEstabelecimento.nome}
                </h1>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                mockEstabelecimento.aberto 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {mockEstabelecimento.aberto ? "Aberto Agora" : "Fechado"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              onClick={handleWhatsApp}
              className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-md shrink-0"
              size="sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={handleInstagram}
              className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 hover:from-purple-500/20 hover:via-pink-500/20 hover:to-orange-500/20 text-white border border-white/10 backdrop-blur-md shrink-0"
              size="sm"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </Button>
            <Button
              onClick={handleCardapio}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md shrink-0"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Cardápio
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 space-y-6 max-w-2xl mx-auto">
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
                          🎉 Ganhe: {mockEstabelecimento.beneficio.titulo}
                        </h2>
                        <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                      </div>
                      
                      {/* Clear Content - No Blur */}
                      <div className="space-y-2">
                        <p className="text-slate-300 text-sm">
                          {mockEstabelecimento.beneficio.regra}
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
            <AccordionItem value="endereco" className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-white">
                  <MapPin className="w-5 h-5 text-violet-400" />
                  <span className="font-semibold">Endereço</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-slate-300 text-sm">
                  {mockEstabelecimento.endereco.completo}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleUber}
                    size="sm"
                    className="bg-black hover:bg-black/80 text-white flex-1"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Uber
                  </Button>
                  <Button
                    onClick={handleWaze}
                    size="sm"
                    className="bg-[#33ccff] hover:bg-[#33ccff]/80 text-white flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Waze
                  </Button>
                  <Button
                    onClick={handleMaps}
                    size="sm"
                    className="bg-[#4285f4] hover:bg-[#4285f4]/80 text-white flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Maps
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Hours */}
            <AccordionItem value="horarios" className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-white">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold">Horários de Funcionamento</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-4">
                {mockEstabelecimento.horarios.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{item.dia}</span>
                    <span className="text-white font-medium">{item.horario}</span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Rules */}
            <AccordionItem value="regras" className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-white">
                  <FileText className="w-5 h-5 text-pink-400" />
                  <span className="font-semibold">Regras de Utilização</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-4">
                {mockEstabelecimento.regras.map((regra, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                    <span className="text-slate-300">{regra}</span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

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
