import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Gift, MapPin, Search, LogOut, Download, User, Calendar, Building, X, Phone, Clock, ExternalLink, Instagram, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavLink } from "@/components/NavLink";

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
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.biervila.com.br",
    logoUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3333-4444",
    whatsapp: "(48) 98765-4321",
    emailContato: "contato@biervila.com.br",
    instagram: "biervila",
    facebook: "biervilafln",
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
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.mareterra.com.br",
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3222-5678",
    whatsapp: "(48) 97654-3210",
    emailContato: "reservas@mareterra.com.br",
    instagram: "mareterra",
    facebook: "mareterrafloripa",
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
    periodoValidade: "dia",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=200&h=200&fit=crop",
    telefoneContato: "(48) 99999-8888",
    whatsapp: "(48) 96543-2109",
    emailContato: "lista@box32.com.br",
    instagram: "box32floripa",
    facebook: "box32oficial",
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
    periodoValidade: "mes",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3232-1010",
    whatsapp: "(48) 99232-1010",
    emailContato: "vendas@surflife.com.br",
    instagram: "surflifebrasil",
    facebook: "surflifeoficial",
  },
  {
    id: "5",
    nomeFantasia: "Pizzaria Bella Napoli",
    categoria: "restaurante",
    endereco: "Rua Esteves Júnior, 605 - Centro, Florianópolis - SC",
    cidade: "Florianópolis",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Dom: 18h às 23h30",
    beneficiosAniversariante: "Pizza média grátis para o aniversariante",
    regrasAniversariante: "Válido no dia do aniversário. Mesa para no mínimo 3 pessoas.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.bellanapoli.com.br",
    logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3224-5566",
    whatsapp: "(48) 99224-5566",
    emailContato: "delivery@bellanapoli.com.br",
    instagram: "bellanapolifloripa",
    facebook: "bellanapolioficial",
  },
  {
    id: "6",
    nomeFantasia: "Churrascaria Bom Sabor",
    categoria: "restaurante",
    endereco: "Av. Acioni Souza Filho, 1800 - Kobrasol, São José - SC",
    cidade: "São José",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Dom: 11h às 15h | 18h às 23h",
    beneficiosAniversariante: "Rodízio completo grátis para o aniversariante",
    regrasAniversariante: "Válido no dia do aniversário. Mesa para no mínimo 2 pessoas.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.bomsabor.com.br",
    logoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3288-7700",
    whatsapp: "(48) 99288-7700",
    emailContato: "contato@bomsabor.com.br",
    instagram: "bomsaborsj",
    facebook: "bomsaboroficial",
  },
  {
    id: "7",
    nomeFantasia: "Bar do Alemão",
    categoria: "bar",
    endereco: "Rua José Maria da Luz, 123 - Centro, São José - SC",
    cidade: "São José",
    estado: "SC",
    diasHorarioFuncionamento: "Ter a Dom: 16h às 00h",
    beneficiosAniversariante: "Porção de petiscos grátis + 1 chopp",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.bardoalemao.com.br",
    logoUrl: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3246-8899",
    whatsapp: "(48) 99246-8899",
    emailContato: "alemao@bardoalemao.com.br",
    instagram: "bardoalemaosj",
    facebook: "bardoalemaooficial",
  },
  {
    id: "8",
    nomeFantasia: "Café & Cia",
    categoria: "restaurante",
    endereco: "Av. Pedra Branca, 2500 - Pedra Branca, Palhoça - SC",
    cidade: "Palhoça",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sáb: 8h às 20h | Dom: 9h às 18h",
    beneficiosAniversariante: "Bolo do dia + café especial grátis",
    regrasAniversariante: "Válido na semana do aniversário.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.cafeecia.com.br",
    logoUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3242-3344",
    whatsapp: "(48) 99242-3344",
    emailContato: "contato@cafeecia.com.br",
    instagram: "cafeeciapalhoca",
    facebook: "cafeeciaoficial",
  },
  {
    id: "9",
    nomeFantasia: "Academia Fitness Pro",
    categoria: "servico",
    endereco: "Rua Nereu Ramos, 456 - Centro, Palhoça - SC",
    cidade: "Palhoça",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sex: 6h às 22h | Sáb: 8h às 14h",
    beneficiosAniversariante: "1 mês de musculação grátis",
    regrasAniversariante: "Válido no mês do aniversário. Apenas para novos alunos.",
    periodoValidade: "mes",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3279-1122",
    whatsapp: "(48) 99279-1122",
    emailContato: "info@fitnesspro.com.br",
    instagram: "fitnesspropalhoca",
    facebook: "fitnessprooficial",
  },
  {
    id: "10",
    nomeFantasia: "Hamburgueria do Cheff",
    categoria: "restaurante",
    endereco: "Rua Manoel Isidoro da Silveira, 789 - Centro, Biguaçu - SC",
    cidade: "Biguaçu",
    estado: "SC",
    diasHorarioFuncionamento: "Ter a Dom: 18h às 23h",
    beneficiosAniversariante: "Hambúrguer artesanal grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.hamburgueriadocheff.com.br",
    logoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3285-5566",
    whatsapp: "(48) 99285-5566",
    emailContato: "pedidos@hamburgueriadocheff.com.br",
    instagram: "hamburgueriadocheff",
    facebook: "hamburgueriadocheffoficial",
  },
  {
    id: "11",
    nomeFantasia: "Loja Moda Bella",
    categoria: "loja",
    endereco: "Av. Tereza Cristina, 321 - Centro, Biguaçu - SC",
    cidade: "Biguaçu",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sex: 9h às 19h | Sáb: 9h às 17h",
    beneficiosAniversariante: "15% de desconto em toda a loja",
    regrasAniversariante: "Válido no mês do aniversário. Não acumulativo com outras promoções.",
    periodoValidade: "mes",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop",
    telefoneContato: "(48) 3243-6677",
    whatsapp: "(48) 99243-6677",
    emailContato: "vendas@modabella.com.br",
    instagram: "modabellabiguacu",
    facebook: "modabellaoficial",
  },
];

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const cupomRef = useRef<HTMLDivElement>(null);
  const [estabelecimentos, setEstabelecimentos] = useState(estabelecimentosFicticios);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedCidade, setSelectedCidade] = useState<string>("todas");
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cupomGerado, setCupomGerado] = useState<any>(null);
  const [showCupom, setShowCupom] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentAniversariante");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    const estabelecimentosCadastrados = localStorage.getItem("estabelecimentos");
    if (estabelecimentosCadastrados) {
      const parsed = JSON.parse(estabelecimentosCadastrados);
      setEstabelecimentos([...estabelecimentosFicticios, ...parsed]);
    }
  }, []);

  useEffect(() => {
    const pendingId = localStorage.getItem("pendingEstabelecimento");
    if (pendingId && currentUser) {
      const estabelecimento = estabelecimentos.find((e) => e.id === pendingId);
      if (estabelecimento) {
        setSelectedEstabelecimento(estabelecimento);
        setDialogOpen(true);
        localStorage.removeItem("pendingEstabelecimento");
      }
    }
  }, [currentUser, estabelecimentos]);

  const handleEmitirCupom = (estabelecimento: any) => {
    const currentUserData = localStorage.getItem("currentAniversariante");
    if (!currentUserData) {
      localStorage.setItem("pendingEstabelecimento", estabelecimento.id);
      toast({
        variant: "destructive",
        title: "Login Necessário",
        description: "Você precisa estar logado como aniversariante",
      });
      navigate("/login/aniversariante");
    } else {
      setSelectedEstabelecimento(estabelecimento);
      setDialogOpen(true);
    }
  };

  const handleSolicitarCupom = () => {
    if (!currentUser || !selectedEstabelecimento) return;

    const novoCupom = {
      id: Date.now().toString(),
      estabelecimentoId: selectedEstabelecimento.id,
      estabelecimentoNome: selectedEstabelecimento.nomeFantasia,
      estabelecimentoLogo: selectedEstabelecimento.logoUrl,
      aniversarianteId: currentUser.id,
      aniversarianteNome: currentUser.nomeCompleto,
      aniversarianteDataNascimento: currentUser.dataNascimento,
      regras: selectedEstabelecimento.regrasAniversariante,
      codigo: `ANIV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      dataEmissao: new Date().toISOString(),
      usado: false,
    };

    const cupons = JSON.parse(localStorage.getItem("cupons") || "[]");
    cupons.push(novoCupom);
    localStorage.setItem("cupons", JSON.stringify(cupons));

    setCupomGerado(novoCupom);
    setDialogOpen(false);
    setShowCupom(true);

    toast({
      title: "Cupom Emitido!",
      description: "Seu cupom foi gerado com sucesso",
    });
  };

  const handlePrintCupom = () => {
    window.print();
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      bar: "Bares",
      restaurante: "Restaurantes",
      balada: "Baladas",
      loja: "Lojas",
      servico: "Serviços",
    };
    return labels[categoria] || categoria;
  };

  // Get unique states and cities
  const estados = Array.from(new Set(estabelecimentos.map(e => e.estado))).sort();
  const cidadesDisponiveis = selectedEstado === "todos" 
    ? Array.from(new Set(estabelecimentos.map(e => e.cidade))).sort()
    : Array.from(new Set(estabelecimentos.filter(e => e.estado === selectedEstado).map(e => e.cidade))).sort();

  const filteredEstabelecimentos = estabelecimentos.filter((est) => {
    const matchesSearch = est.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = selectedCategoria === "todas" || est.categoria === selectedCategoria;
    const matchesEstado = selectedEstado === "todos" || est.estado === selectedEstado;
    const matchesCidade = selectedCidade === "todas" || est.cidade === selectedCidade;
    return matchesSearch && matchesCategoria && matchesEstado && matchesCidade;
  });

  const handleLogout = () => {
    localStorage.removeItem("currentAniversariante");
    setCurrentUser(null);
    toast({
      title: "Até Logo!",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border print:hidden sticky top-0 bg-background z-40 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-primary whitespace-nowrap">ANIVERSARIANTE VIP</h1>
          </div>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {/* Aniversariante Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  Aniversariante
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/login/aniversariante" className="cursor-pointer w-full">
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cadastro/aniversariante" className="cursor-pointer w-full">
                    Cadastro
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Estabelecimento Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  Estabelecimento
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/login/estabelecimento" className="cursor-pointer w-full">
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cadastro/estabelecimento" className="cursor-pointer w-full">
                    Cadastro
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-primary/10 to-background print:hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground leading-tight">
            Seu Aniversário Merece Benefícios Especiais!
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Descubra estabelecimentos parceiros que oferecem benefícios exclusivos para você curtir seu dia especial
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 sm:py-6 md:py-8 bg-background print:hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col gap-3 max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar estabelecimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-11 sm:h-10 text-base"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger className="w-full h-11 sm:h-10 text-base">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Categorias</SelectItem>
                  <SelectItem value="bar">Bares</SelectItem>
                  <SelectItem value="restaurante">Restaurantes</SelectItem>
                  <SelectItem value="balada">Baladas</SelectItem>
                  <SelectItem value="loja">Lojas</SelectItem>
                  <SelectItem value="servico">Serviços</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedEstado} onValueChange={(value) => {
                setSelectedEstado(value);
                setSelectedCidade("todas");
              }}>
                <SelectTrigger className="w-full h-11 sm:h-10 text-base">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Estados</SelectItem>
                  {estados.map(estado => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCidade} onValueChange={setSelectedCidade}>
                <SelectTrigger className="w-full h-11 sm:h-10 text-base">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Cidades</SelectItem>
                  {cidadesDisponiveis.map(cidade => (
                    <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="py-6 sm:py-8 md:py-12 bg-background print:hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {filteredEstabelecimentos.map((estabelecimento) => (
              <Card key={estabelecimento.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 sm:h-48 overflow-hidden">
                  <img
                    src={estabelecimento.logoUrl}
                    alt={estabelecimento.nomeFantasia}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl mb-1">{estabelecimento.nomeFantasia}</CardTitle>
                  <p className="text-sm text-muted-foreground">{getCategoriaLabel(estabelecimento.categoria)}</p>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{estabelecimento.endereco}</span>
                  </div>

                  {estabelecimento.diasHorarioFuncionamento && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{estabelecimento.diasHorarioFuncionamento}</span>
                    </div>
                  )}

                  {estabelecimento.telefoneContato && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <a href={`tel:${estabelecimento.telefoneContato}`} className="hover:text-primary transition-colors">
                        {estabelecimento.telefoneContato}
                      </a>
                    </div>
                  )}

                  {estabelecimento.instagram && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Instagram className="h-4 w-4 flex-shrink-0" />
                      <a 
                        href={`https://instagram.com/${estabelecimento.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        @{estabelecimento.instagram}
                      </a>
                    </div>
                  )}

                  {estabelecimento.linkCardapioDigital && (
                    <a 
                      href={estabelecimento.linkCardapioDigital} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      Ver Cardápio Digital
                    </a>
                  )}
                  
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-semibold text-primary mb-1">🎁 Benefício</p>
                    <p className="text-sm sm:text-base text-foreground">{estabelecimento.beneficiosAniversariante}</p>
                  </div>

                  <div className="text-xs sm:text-sm text-muted-foreground italic">
                    <div>{estabelecimento.regrasAniversariante}</div>
                    <div className="mt-1">Apresentar cupom emitido.</div>
                  </div>
                  
                  <Button 
                    className="w-full h-11 text-base font-semibold" 
                    onClick={() => handleEmitirCupom(estabelecimento)}
                  >
                    Emitir Cupom
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEstabelecimentos.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground text-base sm:text-lg">
                Nenhum estabelecimento encontrado.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Detalhes do Estabelecimento</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Confira as informações e emita seu cupom
            </DialogDescription>
          </DialogHeader>
          {selectedEstabelecimento && (
            <div className="space-y-4 sm:space-y-5">
              {selectedEstabelecimento.logoUrl && (
                <div className="flex justify-center">
                  <img
                    src={selectedEstabelecimento.logoUrl}
                    alt={selectedEstabelecimento.nomeFantasia}
                    className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg sm:text-xl mb-1">
                  {selectedEstabelecimento.nomeFantasia}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">{getCategoriaLabel(selectedEstabelecimento.categoria)}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-base">Localização</h4>
                <p className="text-sm sm:text-base text-muted-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  {selectedEstabelecimento.endereco}
                </p>
              </div>

              {selectedEstabelecimento.diasHorarioFuncionamento && (
                <div>
                  <h4 className="font-semibold mb-2 text-base">Horário</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">{selectedEstabelecimento.diasHorarioFuncionamento}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2 text-base">Benefício</h4>
                <p className="text-sm sm:text-base text-primary font-medium">{selectedEstabelecimento.beneficiosAniversariante}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-base">Regras</h4>
                <p className="text-sm sm:text-base text-muted-foreground">{selectedEstabelecimento.regrasAniversariante}</p>
              </div>
              
              <Button onClick={handleSolicitarCupom} className="w-full h-12 text-base font-semibold">
                <Gift className="mr-2 h-5 w-5" />
                Emitir Cupom
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cupom Modal */}
      {showCupom && cupomGerado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 print:relative print:bg-transparent">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto print:max-h-none">
            <div className="sticky top-0 bg-background border-b p-3 sm:p-4 flex items-center justify-between print:hidden z-10">
              <h2 className="text-lg sm:text-xl font-bold">Seu Cupom</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCupom(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div ref={cupomRef} className="p-4 sm:p-6 md:p-8">
              <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-primary shadow-lg">
                <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
                  <div className="text-center space-y-2 pb-3 sm:pb-4 border-b-2 border-dashed border-primary/30">
                    {cupomGerado.estabelecimentoLogo ? (
                      <img 
                        src={cupomGerado.estabelecimentoLogo} 
                        alt={cupomGerado.estabelecimentoNome}
                        className="h-12 w-12 sm:h-16 sm:w-16 mx-auto rounded-full object-cover mb-2"
                      />
                    ) : (
                      <Building className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-primary mb-2" />
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-primary">🎂 CUPOM DE ANIVERSÁRIO</h2>
                    <p className="text-base sm:text-lg font-semibold">{cupomGerado.estabelecimentoNome}</p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-background/50 rounded-lg">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Aniversariante</p>
                        <p className="font-semibold text-sm sm:text-base break-words">{cupomGerado.aniversarianteNome}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-background/50 rounded-lg">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground">Data de Nascimento</p>
                        <p className="font-semibold text-sm sm:text-base">
                          {new Date(cupomGerado.aniversarianteDataNascimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-background/50 rounded-lg">
                      <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Regras</p>
                        <p className="text-xs sm:text-sm break-words">{cupomGerado.regras}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Código</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary font-mono tracking-wider break-all">{cupomGerado.codigo}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Emitido: {new Date(cupomGerado.dataEmissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t-2 border-dashed border-primary/30">
                    <p className="text-xs sm:text-sm text-center text-muted-foreground italic">
                      📸 Tire print ou salve este cupom<br />
                      e apresente no estabelecimento
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-2 print:hidden">
              <Button onClick={handlePrintCupom} className="flex-1 h-12 text-base font-semibold">
                <Download className="mr-2 h-5 w-5" />
                Salvar / Imprimir
              </Button>
              <Button variant="outline" onClick={() => setShowCupom(false)} className="flex-1 h-12 text-base font-semibold">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-muted py-6 sm:py-8 mt-12 sm:mt-16 print:hidden">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 Aniversariante VIP - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
