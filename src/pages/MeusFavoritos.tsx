import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Instagram, Globe, Heart, Loader2, Sparkles, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";

interface Estabelecimento {
  id: string;
  nome_fantasia: string | null;
  categoria: string | string[] | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  descricao_beneficio: string | null;
  regras_utilizacao: string | null;
  logo_url: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  horario_funcionamento: string | null;
  site: string | null;
}

const MeusFavoritos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<Estabelecimento[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUserAndLoadFavoritos();
  }, []);

  const checkUserAndLoadFavoritos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login/aniversariante");
        return;
      }

      setCurrentUser(user);
      await loadFavoritos(user.id);
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritos = async (userId: string) => {
    try {
      const { data: favoritosData, error } = await supabase
        .from("favoritos")
        .select(`
          estabelecimento_id,
          estabelecimentos (*)
        `)
        .eq("usuario_id", userId);

      if (error) throw error;

      const estabelecimentos = favoritosData
        ?.map((f: any) => f.estabelecimentos)
        .filter(Boolean) || [];

      setFavoritos(estabelecimentos);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos",
        variant: "destructive",
      });
    }
  };

  const removeFavorito = async (estabelecimentoId: string) => {
    try {
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("usuario_id", currentUser.id)
        .eq("estabelecimento_id", estabelecimentoId);

      if (error) throw error;

      setFavoritos(favoritos.filter(e => e.id !== estabelecimentoId));

      toast({
        title: "Removido dos favoritos",
        description: "Estabelecimento removido com sucesso",
      });
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos",
        variant: "destructive",
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Meus Favoritos
            </h1>
            <p className="text-muted-foreground">
              Estabelecimentos que você favoritou
            </p>
          </div>

          {favoritos.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não favoritou nenhum estabelecimento
                </p>
                <Button onClick={() => navigate("/")}>
                  Explorar Estabelecimentos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favoritos.map((estabelecimento) => (
                <Card key={estabelecimento.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                    {estabelecimento.logo_url ? (
                      <img
                        src={estabelecimento.logo_url}
                        alt={estabelecimento.nome_fantasia || "Logo"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/30">
                          {estabelecimento.nome_fantasia?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFavorito(estabelecimento.id)}
                      className="absolute top-3 right-3 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-all"
                      aria-label="Remover dos favoritos"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>

                    <Badge className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm">
                      {getCategoriaLabel(estabelecimento.categoria)}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">
                      {estabelecimento.nome_fantasia}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {estabelecimento.endereco && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-sm text-muted-foreground line-clamp-2">
                          {estabelecimento.endereco}
                        </span>
                        <button
                          onClick={() => openGoogleMaps(estabelecimento.endereco)}
                          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
                          aria-label="Abrir direções no Google Maps"
                        >
                          <Navigation className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {estabelecimento.horario_funcionamento && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-2">{estabelecimento.horario_funcionamento}</span>
                      </div>
                    )}

                    {estabelecimento.telefone && (
                      <a 
                        href={`tel:${estabelecimento.telefone}`}
                        onClick={() => trackEvent(estabelecimento.id, "clique_telefone")}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
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
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
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
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
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
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span>Visitar Site</span>
                      </a>
                    )}

                    {estabelecimento.descricao_beneficio && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mt-3">
                        <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 flex-shrink-0" />
                          Benefício
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {estabelecimento.descricao_beneficio}
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full mt-3"
                      onClick={() => navigate(`/emitir-cupom?estabelecimento=${estabelecimento.id}`)}
                    >
                      Emitir Cupom
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MeusFavoritos;
