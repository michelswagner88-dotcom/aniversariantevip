import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, SlidersHorizontal, Map as MapIcon, List, X, Check, Clock, Gift, Share2, Heart, CalendarDays, Navigation } from 'lucide-react';
import { toast } from "sonner";
import VoiceSearchBar from "@/components/VoiceSearchBar";
import { GoogleMapView } from "@/components/GoogleMapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCepLookup } from "@/hooks/useCepLookup";
import { BackButton } from "@/components/BackButton";
import { EmptyState } from "@/components/EmptyState";
import { useEstabelecimentos } from "@/hooks/useEstabelecimentos";
import { GeolocationProgress } from "@/components/GeolocationProgress";
import { LocationConfirmDialog } from "@/components/LocationConfirmDialog";

// --- Componentes UI ---
const CategoryPill = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${
      active 
        ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20 scale-105' 
        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:scale-102'
    }`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
      {icon}
    </span>
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
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-800 shadow-lg border border-white/5 cursor-pointer hover:border-violet-500/50 transition-all animate-fade-in"
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
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [showCepInput, setShowCepInput] = useState(false);
  const [cepValue, setCepValue] = useState("");

  // --- HOOKS ---
  const { 
    location, 
    loading: geoLoading, 
    error: geoError, 
    currentStep, 
    cachedLocation,
    showLocationConfirm,
    setManualLocation,
    confirmCachedLocation,
    rejectCachedLocation
  } = useGeolocation();
  const { fetchCep, formatCep, loading: cepLoading } = useCepLookup();
  
  // Buscar estabelecimentos reais do banco de dados
  const { data: estabelecimentos = [], isLoading: loadingEstabelecimentos } = useEstabelecimentos({
    cidade: location?.cidade,
    estado: location?.estado,
  });

  // --- ESTADOS DOS FILTROS ---
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterDay, setFilterDay] = useState("any");
  const [filterValidity, setFilterValidity] = useState("month");
  const [filterDistance, setFilterDistance] = useState<number | undefined>(undefined);

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

  // Transformar dados reais do banco em formato do card
  const allPlaces = estabelecimentos.map(est => ({
    id: est.id,
    name: est.nome_fantasia || est.razao_social,
    category: est.categoria?.[0] || "Outros",
    neighborhood: est.bairro || est.cidade || "",
    distance: "N/A",
    benefit: est.descricao_beneficio || "Ver benefício exclusivo",
    isOpen: true,
    validDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
    latitude: est.latitude ? Number(est.latitude) : null,
    longitude: est.longitude ? Number(est.longitude) : null,
    image: est.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  }));

  const filteredPlaces = allPlaces.filter(place => {
    if (activeCategories.length > 0 && !activeCategories.includes(place.category)) return false;
    if (filterOpenNow && !place.isOpen) return false;
    if (filterDay !== 'any' && !place.validDays.includes(filterDay)) return false;
    return true;
  });

  const handleCategoryToggle = (category: string) => {
    if (category === "Todos") {
      setActiveCategories([]);
    } else {
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
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 py-4 backdrop-blur-xl">
        <div className="container mx-auto px-6 mb-3">
          <BackButton to="/" />
        </div>
        <VoiceSearchBar />

        {/* Progress da Geolocalização */}
        {geoLoading && <GeolocationProgress currentStep={currentStep} />}

        {/* Diálogo de Confirmação de Localização em Cache */}
        {cachedLocation && (
          <LocationConfirmDialog
            open={showLocationConfirm}
            cidade={cachedLocation.cidade}
            estado={cachedLocation.estado}
            onConfirm={confirmCachedLocation}
            onReject={rejectCachedLocation}
          />
        )}

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

        <div className="relative container mx-auto px-6 mt-4">
          <div className="absolute left-0 top-0 bottom-2 w-16 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10"></div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory px-16 -mx-16">
            <div className="shrink-0 pl-16"></div>
            <button 
              onClick={() => setShowFilters(true)} 
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 ${filterOpenNow || filterDay !== 'any' || filterDistance ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105'}`}
            >
              <SlidersHorizontal size={18} className="transition-transform duration-300" />
            </button>
            <div className="shrink-0"><CategoryPill icon="🚀" label="Todos" active={activeCategories.length === 0} onClick={() => handleCategoryToggle("Todos")} /></div>
            <div className="shrink-0"><CategoryPill icon="🏋️" label="Academia" active={activeCategories.includes("Academia")} onClick={() => handleCategoryToggle("Academia")} /></div>
            <div className="shrink-0"><CategoryPill icon="🍺" label="Bar" active={activeCategories.includes("Bar")} onClick={() => handleCategoryToggle("Bar")} /></div>
            <div className="shrink-0"><CategoryPill icon="✂️" label="Barbearia" active={activeCategories.includes("Barbearia")} onClick={() => handleCategoryToggle("Barbearia")} /></div>
            <div className="shrink-0"><CategoryPill icon="☕" label="Cafeteria" active={activeCategories.includes("Cafeteria")} onClick={() => handleCategoryToggle("Cafeteria")} /></div>
            <div className="shrink-0"><CategoryPill icon="🎉" label="Casa Noturna" active={activeCategories.includes("Casa Noturna")} onClick={() => handleCategoryToggle("Casa Noturna")} /></div>
            <div className="shrink-0"><CategoryPill icon="🧁" label="Confeitaria" active={activeCategories.includes("Confeitaria")} onClick={() => handleCategoryToggle("Confeitaria")} /></div>
            <div className="shrink-0"><CategoryPill icon="🎬" label="Entretenimento" active={activeCategories.includes("Entretenimento")} onClick={() => handleCategoryToggle("Entretenimento")} /></div>
            <div className="shrink-0"><CategoryPill icon="🏨" label="Hospedagem" active={activeCategories.includes("Hospedagem")} onClick={() => handleCategoryToggle("Hospedagem")} /></div>
            <div className="shrink-0"><CategoryPill icon="🎁" label="Loja de Presentes" active={activeCategories.includes("Loja de Presentes")} onClick={() => handleCategoryToggle("Loja de Presentes")} /></div>
            <div className="shrink-0"><CategoryPill icon="👗" label="Moda e Acessórios" active={activeCategories.includes("Moda e Acessórios")} onClick={() => handleCategoryToggle("Moda e Acessórios")} /></div>
            <div className="shrink-0"><CategoryPill icon="🍽️" label="Restaurante" active={activeCategories.includes("Restaurante")} onClick={() => handleCategoryToggle("Restaurante")} /></div>
            <div className="shrink-0"><CategoryPill icon="💅" label="Salão de Beleza" active={activeCategories.includes("Salão de Beleza")} onClick={() => handleCategoryToggle("Salão de Beleza")} /></div>
            <div className="shrink-0"><CategoryPill icon="💪" label="Saúde e Suplementos" active={activeCategories.includes("Saúde e Suplementos")} onClick={() => handleCategoryToggle("Saúde e Suplementos")} /></div>
            <div className="shrink-0"><CategoryPill icon="🏪" label="Outros Comércios" active={activeCategories.includes("Outros Comércios")} onClick={() => handleCategoryToggle("Outros Comércios")} /></div>
            <div className="shrink-0"><CategoryPill icon="🔧" label="Serviços" active={activeCategories.includes("Serviços")} onClick={() => handleCategoryToggle("Serviços")} /></div>
            <div className="shrink-0 pr-16"></div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6">
        {loadingEstabelecimentos && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Carregando estabelecimentos...</p>
          </div>
        )}

        {!loadingEstabelecimentos && estabelecimentos.length === 0 && (
          <EmptyState />
        )}

        {!loadingEstabelecimentos && estabelecimentos.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 transition-all duration-300">
                {filteredPlaces.length} Resultados
              </span>
              <button onClick={() => setFilterOpenNow(!filterOpenNow)} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-300 ${filterOpenNow ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50 scale-105' : 'text-slate-400 hover:text-white hover:scale-105'}`}>
                <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${filterOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
                Aberto Agora
              </button>
            </div>

            {filteredPlaces.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                Nenhum resultado encontrado com os filtros selecionados
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {estabelecimentos.length > 0 && (
        <GoogleMapView
          establishments={estabelecimentos}
          userLocation={location?.coordinates ? {
            lat: location.coordinates.latitude,
            lng: location.coordinates.longitude,
          } : undefined}
          onEstablishmentClick={(id) => navigate(`/estabelecimento/${id}`)}
        />
      )}

      {showFilters && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl border-t border-white/10 bg-slate-950 p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-white/20 shrink-0"></div>
            <div className="mb-6 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-white">Filtrar Busca</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <div className="space-y-8 overflow-y-auto pb-24 scrollbar-hide flex-1">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Disponibilidade</label>
                <FilterOption label="🟢 Mostrar apenas Abertos Agora" icon={Clock} selected={filterOpenNow} onClick={() => setFilterOpenNow(!filterOpenNow)} className="w-full justify-start px-4 py-4" />
              </div>

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

              {location?.coordinates && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Navigation size={14} /> Distância Máxima
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <FilterOption label="Todas" selected={!filterDistance} onClick={() => setFilterDistance(undefined)} />
                    <FilterOption label="1 km" selected={filterDistance === 1} onClick={() => setFilterDistance(1)} />
                    <FilterOption label="5 km" selected={filterDistance === 5} onClick={() => setFilterDistance(5)} />
                    <FilterOption label="10 km" selected={filterDistance === 10} onClick={() => setFilterDistance(10)} />
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    {filterDistance ? `Mostrando estabelecimentos até ${filterDistance} km de você` : 'Mostrando todos os estabelecimentos'}
                  </p>
                </div>
              )}

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
