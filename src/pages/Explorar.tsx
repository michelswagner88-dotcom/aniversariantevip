import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, SlidersHorizontal, Map as MapIconLucide, List, X, Check, Share2, Heart, CalendarDays, Navigation, Store, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import VoiceSearchBar from "@/components/VoiceSearchBar";
import { SafeImage } from "@/components/SafeImage";
import { GoogleMapView } from "@/components/GoogleMapView";

import { BackButton } from "@/components/BackButton";
import { EmptyState } from "@/components/EmptyState";
import { useEstabelecimentos } from "@/hooks/useEstabelecimentos";
import { useEstabelecimentosProximos } from "@/hooks/useEstabelecimentosProximos";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { sanitizarInput } from "@/lib/sanitize";
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { TiltCard } from '@/components/ui/tilt-card';
import { EstabelecimentoCardSkeleton } from '@/components/skeletons/EstabelecimentoCardSkeleton';
import { SubcategoryFilter } from '@/components/SubcategoryFilter';

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

// --- CTA Bar para Estabelecimentos ---
const EstablishmentCTABar = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-violet-900/60 to-pink-900/60 border border-violet-500/30 rounded-xl p-4 mb-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/20 shrink-0">
            <Store className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Tem um estabelecimento?</p>
            <p className="text-violet-300 text-xs">Apareça aqui e atraia aniversariantes todos os meses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/seja-parceiro"
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:brightness-110 rounded-lg text-white text-sm font-medium transition-all"
          >
            Cadastrar grátis
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

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
    const url = getEstabelecimentoUrl({
      estado: place.estado,
      cidade: place.cidade,
      slug: place.slug,
      id: place.id
    });
    navigate(url);
  };

  return (
    <TiltCard 
      className="group relative h-72 sm:aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-800 shadow-lg border border-white/5 cursor-pointer hover:border-violet-500/50 transition-all animate-fade-in"
      tiltAmount={12}
      shadowAmount={20}
      enableHolographic={true}
    >
      <div onClick={handleCardClick} className="h-full w-full relative z-20">
        <SafeImage src={place.image} alt={place.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
      
      <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-3 sm:p-4">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            {place.category}
          </span>
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

      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <h3 className="font-plus-jakarta text-lg sm:text-xl font-bold text-white leading-tight">{place.name}</h3>
        <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-slate-300">
          <MapPin size={14} className="text-violet-400" /> 
          <span>{place.neighborhood}{place.distance && ` • ${place.distance}`}</span>
        </div>
        {place.especialidades && place.especialidades.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {place.especialidades.slice(0, 3).map((esp: string, idx: number) => (
              <span 
                key={idx}
                className="text-xs px-2 py-0.5 bg-violet-500/30 text-violet-200 rounded-full border border-violet-400/30"
              >
                {esp}
              </span>
            ))}
          </div>
        )}
        {/* Badge benefício - APENAS emoji, sem ícone duplicado */}
        <div className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-violet-600/90 via-fuchsia-500/90 to-pink-500/90 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-center">
            <span className="text-xs sm:text-sm font-bold text-white">
              🎁 Tem benefício de aniversário!
            </span>
          </div>
        </div>
      </div>
      </div>
    </TiltCard>
  );
};

