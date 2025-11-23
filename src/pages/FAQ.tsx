import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CONTATOS } from "@/lib/constants";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function FAQ() {
  const faqItems = [
    {
      pergunta: "Posso usar vários benefícios no mesmo mês?",
      resposta: "Sim. Você pode emitir cupons para quantos estabelecimentos desejar, desde que respeite as regras de utilização de cada local.",
    },
    {
      pergunta: "Preciso sempre reservar antes de usar o benefício?",
      resposta: "Não necessariamente. Alguns estabelecimentos podem exigir reserva antecipada, enquanto outros funcionam por ordem de chegada. Sempre confira as condições de uso na descrição de cada benefício.",
    },
    {
      pergunta: "Para o aniversariante é gratuito?",
      resposta: "Sim, 100% gratuito! Acesse a plataforma e emita seus cupons sem pagar nada. Você só aproveita os benefícios.",
    },
    {
      pergunta: "E para o estabelecimento, como funciona?",
      resposta: "Para os estabelecimentos parceiros, existe uma mensalidade simbólica, com opções de planos trimestrais, semestrais e anuais.",
    },
    {
      pergunta: "Posso usar o cupom em qualquer dia?",
      resposta: "Depende das regras de utilização de cada estabelecimento. Alguns permitem uso apenas no dia do aniversário, outros na semana ou mês do aniversário. Sempre verifique as condições específicas antes de visitar.",
    },
    {
      pergunta: "Preciso apresentar documento?",
      resposta: "Isso varia conforme o estabelecimento parceiro. Para evitar qualquer problema, nossa recomendação é sempre levar um documento com foto. As regras específicas de cada benefício estão descritas no cupom.",
    },
    {
      pergunta: "O que acontece se eu perder meu cupom?",
      resposta: "Você pode acessar sua conta a qualquer momento e visualizar novamente todos os cupons emitidos. Recomendamos fazer screenshot ou salvar em seu celular para fácil acesso.",
    },
    {
      pergunta: "Como faço para me tornar parceiro?",
      resposta: "É simples! Acesse a página 'Seja Parceiro', preencha o cadastro com as informações do seu estabelecimento e escolha o plano que melhor se adequa ao seu negócio.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6 animate-fade-in" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Tire suas dúvidas sobre o Aniversariante VIP
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="animate-fade-in">
            <CardContent className="p-6 md:p-8">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-semibold">{item.pergunta}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.resposta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-t from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ainda Tem Dúvidas?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Entre em contato conosco. Estamos aqui para ajudar!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={`mailto:${CONTATOS.email}`}>
              <Button size="lg" className="text-lg px-8">
                <Mail className="mr-2 h-5 w-5" />
                {CONTATOS.email}
              </Button>
            </a>
            <a href={`https://wa.me/${CONTATOS.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Phone className="mr-2 h-5 w-5" />
                {CONTATOS.whatsapp}
              </Button>
            </a>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}
