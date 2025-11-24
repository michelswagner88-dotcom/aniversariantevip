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
import { CATEGORIAS_ESTABELECIMENTO, ESTADOS_CIDADES, ESTADOS } from "@/lib/constants";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
    <div className="min-h-screen flex flex-col bg-slate-950 pt-20">
      <Header />

      {/* Hero Section - State of the Art */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 px-6">
        {/* Grid Pattern Background (Camada 1) */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Glow Orbs (Camada 2) - Aurora Boreal Effect */}
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-violet-600/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-slate-300">Cadastro 100% Gratuito</span>
          </div>

          {/* H1 - Título Principal (Tipografia de Impacto) */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight leading-[1.1] animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-white">
              O Maior Guia de Benefícios
              <br />
              para Aniversariantes do{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              Brasil
            </span>
          </h1>

          {/* H2 - Subtítulo */}
          <h2 className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl mb-12 sm:mb-16 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Aqui seu aniversário vale muito mais. Encontre benefícios exclusivos para aproveitar no dia, na semana ou no mês inteiro.
          </h2>

          {/* Barra de Busca Hyper-Glass */}
          <div className="w-full max-w-4xl mt-8 sm:mt-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div 
              className="backdrop-blur-2xl bg-white/5 rounded-2xl p-3 border border-white/10"
              style={{
                boxShadow: '0 0 50px -12px rgba(139,92,246,0.3)'
              }}
            >
              {/* Desktop Layout */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto] gap-3 items-center">
                <div className="flex items-center gap-3 px-4">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={selectedEstado} onValueChange={(value) => {
                    setSelectedEstado(value);
                    setSelectedCidade("");
                  }}>
                    <SelectTrigger className="border-none bg-transparent text-white placeholder:text-slate-300 h-12 focus:ring-0 [&>span]:!bg-transparent [&>span]:appearance-none">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 z-50">
                      {ESTADOS.map(estado => (
                        <SelectItem key={estado.value} value={estado.value} className="text-white">
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Separador Vertical (Cristal) */}
                <div className="h-8 w-[1px] bg-white/10" />

                <div className="flex items-center gap-3 px-4">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={selectedCidade} onValueChange={setSelectedCidade} disabled={!selectedEstado}>
                    <SelectTrigger className="border-none bg-transparent text-white placeholder:text-slate-300 h-12 focus:ring-0 disabled:opacity-50 [&>span]:!bg-transparent [&>span]:appearance-none">
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 z-50">
                      {selectedEstado && ESTADOS_CIDADES[selectedEstado as keyof typeof ESTADOS_CIDADES]?.map(cidade => (
                        <SelectItem key={cidade} value={cidade} className="text-white">
                          {cidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Separador Vertical (Cristal) */}
                <div className="h-8 w-[1px] bg-white/10" />

                <div className="flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger className="border-none bg-transparent text-white placeholder:text-slate-300 h-12 focus:ring-0 [&>span]:!bg-transparent [&>span]:appearance-none">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 z-50">
                      <SelectItem value="todas" className="text-white font-semibold">
                        Todas Categorias
                      </SelectItem>
                      {CATEGORIAS_ESTABELECIMENTO.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  size="lg"
                  onClick={() => navigate("/explorar")}
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white h-12 px-8 rounded-xl font-semibold shadow-lg shadow-violet-500/25"
                >
                  Buscar
                </Button>
              </div>

              {/* Mobile Layout */}
              <div className="sm:hidden flex flex-col">
                <div className="flex items-center gap-3 px-4 h-12 border-b border-white/10">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={selectedEstado} onValueChange={(value) => {
                    setSelectedEstado(value);
                    setSelectedCidade("");
                  }}>
                    <SelectTrigger className="border-none bg-transparent text-white placeholder:text-slate-300 h-12 focus:ring-0 [&>span]:!bg-transparent">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 z-50">
                      {ESTADOS.map(estado => (
                        <SelectItem key={estado.value} value={estado.value} className="text-white">
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 px-4 h-12 border-b border-white/10">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={selectedCidade} onValueChange={setSelectedCidade} disabled={!selectedEstado}>
                    <SelectTrigger className="border-none bg-transparent text-white placeholder:text-slate-300 h-12 focus:ring-0 disabled:opacity-50 [&>span]:!bg-transparent">
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 z-50">
                      {selectedEstado && ESTADOS_CIDADES[selectedEstado as keyof typeof ESTADOS_CIDADES]?.map(cidade => (
                        <SelectItem key={cidade} value={cidade} className="text-white">
                          {cidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 px-4 h-12 border-b border-white/10">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger className="border-none bg-transparent text-white placeholder:text-slate-300 h-12 focus:ring-0 [&>span]:!bg-transparent">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 z-50">
                      <SelectItem value="todas" className="text-white font-semibold">
                        Todas Categorias
                      </SelectItem>
                      {CATEGORIAS_ESTABELECIMENTO.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3">
                  <Button 
                    size="lg"
                    onClick={() => navigate("/explorar")}
                    className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white h-12 rounded-xl font-semibold shadow-lg shadow-violet-500/25 w-full"
                  >
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Footer */}
          <p className="text-slate-500 text-sm mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Junte-se a mais de 50.000 aniversariantes que economizam todo mês.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
