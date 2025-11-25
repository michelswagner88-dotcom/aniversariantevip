import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, SlidersHorizontal, Map as MapIcon, List, X, Check, Clock, Gift, Share2, Heart, CalendarDays, Navigation } from 'lucide-react';
import { toast } from "sonner";
import VoiceSearchBar from "@/components/VoiceSearchBar";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCepLookup } from "@/hooks/useCepLookup";

// --- Componentes UI ---
const CategoryPill = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
      active 
        ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

const FilterOption = ({ label, icon: Icon, selected, onClick, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition-all active:scale-95 ${
      selected
        ? 'border-violet-500 bg-violet-500/20 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
    } ${className}`}
  >
    {Icon ? <Icon size={14} className={selected ? "text-violet-300" : "text-slate-500"} /> : (selected && <Check size={12} />)}
    {label}
  </button>
);

const PlaceCard = ({ place }: any) => {
  const navigate = useNavigate();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `Aniversariante VIP: ${place.name}`,
      text: `Olha esse benefício no ${place.name}: ${place.benefit}!`,
      url: window.location.href,
    };
    if (navigator.share) navigator.share(shareData).catch(() => {});
    else toast.success("Link copiado!");
  };

  const handleCardClick = () => {
    navigate('/auth');
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-800 shadow-lg border border-white/5 cursor-pointer hover:border-violet-500/50 transition-all"
    >
      <img src={place.image} alt={place.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
      
      <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-4">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            {place.category}
          </span>
          {place.isOpen && (
            <span className="flex w-fit items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-400 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Aberto
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md hover:bg-white/20">
            <Share2 size={18} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md hover:bg-pink-500/80">
            <Heart size={18} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-plus-jakarta text-xl font-bold text-white leading-tight">{place.name}</h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-300">
          <MapPin size={14} className="text-violet-400" /> 
          <span>{place.neighborhood} • {place.distance}</span>
        </div>
        {/* Badge Benefício - DESTAQUE MÁXIMO */}
        <div className="mt-4 inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 shadow-2xl shadow-violet-500/30">
          <span className="text-lg font-extrabold text-white">
            🎁 Ver Benefício 🔒
          </span>
        </div>
      </div>
    </div>
  );
};

const Explorar = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [showCepInput, setShowCepInput] = useState(false);
  const [cepValue, setCepValue] = useState("");

  // --- HOOKS ---
  const { location, loading: geoLoading, error: geoError, setManualLocation } = useGeolocation();
  const { fetchCep, formatCep, loading: cepLoading } = useCepLookup();

  // --- ESTADOS DOS FILTROS ---
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterDay, setFilterDay] = useState("any"); // 'any', 'seg', 'ter', etc.
  const [filterValidity, setFilterValidity] = useState("month");

  // Mostrar input de CEP se houver erro de geolocalização
  useEffect(() => {
    if (geoError && !location) {
      setShowCepInput(true);
    }
  }, [geoError, location]);

  const handleCepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = await fetchCep(cepValue);
    if (data) {
      setManualLocation(data.localidade, data.uf);
      setShowCepInput(false);
      setCepValue("");
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCepValue(formatted);
  };

  const displayLocation = location 
    ? `${location.cidade}, ${location.estado}` 
    : geoLoading 
    ? "Detectando localização..." 
    : "Localização não disponível";

  // --- DADOS MOCKADOS (Simulando Banco de Dados) ---
  const allPlaces = [
    { 
      id: 1, name: "1929 Trattoria", category: "Gastronomia", neighborhood: "Centro", distance: "2km", benefit: "Sobremesa Exclusiva", isOpen: true, 
      validDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80" 
    },
    { 
      id: 2, name: "Boteco Cascaes", category: "Bares", neighborhood: "Lagoa", distance: "5km", benefit: "Drink Autoral Grátis", isOpen: false, 
      validDays: ['sex', 'sab', 'dom'],
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80" 
    },
    { 
      id: 3, name: "Barbearia VIP", category: "Serviços", neighborhood: "Trindade", distance: "1.2km", benefit: "Corte + Cerveja", isOpen: true, 
      validDays: ['ter', 'qua', 'qui'],
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80" 
    },
    { 
      id: 4, name: "Cinemark", category: "Lazer", neighborhood: "Beiramar", distance: "3.5km", benefit: "Combo Pipoca P", isOpen: true, 
      validDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80" 
    },
  ];

  // --- LÓGICA DE FILTRAGEM ---
  const filteredPlaces = allPlaces.filter(place => {
    // Filtro de categoria: se não há categorias selecionadas, mostra todos
    if (activeCategories.length > 0 && !activeCategories.includes(place.category)) return false;
    if (filterOpenNow && !place.isOpen) return false;
    if (filterDay !== 'any' && !place.validDays.includes(filterDay)) return false;
    return true;
  });

  // Handler para toggle de categorias
  const handleCategoryToggle = (category: string) => {
    if (category === "Todos") {
      // "Todos" limpa todas as seleções
      setActiveCategories([]);
    } else {
      // Toggle: adiciona se não está, remove se já está
      setActiveCategories(prev => 
        prev.includes(category) 
          ? prev.filter(cat => cat !== category)
          : [...prev, category]
      );
    }
  };

  const daysOfWeek = [
    { id: 'seg', label: 'Seg' }, { id: 'ter', label: 'Ter' }, { id: 'qua', label: 'Qua' },
    { id: 'qui', label: 'Qui' }, { id: 'sex', label: 'Sex' }, { id: 'sab', label: 'Sáb' }, { id: 'dom', label: 'Dom' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 pb-24 font-inter text-white">
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Header com Busca por Voz */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 py-4 backdrop-blur-xl">
        <VoiceSearchBar />

        {/* Banner de Localização com CEP */}
        {showCepInput && (
          <div className="container mx-auto px-6 mt-3 animate-in slide-in-from-top duration-300">
            <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-500/20 p-2 shrink-0">
                  <MapPin size={20} className="text-orange-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">Não conseguimos detectar sua localização</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Digite seu CEP para encontrar benefícios perto de você</p>
                  </div>
                  
                  <form onSubmit={handleCepSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={cepValue}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-white/10 focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={cepLoading || cepValue.replace(/\D/g, '').length !== 8}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cepLoading ? "Buscando..." : "Buscar"}
                    </button>
                  </form>

                  <button
                    onClick={() => setShowCepInput(false)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar localização atual + botão CEP alternativo */}
        {location && !showCepInput && (
          <div className="container mx-auto px-6 mt-3">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-violet-400" />
                <span className="text-sm font-medium text-white">{displayLocation}</span>
              </div>
              <button
                onClick={() => setShowCepInput(true)}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                Alterar CEP
              </button>
            </div>
          </div>
        )}

        {/* Pílulas de Categoria */}
        <div className="container mx-auto px-6 mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setShowFilters(true)} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 ${filterOpenNow || filterDay !== 'any' ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <SlidersHorizontal size={18} />
          </button>
          <CategoryPill icon="🚀" label="Todos" active={activeCategories.length === 0} onClick={() => handleCategoryToggle("Todos")} />
          <CategoryPill icon="🏋️" label="Academia" active={activeCategories.includes("Academia")} onClick={() => handleCategoryToggle("Academia")} />
          <CategoryPill icon="🍺" label="Bar" active={activeCategories.includes("Bar")} onClick={() => handleCategoryToggle("Bar")} />
          <CategoryPill icon="✂️" label="Barbearia" active={activeCategories.includes("Barbearia")} onClick={() => handleCategoryToggle("Barbearia")} />
          <CategoryPill icon="☕" label="Cafeteria" active={activeCategories.includes("Cafeteria")} onClick={() => handleCategoryToggle("Cafeteria")} />
          <CategoryPill icon="🎉" label="Casa Noturna" active={activeCategories.includes("Casa Noturna")} onClick={() => handleCategoryToggle("Casa Noturna")} />
          <CategoryPill icon="🍽️" label="Restaurante" active={activeCategories.includes("Restaurante")} onClick={() => handleCategoryToggle("Restaurante")} />
          <CategoryPill icon="💅" label="Salão de Beleza" active={activeCategories.includes("Salão de Beleza")} onClick={() => handleCategoryToggle("Salão de Beleza")} />
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="px-4 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{filteredPlaces.length} Resultados</span>
          <button onClick={() => setFilterOpenNow(!filterOpenNow)} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${filterOpenNow ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'text-slate-400 hover:text-white'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${filterOpenNow ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
            Aberto Agora
          </button>
        </div>

        {viewMode === 'list' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
            {filteredPlaces.map(place => (<PlaceCard key={place.id} place={place} />))}
          </div>
        ) : (
          <div className="relative flex h-[65vh] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900 text-center animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="z-10 mb-4 rounded-full bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10"><MapIcon size={48} className="text-violet-400" /></div>
            <h3 className="z-10 text-xl font-bold text-white">Mapa Interativo</h3>
            <p className="z-10 mt-2 max-w-xs text-sm text-slate-400">Clique em 'Ver Lista' para voltar.</p>
          </div>
        )}
      </div>

      {/* Botão Flutuante */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
        <button onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')} className="flex items-center gap-2 rounded-full bg-slate-900/90 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-md transition-transform active:scale-95 hover:bg-slate-800">
          {viewMode === 'list' ? <><MapIcon size={18} /> Ver no Mapa</> : <><List size={18} /> Ver Lista</>}
        </button>
      </div>

      {/* Drawer de Filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl border-t border-white/10 bg-slate-950 p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-white/20 shrink-0"></div>
            <div className="mb-6 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-white">Filtrar Busca</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <div className="space-y-8 overflow-y-auto pb-24 scrollbar-hide flex-1">
              {/* Filtro 1: Aberto Agora */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Disponibilidade</label>
                <FilterOption label="🟢 Mostrar apenas Abertos Agora" icon={Clock} selected={filterOpenNow} onClick={() => setFilterOpenNow(!filterOpenNow)} className="w-full justify-start px-4 py-4" />
              </div>

              {/* Filtro 2: Dia da Semana */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CalendarDays size={14} /> Planejar Dia da Festa
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <FilterOption label="Qualquer" selected={filterDay === 'any'} onClick={() => setFilterDay('any')} className="col-span-1" />
                  {daysOfWeek.slice(0, 3).map(day => (
                    <FilterOption key={day.id} label={day.label} selected={filterDay === day.id} onClick={() => setFilterDay(day.id)} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.slice(3).map(day => (
                    <FilterOption key={day.id} label={day.label} selected={filterDay === day.id} onClick={() => setFilterDay(day.id)} />
                  ))}
                </div>
              </div>

              {/* Filtro 3: Validade */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Validade do Benefício</label>
                <div className="grid grid-cols-3 gap-2">
                  <FilterOption label="No Dia" selected={filterValidity === 'day'} onClick={() => setFilterValidity('day')} />
                  <FilterOption label="Na Semana" selected={filterValidity === 'week'} onClick={() => setFilterValidity('week')} />
                  <FilterOption label="No Mês" selected={filterValidity === 'month'} onClick={() => setFilterValidity('month')} />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950 p-4 pb-8">
              <button onClick={() => setShowFilters(false)} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-4 font-bold text-white shadow-lg shadow-violet-500/20 transition-transform active:scale-95 hover:brightness-110">
                Ver {filteredPlaces.length} Resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorar;
