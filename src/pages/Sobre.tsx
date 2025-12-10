import { motion } from "framer-motion";
import { Heart, Users, Shield, Sparkles, Gift, Target, ArrowRight, Rocket, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const Sobre = () => {
  const navigate = useNavigate();

  useSEO({
    title: "Sobre Nós | Aniversariante VIP",
    description:
      "Conheça o Aniversariante VIP - o maior guia de benefícios para aniversariantes do Brasil. Nossa missão é tornar cada aniversário especial.",
  });

  const valores = [
    {
      icon: Heart,
      titulo: "A Magia do Aniversário",
      descricao:
        "Todo aniversário é único. Trabalhamos para criar momentos que ficam na memória, transformando uma data comum em algo inesquecível.",
    },
    {
      icon: Calendar,
      titulo: "O Mês Inteiro é Seu",
      descricao:
        "Muitos estabelecimentos liberam o benefício durante todo o mês do aniversário. Mais tempo para você escolher quando e onde celebrar.",
    },
    {
      icon: Users,
      titulo: "Onde Todos Ganham",
      descricao:
        "Unimos aniversariantes que querem celebrar e estabelecimentos que querem receber. Uma rede de valor para os dois lados.",
    },
    {
      icon: Sparkles,
      titulo: "Tecnologia a Seu Favor",
      descricao:
        "Utilizamos tecnologia moderna para você encontrar benefícios de forma rápida, intuitiva e sem complicação.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#240046]">
      <Header />

      <main>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6"
              >
                <Gift className="w-4 h-4 text-[#C77DFF]" />
                <span className="text-sm text-white/90 font-medium">Sobre nós</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
              >
                O Seu Passaporte VIP para o{" "}
                <span className="bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] bg-clip-text text-transparent">
                  Aniversário Perfeito
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
              >
                O Aniversariante VIP nasceu com uma missão simples: transformar o mês do seu aniversário em uma
                experiência verdadeiramente especial. Somos o maior guia de benefícios para aniversariantes do Brasil.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Nossa Missão */}
        <section className="py-16 px-4 bg-[#3C096C]/30">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#C77DFF]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Democratizar a Celebração</h2>
                </div>

                <p className="text-white/70 mb-4 leading-relaxed">
                  Tornar o acesso a benefícios de aniversário fácil e transparente para todos aproveitarem. Acreditamos
                  que celebrar mais um ano de vida deve vir com experiências especiais.
                </p>

                <p className="text-white/70 leading-relaxed">
                  Criamos uma plataforma que conecta você diretamente aos melhores estabelecimentos da sua região, com
                  benefícios reais e sem complicação.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-7xl sm:text-8xl mb-4">🎂</div>
                    <p className="text-lg font-semibold text-white">Celebre com a gente</p>
                    <p className="text-white/60 text-sm mt-1">Todo dia é dia de alguém</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <span className="text-[#C77DFF] text-sm font-semibold uppercase tracking-wider">O que nos guia</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">Nossos valores</h2>
              <p className="text-white/60 max-w-xl mx-auto">Princípios que direcionam cada decisão que tomamos</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {valores.map((valor, index) => (
                <motion.div
                  key={valor.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#240046] border border-white/10 rounded-2xl p-6 hover:border-[#7C3AED]/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <valor.icon className="w-6 h-6 text-[#C77DFF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{valor.titulo}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{valor.descricao}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Nossa História */}
        <section className="py-16 px-4 bg-[#3C096C]/30">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-[#C77DFF]" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Como surgimos</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#240046] border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  A ideia nasceu de uma percepção simples:{" "}
                  <span className="text-white font-medium">
                    muitos estabelecimentos oferecem benefícios incríveis para aniversariantes, mas as pessoas
                    simplesmente não sabem.
                  </span>
                </p>

                <p>
                  Em 2024, decidimos resolver esse problema. Criamos o maior guia de benefícios de aniversário do
                  Brasil, uma plataforma que conecta você diretamente aos estabelecimentos parceiros, mostrando
                  exatamente o que cada um oferece.
                </p>

                <p>
                  Hoje, trabalhamos para expandir nossa rede de parceiros e levar benefícios exclusivos para
                  aniversariantes em todas as cidades do país.{" "}
                  <span className="text-white font-medium">
                    Porque todo mundo merece se sentir VIP no seu dia especial.
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4">
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-3xl p-8 sm:p-10 text-center overflow-hidden"
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C3AED]/20 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#9D4EDD] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30">
                  <Gift className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Pronto para Celebrar com a Gente?</h2>
                <p className="text-white/70 mb-8 max-w-sm mx-auto">
                  Encontre benefícios exclusivos ou cadastre seu estabelecimento como parceiro
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/explorar")}
                    size="lg"
                    className="bg-white text-[#240046] hover:bg-white/90 font-semibold px-8 py-6 h-auto text-base rounded-full shadow-xl shadow-black/20 hover:scale-105 transition-all duration-300"
                  >
                    Encontrar Benefícios
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={() => navigate("/seja-parceiro")}
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-6 h-auto text-base rounded-full hover:scale-105 transition-all duration-300"
                  >
                    Seja Parceiro
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sobre;
