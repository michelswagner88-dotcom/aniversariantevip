import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, FileText, Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SejaParceiro() {
  const passos = [
    {
      numero: 1,
      icon: Building2,
      titulo: "Cadastre sua empresa",
      descricao: "Preencha os dados completos da empresa e selecione uma ou mais categorias que representem seu segmento (ex.: restaurante, bar, casa noturna, loja, serviços, etc.).",
    },
    {
      numero: 2,
      icon: FileText,
      titulo: "Defina seus benefícios para aniversariantes",
      descricao: "Informe quais vantagens você quer oferecer: cortesias, descontos, combos especiais, brindes, entrada VIP, etc.",
    },
    {
      numero: 3,
      icon: Settings,
      titulo: "Configure as regras de utilização",
      descricao: "Descreva claramente: dia(s) em que o benefício é válido (dia, semana ou mês do aniversário), quantidade mínima de pessoas quando houver, se exige ou não reserva antecipada, se é necessária apresentação de documento com foto, condições adicionais (consumo mínimo, áreas específicas do salão, horários, etc.).",
    },
    {
      numero: 4,
      icon: Users,
      titulo: "Comece a receber aniversariantes",
      descricao: "Depois de aprovado, seu estabelecimento passa a aparecer no Aniversariante VIP e os usuários podem emitir cupons para comemorar com você.",
    },
  ];

  const vantagens = [
    {
      titulo: "Mais movimento",
      descricao: "Aniversariante raramente comemora sozinho. Ele traz amigos, família, colegas de trabalho. Um único cupom pode representar uma mesa cheia de novos clientes.",
      icon: Users,
    },
    {
      titulo: "Posicionamento diferenciado",
      descricao: "Seu estabelecimento se torna referência em celebrações, aparecendo em uma plataforma focada 100% em aniversários, destaque frente à concorrência.",
      icon: Building2,
    },
    {
      titulo: "Marketing direcionado",
      descricao: "Divulgação ativa e contínua para um público com alta intenção de consumo: pessoas que estão prestes a comemorar aniversário e já procuram onde ir.",
      icon: FileText,
    },
    {
      titulo: "Baixo custo e retorno recorrente",
      descricao: "Investimento muito menor que outras formas de mídia tradicional, com potencial de retorno mês após mês, enquanto sua empresa estiver na plataforma.",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <Building2 className="h-16 w-16 text-primary mx-auto mb-6 animate-fade-in" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Como se tornar um estabelecimento parceiro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Atraia mais clientes e destaque seu negócio na plataforma de benefícios para aniversariantes
          </p>
        </div>
      </section>

      {/* Passos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como Começar</h2>
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

      {/* Vantagens */}
      <section className="py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Vantagens de Ser Parceiro Aniversariante VIP
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Descubra como a parceria pode transformar seu negócio
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {vantagens.map((vantagem, index) => (
              <Card 
                key={index}
                className="hover-scale transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <vantagem.icon className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{vantagem.titulo}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {vantagem.descricao}
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
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto Para Ser Parceiro?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cadastre seu estabelecimento e comece a atrair mais clientes agora mesmo
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/cadastro-estabelecimento">
              <Button size="lg" className="text-lg px-8">
                <Building2 className="mr-2 h-5 w-5" />
                Cadastrar Estabelecimento
              </Button>
            </Link>
            <Link to="/planos-pagamento">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Planos e Preços
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
