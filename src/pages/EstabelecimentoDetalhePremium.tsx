// =============================================================================
// ESTABELECIMENTO DETALHE PREMIUM - ESTILO AIRBNB
// Aniversariante VIP - Mobile First - Fundo Branco
// Compatível com EstabelecimentoDetalheBySlug (recebe ID como prop)
// =============================================================================

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useEstablishmentMetrics } from "@/hooks/useEstablishmentMetrics";
import { useSEO } from "@/hooks/useSEO";
import { getEstabelecimentoSEO } from "@/constants/seo";
import { SkeletonEstablishmentPage } from "@/components/skeletons";
import CupomModal from "@/components/CupomModal";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
// HERO GALLERY COMPONENT
// =============================================================================

const HeroGallery = ({
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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    setImageLoaded(new Array(fotos.length).fill(false));
  }, [fotos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < fotos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const goTo = (index: number) => setCurrentIndex(index);
  const goPrev = () => currentIndex > 0 && setCurrentIndex((prev) => prev - 1);
  const goNext = () => currentIndex < fotos.length - 1 && setCurrentIndex((prev) => prev + 1);

  const handleImageLoad = (index: number) => {
    setImageLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  return (
    <div className="relative w-full h-[55vh] sm:h-[50vh] lg:h-[60vh] bg-zinc-100">
      {/* Galeria */}
      <div
        className="relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {fotos.map((foto, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              {/* Skeleton enquanto carrega */}
              {!imageLoaded[index] && (
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:400%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              )}
              <img
                src={foto}
                alt={`${nome} - Foto ${index + 1}`}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  imageLoaded[index] ? "opacity-100" : "opacity-0",
                )}
                loading={index === 0 ? "eager" : "lazy"}
                onLoad={() => handleImageLoad(index)}
              />
            </div>
          ))}
        </div>

        {/* Gradiente superior para contraste dos botões */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

        {/* Botões flutuantes - Topo */}
        <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10">
          {/* Voltar */}
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-800" />
          </button>

          {/* Favoritar + Compartilhar */}
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

        {/* Contador de fotos */}
        {fotos.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium">
            {currentIndex + 1} / {fotos.length}
          </div>
        )}

        {/* Dots indicadores */}
        {fotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {fotos.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex ? "bg-white w-4" : "bg-white/50",
                )}
                aria-label={`Ir para foto ${index + 1}`}
              />
            ))}
            {fotos.length > 5 && <span className="text-white/50 text-xs ml-1">+{fotos.length - 5}</span>}
          </div>
        )}

        {/* Setas de navegação - Desktop */}
        {fotos.length > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={cn(
                "hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center hover:scale-105 transition-all",
                currentIndex === 0 && "opacity-0 pointer-events-none",
              )}
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-800" />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === fotos.length - 1}
              className={cn(
                "hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center hover:scale-105 transition-all",
                currentIndex === fotos.length - 1 && "opacity-0 pointer-events-none",
              )}
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-5 h-5 text-zinc-800" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// BENEFIT CARD COMPONENT
// =============================================================================

const BenefitCard = ({
  beneficio,
  validade,
  onShowRules,
}: {
  beneficio: string;
  validade?: string;
  onShowRules: () => void;
}) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
      {/* Header com ícone */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Gift className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-zinc-900 leading-tight">{beneficio}</h3>
          {validade && (
            <div className="flex items-center gap-1.5 mt-2">
              <Calendar className="w-4 h-4 text-violet-600" />
              <span className="text-sm text-violet-600 font-medium">Válido: {validade}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onShowRules}
        className="w-full mt-4 py-3.5 px-4 bg-[#240046] text-white font-semibold rounded-xl hover:bg-[#3C096C] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Ver regras e como usar
      </button>
    </div>
  );
};

// =============================================================================
// QUICK ACTIONS COMPONENT
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
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverBorder: "hover:border-green-300",
      available: !!whatsapp,
      onClick: onWhatsApp,
    },
    {
      id: "instagram",
      icon: Instagram,
      label: "Instagram",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      hoverBorder: "hover:border-pink-300",
      available: !!instagram,
      onClick: onInstagram,
    },
    {
      id: "telefone",
      icon: Phone,
      label: "Ligar",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverBorder: "hover:border-blue-300",
      available: !!telefone,
      onClick: onPhone,
    },
    {
      id: "cardapio",
      icon: UtensilsCrossed,
      label: "Cardápio",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      hoverBorder: "hover:border-orange-300",
      available: showCardapio && !!cardapio,
      onClick: onCardapio,
    },
    {
      id: "website",
      icon: Globe,
      label: "Site",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200",
      hoverBorder: "hover:border-violet-300",
      available: !!website,
      onClick: onWebsite,
    },
  ];

  const availableActions = actions.filter((a) => a.available);

  if (availableActions.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-3",
        availableActions.length === 1 && "grid-cols-1",
        availableActions.length === 2 && "grid-cols-2",
        availableActions.length === 3 && "grid-cols-3",
        availableActions.length === 4 && "grid-cols-4",
        availableActions.length >= 5 && "grid-cols-4",
      )}
    >
      {availableActions.slice(0, 4).map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-xl border bg-white hover:shadow-sm active:scale-95 transition-all",
            action.borderColor,
            action.hoverBorder,
          )}
        >
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", action.bgColor)}>
            <action.icon className={cn("w-5 h-5", action.color)} />
          </div>
          <span className="text-xs font-medium text-zinc-700">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

