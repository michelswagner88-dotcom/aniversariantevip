// =============================================================================
// EXPLORAR.TSX - V2.2
// Layout claro consistente com Home + Mapa Split + Subcategorias funcionando
// CORREÇÕES: Botão roxo, filtros com labels, sem "Melhor avaliados"
// CORREÇÃO: Badge padronizado com Home (🎁 + uma palavra)
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
import { AirbnbMapLayout } from "@/components/map/AirbnbMapLayout";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

// =============================================================================
// CONSTANTS
// =============================================================================

const HEADER_COLOR = "#240046";
const BRAND_PURPLE = "#7C3AED";
const BRAND_PURPLE_HOVER = "#6D28D9";

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

const DISTANCIA_LABELS: Record<string, string> = {
  all: "Qualquer distância",
  "1": "Até 1 km",
  "3": "Até 3 km",
  "5": "Até 5 km",
  "10": "Até 10 km",
  "25": "Até 25 km",
};

const ORDENACAO_LABELS: Record<string, string> = {
  distancia: "Mais próximos",
  nome: "Nome A-Z",
  recentes: "Mais recentes",
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
// BENEFIT CHIP - PADRONIZADO COM A HOME (🎁 + uma palavra)
// =============================================================================

const BADGE_STYLE = "bg-white text-[#240046] font-bold shadow-md border border-violet-100";

const getBenefitChip = (beneficio?: string): { emoji: string; text: string } => {
  if (!beneficio || beneficio.length < 3) return { emoji: "🎁", text: "Presente" };
  const b = beneficio.toLowerCase();

  // Desconto - quando tem porcentagem
  if (b.includes("%") || b.includes("desconto") || b.includes("off")) {
    return { emoji: "🎁", text: "Desconto" };
  }

  // Cortesia - quando é algo grátis
  if (b.includes("grátis") || b.includes("gratis") || b.includes("free") || b.includes("cortesia")) {
    return { emoji: "🎁", text: "Cortesia" };
  }

  // Brinde - quando é presente/mimo/surpresa
  if (
    b.includes("brinde") ||
    b.includes("presente") ||
    b.includes("mimo") ||
    b.includes("surpresa") ||
    b.includes("gift")
  ) {
    return { emoji: "🎁", text: "Brinde" };
  }

  // Dobro - quando é 2x1 ou dobro
  if (b.includes("2x1") || b.includes("dobro") || b.includes("dois por um") || b.includes("leve 2")) {
    return { emoji: "🎁", text: "Dobro" };
  }

  // Bônus - quando é adicional/extra
  if (b.includes("bônus") || b.includes("bonus") || b.includes("extra") || b.includes("adicional")) {
    return { emoji: "🎁", text: "Bônus" };
  }

  // Voucher - quando menciona voucher/cupom
  if (b.includes("voucher") || b.includes("cupom") || b.includes("vale")) {
    return { emoji: "🎁", text: "Voucher" };
  }

  // Padrão - Presente
  return { emoji: "🎁", text: "Presente" };
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
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full", BADGE_STYLE)}>
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
  <header className="sticky top-0 z-50" style={{ backgroundColor: HEADER_COLOR }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center h-14 gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-violet-300" />
          <span className="font-medium text-white">
            {city}
            {state && `, ${state}`}
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
// CATEGORIES BAR
// =============================================================================

const CategoriesBar = ({
  selected,
  onSelect,
  showSubcategories,
  selectedSubcategories,
  onSubcategoriesChange,
  cidade,
  estado,
  estabelecimentos,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  showSubcategories: boolean;
  selectedSubcategories: string[];
  onSubcategoriesChange: (subs: string[]) => void;
  cidade: string | null;
  estado: string | null;
  estabelecimentos: any[];
}) => {
  const cats = [
    { id: null, label: "Todos", icon: Sparkles },
    ...CATEGORIAS_ESTABELECIMENTO.map((c) => ({
      id: c.value,
      label: c.label,
      icon: CATEGORY_ICONS[c.value.toLowerCase()] || Sparkles,
    })),
  ];

  const SUBCATEGORIAS: Record<string, string[]> = {
    academia: ["Musculação", "CrossFit", "Pilates", "Natação", "Funcional", "Spinning", "Yoga", "Artes Marciais"],
    bar: ["Cervejaria", "Pub", "Rooftop", "Bar de Vinhos", "Coquetelaria", "Boteco", "Sports Bar"],
    restaurante: ["Italiano", "Japonês", "Brasileiro", "Churrascaria", "Pizzaria", "Fast Food", "Vegano", "Árabe"],
    cafeteria: ["Café Especial", "Confeitaria", "Padaria", "Brunch", "Doceria"],
    barbearia: ["Corte Masculino", "Barba", "Tratamento Capilar", "Pigmentação"],
    salao: ["Cabelo", "Manicure", "Estética", "Maquiagem", "Depilação", "Sobrancelha"],
    "casa noturna": ["Balada", "Club", "Festa", "Show ao Vivo"],
    hospedagem: ["Hotel", "Pousada", "Resort", "Hostel", "Flat"],
    loja: ["Roupas", "Calçados", "Acessórios", "Presentes", "Eletrônicos", "Decoração"],
    entretenimento: ["Cinema", "Teatro", "Parque", "Escape Room", "Boliche", "Karaokê"],
    sorveteria: ["Artesanal", "Açaí", "Frozen", "Picolé", "Milk Shake"],
  };

  const subcatsDisponiveis = useMemo(() => {
    if (!selected) return [];
    const todasSubs = SUBCATEGORIAS[selected.toLowerCase()] || [];
    if (todasSubs.length === 0) return [];
    const estabsDaCategoria = estabelecimentos.filter((e) => {
      const cats = Array.isArray(e.categoria) ? e.categoria : [e.categoria];
      return cats.some((c) => c?.toLowerCase() === selected.toLowerCase());
    });
    if (estabsDaCategoria.length === 0) return [];
    const especialidadesExistentes = new Set<string>();
    estabsDaCategoria.forEach((est) => {
      const specs = est.especialidades || [];
      specs.forEach((s: string) => especialidadesExistentes.add(s.toLowerCase()));
    });
    return todasSubs.filter((sub) => {
      const subLower = sub.toLowerCase();
      return Array.from(especialidadesExistentes).some(
        (esp) => esp.includes(subLower) || subLower.includes(esp) || esp === subLower,
      );
    });
  }, [selected, estabelecimentos]);

  return (
    <div className="sticky top-[56px] z-40" style={{ backgroundColor: HEADER_COLOR }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="flex items-center overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 border-b border-white/10"
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
                    "flex flex-col items-center gap-1 min-w-[72px] px-3 py-2 relative transition-all flex-shrink-0",
                    "text-white",
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span
                    className={cn(
                      "text-[11px] font-semibold whitespace-nowrap text-white",
                      isActive ? "opacity-100" : "opacity-80",
                    )}
                  >
                    {cat.label}
                  </span>
                  {isActive && <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {showSubcategories && selected && subcatsDisponiveis.length > 0 && (
          <div
            className="flex items-center overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 py-2 bg-[#3C096C]/50"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSubcategoriesChange([])}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0",
                  selectedSubcategories.length === 0
                    ? "bg-white text-[#240046]"
                    : "bg-white/90 text-[#240046] hover:bg-white",
                )}
              >
                Ver todos
              </button>
              <div className="w-px h-5 bg-white/30 mx-1" />
              {subcatsDisponiveis.map((sub) => {
                const isSubActive = selectedSubcategories.includes(sub);
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      if (isSubActive) {
                        onSubcategoriesChange(selectedSubcategories.filter((s) => s !== sub));
                      } else {
                        onSubcategoriesChange([...selectedSubcategories, sub]);
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0",
                      isSubActive
                        ? "bg-white text-[#240046] ring-2 ring-white ring-offset-2 ring-offset-[#3C096C]"
                        : "bg-white/90 text-[#240046] hover:bg-white",
                    )}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
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
  categoria,
}: {
  raioKm: string;
  setRaioKm: (v: string) => void;
  ordenacao: string;
  setOrdenacao: (v: string) => void;
  totalResults: number;
  cidade: string | null;
  categoria: string | null;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div>
      <h1 className="text-lg font-semibold text-zinc-900">
        {categoria ? (
          <span className="capitalize">
            {categoria} em {cidade || "todas as cidades"}
          </span>
        ) : (
          <span>{totalResults} lugares encontrados</span>
        )}
      </h1>
      <p className="text-sm text-zinc-500">{totalResults} lugares encontrados</p>
    </div>

    <div className="flex gap-2 flex-wrap">
      <Select value={ordenacao} onValueChange={setOrdenacao}>
        <SelectTrigger
          className={cn(
            "h-10 text-sm bg-white border-zinc-200 rounded-lg px-3",
            "shadow-sm hover:border-violet-300 hover:bg-violet-50/50",
            "focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400",
            "transition-all duration-200 w-auto min-w-[130px]",
          )}
        >
          <span className="text-zinc-700 font-medium whitespace-nowrap">
            {ORDENACAO_LABELS[ordenacao] || "Mais próximos"}
          </span>
        </SelectTrigger>
        <SelectContent
          className="z-[100] bg-white border border-zinc-200 shadow-lg rounded-lg overflow-hidden"
          position="popper"
          sideOffset={4}
        >
          <SelectItem
            value="distancia"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Mais próximos
          </SelectItem>
          <SelectItem
            value="nome"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Nome A-Z
          </SelectItem>
          <SelectItem
            value="recentes"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Mais recentes
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={raioKm} onValueChange={setRaioKm}>
        <SelectTrigger
          className={cn(
            "h-10 text-sm bg-white border-zinc-200 rounded-lg px-3",
            "shadow-sm hover:border-violet-300 hover:bg-violet-50/50",
            "focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400",
            "transition-all duration-200 w-auto min-w-[150px]",
          )}
        >
          <span className="text-zinc-700 font-medium whitespace-nowrap">
            {DISTANCIA_LABELS[raioKm] || "Qualquer distância"}
          </span>
        </SelectTrigger>
        <SelectContent
          className="z-[100] bg-white border border-zinc-200 shadow-lg rounded-lg overflow-hidden"
          position="popper"
          sideOffset={4}
        >
          <SelectItem
            value="all"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Qualquer distância
          </SelectItem>
          <SelectItem
            value="1"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Até 1 km
          </SelectItem>
          <SelectItem
            value="3"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Até 3 km
          </SelectItem>
          <SelectItem
            value="5"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Até 5 km
          </SelectItem>
          <SelectItem
            value="10"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Até 10 km
          </SelectItem>
          <SelectItem
            value="25"
            className="text-sm py-2.5 px-3 cursor-pointer hover:bg-violet-50 focus:bg-violet-50 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-900"
          >
            Até 25 km
          </SelectItem>
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
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:brightness-110"
            style={{ backgroundColor: BRAND_PURPLE }}
          >
            Cadastrar estabelecimento
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
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:brightness-110"
      style={{ backgroundColor: BRAND_PURPLE }}
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

  const cidadeParam = searchParams.get("cidade") || "";
  const estadoParam = searchParams.get("estado") || "";
  const categoriaParam = searchParams.get("categoria") || "";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoriaParam || null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [raioKm, setRaioKm] = useState("all");
  const [ordenacao, setOrdenacao] = useState("distancia");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const { location: userLocation } = useUserLocation();

  useEffect(() => {
    if (categoriaParam) {
      setSelectedCategory(categoriaParam);
    }
  }, [categoriaParam]);

  const { data: estabelecimentosCidade = [], isLoading: loadingCidade } = useEstabelecimentos({
    cidade: cidadeParam,
    estado: estadoParam,
  });

  const { data: todosEstabelecimentos = [], isLoading: loadingTodos } = useEstabelecimentos({
    showAll: !cidadeParam,
  });

  const estabelecimentos = useMemo(() => {
    if (!cidadeParam) return todosEstabelecimentos;
    if (estabelecimentosCidade.length > 0) return estabelecimentosCidade;
    const normalizedCity = normalizeText(cidadeParam);
    return todosEstabelecimentos.filter((est) => normalizeText(est.cidade || "") === normalizedCity);
  }, [cidadeParam, estabelecimentosCidade, todosEstabelecimentos]);

  const isLoading = cidadeParam ? loadingCidade : loadingTodos;

  const estabelecimentosComDistancia = useEstabelecimentosProximos(estabelecimentos, userLocation, raioKm, ordenacao);

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

  const estabelecimentosFormatados = useMemo(() => {
    let filtered = estabelecimentosComDistancia;

    if (selectedCategory) {
      filtered = filtered.filter((est) => {
        const cats = Array.isArray(est.categoria) ? est.categoria : [est.categoria];
        return cats.some((c) => c?.toLowerCase() === selectedCategory.toLowerCase());
      });
    }

    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((est) => {
        const specs = est.especialidades || [];
        const hasMatch = selectedSubcategories.some((sub) => {
          const subNorm = normalizeText(sub);
          return specs.some((s: string) => {
            const specNorm = normalizeText(s);
            return specNorm === subNorm || specNorm.includes(subNorm) || subNorm.includes(specNorm);
          });
        });
        return hasMatch;
      });
    }

    return filtered
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
      }));
  }, [estabelecimentosComDistancia, selectedCategory, selectedSubcategories]);

  const filteredPlaces = useMemo(() => {
    return allPlaces.filter((place) => {
      if (selectedCategory && place.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      if (selectedSubcategories.length > 0) {
        const placeSubcats = place.especialidades || [];
        const hasMatch = selectedSubcategories.some((sub) => {
          const subNorm = normalizeText(sub);
          return placeSubcats.some((ps: string) => {
            const specNorm = normalizeText(ps);
            return specNorm === subNorm || specNorm.includes(subNorm) || subNorm.includes(specNorm);
          });
        });
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [allPlaces, selectedCategory, selectedSubcategories]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategories([]);

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
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <Header city={cidadeParam || "Todas as cidades"} state={estadoParam || ""} onBack={handleBack} />

      <CategoriesBar
        selected={selectedCategory}
        onSelect={handleCategorySelect}
        showSubcategories={!!selectedCategory}
        selectedSubcategories={selectedSubcategories}
        onSubcategoriesChange={setSelectedSubcategories}
        cidade={cidadeParam || null}
        estado={estadoParam || null}
        estabelecimentos={estabelecimentos}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EstablishmentCTABar />

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && filteredPlaces.length === 0 && <EmptyState cidade={cidadeParam || null} />}

        {!isLoading && filteredPlaces.length > 0 && (
          <>
            <FiltersBar
              raioKm={raioKm}
              setRaioKm={setRaioKm}
              ordenacao={ordenacao}
              setOrdenacao={setOrdenacao}
              totalResults={filteredPlaces.length}
              cidade={cidadeParam || null}
              categoria={selectedCategory}
            />

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
