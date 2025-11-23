import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Phone, Clock, ExternalLink, Heart, Sparkles, Instagram, Globe, Share2, Navigation } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BenefitsBanner } from "@/components/BenefitsBanner";
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
  whatsapp: string | null;
  instagram: string | null;
  horario_funcionamento: string | null;
  site: string | null;
}

const Index = () => {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("todas");
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

  const trackEvent = async (estabelecimentoId: string, tipoEvento: string) => {
    try {
      await supabase.from("estabelecimento_analytics").insert({
        estabelecimento_id: estabelecimentoId,
        tipo_evento: tipoEvento,
        user_id: currentUser?.id || null,
      });
    } catch (error) {
      console.error("Erro ao registrar evento:", error);
    }
  };

  const handleShare = async (estabelecimento: Estabelecimento, platform: string) => {
    const url = `${window.location.origin}/?est=${estabelecimento.id}`;
    const text = `Confira os benefícios de aniversário em ${estabelecimento.nome_fantasia}!`;
    
    await trackEvent(estabelecimento.id, "compartilhamento");
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copiado!",
          description: "O link foi copiado para a área de transferência",
        });
        break;
    }
  };

  // Filtros
  const estabelecimentosFiltrados = estabelecimentos.filter((est) => {
    const matchesSearch = !searchTerm || est.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategoria = !selectedCategoria || selectedCategoria === "todas"
      ? true 
      : Array.isArray(est.categoria) 
        ? est.categoria.includes(selectedCategoria) 
        : est.categoria === selectedCategoria;
    const matchesEstado = !selectedEstado || est.estado === selectedEstado;
    const matchesCidade = !selectedCidade || est.cidade === selectedCidade;

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
                <a href="/cadastro/aniversariante">Cadastre-se Grátis</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-sm sm:text-base w-full sm:w-auto min-h-[48px]">
                <a href="/login/aniversariante">Já Sou Cadastrado</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Banner */}
      {!currentUser && <BenefitsBanner />}

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
              {(selectedEstado || selectedCidade || (selectedCategoria && selectedCategoria !== "todas") || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEstado("");
                    setSelectedCidade("");
                    setSelectedCategoria("todas");
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
                  <SelectItem value="todas" className="text-base py-3 font-semibold">
                    Ver Todas Categorias
                  </SelectItem>
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
      {((selectedCategoria && selectedCategoria !== "todas") || selectedEstado || selectedCidade || searchTerm) && (
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
                          <div className="flex items-start gap-2 min-h-[44px] py-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                            <span className="flex-1 text-sm text-muted-foreground line-clamp-2">
                              {estabelecimento.endereco}
                            </span>
                            <button
                              onClick={() => openGoogleMaps(estabelecimento.endereco)}
                              className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
                              aria-label="Abrir direções no Google Maps"
                              title="Abrir direções"
                            >
                              <Navigation className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {estabelecimento.horario_funcionamento && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-h-[44px] py-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-2">{estabelecimento.horario_funcionamento}</span>
                          </div>
                        )}

                        {estabelecimento.telefone && (
                          <a 
                            href={`tel:${estabelecimento.telefone}`} 
                            onClick={() => trackEvent(estabelecimento.id, "clique_telefone")}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2"
                            aria-label="Ligar para o estabelecimento"
                          >
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{estabelecimento.telefone}</span>
                          </a>
                        )}

                        {estabelecimento.whatsapp && (
                          <a 
                            href={`https://wa.me/55${estabelecimento.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent(estabelecimento.id, "clique_whatsapp")}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2"
                            aria-label="WhatsApp"
                          >
                            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span>{estabelecimento.whatsapp}</span>
                          </a>
                        )}

                        {estabelecimento.instagram && (
                          <a 
                            href={`https://instagram.com/${estabelecimento.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent(estabelecimento.id, "clique_instagram")}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2"
                            aria-label="Ver Instagram"
                          >
                            <Instagram className="h-4 w-4 flex-shrink-0" />
                            <span>@{estabelecimento.instagram}</span>
                          </a>
                        )}

                        {estabelecimento.site && (
                          <a 
                            href={estabelecimento.site.startsWith('http') ? estabelecimento.site : `https://${estabelecimento.site}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent(estabelecimento.id, "clique_site")}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2"
                            aria-label="Visitar site"
                          >
                            <Globe className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{estabelecimento.site}</span>
                          </a>
                        )}

                        {/* Botões de Compartilhamento */}
                        <div className="pt-3 mt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            Compartilhar:
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleShare(estabelecimento, 'whatsapp')}
                              className="p-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-colors"
                              aria-label="Compartilhar no WhatsApp"
                            >
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleShare(estabelecimento, 'facebook')}
                              className="p-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors"
                              aria-label="Compartilhar no Facebook"
                            >
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleShare(estabelecimento, 'copy')}
                              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                              aria-label="Copiar link"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
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
                              onClick={() => window.location.href = `/emitir-cupom?estabelecimento=${estabelecimento.id}`}
                            >
                              Emitir Cupom
                            </Button>
                          </>
                        ) : (
                          <div className="relative p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg border-2 border-primary/30 mt-3 overflow-hidden animate-fade-in">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.15),transparent_70%)]" />
                            <div className="relative z-10 text-center space-y-4">
                              <div className="flex items-center justify-center gap-2">
                                <Sparkles className="h-6 w-6 text-primary animate-pulse drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                                <Sparkles className="h-5 w-5 text-primary animate-pulse drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" style={{ animationDelay: '0.2s' }} />
                                <Sparkles className="h-4 w-4 text-primary animate-pulse drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" style={{ animationDelay: '0.4s' }} />
                              </div>
                              <Button 
                                asChild 
                                size="lg"
                                className="w-full min-h-[48px] text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                              >
                                <a href="/login/aniversariante">Ver Benefícios</a>
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
