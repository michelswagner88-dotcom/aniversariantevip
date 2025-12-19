// =============================================================================
// EXPLORAR.TSX - V2
// Layout claro consistente com Home + Mapa Split + Subcategorias funcionando
// =============================================================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  Check,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Store,
  Loader2,
  Map,
  List,
  Sparkles,
  Dumbbell,
  Beer,
  Scissors,
  Coffee,
  PartyPopper,
  Gamepad2,
  Hotel,
  Store as StoreIcon,
  Utensils,
  Paintbrush,
  IceCream,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useEstabelecimentos } from "@/hooks/useEstabelecimentos";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useEstabelecimentosProximos } from "@/hooks/useEstabelecimentosProximos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { SubcategoryFilter } from "@/components/SubcategoryFilter";
import { AirbnbMapLayout } from "@/components/map/AirbnbMapLayout";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS
// =============================================================================

const HEADER_COLOR = "#240046";

const CATEGORY_ICONS: Record<string, any> = {
  all: Sparkles,
  academia: Dumbbell,
  bar: Beer,
  barbearia: Scissors,
  cafeteria: Coffee,
  "casa noturna": PartyPopper,
  entretenimento: Gamepad2,
  hospedagem: Hotel,
  loja: StoreIcon,
  restaurante: Utensils,
  salao: Paintbrush,
  salão: Paintbrush,
  sorveteria: IceCream,
};

// =============================================================================
// HELPER: Normalizar texto (remover acentos)
// =============================================================================

const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// =============================================================================
// BENEFIT CHIP - COM CORES DIFERENCIADAS
// =============================================================================

type BenefitType = "discount" | "free" | "gift" | "drink" | "food" | "entry" | "default";

const BADGE_STYLES: Record<BenefitType, string> = {
  discount: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  free: "bg-gradient-to-r from-emerald-500 to-green-600 text-white",
  gift: "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white",
  drink: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
  food: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  entry: "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
  default: "bg-white/95 text-zinc-800 border border-zinc-200/80",
};

const getBenefitChip = (beneficio?: string): { emoji: string; text: string; type: BenefitType } => {
  if (!beneficio || beneficio.length < 3) return { emoji: "🎂", text: "Benefício", type: "default" };

  const b = beneficio.toLowerCase();

  const descontoMatch = beneficio.match(/(\d+)\s*%/);
  if (descontoMatch) return { emoji: "🏷️", text: `${descontoMatch[1]}% OFF`, type: "discount" };

  if (b.includes("grátis") || b.includes("gratis") || b.includes("free") || b.includes("cortesia")) {
    if (b.includes("drink") || b.includes("bebida") || b.includes("chopp"))
      return { emoji: "🍺", text: "Drink grátis", type: "drink" };
    if (b.includes("sobremesa") || b.includes("doce") || b.includes("bolo"))
      return { emoji: "🍰", text: "Sobremesa", type: "food" };
    if (b.includes("entrada") || b.includes("ingresso")) return { emoji: "🎟️", text: "Entrada", type: "entry" };
    if (b.includes("corte") || b.includes("cabelo")) return { emoji: "✂️", text: "Corte grátis", type: "free" };
    if (b.includes("café") || b.includes("coffee")) return { emoji: "☕", text: "Café grátis", type: "drink" };
    if (b.includes("pizza")) return { emoji: "🍕", text: "Pizza grátis", type: "food" };
    if (b.includes("sorvete") || b.includes("açaí")) return { emoji: "🍦", text: "Sorvete", type: "food" };
    return { emoji: "🎁", text: "Grátis", type: "free" };
  }

  if (b.includes("brinde") || b.includes("presente") || b.includes("mimo"))
    return { emoji: "🎁", text: "Brinde", type: "gift" };
  if (beneficio.length <= 12) return { emoji: "🎁", text: beneficio, type: "default" };

  return { emoji: "🎂", text: "Benefício", type: "default" };
};

// =============================================================================
// CARD SKELETON
// =============================================================================

