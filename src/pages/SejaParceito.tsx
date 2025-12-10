import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Star,
  Target,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Gift,
  Clock,
  BarChart3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";

export default function SejaParceiro() {
  const navigate = useNavigate();

  useSEO({
    title: SEO_CONTENT.sejaParceiro.title,
    description: SEO_CONTENT.sejaParceiro.description,
  });

  const vantagens = [
    {
      titulo: "Mais clientes, mais vendas",
      descricao: "Aniversariante raramente celebra sozinho. Um benefício pode trazer amigos, família e colegas junto.",
      icon: TrendingUp,
    },
    {
      titulo: "Visibilidade garantida",
      descricao: "Seu negócio aparece em uma plataforma 100% focada em celebrações. Destaque onde importa.",
      icon: Star,
    },
    {
      titulo: "Público pronto para consumir",
      descricao: "Quem acessa já quer aproveitar o aniversário. Cliente com intenção real de compra.",
      icon: Target,
    },
    {
      titulo: "Investimento inteligente",
      descricao: "Mais barato que anúncio tradicional, com retorno mensurável mês após mês.",
      icon: DollarSign,
    },
  ];

  const diferenciais = [
    "Apareça para milhares de aniversariantes",
    "Painel completo para gerenciar seu perfil",
    "Métricas de visualizações e interesse",
    "Suporte dedicado para parceiros",
    "Destaque na sua categoria e cidade",
    "Sem taxa por cliente atendido",
  ];

  return (
    <div className="min-h-screen bg-[#240046]">
      <Header />

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
              <Building2 className="w-4 h-4 text-[#C77DFF]" />
              <span className="text-sm text-white/90 font-medium">Para estabelecimentos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Atraia clientes que{" "}
              <span className="bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] bg-clip-text text-transparent">
                querem celebrar
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
              Cadastre seu estabelecimento e receba aniversariantes prontos para comemorar. Eles trazem amigos, família
              e vontade de gastar.
            </p>

            <Button
              onClick={() => navigate("/cadastro/estabelecimento")}
              size="lg"
              className="bg-white text-[#240046] hover:bg-white/90 font-semibold px-8 py-6 h-auto text-base rounded-full shadow-xl shadow-black/20 hover:scale-105 transition-all duration-300"
            >
              Cadastrar meu estabelecimento
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 px-4 bg-[#1a0033]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">Passo a passo</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">Comece em minutos</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Processo simples e direto para você começar a receber clientes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Passo 1 */}
            <div className="group relative bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/50 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-xl flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="pt-4">
                <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-[#C77DFF]" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">Cadastre-se</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Preencha os dados do seu negócio em um formulário rápido.
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="group relative bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#9D4EDD]/50 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#9D4EDD] to-[#C77DFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#9D4EDD]/30">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="pt-4">
                <div className="w-12 h-12 bg-[#9D4EDD]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Gift className="w-6 h-6 text-[#C77DFF]" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">Defina o benefício</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Escolha o que oferecer: desconto, brinde ou cortesia. Você decide.
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="group relative bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#C77DFF]/50 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#C77DFF] to-[#E0AAFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#C77DFF]/30">
                <span className="text-[#240046] font-bold">3</span>
              </div>
              <div className="pt-4">
                <div className="w-12 h-12 bg-[#C77DFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-[#E0AAFF]" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">Ative seu perfil</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Escolha um plano e comece a aparecer para os aniversariantes.
                </p>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="group relative bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#E0AAFF]/50 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#E0AAFF] to-white rounded-xl flex items-center justify-center shadow-lg shadow-[#E0AAFF]/30">
                <span className="text-[#240046] font-bold">4</span>
              </div>
              <div className="pt-4">
                <div className="w-12 h-12 bg-[#E0AAFF]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-[#E0AAFF]" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">Receba clientes</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Aniversariantes encontram você e vão até seu estabelecimento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">Vantagens</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">Por que ser parceiro?</h2>
            <p className="text-white/60 max-w-xl mx-auto">Benefícios reais para o seu negócio crescer</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {vantagens.map((vantagem, index) => (
              <div
                key={index}
                className="bg-[#1a0033] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/30 transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <vantagem.icon className="w-6 h-6 text-[#C77DFF]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-2">{vantagem.titulo}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{vantagem.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que você ganha */}
      <section className="py-16 px-4 bg-[#1a0033]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">Incluso</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">O que você ganha</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {diferenciais.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-[#240046] border border-white/10 rounded-xl p-4">
                <div className="w-8 h-8 bg-[#7C3AED]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#C77DFF]" />
                </div>
                <span className="text-white/90 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-3xl p-8 sm:p-10 text-center overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C3AED]/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Pronto para crescer?</h3>
              <p className="text-white/70 mb-8 max-w-sm mx-auto">
                Cadastre seu estabelecimento agora e comece a receber aniversariantes
              </p>

              <Button
                onClick={() => navigate("/cadastro/estabelecimento")}
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

      <Footer />
    </div>
  );
}