// =============================================================================
// ABOUT SECTION COMPONENT
// =============================================================================

const AboutSection = ({ descricao }: { descricao?: string }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 150;

  if (!descricao) return null;

  const shouldTruncate = descricao.length > maxLength;
  const displayText = expanded || !shouldTruncate ? descricao : `${descricao.slice(0, maxLength)}...`;

  return (
    <div className="py-6 border-t border-zinc-100">
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">Sobre</h2>
      <p className="text-zinc-600 leading-relaxed">{displayText}</p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-zinc-900 font-semibold underline underline-offset-4 hover:text-violet-600 transition-colors"
        >
          {expanded ? "Mostrar menos" : "Mostrar mais"}
        </button>
      )}
    </div>
  );
};

// =============================================================================
// HOURS SECTION COMPONENT
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
          <p className="text-zinc-600 mt-1">{horario}</p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// LOCATION SECTION COMPONENT
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

  const navigationApps = [
    {
      id: "google_maps",
      label: "Maps",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/32px-Google_Maps_icon_%282020%29.svg.png",
    },
    {
      id: "waze",
      label: "Waze",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Waze_icon.svg/32px-Waze_icon.svg.png",
    },
    {
      id: "uber",
      label: "Uber",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Uber_logo_2018.png/48px-Uber_logo_2018.png",
    },
    {
      id: "99",
      label: "99",
      icon: null,
    },
  ];

  return (
    <div className="py-6 border-t border-zinc-100">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-zinc-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Como chegar</h2>
          <p className="text-zinc-600 mt-1 text-sm leading-relaxed">{fullAddress}</p>
          {cep && <p className="text-zinc-500 text-sm">CEP: {cep}</p>}
        </div>
      </div>

      {/* Mapa Embed */}
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

      {/* Botões de navegação */}
      <div className="grid grid-cols-4 gap-2">
        {navigationApps.map((app) => (
          <button
            key={app.id}
            onClick={() => onDirections(app.id)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm active:scale-95 transition-all"
          >
            {app.icon ? (
              <img src={app.icon} alt={app.label} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
                <span className="text-xs font-bold text-black">99</span>
              </div>
            )}
            <span className="text-xs font-medium text-zinc-700">{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// RULES MODAL COMPONENT
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

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal - Bottom Sheet no mobile */}
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full sm:mx-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
          {/* Handle - Mobile */}
          <div className="sm:hidden flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-zinc-300" />
          </div>

          {/* Header */}
          <div className="sticky top-0 bg-white px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Como usar o benefício</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6">
            {/* Benefício */}
            <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-5 h-5 text-violet-600" />
                <span className="font-semibold text-violet-900">Seu benefício</span>
              </div>
              <p className="text-violet-800">{beneficio}</p>
            </div>

            {/* Validade */}
            {validade && (
              <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl">
                <Calendar className="w-5 h-5 text-zinc-600" />
                <div>
                  <span className="text-sm text-zinc-500">Válido</span>
                  <p className="font-medium text-zinc-900">{validade}</p>
                </div>
              </div>
            )}

            {/* Regras */}
            {regras && (
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Regras e condições</h3>
                <div className="space-y-2">
                  {regras
                    .split(".")
                    .filter(Boolean)
                    .map((regra, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-zinc-600 text-sm">{regra.trim()}.</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Como usar */}
            <div>
              <h3 className="font-semibold text-zinc-900 mb-3">Como usar</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-600">1</span>
                  </div>
                  <p className="text-zinc-600 text-sm">Vá ao estabelecimento no dia do seu aniversário</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-600">2</span>
                  </div>
                  <p className="text-zinc-600 text-sm">Apresente um documento com foto que comprove a data</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-600">3</span>
                  </div>
                  <p className="text-zinc-600 text-sm">Aproveite seu benefício exclusivo!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white p-5 border-t border-zinc-100 space-y-3">
            <button
              onClick={onEmitirCupom}
              className="w-full py-3.5 bg-[#240046] text-white font-semibold rounded-xl hover:bg-[#3C096C] transition-colors flex items-center justify-center gap-2"
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
// STICKY CTA COMPONENT (MOBILE)
// =============================================================================

const StickyCTA = ({ onUseBenefit }: { onUseBenefit: () => void }) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 p-4 sm:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">Benefício de aniversário</p>
          <p className="text-xs text-zinc-500">Disponível no seu dia</p>
        </div>
        <button
          onClick={onUseBenefit}
          className="px-5 py-3 bg-[#240046] text-white font-semibold rounded-xl hover:bg-[#3C096C] active:scale-95 transition-all flex-shrink-0"
        >
          Usar benefício
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// CTA BANNER (PARCEIROS)
// =============================================================================

const PartnerBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="py-6 border-t border-zinc-100">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-center mb-1">Quer sua página assim?</h3>
        <p className="text-sm text-white/80 text-center mb-4">
          Cadastre seu estabelecimento e atraia aniversariantes todos os meses!
        </p>
        <button
          onClick={() => navigate("/seja-parceiro")}
          className="w-full py-3 bg-white text-violet-700 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
        >
          Cadastrar meu negócio
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN PAGE COMPONENT
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

  // Hooks
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

  // SEO dinâmico
  useSEO(
    estabelecimento
      ? getEstabelecimentoSEO(estabelecimento)
      : { title: "Carregando...", description: "Carregando informações do estabelecimento..." },
  );

  // Check auth
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

  // Fetch estabelecimento
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

      // Track page view
      if (!hasTrackedView.current && data.id) {
        trackPageView(data.id);
        hasTrackedView.current = true;
      }

      document.title = `${data.nome_fantasia} - Aniversariante VIP`;
    };

    fetchEstabelecimento();
  }, [id, navigate, trackPageView]);

  // ========== HANDLERS ==========

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

  // Contact handlers
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

  // Directions handlers
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
        if (lat && lng) {
          window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, "_blank");
        } else {
          window.open(`https://waze.com/ul?q=${encodeURIComponent(endereco)}`, "_blank");
        }
        break;
      case "uber":
        if (lat && lng) {
          window.open(
            `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(nome)}`,
            "_blank",
          );
        } else {
          window.open(`https://m.uber.com/`, "_blank");
        }
        break;
      case "99":
        if (lat && lng) {
          window.open(
            `https://99app.com/app/ride?destination_latitude=${lat}&destination_longitude=${lng}&destination_title=${encodeURIComponent(nome)}`,
            "_blank",
          );
        } else {
          window.open(`https://99app.com/`, "_blank");
        }
        break;
    }
  };

  // Share handlers
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

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SkeletonEstablishmentPage />
      </div>
    );
  }

  if (!estabelecimento) return null;

  // ========== DADOS PROCESSADOS ==========
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
  const validadeBeneficio = estabelecimento.beneficio_validade || "No dia do aniversário";
  const regrasBeneficio = estabelecimento.beneficio_regras || estabelecimento.regras_utilizacao;

  const hasWhatsApp = !!formatWhatsApp(estabelecimento.whatsapp || estabelecimento.telefone);

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-white pb-24 sm:pb-6">
      {/* Shimmer animation style */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ========== HERO GALLERY ========== */}
      <HeroGallery
        fotos={fotos}
        nome={estabelecimento.nome_fantasia}
        onBack={handleBack}
        onFavorite={handleFavorite}
        onShare={handleShare}
        isFavorited={id ? isFavorito(id) : false}
      />

      {/* ========== CONTENT ========== */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* BLOCO DE IDENTIDADE */}
        <div className="py-6">
          {/* Nome */}
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
            {estabelecimento.nome_fantasia}
          </h1>

          {/* Categoria + Localização */}
          <div className="flex items-center gap-2 mt-2 text-zinc-600">
            <span className="capitalize">{categoria}</span>
            {localizacao && (
              <>
                <span>·</span>
                <span>{localizacao}</span>
              </>
            )}
          </div>

          {/* Badge verificado */}
          <div className="flex items-center gap-1.5 mt-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Parceiro verificado</span>
          </div>

          {/* Especialidades */}
          {estabelecimento.especialidades?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {estabelecimento.especialidades.slice(0, 4).map((esp: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full">
                  {esp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* BENEFÍCIO EM DESTAQUE */}
        {beneficio && (
          <div className="pb-6">
            <BenefitCard beneficio={beneficio} validade={validadeBeneficio} onShowRules={handleShowRules} />
          </div>
        )}

        {/* AÇÕES RÁPIDAS */}
        <div className="pb-6">
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
        </div>

        {/* SOBRE */}
        <AboutSection descricao={estabelecimento.bio || estabelecimento.descricao} />

        {/* HORÁRIO */}
        <HoursSection horario={estabelecimento.horario_funcionamento} />

        {/* LOCALIZAÇÃO */}
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

        {/* BANNER PARCEIROS */}
        <PartnerBanner />
      </div>

      {/* ========== STICKY CTA (MOBILE) ========== */}
      <StickyCTA onUseBenefit={handleShowRules} />

      {/* ========== MODAL DE REGRAS ========== */}
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

      {/* ========== MODAIS EXISTENTES ========== */}
      <CupomModal isOpen={showCupomModal} onClose={() => setShowCupomModal(false)} estabelecimento={estabelecimento} />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        returnUrl={window.location.pathname}
      />

      {/* ========== SHARE SHEET ========== */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="bg-white border-zinc-200 rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-zinc-900 text-center">Compartilhar</SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-zinc-700">WhatsApp</span>
            </button>

            <button
              onClick={handleShareInstagram}
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
              onClick={handleShareFacebook}
              className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-zinc-700">Facebook</span>
            </button>

            <button
              onClick={handleShareX}
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
              onClick={handleShareTelegram}
              className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky-100">
                <Send className="w-6 h-6 text-sky-600" />
              </div>
              <span className="text-xs text-zinc-700">Telegram</span>
            </button>

            <button
              onClick={handleShareLinkedin}
              className="flex flex-col items-center gap-2 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                <Linkedin className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-xs text-zinc-700">LinkedIn</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors mt-2"
          >
            <Copy className="w-5 h-5 text-violet-600" />
            <span className="text-violet-700 font-medium">Copiar Link</span>
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EstabelecimentoDetalhePremium;
