// =============================================================================
// ESTABELECIMENTO DETALHE PREMIUM - AIRBNB STYLE
// Aniversariante VIP - Complete Redesign
// Mobile-first + Desktop 2-column layout
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Gift,
  MapPin,
  Clock,
  Phone,
  Globe,
  MessageCircle,
  Instagram,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  Store,
  Copy,
  Send,
  Linkedin,
  Facebook,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useEstablishmentMetrics } from "@/hooks/useEstablishmentMetrics";
import { useSEO } from "@/hooks/useSEO";
import { getEstabelecimentoSEO } from "@/constants/seo";
import CupomModal from "@/components/CupomModal";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatWhatsApp,
  formatInstagram,
  formatPhoneLink,
  formatWebsite,
  getWhatsAppMessage,
} from "@/lib/contactUtils";

// =============================================================================
// TYPES
// =============================================================================

interface EstabelecimentoDetalhePremiumProps {
  estabelecimentoIdProp?: string | null;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ACCENT_COLOR = "#240046";

// Mapeamento de validade para texto humano (nunca exibir keys técnicas)
const VALIDADE_MAP: Record<string, string> = {
  dia_aniversario: "Válido no dia do aniversário",
  semana_aniversario: "Válido na semana do aniversário",
  mes_aniversario: "Válido no mês do aniversário",
  sempre: "Válido o ano todo",
};

const getValidadeTexto = (validade?: string): string => {
  if (!validade) return "Válido no dia do aniversário";
  return VALIDADE_MAP[validade] || validade;
};

// =============================================================================
// SKELETON LOADING COMPONENT
// =============================================================================

const PageSkeleton = () => (
  <div className="min-h-screen bg-white">
    {/* Mobile skeleton */}
    <div className="lg:hidden">
      <Skeleton className="w-full h-[44vh] min-h-[260px] max-h-[380px] rounded-none" />
      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
    {/* Desktop skeleton */}
    <div className="hidden lg:block">
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <Skeleton className="w-full aspect-[16/10] max-h-[480px] rounded-xl mb-6" />
      </div>
      <div className="max-w-4xl mx-auto px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// HERO GALLERY MOBILE - Full bleed (apenas mobile)
// =============================================================================

const HeroGalleryMobile = ({
  fotos,
  nome,
  onBack,
  onFavorite,
  onShare,
  isFavorited,
}: {
  fotos: string[];
  nome: string;
  onBack: () => void;
  onFavorite: () => void;
  onShare: () => void;
  isFavorited: boolean;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    setCurrentIndex(newIndex);
  }, []);

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({ left: width * index, behavior: "smooth" });
  };

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => new Set(prev).add(index));
  };

  return (
    <div className="relative w-full h-[44vh] min-h-[260px] max-h-[380px] bg-zinc-100 lg:hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {fotos.map((foto, index) => (
          <div key={index} className="flex-shrink-0 w-full h-full snap-center relative">
            {!imagesLoaded.has(index) && <div className="absolute inset-0 bg-zinc-200 animate-pulse" />}
            <img
              src={foto}
              alt={`${nome} - Foto ${index + 1}`}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                imagesLoaded.has(index) ? "opacity-100" : "opacity-0",
              )}
              loading={index === 0 ? "eager" : "lazy"}
              onLoad={() => handleImageLoad(index)}
            />
          </div>
        ))}
      </div>

      {/* Gradiente superior */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      {/* Botões flutuantes */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-800" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Compartilhar"
          >
            <Share2 className="w-5 h-5 text-zinc-800" />
          </button>
          <button
            onClick={onFavorite}
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart
              className={cn("w-5 h-5 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-zinc-800")}
            />
          </button>
        </div>
      </div>

      {/* Contador */}
      {fotos.length > 1 && (
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
          {currentIndex + 1} / {fotos.length}
        </div>
      )}

      {/* Dots */}
      {fotos.length > 1 && fotos.length <= 8 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {fotos.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                index === currentIndex ? "bg-white w-6" : "bg-white/50 w-2 hover:bg-white/70",
              )}
              aria-label={`Ir para foto ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// GALLERY DESKTOP - Contida no container, carrossel horizontal
// =============================================================================

const GalleryDesktop = ({
  fotos,
  nome,
  onBack,
  onFavorite,
  onShare,
  isFavorited,
}: {
  fotos: string[];
  nome: string;
  onBack: () => void;
  onFavorite: () => void;
  onShare: () => void;
  isFavorited: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => new Set(prev).add(index));
  };

  const goPrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const goNext = () => currentIndex < fotos.length - 1 && setCurrentIndex(currentIndex + 1);

  return (
    <div className="mb-6">
      {/* Header com navegação e ações */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <Share2 className="w-4 h-4 text-zinc-600" />
            <span className="text-sm font-medium text-zinc-700 underline">Compartilhar</span>
          </button>
          <button
            onClick={onFavorite}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <Heart
              className={cn("w-4 h-4 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-zinc-600")}
            />
            <span className="text-sm font-medium text-zinc-700 underline">{isFavorited ? "Salvo" : "Salvar"}</span>
          </button>
        </div>
      </div>

      {/* Foto única com navegação */}
      <div className="relative aspect-[16/10] max-h-[480px] rounded-xl overflow-hidden bg-zinc-100">
        {!imagesLoaded.has(currentIndex) && <div className="absolute inset-0 bg-zinc-200 animate-pulse" />}
        <img
          src={fotos[currentIndex]}
          alt={`${nome} - Foto ${currentIndex + 1}`}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            imagesLoaded.has(currentIndex) ? "opacity-100" : "opacity-0",
          )}
          loading="eager"
          onLoad={() => handleImageLoad(currentIndex)}
        />

        {/* Setas de navegação */}
        {fotos.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all",
                currentIndex === 0 && "opacity-0 pointer-events-none",
              )}
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-700" />
            </button>
            <button
              onClick={goNext}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all",
                currentIndex === fotos.length - 1 && "opacity-0 pointer-events-none",
              )}
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-5 h-5 text-zinc-700" />
            </button>
          </>
        )}

        {/* Indicador de posição */}
        {fotos.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            {currentIndex + 1} / {fotos.length}
          </div>
        )}

        {/* Dots */}
        {fotos.length > 1 && fotos.length <= 8 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {fotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-200",
                  index === currentIndex ? "bg-white w-5" : "bg-white/50 w-2 hover:bg-white/70",
                )}
                aria-label={`Ir para foto ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// BENEFIT CARD - Igual em mobile e desktop
// =============================================================================

const BenefitCard = ({
  beneficio,
  validade,
  onShowRules,
  className,
}: {
  beneficio: string;
  validade?: string;
  onShowRules: () => void;
  className?: string;
}) => {
  const validadeTexto = getValidadeTexto(validade);

  return (
    <div className={cn("bg-white border border-zinc-200 rounded-2xl p-5", className)}>
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${ACCENT_COLOR}15` }}
        >
          <Gift className="w-6 h-6" style={{ color: ACCENT_COLOR }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5" style={{ color: ACCENT_COLOR }} />
            <span className="text-xs font-medium" style={{ color: ACCENT_COLOR }}>
              {validadeTexto}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 leading-snug">{beneficio}</h3>
        </div>
      </div>

      <button
        onClick={onShowRules}
        className="w-full mt-5 py-3.5 px-4 text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        style={{ backgroundColor: ACCENT_COLOR }}
      >
        <Sparkles className="w-5 h-5" />
        Ver regras e como usar
      </button>
    </div>
  );
};

// =============================================================================
// QUICK ACTIONS
// =============================================================================

const QuickActions = ({
  whatsapp,
  instagram,
  telefone,
  website,
  cardapio,
  showCardapio,
  onWhatsApp,
  onInstagram,
  onPhone,
  onWebsite,
  onCardapio,
}: {
  whatsapp?: string;
  instagram?: string;
  telefone?: string;
  website?: string;
  cardapio?: string;
  showCardapio?: boolean;
  onWhatsApp: () => void;
  onInstagram: () => void;
  onPhone: () => void;
  onWebsite: () => void;
  onCardapio: () => void;
}) => {
  const actions = [
    {
      id: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      available: !!whatsapp,
      onClick: onWhatsApp,
      color: "text-green-600",
      hoverBg: "hover:bg-green-50",
    },
    {
      id: "instagram",
      icon: Instagram,
      label: "Instagram",
      available: !!instagram,
      onClick: onInstagram,
      color: "text-pink-600",
      hoverBg: "hover:bg-pink-50",
    },
    {
      id: "telefone",
      icon: Phone,
      label: "Ligar",
      available: !!telefone,
      onClick: onPhone,
      color: "text-blue-600",
      hoverBg: "hover:bg-blue-50",
    },
    {
      id: "website",
      icon: Globe,
      label: "Site",
      available: !!website,
      onClick: onWebsite,
      color: "text-violet-600",
      hoverBg: "hover:bg-violet-50",
    },
    {
      id: "cardapio",
      icon: UtensilsCrossed,
      label: "Cardápio",
      available: showCardapio && !!cardapio,
      onClick: onCardapio,
      color: "text-orange-600",
      hoverBg: "hover:bg-orange-50",
    },
  ];

  const availableActions = actions.filter((a) => a.available);
  if (availableActions.length === 0) return null;

  // Grid fixo de 4 colunas no mobile
  return (
    <div className="py-6 border-t border-zinc-100">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Contato</h2>
      <div className="grid grid-cols-4 gap-2">
        {availableActions.slice(0, 4).map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border border-zinc-200 transition-all duration-150",
              "hover:border-zinc-300 hover:shadow-sm active:scale-95",
              action.hoverBg,
            )}
          >
            <action.icon className={cn("w-5 h-5", action.color)} />
            <span className="text-[10px] font-medium text-zinc-600 truncate w-full text-center">{action.label}</span>
          </button>
        ))}
      </div>
      {/* Se tiver mais de 4 ações, mostra em linha extra */}
      {availableActions.length > 4 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {availableActions.slice(4).map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border border-zinc-200 transition-all duration-150",
                "hover:border-zinc-300 hover:shadow-sm active:scale-95",
                action.hoverBg,
              )}
            >
              <action.icon className={cn("w-5 h-5", action.color)} />
              <span className="text-[10px] font-medium text-zinc-600 truncate w-full text-center">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// BIO MOBILE - Aparece logo após identidade, estilo Instagram (MOBILE ONLY)
// =============================================================================

const BioMobile = ({ descricao }: { descricao?: string }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 120;

  if (!descricao || descricao.trim().length === 0) return null;

  const shouldTruncate = descricao.length > MAX_LENGTH;
  const displayText = expanded || !shouldTruncate ? descricao : `${descricao.slice(0, MAX_LENGTH).trim()}...`;

  return (
    <div className="mt-3">
      <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{displayText}</p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-sm font-medium text-zinc-900 underline underline-offset-2"
        >
          {expanded ? "Mostrar menos" : "Mostrar mais"}
        </button>
      )}
    </div>
  );
};

// =============================================================================
// ABOUT SECTION - Desktop only
// =============================================================================

const AboutSection = ({ descricao }: { descricao?: string }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 180;

  if (!descricao || descricao.trim().length === 0) return null;

  const shouldTruncate = descricao.length > MAX_LENGTH;
  const displayText = expanded || !shouldTruncate ? descricao : `${descricao.slice(0, MAX_LENGTH).trim()}...`;

  return (
    <div className="py-6 border-b border-zinc-100">
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">Sobre</h2>
      <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{displayText}</p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 inline-flex items-center gap-1 text-zinc-900 font-semibold underline underline-offset-4 hover:text-zinc-700 transition-colors"
        >
          {expanded ? (
            <>
              Mostrar menos <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Mostrar mais <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

// =============================================================================
// HOURS SECTION
// =============================================================================

const HoursSection = ({ horario }: { horario?: string }) => {
  if (!horario) return null;

  return (
    <div className="py-6 border-t border-zinc-100">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
          <Clock className="w-6 h-6 text-zinc-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Horário de funcionamento</h2>
          <p className="text-zinc-600 mt-1 whitespace-pre-line">{horario}</p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// LOCATION SECTION
// =============================================================================

const LocationSection = ({
  endereco,
  bairro,
  cidade,
  estado,
  cep,
  latitude,
  longitude,
  nomeEstabelecimento,
  onDirections,
}: {
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  nomeEstabelecimento: string;
  onDirections: (app: string) => void;
}) => {
  const fullAddress = [endereco, bairro, cidade && estado ? `${cidade} - ${estado}` : cidade || estado]
    .filter(Boolean)
    .join(", ");
  const hasCoordinates = latitude && longitude;

  return (
    <div className="py-6 pb-20 border-t border-zinc-100">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Como chegar</h2>

      <div className="flex items-start gap-3 mb-4">
        <MapPin className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-zinc-700">{fullAddress}</p>
          {cep && <p className="text-zinc-500 text-sm mt-0.5">CEP: {cep}</p>}
        </div>
      </div>

      {hasCoordinates && (
        <div className="rounded-xl overflow-hidden border border-zinc-200 mb-4">
          <iframe
            title="Localização no mapa"
            width="100%"
            height="200"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}&zoom=15`}
          />
        </div>
      )}

      {/* Botões de navegação com ícones SVG */}
      <div className="grid grid-cols-4 gap-2">
        {/* Google Maps */}
        <button
          onClick={() => onDirections("google_maps")}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 92.3 132.3" className="w-7 h-7">
              <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z" />
              <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z" />
              <path
                fill="#4285f4"
                d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"
              />
              <path
                fill="#fbbc04"
                d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"
              />
              <path
                fill="#34a853"
                d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2"
              />
            </svg>
          </div>
          <span className="text-xs font-medium text-zinc-700">Maps</span>
        </button>

        {/* Waze */}
        <button
          onClick={() => onDirections("waze")}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-7 h-7">
              <path
                fill="#4dd0e1"
                d="M24 4C12.95 4 4 12.95 4 24c0 6.62 3.23 12.48 8.19 16.12-.27-1.52-.19-3.52.71-5.22C9.08 32.11 6 28.36 6 24c0-9.93 8.07-18 18-18s18 8.07 18 18c0 4.36-3.08 8.11-6.9 10.9.9 1.7.98 3.7.71 5.22C40.77 36.48 44 30.62 44 24c0-11.05-8.95-20-20-20z"
              />
              <circle fill="#263238" cx="17" cy="22" r="3" />
              <circle fill="#263238" cx="31" cy="22" r="3" />
              <path fill="#263238" d="M24 36c-4.41 0-8-3.59-8-8h3c0 2.76 2.24 5 5 5s5-2.24 5-5h3c0 4.41-3.59 8-8 8z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-zinc-700">Waze</span>
        </button>

        {/* Uber */}
        <button
          onClick={() => onDirections("uber")}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-md bg-black flex items-center justify-center">
            <span className="text-white text-xs font-bold">Uber</span>
          </div>
          <span className="text-xs font-medium text-zinc-700">Uber</span>
        </button>

        {/* 99 */}
        <button
          onClick={() => onDirections("99")}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-md bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-sm font-black">99</span>
          </div>
          <span className="text-xs font-medium text-zinc-700">99</span>
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// RULES MODAL
// =============================================================================

const RulesModal = ({
  isOpen,
  onClose,
  beneficio,
  regras,
  validade,
  onEmitirCupom,
  onWhatsApp,
  hasWhatsApp,
}: {
  isOpen: boolean;
  onClose: () => void;
  beneficio?: string;
  regras?: string;
  validade?: string;
  onEmitirCupom: () => void;
  onWhatsApp: () => void;
  hasWhatsApp: boolean;
}) => {
  if (!isOpen) return null;

  const validadeTexto = getValidadeTexto(validade);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] sm:max-h-[80vh] w-full sm:max-w-lg overflow-hidden flex flex-col">
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-zinc-300" />
          </div>

          <div className="sticky top-0 bg-white px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Como usar seu benefício</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div
              className="p-4 rounded-xl border"
              style={{ backgroundColor: `${ACCENT_COLOR}05`, borderColor: `${ACCENT_COLOR}20` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                <span className="font-semibold" style={{ color: ACCENT_COLOR }}>
                  Seu benefício
                </span>
              </div>
              <p className="text-zinc-800 font-medium">{beneficio}</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl">
              <Calendar className="w-5 h-5 text-zinc-500" />
              <div>
                <span className="text-xs text-zinc-500 block">Validade</span>
                <p className="font-medium text-zinc-900">{validadeTexto}</p>
              </div>
            </div>

            {regras && (
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Regras e condições</h3>
                <div className="space-y-2.5">
                  {regras
                    .split(/[.;]/)
                    .filter((r) => r.trim().length > 0)
                    .map((regra, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-zinc-600 text-sm">
                          {regra.trim()}
                          {!regra.trim().endsWith(".") && "."}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-zinc-900 mb-3">Passo a passo</h3>
              <div className="space-y-4">
                {[
                  "Vá ao estabelecimento no período de validade",
                  "Apresente um documento com foto que comprove sua data de nascimento",
                  "Aproveite seu benefício exclusivo!",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${ACCENT_COLOR}15` }}
                    >
                      <span className="text-sm font-bold" style={{ color: ACCENT_COLOR }}>
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-zinc-600 text-sm pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white p-5 border-t border-zinc-100 space-y-3">
            <button
              onClick={onEmitirCupom}
              className="w-full py-3.5 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              <Gift className="w-5 h-5" />
              Emitir Meu Cupom
            </button>
            {hasWhatsApp && (
              <button
                onClick={onWhatsApp}
                className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Falar no WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// =============================================================================
// PARTNER BANNER
// =============================================================================

const PartnerBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="py-6 border-t border-zinc-100">
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #5A189A 100%)` }}
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
          <Store className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Quer sua página assim?</h3>
        <p className="text-white/80 text-sm mb-5 max-w-sm mx-auto">
          Cadastre seu estabelecimento e atraia aniversariantes todos os meses!
        </p>
        <button
          onClick={() => navigate("/seja-parceiro")}
          className="px-6 py-3 bg-white text-zinc-900 font-semibold rounded-xl hover:bg-white/90 transition-colors inline-flex items-center gap-2"
        >
          Cadastrar meu negócio
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// SHARE SHEET
// =============================================================================

const ShareSheet = ({
  isOpen,
  onClose,
  onShareWhatsApp,
  onShareInstagram,
  onShareFacebook,
  onShareX,
  onShareTelegram,
  onShareLinkedin,
  onCopyLink,
}: {
  isOpen: boolean;
  onClose: () => void;
  onShareWhatsApp: () => void;
  onShareInstagram: () => void;
  onShareFacebook: () => void;
  onShareX: () => void;
  onShareTelegram: () => void;
  onShareLinkedin: () => void;
  onCopyLink: () => void;
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-white border-zinc-200 rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-zinc-900 text-center">Compartilhar</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
          <button
            onClick={onShareWhatsApp}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-zinc-700">WhatsApp</span>
          </button>

          <button
            onClick={onShareInstagram}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
              }}
            >
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-zinc-700">Instagram</span>
          </button>

          <button
            onClick={onShareFacebook}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
              <Facebook className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-zinc-700">Facebook</span>
          </button>

          <button
            onClick={onShareX}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-700">X</span>
          </button>

          <button
            onClick={onShareTelegram}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky-100">
              <Send className="w-6 h-6 text-sky-600" />
            </div>
            <span className="text-xs text-zinc-700">Telegram</span>
          </button>

          <button
            onClick={onShareLinkedin}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
              <Linkedin className="w-6 h-6 text-blue-700" />
            </div>
            <span className="text-xs text-zinc-700">LinkedIn</span>
          </button>
        </div>

        <button
          onClick={onCopyLink}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-colors mt-2"
          style={{ backgroundColor: `${ACCENT_COLOR}10` }}
        >
          <Copy className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
          <span className="font-medium" style={{ color: ACCENT_COLOR }}>
            Copiar Link
          </span>
        </button>
      </SheetContent>
    </Sheet>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EstabelecimentoDetalhePremium = ({ estabelecimentoIdProp }: EstabelecimentoDetalhePremiumProps) => {
  const navigate = useNavigate();
  const id = estabelecimentoIdProp;

  const [estabelecimento, setEstabelecimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showCupomModal, setShowCupomModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  const { isFavorito, toggleFavorito } = useFavoritos(userId);
  const {
    trackPageView,
    trackBenefitClick,
    trackWhatsAppClick,
    trackPhoneClick,
    trackInstagramClick,
    trackSiteClick,
    trackDirectionsClick,
    trackShare,
    trackFavorite,
  } = useEstablishmentMetrics();
  const hasTrackedView = useRef(false);

  useSEO(
    estabelecimento
      ? getEstabelecimentoSEO(estabelecimento)
      : { title: "Carregando...", description: "Carregando informações do estabelecimento..." },
  );

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEstabelecimento = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("public_estabelecimentos")
        .select("*")
        .eq("id", id)
        .eq("ativo", true)
        .maybeSingle();
      if (error || !data) {
        toast.error("Estabelecimento não encontrado");
        navigate("/explorar");
        return;
      }
      setEstabelecimento(data);
      setLoading(false);
      if (!hasTrackedView.current && data.id) {
        trackPageView(data.id);
        hasTrackedView.current = true;
      }
      document.title = `${data.nome_fantasia} - Aniversariante VIP`;
    };
    fetchEstabelecimento();
  }, [id, navigate, trackPageView]);

  const handleBack = () => navigate(-1);
  const handleFavorite = async () => {
    if (!userId || !id) {
      setShowLoginModal(true);
      return;
    }
    trackFavorite(id);
    await toggleFavorito(id);
  };
  const handleShare = () => {
    if (id) trackShare(id);
    setShowShareSheet(true);
  };
  const handleShowRules = () => {
    if (!userId) {
      setShowLoginModal(true);
      return;
    }
    if (id) trackBenefitClick(id);
    setShowRulesModal(true);
  };
  const handleEmitirCupom = () => {
    setShowRulesModal(false);
    setShowCupomModal(true);
  };

  const handleWhatsApp = () => {
    const numero = estabelecimento?.whatsapp || estabelecimento?.telefone;
    const formattedNumber = formatWhatsApp(numero);
    if (!formattedNumber) {
      toast.error("WhatsApp não disponível");
      return;
    }
    if (id) trackWhatsAppClick(id);
    const message = getWhatsAppMessage(estabelecimento.nome_fantasia, estabelecimento.categoria?.[0]);
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleInstagram = () => {
    const instagramUrl = formatInstagram(estabelecimento?.instagram);
    if (!instagramUrl) {
      toast.error("Instagram não disponível");
      return;
    }
    if (id) trackInstagramClick(id);
    window.open(instagramUrl, "_blank");
  };

  const handlePhone = () => {
    const phoneLink = formatPhoneLink(estabelecimento?.telefone);
    if (!phoneLink) {
      toast.error("Telefone não disponível");
      return;
    }
    if (id) trackPhoneClick(id);
    window.location.href = phoneLink;
  };

  const handleWebsite = () => {
    const siteUrl = formatWebsite(estabelecimento?.site);
    if (!siteUrl) {
      toast.error("Site não disponível");
      return;
    }
    if (id) trackSiteClick(id);
    window.open(siteUrl, "_blank");
  };

  const handleCardapio = () => {
    if (!estabelecimento?.link_cardapio) {
      toast.error("Cardápio não disponível");
      return;
    }
    window.open(estabelecimento.link_cardapio, "_blank");
  };

  const getEnderecoCompleto = () =>
    [
      estabelecimento?.logradouro,
      estabelecimento?.numero,
      estabelecimento?.bairro,
      estabelecimento?.cidade,
      estabelecimento?.estado,
    ]
      .filter(Boolean)
      .join(", ");

  const handleDirections = (app: string) => {
    if (id) trackDirectionsClick(id, app);
    const endereco = getEnderecoCompleto();
    const lat = estabelecimento?.latitude;
    const lng = estabelecimento?.longitude;
    const nome = estabelecimento?.nome_fantasia;
    switch (app) {
      case "google_maps":
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, "_blank");
        break;
      case "waze":
        lat && lng
          ? window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, "_blank")
          : window.open(`https://waze.com/ul?q=${encodeURIComponent(endereco)}`, "_blank");
        break;
      case "uber":
        lat && lng
          ? window.open(
              `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(nome)}`,
              "_blank",
            )
          : window.open("https://m.uber.com/", "_blank");
        break;
      case "99":
        lat && lng
          ? window.open(
              `https://99app.com/app/ride?destination_latitude=${lat}&destination_longitude=${lng}&destination_title=${encodeURIComponent(nome)}`,
              "_blank",
            )
          : window.open("https://99app.com/", "_blank");
        break;
    }
  };

  const getShareText = () =>
    `🎂 Confira ${estabelecimento?.nome_fantasia} no Aniversariante VIP!\n\n📍 ${estabelecimento?.bairro}, ${estabelecimento?.cidade}`;
  const getShareUrl = () => window.location.href;
  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareText() + "\n\n" + getShareUrl())}`, "_blank");
    setShowShareSheet(false);
  };
  const handleShareInstagram = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success("Link copiado! Cole no seu Stories ou Direct do Instagram 📸");
    setShowShareSheet(false);
  };
  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, "_blank");
    setShowShareSheet(false);
  };
  const handleShareX = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`,
      "_blank",
    );
    setShowShareSheet(false);
  };
  const handleShareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareText())}`,
      "_blank",
    );
    setShowShareSheet(false);
  };
  const handleShareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`, "_blank");
    setShowShareSheet(false);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success("Link copiado!");
    setShowShareSheet(false);
  };

  if (loading) return <PageSkeleton />;
  if (!estabelecimento) return null;

  const fotos =
    estabelecimento.galeria_fotos?.length > 0
      ? estabelecimento.galeria_fotos
      : estabelecimento.imagem_url
        ? [estabelecimento.imagem_url]
        : estabelecimento.logo_url
          ? [estabelecimento.logo_url]
          : ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"];
  const categoria = estabelecimento.categoria?.[0] || "Estabelecimento";
  const localizacao = [estabelecimento.bairro, estabelecimento.cidade].filter(Boolean).join(", ");
  const mostraCardapio = ["Bar", "Restaurante"].includes(categoria);
  const beneficio = estabelecimento.beneficio_titulo || estabelecimento.descricao_beneficio;
  const validadeBeneficio = estabelecimento.beneficio_validade;
  const regrasBeneficio = estabelecimento.beneficio_regras || estabelecimento.regras_utilizacao;
  const hasWhatsApp = !!formatWhatsApp(estabelecimento.whatsapp || estabelecimento.telefone);

  return (
    <div className="min-h-screen bg-white">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* Galeria mobile - full bleed */}
      <HeroGalleryMobile
        fotos={fotos}
        nome={estabelecimento.nome_fantasia}
        onBack={handleBack}
        onFavorite={handleFavorite}
        onShare={handleShare}
        isFavorited={id ? isFavorito(id) : false}
      />

      {/* Container desktop */}
      <div className="hidden lg:block">
        {/* Galeria desktop - container mais largo */}
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <GalleryDesktop
            fotos={fotos}
            nome={estabelecimento.nome_fantasia}
            onBack={handleBack}
            onFavorite={handleFavorite}
            onShare={handleShare}
            isFavorited={id ? isFavorito(id) : false}
          />
        </div>

        {/* Conteúdo - container mais estreito (recuado em relação à foto) */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="max-w-2xl mx-auto pb-12">
            {/* Título e info */}
            <div className="py-6 border-b border-zinc-100">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                {estabelecimento.nome_fantasia}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-zinc-600">
                <span className="capitalize">{categoria}</span>
                {localizacao && (
                  <>
                    <span className="text-zinc-300">·</span>
                    <span>{localizacao}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Parceiro verificado</span>
              </div>
              {estabelecimento.especialidades?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {estabelecimento.especialidades.slice(0, 5).map((esp: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full">
                      {esp}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sobre */}
            <AboutSection descricao={estabelecimento.bio || estabelecimento.descricao} />

            {/* Benefício */}
            {beneficio && (
              <div className="py-6 border-b border-zinc-100">
                <BenefitCard beneficio={beneficio} validade={validadeBeneficio} onShowRules={handleShowRules} />
              </div>
            )}

            <QuickActions
              whatsapp={formatWhatsApp(estabelecimento.whatsapp || estabelecimento.telefone)}
              instagram={formatInstagram(estabelecimento.instagram)}
              telefone={formatPhoneLink(estabelecimento.telefone)}
              website={formatWebsite(estabelecimento.site)}
              cardapio={estabelecimento.link_cardapio}
              showCardapio={mostraCardapio}
              onWhatsApp={handleWhatsApp}
              onInstagram={handleInstagram}
              onPhone={handlePhone}
              onWebsite={handleWebsite}
              onCardapio={handleCardapio}
            />

            <HoursSection horario={estabelecimento.horario_funcionamento} />
            <LocationSection
              endereco={[estabelecimento.logradouro, estabelecimento.numero, estabelecimento.complemento]
                .filter(Boolean)
                .join(", ")}
              bairro={estabelecimento.bairro}
              cidade={estabelecimento.cidade}
              estado={estabelecimento.estado}
              cep={estabelecimento.cep}
              latitude={estabelecimento.latitude}
              longitude={estabelecimento.longitude}
              nomeEstabelecimento={estabelecimento.nome_fantasia}
              onDirections={handleDirections}
            />
            <PartnerBanner />
          </div>
        </div>
      </div>

      {/* Container mobile */}
      <div className="lg:hidden px-4 sm:px-6 pb-12">
        {/* Título e info */}
        <div className="py-6 border-b border-zinc-100">
          <h1 className="text-2xl font-bold text-zinc-900 leading-tight">{estabelecimento.nome_fantasia}</h1>
          <div className="flex items-center gap-2 mt-2 text-zinc-600">
            <span className="capitalize">{categoria}</span>
            {localizacao && (
              <>
                <span className="text-zinc-300">·</span>
                <span>{localizacao}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Parceiro verificado</span>
          </div>
          {estabelecimento.especialidades?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {estabelecimento.especialidades.slice(0, 5).map((esp: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full">
                  {esp}
                </span>
              ))}
            </div>
          )}

          {/* Bio mobile */}
          <BioMobile descricao={estabelecimento.bio || estabelecimento.descricao} />
        </div>

        {/* Benefício */}
        {beneficio && (
          <div className="py-6 border-b border-zinc-100">
            <BenefitCard beneficio={beneficio} validade={validadeBeneficio} onShowRules={handleShowRules} />
          </div>
        )}

        <QuickActions
          whatsapp={formatWhatsApp(estabelecimento.whatsapp || estabelecimento.telefone)}
          instagram={formatInstagram(estabelecimento.instagram)}
          telefone={formatPhoneLink(estabelecimento.telefone)}
          website={formatWebsite(estabelecimento.site)}
          cardapio={estabelecimento.link_cardapio}
          showCardapio={mostraCardapio}
          onWhatsApp={handleWhatsApp}
          onInstagram={handleInstagram}
          onPhone={handlePhone}
          onWebsite={handleWebsite}
          onCardapio={handleCardapio}
        />

        <HoursSection horario={estabelecimento.horario_funcionamento} />
        <LocationSection
          endereco={[estabelecimento.logradouro, estabelecimento.numero, estabelecimento.complemento]
            .filter(Boolean)
            .join(", ")}
          bairro={estabelecimento.bairro}
          cidade={estabelecimento.cidade}
          estado={estabelecimento.estado}
          cep={estabelecimento.cep}
          latitude={estabelecimento.latitude}
          longitude={estabelecimento.longitude}
          nomeEstabelecimento={estabelecimento.nome_fantasia}
          onDirections={handleDirections}
        />
        <PartnerBanner />
      </div>

      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        beneficio={beneficio}
        regras={regrasBeneficio}
        validade={validadeBeneficio}
        onEmitirCupom={handleEmitirCupom}
        onWhatsApp={handleWhatsApp}
        hasWhatsApp={hasWhatsApp}
      />
      <CupomModal isOpen={showCupomModal} onClose={() => setShowCupomModal(false)} estabelecimento={estabelecimento} />
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        returnUrl={window.location.pathname}
      />
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        onShareWhatsApp={handleShareWhatsApp}
        onShareInstagram={handleShareInstagram}
        onShareFacebook={handleShareFacebook}
        onShareX={handleShareX}
        onShareTelegram={handleShareTelegram}
        onShareLinkedin={handleShareLinkedin}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
};

export default EstabelecimentoDetalhePremium;
