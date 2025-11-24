import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Heart, Map, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIAS = [
  { id: "todos", label: "Todos", emoji: "🎯" },
  { id: "gastronomia", label: "Gastronomia", emoji: "🍔" },
  { id: "bares", label: "Bares & Baladas", emoji: "🥂" },
  { id: "lojas", label: "Lojas", emoji: "🛍️" },
  { id: "estetica", label: "Estética", emoji: "💇‍♂️" },
  { id: "lazer", label: "Lazer", emoji: "🎬" },
];

const ESTABELECIMENTOS_MOCK = [
  {
    id: 1,
    nome: "Sushi Palace",
    categoria: "Restaurante Japonês",
    localizacao: "Centro • 2km",
    beneficio: "Rodízio Grátis",
    imagem: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
  },
  {
    id: 2,
    nome: "Barber House Premium",
    categoria: "Barbearia",
    localizacao: "Jardins • 1.5km",
    beneficio: "Corte + Barba Grátis",
    imagem: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
  },
  {
    id: 3,
    nome: "Fashion Store",
    categoria: "Loja de Roupas",
    localizacao: "Shopping Center • 3km",
    beneficio: "20% OFF na Peça",
    imagem: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  },
];

const Explorar = () => {
  const navigate = useNavigate();
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [cidadeAtual, setCidadeAtual] = useState("Florianópolis, SC");

  const toggleFavorito = (id: number) => {
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
              <MapPin className="w-5 h-5 text-violet-400" />
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
      <main className="container mx-auto px-6 py-8 pb-32 relative z-10">
        <div className="space-y-6">
          {ESTABELECIMENTOS_MOCK.map((estabelecimento) => (
            <div key={estabelecimento.id} className="group">
              {/* Card Container */}
              <div 
                onClick={() => navigate(`/estabelecimento/${estabelecimento.id}`)}
                className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_0_50px_rgba(139,92,246,0.4)] transition-all duration-300 cursor-pointer"
              >
                {/* Imagem com Aspect Ratio 4:5 */}
                <div className="relative aspect-[4/5] w-full">
                  <img
                    src={estabelecimento.imagem}
                    alt={estabelecimento.nome}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay - Mais intenso */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

                  {/* Badge Categoria - Topo Esquerdo */}
                  <div className="absolute top-5 left-5">
                    <div className="px-3 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20">
                      <span className="text-xs font-semibold text-white tracking-wide">
                        {estabelecimento.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Botão Favoritar - Topo Direito */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(estabelecimento.id);
                    }}
                    className="absolute top-5 right-5 w-11 h-11 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        favoritos.includes(estabelecimento.id)
                          ? "fill-pink-500 text-pink-500 scale-110"
                          : "text-white"
                      }`}
                    />
                  </button>

                  {/* Informações - Rodapé Absoluto */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3.5">
                    {/* Título */}
                    <h3 className="text-3xl font-bold text-white leading-tight tracking-tight">
                      {estabelecimento.nome}
                    </h3>

                    {/* Localização */}
                    <div className="flex items-center gap-2 text-slate-200">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{estabelecimento.localizacao}</span>
                    </div>

                    {/* Badge Benefício - DESTAQUE MÁXIMO */}
                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 shadow-2xl shadow-violet-500/30">
                      <span className="text-2xl">🎁</span>
                      <div>
                        <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
                          Ganhe
                        </p>
                        <p className="text-base font-extrabold text-white leading-tight">
                          {estabelecimento.beneficio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