const Explorar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  
  // --- BUSCA POR TEXTO (do URL param) ---
  const searchQuery = searchParams.get('q') || '';
  const cidadeParam = searchParams.get('cidade') || '';
  const estadoParam = searchParams.get('estado') || '';
  const categoriaParam = searchParams.get('categoria') || '';
  const especialidadeParam = searchParams.get('especialidade') || '';
  
  // --- CIDADE SELECIONADA ---
  const [selectedCity, setSelectedCity] = useState<{ nome: string; estado: string } | null>(null);
  
  // --- TOGGLE LISTA/MAPA ---
  const [viewMode, setViewMode] = useState<'lista' | 'mapa'>('lista');
  
  // --- FILTROS DE DISTÂNCIA E ORDENAÇÃO ---
  const [raioKm, setRaioKm] = useState('all');
  const [ordenacao, setOrdenacao] = useState('distancia');

  // --- HOOKS ---
  const { location: userLocation, requestLocation, loading: userLocationLoading } = useUserLocation();
  
  // Inicializar cidade, estado e categoria a partir dos URL params
  useEffect(() => {
    // Inicializar cidade da URL (com estado completo)
    if (cidadeParam) {
      setSelectedCity({ nome: cidadeParam, estado: estadoParam });
    } else {
      setSelectedCity(null);
    }
    
    // Inicializar categoria da URL
    if (categoriaParam) {
      setSelectedCategory(categoriaParam);
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams]);
  
  // Buscar estabelecimentos da cidade selecionada (usando params direto para evitar delay de estado)
  const { data: estabelecimentosCidade = [], isLoading: loadingCidade, error: errorCidade } = useEstabelecimentos({
    cidade: cidadeParam || selectedCity?.nome,
    estado: estadoParam || selectedCity?.estado,
  });

  // Sempre busca todos para mostrar quando cidade não tem resultados
  const { data: todosEstabelecimentos = [], isLoading: loadingTodos, error: errorTodos } = useEstabelecimentos({
    showAll: true,
  });

  // DEBUG: Log para diagnóstico
  console.log('[Explorar] Debug:', {
    selectedCity,
    selectedCategory,
    cidadeParam,
    estadoParam,
    categoriaParam,
    estabelecimentosCidade: estabelecimentosCidade?.length,
    todosEstabelecimentos: todosEstabelecimentos?.length,
    loadingCidade,
    loadingTodos,
    errorCidade,
    errorTodos,
  });

  // Prioriza estabelecimentos da cidade, senão mostra todos
  const estabelecimentos = selectedCity && estabelecimentosCidade.length > 0 
    ? estabelecimentosCidade 
    : todosEstabelecimentos;

  const mostrandoOutrasCidades = selectedCity && estabelecimentosCidade.length === 0 && todosEstabelecimentos.length > 0;
  const loadingEstabelecimentos = loadingCidade || loadingTodos;

  // --- ESTADOS DOS FILTROS ---
  const [filterDay, setFilterDay] = useState("any");
  const [filterValidity, setFilterValidity] = useState("month");
  const [filterDistance, setFilterDistance] = useState<number | undefined>(undefined);

  // Handler para limpar cidade
  const handleClearCity = () => {
    setSelectedCity(null);
  };

  // Aplicar filtros de proximidade e ordenação
  const estabelecimentosComDistancia = useEstabelecimentosProximos(
    estabelecimentos,
    userLocation,
    raioKm,
    ordenacao
  );

  // Transformar dados reais do banco em formato do card
  const allPlaces = estabelecimentosComDistancia.map(est => ({
    id: est.id,
    name: est.nome_fantasia || est.razao_social,
    category: est.categoria?.[0] || "Outros",
    especialidades: est.especialidades || [],
    neighborhood: est.bairro || est.cidade || "",
          distance: est.distancia !== null && est.distancia !== undefined
            ? est.distancia < 1 
              ? `${Math.round(est.distancia * 1000)}m` 
              : `${est.distancia.toFixed(1)}km`
            : null,
    benefit: est.descricao_beneficio || "Ver benefício exclusivo",
    validDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
    latitude: est.latitude ? Number(est.latitude) : null,
    longitude: est.longitude ? Number(est.longitude) : null,
    image: est.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    distancia: est.distancia,
    estado: est.estado,
    cidade: est.cidade,
    slug: est.slug,
  }));

  // Transformar dados para o formato do GoogleMapView
  const estabelecimentosFormatados = useMemo(() => {
    return estabelecimentosComDistancia
      .filter(est => est.latitude && est.longitude)
      .map(est => ({
        id: est.id,
        nome_fantasia: est.nome_fantasia || est.razao_social || 'Estabelecimento',
        categoria: est.categoria || [],
        endereco: `${est.logradouro || ''}, ${est.numero || ''} - ${est.bairro || ''}, ${est.cidade || ''}`,
        latitude: Number(est.latitude),
        longitude: Number(est.longitude),
        logo_url: est.logo_url || null,
        descricao_beneficio: est.descricao_beneficio || '',
        cidade: est.cidade || '',
        estado: est.estado || '',
        slug: est.slug || null,
      }));
  }, [estabelecimentosComDistancia]);

  // Usar categoriaParam diretamente da URL para evitar delay do estado
  const categoryToFilter = categoriaParam || selectedCategory;
  
  const filteredPlaces = allPlaces.filter(place => {
    if (categoryToFilter && place.category !== categoryToFilter) return false;
    if (filterDay !== 'any' && !place.validDays.includes(filterDay)) return false;
    if (selectedSubcategories.length > 0) {
      const placeSubcats = place.especialidades || [];
      const hasMatch = selectedSubcategories.some(sub => placeSubcats.includes(sub));
      if (!hasMatch) return false;
    }
    // Filtro por especialidade (do parâmetro URL)
    if (especialidadeParam.trim()) {
      const placeSpecs = place.especialidades || [];
      const matchesEsp = placeSpecs.some((s: string) => 
        s.toLowerCase().includes(especialidadeParam.toLowerCase())
      );
      if (!matchesEsp) return false;
    }
    // Filtro por busca de texto (nome, categoria, bairro, especialidades)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = place.name?.toLowerCase().includes(query);
      const matchesCategory = place.category?.toLowerCase().includes(query);
      const matchesNeighborhood = place.neighborhood?.toLowerCase().includes(query);
      const matchesSpecialties = place.especialidades?.some((s: string) => s.toLowerCase().includes(query));
      if (!matchesName && !matchesCategory && !matchesNeighborhood && !matchesSpecialties) return false;
    }
    return true;
  });

  const selectCategory = (category: string | null) => {
    const newCategory = (categoryToFilter === category) ? null : category;
    
    // Atualizar URL para manter estado sincronizado
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set('categoria', newCategory);
    } else {
      newParams.delete('categoria');
    }
    navigate(`/explorar?${newParams.toString()}`, { replace: true });
    
    setSelectedCategory(newCategory);
    setSelectedSubcategories([]);
  };

  // Agrupar estabelecimentos por cidade (para mostrar quando não tem na cidade selecionada)
  const establishmentsByCity = useMemo(() => {
    if (!mostrandoOutrasCidades) return [];
    
    const byCity: Record<string, typeof allPlaces> = {};
    allPlaces.forEach(place => {
      const key = place.cidade || 'Outras';
      if (!byCity[key]) byCity[key] = [];
      byCity[key].push(place);
    });
    
    return Object.entries(byCity)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 4)
      .map(([city, places]) => ({ city, places: places.slice(0, 4) }));
  }, [allPlaces, mostrandoOutrasCidades]);

  const daysOfWeek = [
    { id: 'seg', label: 'Seg' }, { id: 'ter', label: 'Ter' }, { id: 'qua', label: 'Qua' },
    { id: 'qui', label: 'Qui' }, { id: 'sex', label: 'Sex' }, { id: 'sab', label: 'Sáb' }, { id: 'dom', label: 'Dom' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 pb-24 font-inter text-white">
      <div className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 py-4 backdrop-blur-xl">
        <div className="container mx-auto px-6 mb-3">
          <BackButton to="/" />
        </div>
        <VoiceSearchBar />

        <div className="container mx-auto px-6 mt-4">
          <div className="flex items-center gap-3">
            {/* Botão de filtro FIXO à esquerda */}
            <button 
              onClick={() => setShowFilters(true)} 
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 ${filterDay !== 'any' || filterDistance ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105'}`}
            >
              <SlidersHorizontal size={18} className="transition-transform duration-300" />
            </button>
            
            {/* Categorias em scroll horizontal */}
            <div className="flex-1 overflow-x-auto scrollbar-hide relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10"></div>
              
              <div className="flex gap-3 pb-2 px-8">
                <CategoryPill icon="🚀" label="Todos" active={!selectedCategory} onClick={() => selectCategory(null)} />
                {CATEGORIAS_ESTABELECIMENTO.map((cat) => (
                  <CategoryPill 
                    key={cat.value}
                    icon={cat.icon} 
                    label={cat.label} 
                    active={selectedCategory === cat.value} 
                    onClick={() => selectCategory(cat.value)} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Filtro de Subcategorias - aparece quando 1 categoria está selecionada */}
          {selectedCategory && (
            <div className="mt-3">
              <SubcategoryFilter
                category={selectedCategory}
                selectedSubcategories={selectedSubcategories}
                onSubcategoriesChange={setSelectedSubcategories}
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* CTA Bar para Estabelecimentos */}
        <EstablishmentCTABar />

        {loadingEstabelecimentos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EstabelecimentoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loadingEstabelecimentos && estabelecimentos.length === 0 && (
          <EmptyState />
        )}

        {!loadingEstabelecimentos && estabelecimentos.length > 0 && (
          <>
            {/* Banner Premium quando cidade não tem estabelecimentos */}
            {mostrandoOutrasCidades && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-violet-900/50 to-pink-900/50 border border-violet-500/30 rounded-2xl p-5 mb-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-violet-500/20 shrink-0">
                    <MapPin className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      Ainda não temos parceiros em {selectedCity?.nome} 😔
                    </h3>
                    <p className="text-violet-200 text-sm mb-4">
                      Mas estamos crescendo rápido! Quer ajudar a trazer o Aniversariante VIP pra sua cidade?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link 
                        to="/seja-parceiro"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:brightness-110 rounded-lg text-white text-sm font-medium transition-all"
                      >
                        <Store className="w-4 h-4" />
                        Cadastrar meu estabelecimento
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-violet-500/50 text-violet-300 hover:bg-violet-500/20"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Sugerir um lugar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Seção: Estabelecimentos de outras cidades */}
            {mostrandoOutrasCidades && establishmentsByCity.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4">
                  Enquanto isso, confira nossos parceiros em outras cidades:
                </h3>
                
                {establishmentsByCity.map(({ city, places }) => (
                  <div key={city} className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        {city}
                        <span className="text-slate-400 text-sm font-normal">
                          ({places.length} {places.length === 1 ? 'lugar' : 'lugares'})
                        </span>
                      </h4>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {places.map(place => (
                        <div key={place.id} className="w-72 shrink-0">
                          <PlaceCard place={place} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}


            {/* Filtros de distância e ordenação */}
            {!mostrandoOutrasCidades && (
              <div className="flex flex-wrap gap-3 mb-4">
                <Select value={raioKm} onValueChange={setRaioKm}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                    <SelectValue placeholder="Distância" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer distância</SelectItem>
                    <SelectItem value="1">Até 1 km</SelectItem>
                    <SelectItem value="3">Até 3 km</SelectItem>
                    <SelectItem value="5">Até 5 km</SelectItem>
                    <SelectItem value="10">Até 10 km</SelectItem>
                    <SelectItem value="25">Até 25 km</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ordenacao} onValueChange={setOrdenacao}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distancia">Mais próximos</SelectItem>
                    <SelectItem value="nome">Nome A-Z</SelectItem>
                    <SelectItem value="avaliacao">Melhor avaliados</SelectItem>
                    <SelectItem value="recentes">Mais recentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Toggle Lista/Mapa */}
            {!mostrandoOutrasCidades && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-sm">
                  {filteredPlaces.length} estabelecimentos encontrados
                  {selectedCity && <span className="text-violet-400"> em {selectedCity.nome}</span>}
                </p>
                
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('lista')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      viewMode === 'lista' 
                        ? 'bg-violet-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Lista
                  </button>
                  <button
                    onClick={() => setViewMode('mapa')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      viewMode === 'mapa' 
                        ? 'bg-violet-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MapIconLucide className="w-4 h-4" />
                    Mapa
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo: Lista ou Mapa */}
            {!mostrandoOutrasCidades && (
              filteredPlaces.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400">
                  Nenhum resultado encontrado com os filtros selecionados
                </div>
              ) : viewMode === 'lista' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPlaces.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              ) : (
                <GoogleMapView
                  establishments={estabelecimentosFormatados}
                  onEstablishmentClick={(establishment) => {
                    const url = getEstabelecimentoUrl({
                      estado: establishment.estado,
                      cidade: establishment.cidade,
                      slug: establishment.slug,
                      id: establishment.id
                    });
                    navigate(url);
                  }}
                  userLocation={userLocation ? {
                    lat: userLocation.lat,
                    lng: userLocation.lng
                  } : null}
                />
              )
            )}
          </>
        )}
      </div>

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

              {userLocation && (
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