const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/5] rounded-2xl bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] mb-2.5" />
    <div className="space-y-1.5 px-0.5">
      <div className="h-4 bg-zinc-200 rounded-md w-4/5" />
      <div className="h-3.5 bg-zinc-200 rounded-md w-3/5" />
    </div>
  </div>
);

// =============================================================================
// ESTABLISHMENT CARD
// =============================================================================

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    category: string;
    neighborhood: string;
    image: string;
    benefit: string;
    estado: string;
    cidade: string;
    slug: string | null;
    especialidades?: string[];
    distance?: string | null;
  };
}

const PlaceCard = ({ place }: PlaceCardProps) => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const chip = getBenefitChip(place.benefit);

  const handleClick = () => {
    const url = getEstabelecimentoUrl({
      estado: place.estado,
      cidade: place.cidade,
      slug: place.slug,
      id: place.id,
    });
    navigate(url);
  };

  return (
    <article onClick={handleClick} className="cursor-pointer group">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100 mb-2.5">
        {place.image && !error && (
          <img
            src={place.image}
            alt={place.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              loaded ? "opacity-100 group-hover:scale-105" : "opacity-0",
            )}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}

        {(!place.image || error || !loaded) && (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
            <Store className="w-12 h-12 text-violet-300" />
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full shadow-sm",
              BADGE_STYLES[chip.type],
            )}
          >
            <span>{chip.emoji}</span>
            <span>{chip.text}</span>
          </span>
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.info("Faça login para favoritar");
          }}
          className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart className="w-5 h-5 fill-black/30 text-white stroke-2 drop-shadow-md" />
        </button>
      </div>

      <div className="px-0.5">
        <h3 className="font-semibold text-zinc-900 text-sm leading-tight line-clamp-1 group-hover:text-violet-700 transition-colors">
          {place.name}
        </h3>
        <p className="text-zinc-500 text-sm line-clamp-1 mt-0.5">
          {place.category && <span className="capitalize">{place.category}</span>}
          {place.category && place.neighborhood && " · "}
          {place.neighborhood}
          {place.distance && ` · ${place.distance}`}
        </p>
      </div>
    </article>
  );
};

// =============================================================================
// HEADER
// =============================================================================

