import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { 
  Sparkles, 
  Calendar, 
  Handshake, 
  Zap,
  ArrowRight,
  Gift
} from "lucide-react";

export default function Sobre() {
  useSEO({
    title: SEO_CONTENT.sobre.title,
    description: SEO_CONTENT.sobre.description,
  });

  const valores = [
    {
      icon: Sparkles,
      titulo: "A magia do aniversário",
      texto: "Todo aniversário é único. A gente trabalha para criar momentos que ficam na memória.",
    },
    {
      icon: Calendar,
      titulo: "O mês inteiro é seu",
      texto: "Quando o benefício vale o mês todo, você escolhe o melhor dia para comemorar.",
    },
    {
      icon: Handshake,
      titulo: "Onde todo mundo ganha",
      texto: "Aniversariantes encontram vantagens. Estabelecimentos recebem clientes com intenção real.",
    },
    {
      icon: Zap,
      titulo: "Tecnologia a seu favor",
      texto: "Experiência rápida e intuitiva — do "descobrir" ao "celebrar".",
    },
  ];

  return (
    <div className="min-h-screen bg-[#240046]">
      <Header />

      {/* =========================================================================
          HERO
          ========================================================================= */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
        {/* Background sutil */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)"
          }}
        />

        <div className="relative max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Voltar */}
          <div className="mb-8">
            <BackButton />
          </div>

          <div className="text-center">
            {/* Eyebrow */}
            <span className="inline-block text-[#C77DFF] text-sm font-semibold uppercase tracking-wider mb-4">
              Sobre nós
            </span>

            {/* H1 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-[-0.02em] max-w-[860px] mx-auto">
              Seu passaporte VIP para um aniversário inesquecível
            </h1>

            {/* Subtítulo */}
            <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed max-w-[720px] mx-auto">
              O Aniversariante VIP existe para transformar o mês do seu aniversário em experiências especiais, com benefícios fáceis de usar e disponíveis nos melhores estabelecimentos de cada cidade.
            </p>

            {/* Microcopy */}
            <p className="mt-4 text-sm text-[#C77DFF] font-medium">
              100% Grátis para aniversariantes.
            </p>

            {/* Botões */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="h-12 px-6 bg-white text-[#240046] hover:bg-white/95 font-semibold rounded-full shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Link to="/explorar">
                  Encontrar benefícios
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-6 bg-transparent border-white/15 text-white/90 hover:bg-white/5 hover:text-white hover:border-white/25 font-medium rounded-full transition-all duration-200"
              >
                <Link to="/seja-parceiro">
                  Seja parceiro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MISSÃO
          ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#3C096C]/30">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-[720px]">
            {/* Eyebrow */}
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">
              Nossa missão
            </span>

            {/* Headline */}
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Democratizar a celebração
            </h2>

            {/* Texto */}
            <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed">
              Tornar o acesso a benefícios de aniversário fácil, transparente e realmente útil. A gente acredita que celebrar mais um ano de vida deve vir com vantagens reais — e com a experiência simples do jeito que tem que ser.
            </p>

            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
              Criamos uma plataforma que conecta aniversariantes a estabelecimentos parceiros, mostrando exatamente o que cada lugar oferece e como usar.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          VALORES
          ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">
              Nossos valores
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              No que acreditamos
            </h2>
          </div>

          {/* Grid de cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {valores.map((valor, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 lg:p-7 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Ícone */}
                  <div className="w-11 h-11 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <valor.icon className="w-5 h-5 text-[#C77DFF]" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1.5">
                      {valor.titulo}
                    </h3>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                      {valor.texto}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMO SURGIMOS
          ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#3C096C]/30">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-[720px]">
            {/* Eyebrow */}
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">
              Nossa história
            </span>

            {/* Headline */}
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Como surgimos
            </h2>

            {/* Textos */}
            <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed">
              A ideia nasceu de uma percepção simples: muitos lugares oferecem benefícios incríveis para aniversariantes — mas quase ninguém sabe onde estão, quais são e como usar.
            </p>

            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
              Então, decidimos resolver isso criando uma plataforma que organiza tudo em um só lugar, com informações objetivas e atualizadas.
            </p>

            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
              Hoje, seguimos expandindo nossa rede de parceiros para levar benefícios exclusivos a cada vez mais cidades. Porque todo mundo merece se sentir VIP no próprio aniversário.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CTA FINAL
          ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 text-center">
            {/* Ícone */}
            <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#7C3AED]/20">
              <Gift className="w-7 h-7 text-white" />
            </div>

            {/* Título */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Pronto para celebrar com a gente?
            </h2>

            {/* Texto */}
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-[600px] mx-auto mb-8">
              Encontre benefícios exclusivos na sua cidade — ou cadastre seu estabelecimento para receber aniversariantes todos os meses.
            </p>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="h-12 px-6 bg-white text-[#240046] hover:bg-white/95 font-semibold rounded-full shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Link to="/explorar">
                  Encontrar benefícios
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-6 bg-transparent border-white/15 text-white/90 hover:bg-white/5 hover:text-white hover:border-white/25 font-medium rounded-full transition-all duration-200"
              >
                <Link to="/seja-parceiro">
                  Seja parceiro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}