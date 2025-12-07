import { motion } from "framer-motion";
import { Heart, Users, Shield, Sparkles, Gift, Target } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";

const Sobre = () => {
  useSEO({
    title: "Sobre Nós | Aniversariante VIP",
    description: "Conheça o Aniversariante VIP - o maior guia de benefícios para aniversariantes do Brasil. Nossa missão é tornar cada aniversário especial."
  });

  const valores = [
    {
      icon: Heart,
      titulo: "Paixão por Celebrar",
      descricao: "Acreditamos que todo aniversário merece ser especial. Trabalhamos para criar momentos inesquecíveis."
    },
    {
      icon: Shield,
      titulo: "Transparência",
      descricao: "Benefícios claros, sem letras miúdas. O que você vê é o que você recebe."
    },
    {
      icon: Users,
      titulo: "Comunidade",
      descricao: "Conectamos aniversariantes a estabelecimentos parceiros, criando uma rede de celebração."
    },
    {
      icon: Sparkles,
      titulo: "Inovação",
      descricao: "Tecnologia de ponta para facilitar sua experiência e garantir benefícios exclusivos."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Botão Voltar */}
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <BackButton />
        </div>
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium mb-6">
                <Gift className="w-4 h-4" />
                Sobre Nós
              </span>
              
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-6">
                O Maior Guia de Benefícios para{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
                  Aniversariantes
                </span>{" "}
                do Brasil
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nascemos com uma missão simples: fazer de cada aniversário uma celebração inesquecível, 
                conectando você aos melhores benefícios da sua cidade.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Nossa Missão */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-violet-400" />
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    Nossa Missão
                  </h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Democratizar o acesso a benefícios exclusivos de aniversário para todos os brasileiros. 
                  Acreditamos que celebrar mais um ano de vida deveria vir acompanhado de experiências especiais.
                </p>
                <p className="text-muted-foreground">
                  Por isso, criamos uma plataforma que conecta você diretamente aos melhores estabelecimentos 
                  da sua região, oferecendo benefícios reais e sem complicação.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl sm:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-2">
                      🎂
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      Celebre com a gente
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
                Nossos Valores
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                O que nos guia todos os dias na construção da melhor experiência para você.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {valores.map((valor, index) => (
                <motion.div
                  key={valor.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-violet-500/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                    <valor.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {valor.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {valor.descricao}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Como Surgimos */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-6">
                Como Surgimos
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-left">
                <p className="text-muted-foreground mb-4">
                  A ideia do Aniversariante VIP nasceu de uma percepção simples: muitos estabelecimentos 
                  oferecem benefícios incríveis para aniversariantes, mas as pessoas simplesmente não sabem disso.
                </p>
                <p className="text-muted-foreground mb-4">
                  Em 2024, decidimos resolver esse problema criando o maior guia de benefícios de aniversário 
                  do Brasil. Nossa plataforma conecta você diretamente aos estabelecimentos parceiros, 
                  mostrando exatamente o que cada um oferece e como aproveitar.
                </p>
                <p className="text-muted-foreground">
                  Hoje, trabalhamos incansavelmente para expandir nossa rede de parceiros e levar benefícios 
                  exclusivos para aniversariantes em todas as cidades do país. Porque acreditamos que todo 
                  mundo merece se sentir VIP no seu dia especial.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-violet-500/20"
            >
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
                Pronto para Celebrar?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Cadastre-se gratuitamente e descubra os melhores benefícios de aniversário na sua cidade.
              </p>
              <a
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Gift className="w-5 h-5" />
                Criar Conta Grátis
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sobre;
