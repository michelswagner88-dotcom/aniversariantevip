import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { CONTATOS } from "@/lib/constants";

export default function FAQ() {
  useSEO({
    title: SEO_CONTENT.faq.title,
    description: SEO_CONTENT.faq.description,
  });

  const perguntas = [
    {
      pergunta: "Posso usar vários benefícios no mesmo mês?",
      resposta: "Sim. Você pode aproveitar benefícios em quantos estabelecimentos quiser, desde que respeite as regras de uso de cada local (dia/semana/mês do aniversário, horários, consumo mínimo, etc.)."
    },
    {
      pergunta: "Preciso sempre reservar antes de usar o benefício?",
      resposta: "Não necessariamente. Alguns estabelecimentos exigem reserva antecipada, outros funcionam por ordem de chegada. Sempre confira as condições na página do benefício."
    },
    {
      pergunta: "Para o aniversariante é gratuito?",
      resposta: "Sim, 100% gratuito! Você só precisa acessar a plataforma, escolher o estabelecimento e seguir as regras do benefício."
    },
    {
      pergunta: "E para o estabelecimento, como funciona?",
      resposta: "Para os estabelecimentos parceiros, existe uma mensalidade, com opções de planos mensais, trimestrais, semestrais e anuais."
    },
    {
      pergunta: "Posso usar o benefício em qualquer dia?",
      resposta: "Depende das regras de cada estabelecimento. Alguns permitem somente no dia do aniversário, outros liberam na semana ou no mês. Verifique as condições específicas antes de ir."
    },
    {
      pergunta: "Preciso apresentar documento?",
      resposta: "Isso varia conforme o estabelecimento. Para evitar qualquer problema, recomendamos levar um documento com foto (alguns locais podem pedir para confirmar a data de nascimento)."
    },
    {
      pergunta: "Preciso mostrar algo no local?",
      resposta: "Não precisa. Ao chegar, basta informar que você quer usar o benefício de aniversariante e seguir as condições descritas na página do benefício (regras de data, horários, consumo mínimo e demais exigências do local). Se preferir, deixe a página aberta no celular para facilitar."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        {/* Header */}
        <div className="py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground">Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2">
            Tire suas dúvidas sobre o Aniversariante VIP
          </p>
        </div>

        {/* Perguntas em acordeão */}
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <Accordion type="single" collapsible className="space-y-4">
            {perguntas.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border/20 rounded-xl px-6"
              >
                <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                  <span className="text-foreground">{index + 1}. {item.pergunta}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contato */}
          <div className="mt-12 text-center p-8 bg-card border border-border/20 rounded-2xl">
            <h2 className="text-xl font-bold text-foreground mb-2">Ainda tem dúvidas?</h2>
            <p className="text-muted-foreground mb-6">
              Entre em contato conosco. Estamos aqui para ajudar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`mailto:${CONTATOS.email}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition"
              >
                <Mail size={18} />
                {CONTATOS.email}
              </a>
              <a 
                href={`https://wa.me/${CONTATOS.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition"
              >
                <Phone size={18} />
                {CONTATOS.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
