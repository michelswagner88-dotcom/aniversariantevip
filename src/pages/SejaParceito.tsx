import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, FileText, Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SejaParceiro() {
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

      {/* Como Funciona */}
      <section className="py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="hover-scale transition-all duration-300 animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Cadastre-se</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Preencha seus dados de acesso e informações do seu estabelecimento.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-300 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Defina seus benefícios</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Informe os benefícios para os aniversariantes e suas regras de utilização.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-300 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Escolha o seu plano</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Escolha um dos planos disponíveis para ativar sua oferta na plataforma.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-300 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Receba os aniversariantes</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Os aniversariantes emitem cupons no seu estabelecimento e apresentam no momento de utilização.
                </p>
              </CardContent>
            </Card>
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
            <Link to="/cadastro/estabelecimento">
              <Button size="lg" className="text-lg px-8">
                <Building2 className="mr-2 h-5 w-5" />
                Cadastrar Estabelecimento
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
