import { useState } from "react";
import { Search, MapPin, Heart, Map } from "lucide-react";
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
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [favoritos, setFavoritos] = useState<number[]>([]);

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

      {/* Compact Header - Fixed */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          {/* Search Bar Compacta */}
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] p-3">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Buscar por cidade ou local..."
                className="flex-1 bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
              />
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white border-0 hover:opacity-90 transition-opacity px-6"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros Horizontais Deslizantes */}
      <div className="sticky top-[73px] z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all ${
                  categoriaAtiva === cat.id
                    ? "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 border-transparent text-white font-medium"
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

      {/* Feed de Cards */}
      <main className="container mx-auto px-6 py-8 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ESTABELECIMENTOS_MOCK.map((estabelecimento) => (
            <div key={estabelecimento.id} className="group">
              {/* Card Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-300 hover:scale-[1.02]">
                {/* Imagem com Aspect Ratio 4:5 */}
                <div className="relative aspect-[4/5] w-full">
                  <img
                    src={estabelecimento.imagem}
                    alt={estabelecimento.nome}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  {/* Badge Categoria - Topo Esquerdo */}
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20">
                      <span className="text-xs font-medium text-white">
                        {estabelecimento.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Botão Favoritar - Topo Direito */}
                  <button
                    onClick={() => toggleFavorito(estabelecimento.id)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favoritos.includes(estabelecimento.id)
                          ? "fill-pink-500 text-pink-500"
                          : "text-white"
                      }`}
                    />
                  </button>

                  {/* Informações - Rodapé Absoluto */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                    {/* Título */}
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {estabelecimento.nome}
                    </h3>

                    {/* Localização */}
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{estabelecimento.localizacao}</span>
                    </div>

                    {/* Badge Benefício - DESTAQUE MÁXIMO */}
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 shadow-lg">
                      <span className="text-xl">🎁</span>
                      <div>
                        <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                          Ganhe
                        </p>
                        <p className="text-sm font-bold text-white">
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
          className="backdrop-blur-xl bg-slate-900/90 border border-white/10 text-white hover:bg-slate-800/90 shadow-2xl px-6 py-6 rounded-full"
        >
          <Map className="w-5 h-5 mr-2" />
          Ver Mapa
        </Button>
      </div>
    </div>
  );
};

export default Explorar;
