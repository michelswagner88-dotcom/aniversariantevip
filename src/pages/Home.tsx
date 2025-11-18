import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Gift, Crown } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ANIVERSARIANTE VIP</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/login/aniversariante" className="text-foreground hover:text-primary transition">
              Sou aniversariante
            </Link>
            <Link to="/login/estabelecimento" className="text-foreground hover:text-primary transition">
              Sou estabelecimento
            </Link>
            <Link to="/login/aniversariante">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/cadastro/aniversariante">
              <Button>Cadastrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-secondary rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">Programa de benefícios exclusivos</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Benefícios exclusivos para
            <span className="block text-primary mt-2">aniversariantes</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e tenha acesso a descontos e presentes especiais em diversos estabelecimentos no seu aniversário.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro/aniversariante">
              <Button size="lg" className="w-full sm:w-auto">
                <Gift className="mr-2 h-5 w-5" />
                Cadastrar como aniversariante
              </Button>
            </Link>
            <Link to="/cadastro/estabelecimento">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Crown className="mr-2 h-5 w-5" />
                Cadastrar meu estabelecimento
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 px-4 bg-secondary">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Como funciona</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-foreground">Cadastre-se</h4>
              <p className="text-muted-foreground">Crie sua conta gratuitamente informando seus dados e data de nascimento</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-foreground">Receba cupons</h4>
              <p className="text-muted-foreground">Estabelecimentos parceiros emitem cupons com benefícios especiais para você</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-foreground">Aproveite</h4>
              <p className="text-muted-foreground">Apresente seu cupom no estabelecimento e ganhe seu benefício exclusivo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2024 Aniversariante VIP. Todos os direitos reservados.</p>
          <div className="flex gap-4 justify-center">
            <a href="#" className="hover:text-primary transition">Termos de Uso</a>
            <a href="#" className="hover:text-primary transition">Política de Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