const Header = ({ city, state, onBack }: { city: string; state: string; onBack: () => void }) => (
  <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center h-14 gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-700" />
        </button>

        <div className="flex-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-violet-600" />
          <span className="font-medium text-zinc-900">
            {city}, {state}
          </span>
        </div>

        <Link
          to="/"
          className="font-bold text-sm"
          style={{
            background: "linear-gradient(90deg, #9D4EDD 0%, #00D4FF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ANIVERSARIANTE VIP
        </Link>
      </div>
    </div>
  </header>
);

// =============================================================================
// CATEGORIES BAR - STICKY
// =============================================================================

const CategoriesBar = ({
  selected,
  onSelect,
  showSubcategories,
  selectedSubcategories,
  onSubcategoriesChange,
  cidade,
  estado,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  showSubcategories: boolean;
  selectedSubcategories: string[];
  onSubcategoriesChange: (subs: string[]) => void;
  cidade: string | null;
  estado: string | null;
}) => {
  const cats = [
    { id: null, label: "Todos", icon: Sparkles },
    ...CATEGORIAS_ESTABELECIMENTO.map((c) => ({
      id: c.value,
      label: c.label,
      icon: CATEGORY_ICONS[c.value.toLowerCase()] || Sparkles,
    })),
  ];

  return (
    <div className="sticky top-[56px] z-40 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto">
        {/* Categories */}
        <div
          className="flex items-center overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex items-center gap-1 py-2">
            {cats.map((cat) => {
              const Icon = cat.icon;
              const isActive = selected === cat.id;
              return (
                <button
                  key={cat.id || "all"}
                  onClick={() => onSelect(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 min-w-[72px] px-3 py-2 relative transition-all flex-shrink-0 rounded-lg",
                    isActive ? "bg-violet-50 text-violet-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700",
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-violet-600" : "")} />
                  <span className="text-[11px] font-medium whitespace-nowrap">{cat.label}</span>
                  {isActive && <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-violet-600 rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories */}
        {showSubcategories && selected && (
          <div className="px-4 sm:px-6 lg:px-8 py-2 border-t border-zinc-100 bg-zinc-50">
            <SubcategoryFilter
              category={selected}
              selectedSubcategories={selectedSubcategories}
              onSubcategoriesChange={onSubcategoriesChange}
              cidade={cidade}
              estado={estado}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// FILTERS BAR
// =============================================================================

const FiltersBar = ({
  raioKm,
  setRaioKm,
  ordenacao,
  setOrdenacao,
  totalResults,
  cidade,
}: {
  raioKm: string;
  setRaioKm: (v: string) => void;
  ordenacao: string;
  setOrdenacao: (v: string) => void;
  totalResults: number;
  cidade: string | null;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div>
      <h1 className="text-lg font-semibold text-zinc-900">
        {totalResults} lugares encontrados
        {cidade && <span className="text-violet-600"> em {cidade}</span>}
      </h1>
    </div>

    <div className="flex gap-2">
      <Select value={raioKm} onValueChange={setRaioKm}>
        <SelectTrigger className="w-[160px] h-9 text-sm bg-white border-zinc-200">
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
        <SelectTrigger className="w-[160px] h-9 text-sm bg-white border-zinc-200">
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
  </div>
);

// =============================================================================
// CTA BAR FOR ESTABLISHMENTS
// =============================================================================

const EstablishmentCTABar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-xl p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100 shrink-0">
            <Store className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-zinc-900 font-medium text-sm">Tem um estabelecimento?</p>
            <p className="text-zinc-500 text-xs">Apareça aqui e atraia aniversariantes todos os meses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/seja-parceiro"
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 rounded-lg text-white text-sm font-medium transition-all"
          >
            Cadastrar grátis
          </Link>
          <button onClick={() => setIsVisible(false)} className="p-2 hover:bg-violet-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// EMPTY STATE
// =============================================================================

const EmptyState = ({ cidade }: { cidade: string | null }) => (
  <div className="text-center py-16">
    <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
      <MapPin className="w-10 h-10 text-violet-400" />
    </div>
    <h3 className="text-xl font-semibold text-zinc-900 mb-2">
      {cidade ? `Ainda não temos parceiros em ${cidade}` : "Nenhum resultado encontrado"}
    </h3>
    <p className="text-zinc-500 mb-6 max-w-md mx-auto">
      Estamos crescendo rápido! Quer ajudar a trazer o Aniversariante VIP pra sua cidade?
    </p>
    <Link
      to="/seja-parceiro"
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 rounded-xl text-white font-medium transition-all"
    >
      <Store className="w-5 h-5" />
      Cadastrar meu estabelecimento
    </Link>
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Explorar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Params
  const cidadeParam = searchParams.get("cidade") || "";
  const estadoParam = searchParams.get("estado") || "";
  const categoriaParam = searchParams.get("categoria") || "";

  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoriaParam || null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [raioKm, setRaioKm] = useState("all");
  const [ordenacao, setOrdenacao] = useState("distancia");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Location
  const { location: userLocation } = useUserLocation();

  // Sync category with URL
  useEffect(() => {
    if (categoriaParam) {
      setSelectedCategory(categoriaParam);
    }
  }, [categoriaParam]);

  // Fetch establishments
  const { data: estabelecimentosCidade = [], isLoading: loadingCidade } = useEstabelecimentos({
    cidade: cidadeParam,
    estado: estadoParam,
  });

  const { data: todosEstabelecimentos = [], isLoading: loadingTodos } = useEstabelecimentos({
    showAll: !cidadeParam,
  });

  // Use normalized comparison for city filtering
  const estabelecimentos = useMemo(() => {
    if (!cidadeParam) return todosEstabelecimentos;

    // Try exact match first
    if (estabelecimentosCidade.length > 0) return estabelecimentosCidade;

    // Fallback: normalized comparison
    const normalizedCity = normalizeText(cidadeParam);
    return todosEstabelecimentos.filter((est) => normalizeText(est.cidade || "") === normalizedCity);
  }, [cidadeParam, estabelecimentosCidade, todosEstabelecimentos]);

  const isLoading = cidadeParam ? loadingCidade : loadingTodos;

  // Apply proximity filters
  const estabelecimentosComDistancia = useEstabelecimentosProximos(estabelecimentos, userLocation, raioKm, ordenacao);

  // Transform to card format
  const allPlaces = useMemo(
    () =>
      estabelecimentosComDistancia.map((est) => ({
        id: est.id,
        name: est.nome_fantasia || est.razao_social || "Estabelecimento",
        category: est.categoria?.[0] || "Outros",
        especialidades: est.especialidades || [],
        neighborhood: est.bairro || est.cidade || "",
        distance:
          est.distancia !== null && est.distancia !== undefined
            ? est.distancia < 1
              ? `${Math.round(est.distancia * 1000)}m`
              : `${est.distancia.toFixed(1)}km`
            : null,
        benefit: est.descricao_beneficio || "Ver benefício exclusivo",
        latitude: est.latitude ? Number(est.latitude) : null,
        longitude: est.longitude ? Number(est.longitude) : null,
        image: est.logo_url || est.imagem_url || "",
        estado: est.estado || "",
        cidade: est.cidade || "",
        slug: est.slug || null,
      })),
    [estabelecimentosComDistancia],
  );

  // Format for map component
  const estabelecimentosFormatados = useMemo(
    () =>
      estabelecimentosComDistancia
        .filter((est) => est.latitude && est.longitude)
        .map((est) => ({
          id: est.id,
          nome_fantasia: est.nome_fantasia || est.razao_social || "Estabelecimento",
          categoria: est.categoria || [],
          endereco: `${est.logradouro || ""}, ${est.numero || ""} - ${est.bairro || ""}, ${est.cidade || ""}`,
          latitude: Number(est.latitude),
          longitude: Number(est.longitude),
          logo_url: est.logo_url || null,
          descricao_beneficio: est.descricao_beneficio || "",
          cidade: est.cidade || "",
          estado: est.estado || "",
          slug: est.slug || null,
        })),
    [estabelecimentosComDistancia],
  );

  // Filter places
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter((place) => {
      // Category filter
      if (selectedCategory && place.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategories.length > 0) {
        const placeSubcats = place.especialidades || [];
        const hasMatch = selectedSubcategories.some((sub) =>
          placeSubcats.some((ps) => normalizeText(ps) === normalizeText(sub)),
        );
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [allPlaces, selectedCategory, selectedSubcategories]);

  // Handlers
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategories([]); // Reset subcategories when category changes

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (categoryId) {
      newParams.set("categoria", categoryId);
    } else {
      newParams.delete("categoria");
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleBack = () => navigate(-1);

  const handleEstablishmentClick = (establishment: any) => {
    const url = getEstabelecimentoUrl({
      estado: establishment.estado,
      cidade: establishment.cidade,
      slug: establishment.slug,
      id: establishment.id,
    });
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-8">
      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <Header city={cidadeParam || "Todas as cidades"} state={estadoParam || ""} onBack={handleBack} />

      {/* Categories */}
      <CategoriesBar
        selected={selectedCategory}
        onSelect={handleCategorySelect}
        showSubcategories={!!selectedCategory}
        selectedSubcategories={selectedSubcategories}
        onSubcategoriesChange={setSelectedSubcategories}
        cidade={cidadeParam || null}
        estado={estadoParam || null}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* CTA Bar */}
        <EstablishmentCTABar />

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPlaces.length === 0 && <EmptyState cidade={cidadeParam || null} />}

        {/* Results with Map */}
        {!isLoading && filteredPlaces.length > 0 && (
          <>
            {/* Filters */}
            <FiltersBar
              raioKm={raioKm}
              setRaioKm={setRaioKm}
              ordenacao={ordenacao}
              setOrdenacao={setOrdenacao}
              totalResults={filteredPlaces.length}
              cidade={cidadeParam || null}
            />

            {/* Map Layout */}
            <AirbnbMapLayout
              establishments={estabelecimentosFormatados}
              onEstablishmentClick={handleEstablishmentClick}
              userLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null}
            >
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </AirbnbMapLayout>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Explorar;
