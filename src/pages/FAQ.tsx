import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, HelpCircle, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { CONTATOS } from "@/lib/constants";
import { motion, type Variants } from "framer-motion";

export default function FAQ() {
  useSEO({
    title: SEO_CONTENT.faq.title,
    description: SEO_CONTENT.faq.description,
  });

  const perguntas = [
    {
      pergunta: "Para o aniversariante é gratuito?",
      resposta:
        "Sim, 100% gratuito! Você só precisa criar sua conta, escolher o estabelecimento e seguir as regras do benefício. Sem taxas, sem pegadinhas.",
    },
    {
      pergunta: "Posso usar vários benefícios no mesmo mês?",
      resposta:
        "Sim! Você pode aproveitar benefícios em quantos estabelecimentos quiser, desde que respeite as regras de cada local (período válido, horários, consumo mínimo, etc.).",
    },
    {
      pergunta: "Preciso reservar antes de ir?",
      resposta:
        "Depende do estabelecimento. Alguns exigem reserva antecipada, outros funcionam por ordem de chegada. Sempre confira as condições na página do benefício antes de ir.",
    },
    {
      pergunta: "Posso usar o benefício em qualquer dia?",
      resposta:
        "Varia conforme as regras de cada lugar. Alguns permitem só no dia do aniversário, outros liberam na semana ou no mês inteiro. Verifique as condições específicas.",
    },
    {
      pergunta: "Preciso apresentar documento?",
      resposta:
        "Recomendamos levar um documento com foto. Alguns estabelecimentos podem pedir para confirmar sua data de nascimento.",
    },
    {
      pergunta: "Preciso mostrar algo no celular?",
      resposta:
        "Não é obrigatório. Basta informar que quer usar o benefício de aniversariante e seguir as condições descritas. Se preferir, deixe a página do benefício aberta no celular para facilitar.",
    },
    {
      pergunta: "E para estabelecimentos, como funciona?",
      resposta:
        "Para os parceiros existe uma mensalidade acessível, com opções de planos mensais, trimestrais, semestrais e anuais. Quanto maior o período, maior o desconto.",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#240046]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 pb-12 px-4 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#7C3AED]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          {/* Botão Voltar */}
          <div className="mb-8">
            <BackButton />
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <HelpCircle className="w-4 h-4 text-[#C77DFF]" />
              <span className="text-sm text-white/90 font-medium">Central de ajuda</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Perguntas frequentes</h1>
            <p className="text-white/70 max-w-lg mx-auto">Tire suas dúvidas sobre como funciona o Aniversariante VIP</p>
          </motion.div>
        </div>
      </section>

      {/* Perguntas em acordeão */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <Accordion type="single" collapsible className="space-y-3">
              {perguntas.map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <AccordionItem
                    value={`item-${index}`}
                    className="bg-[#1a0033] border border-white/10 rounded-xl px-5 sm:px-6 data-[state=open]:border-[#7C3AED]/30 transition-colors"
                  >
                    <AccordionTrigger className="text-left font-medium py-4 hover:no-underline group">
                      <span className="text-white group-hover:text-[#C77DFF] transition-colors flex items-start gap-3">
                        <span className="text-[#7C3AED] font-semibold flex-shrink-0">
                          {String(index + 1).padStart(2, "0")}.
                        </span>
                        <span>{item.pergunta}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/70 pb-5 pl-9 leading-relaxed">
                      {item.resposta}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Contato */}
      <section className="px-4 pb-20">
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="relative bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-3xl p-8 text-center overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/20 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative">
              <div className="w-14 h-14 bg-[#7C3AED]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-7 h-7 text-[#C77DFF]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Ainda tem dúvidas?</h2>
              <p className="text-white/70 mb-6">Fale com a gente. Estamos aqui para ajudar!</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.a
                  href={`mailto:${CONTATOS.email}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#240046] font-semibold rounded-full hover:bg-white/90 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-4 h-4" />
                  {CONTATOS.email}
                </motion.a>

                <motion.a
                  href={`https://wa.me/${CONTATOS.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#25D366]/90 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-4 h-4" />
                  {CONTATOS.whatsapp}
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
