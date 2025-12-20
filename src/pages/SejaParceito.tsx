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
  Gift,
  Clock,
  Check,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { useAuth } from "@/hooks/useAuth";

export default function SejaParceiro() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useSEO({
    title: SEO_CONTENT.sejaParceiro.title,
    description: SEO_CONTENT.sejaParceiro.description,
  });

  const vantagens = [
    {
      titulo: "Seja encontrado",
      descricao:
        "Muita gente não sabe quais lugares oferecem benefício de aniversário. Aqui, seu estabelecimento vira vitrine para quem está ativamente buscando.",
      icon: Target,
    },
    {
      titulo: "Mais visibilidade, mais movimento",
      descricao: "Você aparece para um público específico, com interesse real em aproveitar o mês especial.",
      icon: TrendingUp,
    },
    {
      titulo: "Público com alta intenção",
      descricao: "Quem acessa está decidido a aproveitar. Menos curiosos, mais clientes prontos para consumir.",
      icon: Star,
    },
    {
      titulo: "Investimento previsível",
      descricao: "Mais estável que anúncios tradicionais e com retorno contínuo ao longo do mês.",
      icon: DollarSign,
    },
  ];

  const diferenciais = [
    "Visibilidade para aniversariantes na sua cidade",
    "Página do estabelecimento com benefício e regras claras",
    "Painel para gerenciar seu perfil e informações",
    "Métricas de visualizações e interesse",
    "Destaque por categoria e localização",
    "Suporte para parceiros",
    "Sem taxa por cliente atendido",
    "Você define as regras do seu benefício",
  ];

  // Handlers para o CTA final
  const handleCadastrar = () => {
    if (user) {
      // TODO: Verificar se já é parceiro e redirecionar para dashboard
      // Por enquanto, vai para cadastro de estabelecimento
      navigate("/cadastro/estabelecimento");
    } else {
      // Deslogado: vai para cadastro com contexto de parceiro
      navigate("/cadastro", { state: { returnUrl: "/cadastro/estabelecimento", isParceiro: true } });
    }
  };

  const handleEntrar = () => {
    if (user) {
      // TODO: Verificar se já é parceiro e redirecionar para dashboard
      navigate("/painel");
    } else {
      navigate("/entrar", { state: { returnUrl: "/cadastro/estabelecimento" } });
    }
  };

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
              Atraia clientes no{" "}
              <span className="bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] bg-clip-text text-transparent">
                momento certo
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
              Muitos aniversariantes nem sabem que seu estabelecimento oferece benefício. Apareça para quem está
              buscando — e transforme sua oferta em movimento real.
            </p>

            <Button
              onClick={handleCadastrar}
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
      <section className="py-16 px-4 bg-[#3C096C]/30">
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
            <p className="text-white/60 max-w-xl mx-auto">
              Benefícios reais para o seu negócio crescer com consistência
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {vantagens.map((vantagem, index) => (
              <div
                key={index}
                className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/30 transition-all"
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
      <section className="py-16 px-4 bg-[#3C096C]/30">
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

      {/* =========================================================================
          CTA FINAL - Refatorado conforme especificações premium
          ========================================================================= */}
      <section className="relative py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background com radial sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-[1120px] mx-auto">
          {/* Card principal */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-[0_24px_80px_-40px_rgba(0,0,0,0.55)] p-5 sm:p-7 lg:p-8">
            {/* Grid: 1 coluna mobile, 12 colunas desktop (7+5) */}
            <div className="grid lg:grid-cols-12 gap-5 lg:gap-8 items-center">
              {/* Coluna esquerda: Texto + Bullets + Botões */}
              <div className="lg:col-span-7 text-center lg:text-left">
                {/* Título */}
                <h2 className="text-[24px] leading-[30px] sm:text-[28px] sm:leading-[34px] lg:text-[36px] lg:leading-[42px] font-semibold text-white tracking-[-0.02em] lg:tracking-[-0.03em]">
                  Pronto pra atrair aniversariantes na sua cidade?
                </h2>

                {/* Subtítulo */}
                <p className="mt-3 text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px] text-white/70 max-w-[38ch] lg:max-w-[54ch] mx-auto lg:mx-0">
                  Crie sua página em minutos e comece a aparecer pra quem está buscando benefício agora.
                </p>

                {/* Bullets */}
                <div className="mt-5 space-y-2 inline-flex flex-col items-start mx-auto lg:mx-0">
                  {[
                    "Sem taxa por cliente atendido",
                    "Você define as regras do benefício",
                    "Página pronta pra compartilhar",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <Check
                        className="w-[18px] h-[18px] text-[#C77DFF] mt-[2px] flex-shrink-0"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      <span className="text-[14px] leading-[20px] text-white/90">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Botões */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {/* Botão primário */}
                  <Button
                    onClick={handleCadastrar}
                    type="button"
                    className="w-full sm:w-auto sm:min-w-[260px] h-12 lg:h-[52px] px-6 lg:px-7 bg-white text-[#240046] hover:bg-white/95 font-semibold text-[15px] rounded-full shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 group"
                  >
                    Cadastrar meu estabelecimento
                    <ArrowRight
                      className="w-[18px] h-[18px] ml-2 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </Button>

                  {/* Botão secundário */}
                  <Button
                    onClick={handleEntrar}
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto h-12 lg:h-[52px] px-6 lg:px-7 bg-transparent border-white/15 text-white/80 hover:bg-white/5 hover:text-white hover:border-white/25 font-medium text-[15px] rounded-full transition-all duration-200"
                  >
                    Já sou parceiro • Entrar
                  </Button>
                </div>

                {/* Microcopy */}
                <p className="mt-3 text-[12px] leading-[16px] text-white/50 text-center sm:text-left">
                  Leva menos de 2 minutos.
                </p>
              </div>

              {/* Coluna direita: Preview (hidden no mobile) */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="bg-black/20 border border-white/10 rounded-2xl p-5 min-h-[220px]">
                  {/* Header do preview */}
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[#C77DFF]" aria-hidden="true" />
                    <span className="text-[12px] font-medium text-white/60 uppercase tracking-wider">
                      Prévia da sua página
                    </span>
                  </div>

                  {/* Mock do card de estabelecimento */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    {/* Nome fake */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="h-3 w-32 bg-white/30 rounded-full mb-1.5" />
                        <div className="h-2 w-20 bg-white/15 rounded-full" />
                      </div>
                    </div>

                    {/* Benefício fake */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-[#7C3AED]/30 text-[#E0AAFF] text-[11px] font-medium px-2.5 py-1 rounded-full">
                        🎁 Cortesia
                      </div>
                    </div>

                    {/* Descrição fake */}
                    <div className="space-y-1.5 mb-4">
                      <div className="h-2 w-full bg-white/10 rounded-full" />
                      <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                    </div>

                    {/* Botão fake */}
                    <div className="h-9 w-full bg-[#7C3AED]/40 rounded-lg flex items-center justify-center">
                      <span className="text-[12px] font-medium text-white/70">Ver benefício</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
