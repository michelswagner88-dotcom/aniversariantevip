import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Gift, Crown, MapPin, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const estabelecimentosFicticios = [
  {
    id: "1",
    nomeFantasia: "Bier Vila",
    categoria: "bar",
    endereco: "Rua Felipe Schmidt, 250 - Centro, Florianópolis - SC",
    cidade: "Florianópolis",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sex: 17h às 23h | Sáb e Dom: 12h às 00h",
    beneficiosAniversariante: "1 cerveja artesanal grátis no dia do aniversário",
    regrasAniversariante: "Válido apenas no dia do aniversário. Apresentar documento com foto.",
  },
  {
    id: "2",
    nomeFantasia: "Restaurante Mar & Terra",
    categoria: "restaurante",
    endereco: "Av. Beira Mar Norte, 1500 - Centro, Florianópolis - SC",
    cidade: "Florianópolis",
    estado: "SC",
    diasHorarioFuncionamento: "Ter a Dom: 11h30 às 15h | 18h às 23h",
    beneficiosAniversariante: "Sobremesa grátis para o aniversariante",
    regrasAniversariante: "Válido na semana do aniversário. Mesa para no mínimo 2 pessoas.",
  },
  {
    id: "3",
    nomeFantasia: "Box 32",
    categoria: "balada",
    endereco: "Rua Jerônimo Coelho, 185 - Centro, Florianópolis - SC",
    cidade: "Florianópolis",
    estado: "SC",
    diasHorarioFuncionamento: "Qua a Sáb: 23h às 05h",
    beneficiosAniversariante: "Entrada VIP grátis + 1 drink de cortesia",
    regrasAniversariante: "Válido até 7 dias após o aniversário. Lista até 00h.",
  },
  {
    id: "4",
    nomeFantasia: "Loja Surf Life",
    categoria: "loja",
    endereco: "Rua das Rendeiras, 78 - Lagoa da Conceição, Florianópolis - SC",
    cidade: "Florianópolis",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sáb: 9h às 19h",
    beneficiosAniversariante: "20% de desconto em toda a loja",
    regrasAniversariante: "Válido no mês do aniversário. Não acumulativo com outras promoções.",
  },
  {
    id: "5",
    nomeFantasia: "Pizzaria Bella Napoli",
    categoria: "restaurante",
    endereco: "Rua Esteves Júnior, 605 - Centro, Florianópolis - SC",
    cidade: "Florianópolis",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Dom: 18h às 23h30",
    beneficiosAniversariante: "Pizza grande grátis na compra de 2 pizzas",
    regrasAniversariante: "Válido no dia do aniversário. Não válido para delivery.",
  },
  {
    id: "6",
    nomeFantasia: "Café & Livros",
    categoria: "loja",
    endereco: "Rua Felipe Schmidt, 390 - Centro, Florianópolis - SC",
    cidade: "Florianópolis",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sex: 8h às 20h | Sáb: 9h às 18h",
    beneficiosAniversariante: "Cappuccino + torta grátis",
    regrasAniversariante: "Válido na semana do aniversário.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedEstado, setSelectedEstado] = useState("todos");
  const [selectedCidade, setSelectedCidade] = useState("todos");
  const [selectedCategoria, setSelectedCategoria] = useState("todos");
  const [estabelecimentos, setEstabelecimentos] = useState(estabelecimentosFicticios);
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let filtered = estabelecimentosFicticios;

    if (selectedEstado !== "todos") {
      filtered = filtered.filter(e => e.estado === selectedEstado);
    }

    if (selectedCidade !== "todos") {
      filtered = filtered.filter(e => e.cidade === selectedCidade);
    }

    if (selectedCategoria !== "todos") {
      filtered = filtered.filter(e => e.categoria === selectedCategoria);
    }

    setEstabelecimentos(filtered);
  }, [selectedEstado, selectedCidade, selectedCategoria]);

  // Verificar se há um estabelecimento pendente após login
  useEffect(() => {
    const pendingEstabelecimentoId = localStorage.getItem("pendingEstabelecimento");
    if (pendingEstabelecimentoId) {
      const estabelecimento = estabelecimentosFicticios.find(e => e.id === pendingEstabelecimentoId);
      if (estabelecimento) {
        setSelectedEstabelecimento(estabelecimento);
        setDialogOpen(true);
        localStorage.removeItem("pendingEstabelecimento");
      }
    }
  }, []);

  const handleEmitirCupom = (estabelecimento: any) => {
    const currentUser = localStorage.getItem("currentAniversariante");
    if (!currentUser) {
      // Salvar o estabelecimento para abrir após o login
      localStorage.setItem("pendingEstabelecimento", estabelecimento.id);
      toast({
        variant: "destructive",
        title: "Login necessário",
        description: "Você precisa estar logado como aniversariante para solicitar cupom",
      });
      navigate("/login/aniversariante");
    } else {
      setSelectedEstabelecimento(estabelecimento);
      setDialogOpen(true);
    }
  };

  const handleSolicitarCupom = () => {
    toast({
      title: "Cupom solicitado!",
      description: "O estabelecimento irá analisar sua solicitação",
    });
    setDialogOpen(false);
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      bar: "Bar",
      restaurante: "Restaurante",
      balada: "Balada",
      loja: "Loja",
      servico: "Serviço",
    };
    return labels[categoria] || categoria;
  };

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

      {/* Estabelecimentos Parceiros */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8 text-foreground">Estabelecimentos Parceiros</h3>
          
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os estados</SelectItem>
                <SelectItem value="SC">Santa Catarina</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCidade} onValueChange={setSelectedCidade}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as cidades</SelectItem>
                <SelectItem value="Florianópolis">Florianópolis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas categorias</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="restaurante">Restaurante</SelectItem>
                <SelectItem value="balada">Balada</SelectItem>
                <SelectItem value="loja">Loja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Estabelecimentos */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estabelecimentos.map((estabelecimento) => (
              <Card key={estabelecimento.id} className="hover:border-primary transition">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{estabelecimento.nomeFantasia}</CardTitle>
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded text-xs text-primary">
                        <Tag className="h-3 w-3" />
                        {getCategoriaLabel(estabelecimento.categoria)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{estabelecimento.endereco}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{estabelecimento.diasHorarioFuncionamento}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Gift className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">{estabelecimento.beneficiosAniversariante}</span>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => handleEmitirCupom(estabelecimento)}
                  >
                    Solicitar Cupom
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {estabelecimentos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum estabelecimento encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </section>

      {/* Dialog de Detalhes do Estabelecimento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEstabelecimento?.nomeFantasia}</DialogTitle>
            <DialogDescription>Detalhes do estabelecimento e benefício</DialogDescription>
          </DialogHeader>
          {selectedEstabelecimento && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Categoria</h4>
                <p className="text-muted-foreground">{getCategoriaLabel(selectedEstabelecimento.categoria)}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Endereço</h4>
                <p className="text-muted-foreground">{selectedEstabelecimento.endereco}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Horário de Funcionamento</h4>
                <p className="text-muted-foreground">{selectedEstabelecimento.diasHorarioFuncionamento}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Benefício para Aniversariantes</h4>
                <p className="text-primary font-medium">{selectedEstabelecimento.beneficiosAniversariante}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Regras</h4>
                <p className="text-muted-foreground">{selectedEstabelecimento.regrasAniversariante}</p>
              </div>
              <Button onClick={handleSolicitarCupom} className="w-full">
                <Gift className="mr-2 h-4 w-4" />
                Confirmar Solicitação de Cupom
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
