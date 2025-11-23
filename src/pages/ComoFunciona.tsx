import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, UserPlus, Gift, FileCheck, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ComoFunciona() {
  const passos = [
    {
      numero: 1,
      icon: UserPlus,
      titulo: "Crie Sua Conta",
      descricao: "Crie sua conta com seus dados básicos para liberar os benefícios.",
    },
    {
      numero: 2,
      icon: Gift,
      titulo: "Emita Seus Cupons",
      descricao: "Navegue pelos estabelecimentos parceiros e emita cupons em quantos locais desejar.",
    },
    {
      numero: 3,
      icon: FileCheck,
      titulo: "Leia as Regras",
      descricao: "Antes de utilizar seu cupom, leia atentamente as regras de cada estabelecimento.",
    },
    {
      numero: 4,
      icon: PartyPopper,
      titulo: "Aproveite o Seu Benefício",
      descricao: "Apresente o cupom no estabelecimento e curta seus benefícios de aniversário.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <Crown className="h-16 w-16 text-primary mx-auto mb-6 animate-fade-in drop-shadow-lg" />
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in uppercase tracking-tight">
            Como Funciona
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed">
            Aproveite seu aniversário com vantagens exclusivas em diversos estabelecimentos
          </p>
        </div>
      </section>

      {/* Passos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {passos.map((passo, index) => (
              <Card 
                key={passo.numero}
                className="hover-scale transition-all duration-300 animate-fade-in border-primary/20 bg-gradient-to-br from-card via-card to-primary/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/30">
                        <passo.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-5xl font-bold text-primary/40">
                          {passo.numero}
                        </span>
                        <h3 className="text-2xl font-bold uppercase tracking-wide">{passo.titulo}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {passo.descricao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-t from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-tight">Pronto Para Começar?</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Crie sua conta gratuita agora e comece a aproveitar benefícios exclusivos no seu aniversário
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link to="/cadastro-aniversariante">
              <Button size="lg" className="text-lg px-10 py-6 uppercase font-semibold">
                <Crown className="mr-2 h-6 w-6" />
                Cadastrar-Se Grátis
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 uppercase font-semibold">
                Ver Estabelecimentos
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}
