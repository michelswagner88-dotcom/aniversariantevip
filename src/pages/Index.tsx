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
import { CATEGORIAS_ESTABELECIMENTO, ESTADOS_CIDADES, ESTADOS } from "@/lib/constants";
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
  instagram: string | null;
  horario_funcionamento: string | null;
}

const Index = () => {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedCidade, setSelectedCidade] = useState("");
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
  const estabelecimentosFiltrados = selectedCategoria 
    ? estabelecimentos.filter((est) => {
        const matchesSearch = est.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesCategoria = Array.isArray(est.categoria) 
          ? est.categoria.includes(selectedCategoria) 
          : est.categoria === selectedCategoria;
        const matchesEstado = !selectedEstado || est.estado === selectedEstado;
        const matchesCidade = !selectedCidade || est.cidade === selectedCidade;

        return matchesSearch && matchesCategoria && matchesEstado && matchesCidade;
      })
    : [];

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section Premium */}
      <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide leading-tight">
              O MAIOR GUIA DE BENEFÍCIOS PARA ANIVERSARIANTES DO BRASIL
            </span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-foreground leading-tight animate-fade-in px-2">
            Seu Aniversário<br />
            <span className="text-primary">Merece Celebração</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 animate-fade-in px-4 leading-relaxed">
            Encontre estabelecimentos com benefícios especiais para o seu aniversário: do mês inteiro ao grande dia de comemoração.
          </p>

          {!currentUser && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in px-4">
              <Button size="lg" asChild className="text-sm sm:text-base w-full sm:w-auto min-h-[48px]">
                <a href="/cadastro/aniversariante">Cadastrar-se Grátis</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-sm sm:text-base w-full sm:w-auto min-h-[48px]">
                <a href="/login/aniversariante">Já Sou Cadastrado</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6 sm:py-8 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-5xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar estabelecimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 sm:h-14 text-base"
                />
              </div>
              {(selectedEstado || selectedCidade || selectedCategoria || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEstado("");
                    setSelectedCidade("");
                    setSelectedCategoria("");
                    setSearchTerm("");
                  }}
                  className="h-12 sm:h-14 px-4 whitespace-nowrap"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select 
                value={selectedEstado} 
                onValueChange={(value) => {
                  setSelectedEstado(value);
                  setSelectedCidade("");
                }}
              >
                <SelectTrigger className="h-12 sm:h-14 text-base">
                  <SelectValue placeholder="Selecione o Estado" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {ESTADOS.map(estado => (
                    <SelectItem key={estado.value} value={estado.value} className="text-base py-3">
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedCidade} 
                onValueChange={setSelectedCidade}
                disabled={!selectedEstado}
              >
                <SelectTrigger className="h-12 sm:h-14 text-base">
                  <SelectValue placeholder={selectedEstado ? "Selecione a Cidade" : "Selecione o Estado primeiro"} />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {selectedEstado && ESTADOS_CIDADES[selectedEstado as keyof typeof ESTADOS_CIDADES]?.map(cidade => (
                    <SelectItem key={cidade} value={cidade} className="text-base py-3">
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger className="h-12 sm:h-14 text-base">
                  <SelectValue placeholder="Selecione a Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {CATEGORIAS_ESTABELECIMENTO.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-base py-3">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Contador de Resultados */}
      {(selectedCategoria || selectedEstado || selectedCidade) && (
        <div className="container mx-auto px-4 max-w-7xl pt-6">
          <p className="text-sm sm:text-base text-muted-foreground">
            <span className="font-semibold text-foreground">
              {estabelecimentosFiltrados.length}
            </span>{" "}
            {estabelecimentosFiltrados.length === 1 
              ? "estabelecimento encontrado" 
              : "estabelecimentos encontrados"}
          </p>
        </div>
      )}

      {/* Listagem de Estabelecimentos */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          {!selectedEstado ? (
            <div className="text-center py-12 sm:py-20 px-4">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
                <Search className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">
                Comece Sua Busca
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground px-4">
                Selecione um estado para ver os estabelecimentos disponíveis
              </p>
            </div>
          ) : sortedGroups.length === 0 ? (
            <div className="text-center py-12 sm:py-20 px-4">
              <p className="text-base sm:text-lg text-muted-foreground">
                Nenhum estabelecimento encontrado com os filtros selecionados.
              </p>
            </div>
          ) : (
            sortedGroups.map((group) => (
              <div key={`${group.estado}-${group.cidade}`} className="mb-12 sm:mb-16">
                <div className="mb-6 sm:mb-8 px-2">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-2 sm:gap-3">
                    <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                    <span className="break-words">{group.cidade}, {group.estado}</span>
                  </h2>
                  <div className="h-1 w-20 sm:w-24 bg-primary/60 mt-3 rounded-full" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {group.estabelecimentos.map((estabelecimento, index) => (
                    <Card 
                      key={estabelecimento.id} 
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-2 animate-fade-in group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative h-44 sm:h-48 overflow-hidden">
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
                            className={`absolute top-3 right-3 p-3 rounded-full backdrop-blur-md transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                              isFavorito(estabelecimento.id)
                                ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                                : 'bg-background/80 text-foreground hover:bg-background hover:scale-105'
                            }`}
                            aria-label={isFavorito(estabelecimento.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          >
                            <Heart 
                              className={`h-5 w-5 transition-all ${
                                isFavorito(estabelecimento.id) ? 'fill-current' : ''
                              }`}
                            />
                          </button>
                        )}
                        
                        <Badge className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm text-xs sm:text-sm px-2 py-1">
                          {getCategoriaLabel(estabelecimento.categoria)}
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-3 px-4 sm:px-6">
                        <CardTitle className="text-lg sm:text-xl leading-tight break-words">
                          {estabelecimento.nome_fantasia}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                        {estabelecimento.endereco && (
                          <button
                            onClick={() => openGoogleMaps(estabelecimento.endereco)}
                            className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left group/link min-h-[44px] py-2"
                            aria-label="Abrir no Google Maps"
                          >
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
                            <span className="line-clamp-2 group-hover/link:underline">{estabelecimento.endereco}</span>
                          </button>
                        )}

                        {estabelecimento.telefone && (
                          <a 
                            href={`tel:${estabelecimento.telefone}`} 
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2"
                            aria-label="Ligar para o estabelecimento"
                          >
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{estabelecimento.telefone}</span>
                          </a>
                        )}

                        {estabelecimento.horario_funcionamento && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-h-[44px] py-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{estabelecimento.horario_funcionamento}</span>
                          </div>
                        )}

                        {estabelecimento.instagram && (
                          <a 
                            href={`https://instagram.com/${estabelecimento.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2"
                            aria-label="Ver Instagram"
                          >
                            <Instagram className="h-4 w-4 flex-shrink-0" />
                            <span>{estabelecimento.instagram}</span>
                          </a>
                        )}
                        
                        {currentUser ? (
                          <>
                            <div className="p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20 mt-3">
                              <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 flex-shrink-0" />
                                Benefícios e Regras
                              </p>
                              {estabelecimento.descricao_beneficio && (
                                <p className="text-sm text-foreground leading-relaxed break-words mb-2">
                                  {estabelecimento.descricao_beneficio}
                                </p>
                              )}
                              {estabelecimento.regras_utilizacao && (
                                <p className="text-xs text-muted-foreground italic break-words leading-relaxed mt-2 pt-2 border-t border-primary/10">
                                  {estabelecimento.regras_utilizacao}
                                </p>
                              )}
                            </div>

                            <Button 
                              className="w-full mt-3"
                              onClick={() => window.location.href = `/area/aniversariante?emitir=${estabelecimento.id}`}
                            >
                              Emitir Cupom
                            </Button>
                          </>
                        ) : (
                          <div className="relative p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg border-2 border-primary/30 mt-3 overflow-hidden animate-fade-in">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.15),transparent_70%)]" />
                            <div className="relative z-10 text-center space-y-3">
                              <div className="flex items-center justify-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                                <Sparkles className="h-4 w-4 text-primary animate-pulse" style={{ animationDelay: '0.3s' }} />
                              </div>
                              <p className="text-base sm:text-lg font-bold text-primary leading-tight">
                                Faça o cadastro para<br />ver os benefícios!!
                              </p>
                              <Button 
                                asChild 
                                size="lg"
                                className="w-full min-h-[48px] text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                              >
                                <a href="/cadastro/aniversariante">Ver Benefícios</a>
                              </Button>
                            </div>
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
