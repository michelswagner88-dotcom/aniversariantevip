import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cake,
  Store,
  UserPlus,
  Search,
  FileText,
  Gift,
  Building,
  Settings,
  CreditCard,
  Users,
  TrendingUp,
  Target,
  DollarSign,
  Star,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Zap,
  MapPin,
  Shield,
  Heart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";

const ComoFunciona = () => {
  useSEO({
    title: SEO_CONTENT.comoFunciona.title,
    description: SEO_CONTENT.comoFunciona.description,
  });

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"aniversariante" | "estabelecimento">("aniversariante");

  return (
    <div className="min-h-screen bg-[#240046]">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 pb-16 px-4 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Botão Voltar */}
          <div className="mb-8">
            <BackButton />
          </div>

          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#C77DFF]" />
              <span className="text-sm text-white/90 font-medium">
                O maior guia de benefícios para aniversariantes do Brasil
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Como o{" "}
              <span className="bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] bg-clip-text text-transparent">
                Aniversariante VIP
              </span>
              <br />
              funciona?
            </h1>

            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Conectamos aniversariantes a estabelecimentos que oferecem benefícios exclusivos. Você ganha, o
              estabelecimento ganha. Todo mundo celebra.
            </p>
          </div>
        </div>
      </section>

      {/* Toggle Tabs */}
      <section className="px-4 pb-12">
        <div className="max-w-md mx-auto">
          <div className="bg-[#1a0033] p-1.5 rounded-2xl flex border border-white/10">
            <button
              onClick={() => setActiveTab("aniversariante")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "aniversariante"
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#9D4EDD] text-white shadow-lg shadow-[#7C3AED]/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Cake className="w-5 h-5" />
              <span className="text-sm sm:text-base">Aniversariante</span>
            </button>
            <button
              onClick={() => setActiveTab("estabelecimento")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "estabelecimento"
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#9D4EDD] text-white shadow-lg shadow-[#7C3AED]/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Store className="w-5 h-5" />
              <span className="text-sm sm:text-base">Estabelecimento</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========== CONTEÚDO ANIVERSARIANTE ========== */}
      {activeTab === "aniversariante" && (
        <>
          {/* Passos - Aniversariante */}
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Seu aniversário com vantagens reais</h2>
                <p className="text-white/60 max-w-xl mx-auto">
                  Quatro passos simples para aproveitar benefícios exclusivos
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Passo 1 */}
                <div className="group relative bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-xl flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UserPlus className="w-6 h-6 text-[#C77DFF]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">Crie sua conta</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Cadastro gratuito em menos de 1 minuto. Só precisamos do básico.
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="group relative bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#9D4EDD]/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#9D4EDD] to-[#C77DFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#9D4EDD]/30">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#9D4EDD]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6 text-[#C77DFF]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">Explore os parceiros</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Navegue por restaurantes, bares, lojas e serviços com ofertas especiais.
                    </p>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="group relative bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#C77DFF]/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#C77DFF] to-[#E0AAFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#C77DFF]/30">
                    <span className="text-[#240046] font-bold">3</span>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#C77DFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-[#E0AAFF]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">Veja as condições</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Cada lugar tem suas regras. Confira antes de ir para não ter surpresas.
                    </p>
                  </div>
                </div>

                {/* Passo 4 */}
                <div className="group relative bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#E0AAFF]/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#E0AAFF] to-white rounded-xl flex items-center justify-center shadow-lg shadow-[#E0AAFF]/30">
                    <span className="text-[#240046] font-bold">4</span>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#E0AAFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Gift className="w-6 h-6 text-[#E0AAFF]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">Aproveite!</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Mostre seu documento, valide o benefício e celebre seu dia especial.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Diferenciais da Plataforma */}
          <section className="py-16 px-4 bg-[#1a0033]/50">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">Por que usar</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">Mais que um guia de benefícios</h2>
                <p className="text-white/60 max-w-xl mx-auto">Uma experiência pensada do início ao fim para você</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/30 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED]/20 to-[#9D4EDD]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Smartphone className="w-6 h-6 text-[#C77DFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Design intuitivo</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Interface limpa que funciona perfeitamente no celular ou computador.
                  </p>
                </div>

                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#9D4EDD]/30 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#9D4EDD]/20 to-[#C77DFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-[#C77DFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Busca inteligente</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Filtre por cidade, categoria ou encontre o que está perto de você.
                  </p>
                </div>

                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#C77DFF]/30 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C77DFF]/20 to-[#E0AAFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-[#E0AAFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Rápido e leve</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Plataforma otimizada para carregar em segundos, mesmo no 4G.
                  </p>
                </div>

                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/30 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED]/20 to-[#9D4EDD]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-[#C77DFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Seus dados seguros</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Criptografia de ponta a ponta. Sua privacidade é prioridade.
                  </p>
                </div>

                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#9D4EDD]/30 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#9D4EDD]/20 to-[#C77DFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6 text-[#C77DFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">100% gratuito</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Para o aniversariante, não custa nada. Nunca. Zero taxas escondidas.
                  </p>
                </div>

                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#C77DFF]/30 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C77DFF]/20 to-[#E0AAFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-[#E0AAFF]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Feito no Brasil</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Pensado para o brasileiro, com carinho em cada detalhe.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Aniversariante */}
          <section className="py-16 px-4">
            <div className="max-w-xl mx-auto">
              <div className="relative bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-3xl p-8 sm:p-10 text-center overflow-hidden">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C3AED]/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30">
                    <Gift className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Pronto para celebrar?</h3>
                  <p className="text-white/70 mb-8 max-w-sm mx-auto">
                    Cadastre-se agora e descubra os benefícios disponíveis na sua cidade
                  </p>

                  <Button
                    onClick={() => navigate("/cadastro")}
                    size="lg"
                    className="bg-white text-[#240046] hover:bg-white/90 font-semibold px-8 py-6 h-auto text-base rounded-full shadow-xl shadow-black/20 hover:scale-105 transition-all duration-300"
                  >
                    Criar minha conta grátis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ========== CONTEÚDO ESTABELECIMENTO ========== */}
      {activeTab === "estabelecimento" && (
        <>
          {/* Header Estabelecimento */}
          <section className="py-8 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Atraia clientes que querem celebrar</h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Aniversariantes raramente comemoram sozinhos. Um benefício pode trazer uma mesa cheia.
              </p>
            </div>
          </section>

          {/* Passos - Estabelecimento */}
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Passo 1 */}
                <div className="group relative bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-xl flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Building className="w-6 h-6 text-[#C77DFF]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">Cadastre-se</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Informe os dados do seu negócio em um formulário simples e direto.
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="group relative bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#9D4EDD]/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#9D4EDD] to-[#C77DFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#9D4EDD]/30">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#9D4EDD]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Settings className="w-6 h-6 text-[#C77DFF]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">Defina o benefício</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Escolha o que oferecer: desconto, brinde, cortesia. Você decide as regras.
                    </p>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="group relative bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#C77DFF]/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#C77DFF] to-[#E0AAFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#C77DFF]/30">
                    <span className="text-[#240046] font-bold">3</span>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#C77DFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6 text-[#E0AAFF]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">Escolha seu plano</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Planos acessíveis com retorno garantido. Investimento que se paga.
                    </p>
                  </div>
                </div>

                {/* Passo 4 */}
                <div className="group relative bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#E0AAFF]/50 transition-all duration-300">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#E0AAFF] to-white rounded-xl flex items-center justify-center shadow-lg shadow-[#E0AAFF]/30">
                    <span className="text-[#240046] font-bold">4</span>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#E0AAFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-[#E0AAFF]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">Receba clientes</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Aniversariantes encontram você na plataforma e vão até seu estabelecimento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Vantagens */}
          <section className="py-16 px-4 bg-[#1a0033]/50">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">Vantagens</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">Por que ser parceiro?</h2>
                <p className="text-white/60 max-w-xl mx-auto">Retorno real com investimento inteligente</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/30 transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-[#C77DFF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Mais clientes, mais vendas</h4>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Aniversariante raramente celebra sozinho. Um benefício pode trazer amigos, família e colegas
                        junto.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#9D4EDD]/30 transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#9D4EDD]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-[#C77DFF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Visibilidade garantida</h4>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Seu negócio aparece em uma plataforma 100% focada em celebrações. Destaque onde importa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#C77DFF]/30 transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#C77DFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-[#E0AAFF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Público pronto para consumir</h4>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Quem acessa já quer aproveitar o aniversário. Cliente com intenção real de compra.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#E0AAFF]/30 transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#E0AAFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-[#E0AAFF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Investimento inteligente</h4>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Mais barato que anúncio tradicional, com retorno mensurável mês após mês.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Estabelecimento */}
          <section className="py-16 px-4">
            <div className="max-w-xl mx-auto">
              <div className="relative bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-3xl p-8 sm:p-10 text-center overflow-hidden">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C3AED]/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30">
                    <Store className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Quer mais clientes?</h3>
                  <p className="text-white/70 mb-8 max-w-sm mx-auto">
                    Cadastre seu estabelecimento e comece a receber aniversariantes
                  </p>

                  <Button
                    onClick={() => navigate("/seja-parceiro")}
                    size="lg"
                    className="bg-white text-[#240046] hover:bg-white/90 font-semibold px-8 py-6 h-auto text-base rounded-full shadow-xl shadow-black/20 hover:scale-105 transition-all duration-300"
                  >
                    Quero ser parceiro
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-white/50 text-sm mt-6">
                    Já tem conta?{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="text-[#C77DFF] hover:text-white transition-colors"
                    >
                      Entrar
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ComoFunciona;
