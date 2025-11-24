import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Heart, Map, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIAS = [
  { id: "todos", label: "Todos", emoji: "🎯" },
  { id: "gastronomia", label: "Gastronomia", emoji: "🍔" },
  { id: "bares", label: "Bares & Baladas", emoji: "🥂" },
  { id: "lojas", label: "Lojas", emoji: "🛍️" },
  { id: "estetica", label: "Estética", emoji: "💇‍♂️" },
  { id: "lazer", label: "Lazer", emoji: "🎬" },
];

const Explorar = () => {
  const navigate = useNavigate();
  const { location, loading: geoLoading } = useGeolocation();
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<any[]>([]);
  const [loadingEstabelecimentos, setLoadingEstabelecimentos] = useState(true);
  
  const cidadeAtual = location 
    ? `${location.cidade}, ${location.estado}` 
    : "Carregando localização...";

  useEffect(() => {
    loadEstabelecimentos();
  }, [location]);

  const loadEstabelecimentos = async () => {
    setLoadingEstabelecimentos(true);
    
    let query = supabase
      .from('estabelecimentos')
      .select('*')
      .order('nome_fantasia');
    
    // Filtrar por cidade se localização disponível
    if (location) {
      query = query
        .eq('cidade', location.cidade)
        .eq('estado', location.estado);
    }
    
    const { data, error } = await query;
    
    if (!error && data) {
      setEstabelecimentos(data);
    }
    
    setLoadingEstabelecimentos(false);
  };

  const toggleFavorito = (id: string) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Glow Orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Smart Header - Fixed */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Localização (Esquerda) */}
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex-shrink-0">
              {geoLoading ? (
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-violet-400" />
              )}
              <span className="text-sm font-medium text-white">{cidadeAtual}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Campo de Busca (Direita) */}
            <div className="flex-1 relative backdrop-blur-xl bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 px-4 py-3">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Buscar local..."
                  className="flex-1 bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros e Categorias */}
      <div className="sticky top-[89px] z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Botão Filtros */}
            <button className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-slate-300" />
            </button>

            {/* Categorias Deslizantes */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-1">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaAtiva(cat.id)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-full border transition-all text-sm font-medium ${
                      categoriaAtiva === cat.id
                        ? "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 border-transparent text-white"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="mr-2">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed de Cards */}
      <main className="container mx-auto px-6 pb-24 pt-6">
        {loadingEstabelecimentos ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        ) : estabelecimentos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-4">
              Nenhum estabelecimento encontrado em {cidadeAtual}
            </p>
            <p className="text-slate-500 text-sm">
              Tente buscar em outra cidade ou aguarde novos parceiros
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {estabelecimentos.map((est) => (
              <div
                key={est.id}
                onClick={() => navigate(`/estabelecimento/${est.id}`)}
                className="relative group cursor-pointer overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={est.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                    alt={est.nome_fantasia}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  {/* Badge Categoria - Canto Superior Esquerdo */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-xs font-semibold text-white">
                      {est.categoria?.[0] || "Outros"}
                    </span>
                  </div>

                  {/* Botão Favorito - Canto Superior Direito */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(est.id);
                    }}
                    className="absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-xl bg-slate-900/80 border border-white/20 text-white hover:bg-slate-800/90 transition-all hover:scale-110 active:scale-95"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favoritos.includes(est.id) ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>

                  {/* Informações na Parte Inferior da Imagem */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {est.nome_fantasia}
                    </h3>
                    <p className="text-sm text-slate-300 flex items-center gap-1.5 mb-4">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {est.cidade}, {est.estado}
                    </p>

                    {/* Badge Benefício - DESTAQUE MÁXIMO */}
                    <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 shadow-2xl shadow-violet-500/30">
                      <span className="text-lg font-extrabold text-white">
                        🎁 Ver Benefício 🔒
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Map Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Button
          size="lg"
          className="backdrop-blur-xl bg-slate-900/95 border border-white/20 text-white hover:bg-slate-800/95 shadow-2xl shadow-black/50 px-8 py-7 rounded-full font-semibold text-base"
        >
          <Map className="w-5 h-5 mr-2.5" />
          Ver Mapa
        </Button>
      </div>
    </div>
  );
};

export default Explorar;
