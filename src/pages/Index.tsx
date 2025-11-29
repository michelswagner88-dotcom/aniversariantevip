import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Phone, Clock, ExternalLink, Heart, Sparkles, Instagram, Globe, Share2, Navigation, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useNavigate, Link } from "react-router-dom";
import { CityCombobox } from "@/components/CityCombobox";
import { useQuery } from "@tanstack/react-query";
import { sanitizarInput } from "@/lib/sanitize";

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
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedCidade, setSelectedCidade] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const { favoritos, toggleFavorito, isFavorito, loading: favoritosLoading } = useFavoritos(currentUser?.id || null);

  useEffect(() => {
    // Listener que reage a mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user || null);
      }
    );

    // Verificar usuário atual no mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    loadEstabelecimentos();

    return () => subscription.unsubscribe();
  }, []);

  // Buscar cidade do perfil do usuário logado
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-cidade', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('aniversariantes')
        .select('cidade, estado')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!currentUser?.id,
    staleTime: 0, // Sempre buscar dados frescos
  });

  // Preencher automaticamente a cidade quando o perfil carregar
  useEffect(() => {
    if (userProfile?.cidade && userProfile?.estado && !selectedCidade && !selectedEstado) {
      setSelectedCidade(userProfile.cidade);
      setSelectedEstado(userProfile.estado);
    }
  }, [userProfile, selectedCidade, selectedEstado]);

  const loadEstabelecimentos = async () => {
    const { data, error } = await supabase
      .from("public_estabelecimentos")
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
    if (!categoria) return "🏪 Outros";
    const cat = Array.isArray(categoria) ? categoria[0] : categoria;
    const found = CATEGORIAS_ESTABELECIMENTO.find(c => c.value === cat);
    return found ? `${found.icon} ${found.label}` : "🏪 Outros";
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

  const limparFiltros = () => {
    setSelectedCidade("");
    setSelectedEstado("");
    setSelectedCategoria("");
    setSearchTerm("");
  };

  const handleCitySelect = (cidade: string, estado: string) => {
    setSelectedCidade(cidade);
    setSelectedEstado(estado);
  };

  // Filtros
  const estabelecimentosFiltrados = estabelecimentos.filter((est) => {
    const matchesSearch = !searchTerm || est.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategoria = !selectedCategoria || selectedCategoria === "" || selectedCategoria === "todas"
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
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[55vh] md:min-h-screen flex items-center justify-center px-4 overflow-hidden pt-24 pb-8 sm:pt-32 sm:pb-32">
        {/* Grid Pattern Background - Subtle */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Refined Glow Orbs - Controlled */}
        <div className="absolute top-32 left-10 w-[500px] h-[500px] bg-violet-600/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-fuchsia-500/15 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Badge Discreto - Premium Subtle */}
          <Link 
            to="/auth"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm mb-8 sm:mb-10 transition-all duration-200 cursor-pointer shadow-lg animate-fade-in opacity-0"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">CADASTRO GRATUITO</span>
          </Link>

          {/* H1 - Premium Typography */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl mb-6 sm:mb-8 tracking-tight leading-[1.05] animate-fade-in" style={{ animationDelay: '0.08s' }}>
            <span className="text-white">
              O Maior Guia de Benefícios
              <br />
              para Aniversariantes do{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              Brasil
            </span>
          </h1>

          {/* H2 - Enhanced Legibility */}
          <h2 className="text-base sm:text-xl md:text-2xl text-slate-300 opacity-85 max-w-2xl mb-10 sm:mb-14 leading-relaxed animate-fade-in" style={{ animationDelay: '0.16s' }}>
            Aqui seu aniversário vale muito mais. Encontre benefícios exclusivos para aproveitar no dia, na semana ou no mês inteiro.
          </h2>

          {/* Premium Search Card - World-Class */}
          <div className="w-full max-w-4xl animate-fade-in" style={{ animationDelay: '0.24s' }}>
            <div 
              className="backdrop-blur-xl bg-white/[0.08] rounded-2xl p-5 sm:p-4 border border-white/20 shadow-premium-lg"
              style={{
                boxShadow: '0 8px 32px -8px rgba(139,92,246,0.35), 0 4px 16px -4px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.1)'
              }}
            >
              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center gap-0">
                {/* Cidade - Smart Combobox */}
                <div className="flex items-center gap-3 px-4 flex-1 min-w-[300px]">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <CityCombobox
                    value={selectedCidade && selectedEstado ? `${selectedCidade}, ${selectedEstado}` : ""}
                    onSelect={handleCitySelect}
                    placeholder="Digite a cidade"
                    className="border-none bg-transparent shadow-none h-auto p-0 hover:bg-transparent"
                  />
                </div>

                {/* Separador Vertical (Cristal) */}
                <div className="h-8 w-[1px] bg-white/10" />

                {/* Categoria */}
                <div className="flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger className="border-none bg-transparent text-white placeholder:text-slate-300 h-12 focus:ring-0 [&>span]:!bg-transparent [&>span]:appearance-none">
                      <SelectValue placeholder="Escolha a categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 z-50">
                      <SelectItem value="todas" className="text-white font-semibold">
                        🎉 Ver todas
                      </SelectItem>
                      {CATEGORIAS_ESTABELECIMENTO.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Separador Vertical (Cristal) */}
                <div className="h-8 w-[1px] bg-white/10" />

                {/* Limpar e Buscar */}
                {(selectedCidade || (selectedCategoria && selectedCategoria !== 'todas' && selectedCategoria !== '')) && (
                  <Button 
                    size="lg"
                    variant="ghost"
                    onClick={limparFiltros}
                    className="text-slate-400 hover:text-white hover:bg-white/5 h-12 px-4 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}

                {/* Botão de busca por voz */}
                <div className="px-2">
                  <VoiceSearchButton 
                    onResult={(text) => {
                      // Tentar extrair cidade ou categoria da fala
                      toast({ description: `Buscando: "${text}"` });
                      navigate("/explorar");
                    }} 
                  />
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
                {/* Cidade */}
                <div className="flex items-center gap-3 px-4 h-12 border-b border-white/10 relative">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 flex items-center relative">
                    <CityCombobox
                      value={selectedCidade && selectedEstado ? `${selectedCidade}, ${selectedEstado}` : ""}
                      onSelect={handleCitySelect}
                      placeholder="Digite a cidade"
                      className="border-none bg-transparent shadow-none h-auto p-0 hover:bg-transparent"
                    />
                  </div>
                </div>

                {/* Categoria com Botão de Voz */}
                <div className="flex items-center gap-3 px-4 h-12 border-b border-white/10">
                  <VoiceSearchButton 
                    onResult={(text) => {
                      toast({ description: `Buscando: "${text}"` });
                      navigate("/explorar");
                    }} 
                  />
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger className="border-none bg-transparent text-white placeholder:text-slate-300 h-12 focus:ring-0 [&>span]:!bg-transparent">
                      <SelectValue placeholder="Escolha a categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 z-50">
                      <SelectItem value="todas" className="text-white font-semibold">
                        🎉 Ver todas
                      </SelectItem>
                      {CATEGORIAS_ESTABELECIMENTO.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ações */}
                <div className="p-3 space-y-2">
                  {(selectedCidade || (selectedCategoria && selectedCategoria !== 'todas' && selectedCategoria !== '')) && (
                    <Button 
                      size="lg"
                      variant="ghost"
                      onClick={limparFiltros}
                      className="text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl w-full"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Limpar filtros
                    </Button>
                  )}
                  
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

          {/* Social Proof */}
          <p className="text-white/85 text-sm mt-8 sm:mt-10 mb-0 animate-fade-in" style={{ animationDelay: '0.32s' }}>
            Junte-se a mais de 50.000 aniversariantes que economizam todo mês.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
