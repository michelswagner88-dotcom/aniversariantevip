import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Phone, Clock, ExternalLink, Heart, Sparkles, Instagram } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { useFavoritos } from "@/hooks/useFavoritos";

interface Estabelecimento {
  id: string;
  nome_fantasia: string | null;
  categoria: string | string[] | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  descricao_beneficio: string | null;
  regras_utilizacao: string | null;
  periodo_validade_beneficio: string | null;
  logo_url: string | null;
  telefone: string | null;
  link_cardapio: string | null;
}

const Index = () => {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("todas");
  const [selectedEstado, setSelectedEstado] = useState("todos");
  const [selectedCidade, setSelectedCidade] = useState("todas");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const { favoritos, toggleFavorito, isFavorito, loading: favoritosLoading } = useFavoritos(currentUser?.id || null);

  useEffect(() => {
    checkUser();
    loadEstabelecimentos();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadEstabelecimentos = async () => {
    const { data, error } = await supabase
      .from("estabelecimentos")
      .select("*")
      .order("nome_fantasia");

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os estabelecimentos",
        variant: "destructive",
      });
      return;
    }

    setEstabelecimentos(data || []);
  };

  const getCategoriaLabel = (categoria: string | string[] | null) => {
    if (!categoria) return "Outros";
    const cat = Array.isArray(categoria) ? categoria[0] : categoria;
    const found = CATEGORIAS_ESTABELECIMENTO.find(c => c.value === cat);
    return found?.label || "Outros";
  };

  const openGoogleMaps = (endereco: string | null) => {
    if (!endereco) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(url, "_blank");
  };

  // Filtros
  const estabelecimentosFiltrados = estabelecimentos.filter((est) => {
    const matchesSearch = est.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategoria = selectedCategoria === "todas" || 
      (Array.isArray(est.categoria) ? est.categoria.includes(selectedCategoria) : est.categoria === selectedCategoria);
    const matchesEstado = selectedEstado === "todos" || est.estado === selectedEstado;
    const matchesCidade = selectedCidade === "todas" || est.cidade === selectedCidade;

    return matchesSearch && matchesCategoria && matchesEstado && matchesCidade;
  });

  // Agrupamento por localização
  const estabelecimentosAgrupados = estabelecimentosFiltrados.reduce((acc, est) => {
    const key = `${est.estado}-${est.cidade}`;
    if (!acc[key]) {
      acc[key] = {
        estado: est.estado || "",
        cidade: est.cidade || "",
        estabelecimentos: [],
      };
    }
    acc[key].estabelecimentos.push(est);
    return acc;
  }, {} as Record<string, { estado: string; cidade: string; estabelecimentos: Estabelecimento[] }>);

  const sortedGroups = Object.values(estabelecimentosAgrupados).sort((a, b) => {
    if (a.estado !== b.estado) return a.estado.localeCompare(b.estado);
    return a.cidade.localeCompare(b.cidade);
  });

  // Estados e cidades disponíveis
  const estados = Array.from(new Set(estabelecimentos.map(e => e.estado).filter(Boolean))) as string[];
  const cidadesDisponiveis = selectedEstado === "todos" 
    ? Array.from(new Set(estabelecimentos.map(e => e.cidade).filter(Boolean))) as string[]
    : Array.from(new Set(estabelecimentos.filter(e => e.estado === selectedEstado).map(e => e.cidade).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section Premium */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Benefícios Exclusivos</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight animate-fade-in">
            Seu Aniversário<br />
            <span className="text-primary">Merece Celebração</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
            Descubra centenas de estabelecimentos parceiros com benefícios exclusivos para o seu dia especial
          </p>

          {!currentUser && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" asChild className="text-base">
                <a href="/cadastro/aniversariante">Cadastrar-se Grátis</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <a href="/login/aniversariante">Já sou cadastrado</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 max-w-5xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar estabelecimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Categorias</SelectItem>
                  {CATEGORIAS_ESTABELECIMENTO.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEstado} onValueChange={(value) => {
                setSelectedEstado(value);
                setSelectedCidade("todas");
              }}>
                <SelectTrigger className="h-12">
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
                <SelectTrigger className="h-12">
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

      {/* Listagem de Estabelecimentos */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          {sortedGroups.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Nenhum estabelecimento encontrado.</p>
            </div>
          ) : (
            sortedGroups.map((group) => (
              <div key={`${group.estado}-${group.cidade}`} className="mb-16">
                <div className="mb-8">
                  <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-primary" />
                    {group.cidade}, {group.estado}
                  </h2>
                  <div className="h-1 w-24 bg-primary/60 mt-3 rounded-full" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.estabelecimentos.map((estabelecimento, index) => (
                    <Card 
                      key={estabelecimento.id} 
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={estabelecimento.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop"}
                          alt={estabelecimento.nome_fantasia || "Estabelecimento"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {currentUser && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorito(estabelecimento.id);
                            }}
                            disabled={favoritosLoading}
                            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 ${
                              isFavorito(estabelecimento.id)
                                ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                                : 'bg-background/80 text-foreground hover:bg-background hover:scale-105'
                            }`}
                          >
                            <Heart 
                              className={`h-5 w-5 transition-all ${
                                isFavorito(estabelecimento.id) ? 'fill-current' : ''
                              }`}
                            />
                          </button>
                        )}
                        
                        <Badge className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm">
                          {getCategoriaLabel(estabelecimento.categoria)}
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl">{estabelecimento.nome_fantasia}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {estabelecimento.endereco && (
                          <button
                            onClick={() => openGoogleMaps(estabelecimento.endereco)}
                            className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left group/link"
                          >
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
                            <span className="line-clamp-2 group-hover/link:underline">{estabelecimento.endereco}</span>
                          </button>
                        )}

                        {estabelecimento.telefone && (
                          <a href={`tel:${estabelecimento.telefone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Phone className="h-4 w-4" />
                            {estabelecimento.telefone}
                          </a>
                        )}

                        {estabelecimento.link_cardapio && (
                          <a 
                            href={estabelecimento.link_cardapio} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver Cardápio
                          </a>
                        )}
                        
                        {currentUser && estabelecimento.descricao_beneficio && (
                          <>
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mt-4">
                              <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Benefício Exclusivo
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {estabelecimento.descricao_beneficio}
                              </p>
                            </div>

                            {estabelecimento.regras_utilizacao && (
                              <p className="text-xs text-muted-foreground italic">
                                {estabelecimento.regras_utilizacao}
                              </p>
                            )}
                          </>
                        )}

                        {!currentUser && (
                          <div className="p-4 bg-muted/50 rounded-lg border border-border mt-4">
                            <p className="text-sm text-muted-foreground text-center">
                              <a href="/cadastro/aniversariante" className="text-primary hover:underline font-medium">
                                Cadastre-se grátis
                              </a> para ver os benefícios
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
