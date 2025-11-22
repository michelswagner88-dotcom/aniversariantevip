import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, UserPlus, Gift, FileCheck, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";

export default function ComoFunciona() {
  const passos = [
    {
      numero: 1,
      icon: UserPlus,
      titulo: "Cadastre-se gratuitamente",
      descricao: "Crie sua conta no Aniversariante VIP e preencha seus dados (nome completo, CPF, telefone, e-mail e data de nascimento).",
    },
    {
      numero: 2,
      icon: Gift,
      titulo: "Escolha seus benefícios",
      descricao: "Navegue pelos estabelecimentos parceiros e emita cupons nos locais que mais combinam com você. Você pode emitir cupons em quantos lugares quiser.",
    },
    {
      numero: 3,
      icon: FileCheck,
      titulo: "Confira as regras de cada local",
      descricao: "Antes de usar, leia sempre as regras do benefício: dia em que vale, quantidade mínima de pessoas, consumação, necessidade de reserva, apresentação de documento com foto, etc.",
    },
    {
      numero: 4,
      icon: PartyPopper,
      titulo: "Apresente o cupom no dia",
      descricao: "No dia combinado, vá ao estabelecimento, apresente seu cupom de aniversário e aproveite seu momento especial com benefícios exclusivos.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <Crown className="h-16 w-16 text-primary mx-auto mb-6 animate-fade-in" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Como utilizar os benefícios do Aniversariante VIP
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Aproveite seu aniversário com vantagens exclusivas em diversos estabelecimentos
          </p>
        </div>
      </section>

      {/* Passos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {passos.map((passo, index) => (
              <Card 
                key={passo.numero}
                className="hover-scale transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <passo.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl font-bold text-primary">
                          {passo.numero}
                        </span>
                        <h3 className="text-xl font-semibold">{passo.titulo}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
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
      <section className="py-16 bg-gradient-to-t from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuita agora e comece a aproveitar benefícios exclusivos no seu aniversário
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/cadastro-aniversariante">
              <Button size="lg" className="text-lg px-8">
                <Crown className="mr-2 h-5 w-5" />
                Cadastrar-se Grátis
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Estabelecimentos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
