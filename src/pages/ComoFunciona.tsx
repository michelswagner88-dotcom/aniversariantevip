import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import {
  Search,
  MapPin,
  Gift,
  PartyPopper,
  Clock,
  Heart,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function ComoFunciona() {
  useSEO({
    title: SEO_CONTENT.comoFunciona.title,
    description: SEO_CONTENT.comoFunciona.description,
  });

  const passos = [
    {
      numero: "1",
      icon: Search,
      titulo: "Busque uma cidade",
      descricao: "Digite a cidade e descubra os estabelecimentos que oferecem benefícios para aniversariantes.",
    },
    {
      numero: "2",
      icon: MapPin,
      titulo: "Escolha o lugar",
      descricao: "Explore bares, restaurantes, salões, academias e muito mais. Veja o benefício de cada um.",
    },
    {
      numero: "3",
      icon: Gift,
      titulo: "Confira as regras",
      descricao: "Cada lugar tem suas condições — leia com atenção para aproveitar sem surpresas.",
    },
    {
      numero: "4",
      icon: PartyPopper,
      titulo: "Vá e celebre",
      descricao: "Apresente um documento com sua data de nascimento e aproveite seu benefício.",
    },
  ];

  const vantagens = [
    {
      icon: Clock,
      titulo: "O mês inteiro",
      descricao: "A maioria dos benefícios vale durante todo o mês do seu aniversário.",
    },
    {
      icon: Heart,
      titulo: "100% grátis",
      descricao: "Você não paga nada para usar a plataforma.",
    },
    {
      icon: Sparkles,
      titulo: "Benefícios reais",
      descricao: "Descontos, cortesias, brindes — vantagens que fazem diferença.",
    },
    {
      icon: Shield,
      titulo: "Informação clara",
      descricao: "Cada página mostra exatamente o que você ganha e como usar.",
    },
    {
      icon: MapPin,
      titulo: "Perto de você",
      descricao: "Encontre opções na sua cidade ou onde você for comemorar.",
    },
    {
      icon: CheckCircle2,
      titulo: "Parceiros verificados",
      descricao: "Trabalhamos apenas com estabelecimentos que realmente entregam o benefício.",
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
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)",
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
              Como funciona
            </span>

            {/* H1 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-[-0.02em] max-w-[860px] mx-auto">
              Descubra benefícios e celebre do seu jeito
            </h1>

            {/* Subtítulo */}
            <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed max-w-[720px] mx-auto">
              Usar o Aniversariante VIP é simples: você busca, escolhe e aproveita.
            </p>

            {/* Botão */}
            <div className="mt-8">
              <Button
                asChild
                className="h-12 px-6 bg-white text-[#240046] hover:bg-white/95 font-semibold rounded-full shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Link to="/cadastro">
                  Criar conta VIP
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4 PASSOS
          ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#3C096C]/30">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">Passo a passo</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Em 4 passos simples
            </h2>
          </div>

          {/* Grid de passos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {passos.map((passo, index) => (
              <div
                key={index}
                className="relative bg-[#240046] border border-white/10 rounded-3xl p-5 sm:p-6 hover:border-[#7C3AED]/30 transition-all duration-300 group"
              >
                {/* Número */}
                <div className="absolute -top-3 -left-2 w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-lg flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
                  <span className="text-white font-bold text-sm">{passo.numero}</span>
                </div>

                {/* Ícone */}
                <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center mb-4 mt-2 group-hover:scale-105 transition-transform">
                  <passo.icon className="w-6 h-6 text-[#C77DFF]" />
                </div>

                {/* Conteúdo */}
                <h3 className="text-lg font-semibold text-white mb-2">{passo.titulo}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{passo.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          VANTAGENS
          ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">Vantagens</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Por que usar o Aniversariante VIP
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/60 max-w-[600px] mx-auto">
              Tudo o que você precisa para aproveitar seu mês especial
            </p>
          </div>

          {/* Grid de vantagens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {vantagens.map((vantagem, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Ícone */}
                  <div className="w-11 h-11 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <vantagem.icon className="w-5 h-5 text-[#C77DFF]" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1">{vantagem.titulo}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{vantagem.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          O QUE VOCÊ PRECISA
          ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#3C096C]/30">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-[720px]">
            {/* Eyebrow */}
            <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">Na hora de usar</span>

            {/* Headline */}
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              O que levar no dia
            </h2>

            {/* Lista */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C77DFF]" />
                </div>
                <div>
                  <p className="text-white font-medium">Documento com foto e data de nascimento</p>
                  <p className="text-sm text-white/60 mt-0.5">RG, CNH ou outro documento oficial</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C77DFF]" />
                </div>
                <div>
                  <p className="text-white font-medium">Estar no mês do seu aniversário</p>
                  <p className="text-sm text-white/60 mt-0.5">A maioria dos benefícios vale o mês inteiro</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C77DFF]" />
                </div>
                <div>
                  <p className="text-white font-medium">Conferir as regras antes de ir</p>
                  <p className="text-sm text-white/60 mt-0.5">Cada estabelecimento tem suas condições específicas</p>
                </div>
              </div>
            </div>

            {/* Dica */}
            <div className="mt-8 p-4 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-2xl">
              <p className="text-sm text-white/80">
                <span className="font-semibold text-[#C77DFF]">Dica:</span> Alguns lugares pedem reserva antecipada ou
                têm dias específicos para o benefício. Sempre confira na página do estabelecimento.
              </p>
            </div>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Pronto para descobrir seu benefício?</h2>

            {/* Texto */}
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-[600px] mx-auto mb-8">
              Busque agora os estabelecimentos que oferecem vantagens para aniversariantes na sua cidade.
            </p>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="h-12 px-6 bg-white text-[#240046] hover:bg-white/95 font-semibold rounded-full shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Link to="/cadastro">
                  Criar conta VIP
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-6 bg-transparent border-white/15 text-white/90 hover:bg-white/5 hover:text-white hover:border-white/25 font-medium rounded-full transition-all duration-200"
              >
                <Link to="/seja-parceiro">Seja parceiro</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
