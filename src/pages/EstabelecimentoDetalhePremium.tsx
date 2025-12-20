// =============================================================================
// ESTABELECIMENTO PAGE - ESTILO AIRBNB
// Aniversariante VIP - Mobile First - Fundo Branco
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Navigation,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

// =============================================================================
// TYPES
// =============================================================================

interface Estabelecimento {
  id: string;
  nome_fantasia: string;
  categoria: string | string[];
  especialidades?: string[];
  descricao?: string;
  descricao_beneficio?: string;
  regras_beneficio?: string;
  validade_beneficio?: string;
  imagem_url?: string;
  logo_url?: string;
  fotos?: string[];
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  horario_funcionamento?: string;
  latitude?: number;
  longitude?: number;
  verificado?: boolean;
}

// =============================================================================
// MOCK DATA (para desenvolvimento - remover em produção)
// =============================================================================

const MOCK_ESTABELECIMENTO: Estabelecimento = {
  id: "1",
  nome_fantasia: "Restaurante Exemplo",
  categoria: "Restaurante",
  especialidades: ["Italiano", "Contemporâneo"],
  descricao:
    "Um lugar especial para celebrar momentos únicos. Nossa cozinha combina tradição italiana com toques contemporâneos, criando experiências gastronômicas memoráveis. Ambiente aconchegante e atendimento personalizado para fazer do seu aniversário um dia inesquecível.",
  descricao_beneficio: "Sobremesa especial de aniversário + 15% de desconto na conta",
  regras_beneficio:
    "Válido apenas no dia do aniversário mediante apresentação de documento com foto. Não acumulativo com outras promoções. Reserva antecipada recomendada.",
  validade_beneficio: "No dia do aniversário",
  imagem_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  fotos: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800",
  ],
  endereco: "Rua das Flores, 123",
  bairro: "Jardins",
  cidade: "São Paulo",
  estado: "SP",
  cep: "01234-567",
  telefone: "(11) 3456-7890",
  whatsapp: "5511987654321",
  instagram: "restauranteexemplo",
  website: "https://restauranteexemplo.com.br",
  horario_funcionamento: "Ter-Dom: 12h às 23h",
  latitude: -23.5505,
  longitude: -46.6333,
  verificado: true,
};

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative w-full h-[60vh] sm:h-[50vh] lg:h-[60vh] bg-zinc-100">
      {/* Galeria */}
      <div
        ref={containerRef}
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
            <div key={index} className="w-full h-full flex-shrink-0">
              <img
                src={foto}
                alt={`${nome} - Foto ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Gradiente superior para contraste dos botões */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

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
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium">
          {currentIndex + 1} / {fotos.length}
        </div>

        {/* Dots indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {fotos.map((_, index) => (
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
        </div>

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
}: {
  whatsapp?: string;
  instagram?: string;
  telefone?: string;
  website?: string;
}) => {
  const actions = [
    {
      id: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      color: "text-green-600",
      bgColor: "bg-green-50",
      available: !!whatsapp,
      onClick: () => whatsapp && window.open(`https://wa.me/${whatsapp}`, "_blank"),
    },
    {
      id: "instagram",
      icon: Instagram,
      label: "Instagram",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      available: !!instagram,
      onClick: () => instagram && window.open(`https://instagram.com/${instagram}`, "_blank"),
    },
    {
      id: "telefone",
      icon: Phone,
      label: "Ligar",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      available: !!telefone,
      onClick: () => telefone && (window.location.href = `tel:${telefone}`),
    },
    {
      id: "website",
      icon: Globe,
      label: "Site",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      available: !!website,
      onClick: () => website && window.open(website, "_blank"),
    },
  ];

  const availableActions = actions.filter((a) => a.available);

  if (availableActions.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-3">
      {availableActions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm active:scale-95 transition-all"
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
}: {
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
}) => {
  const fullAddress = [endereco, bairro, cidade && estado ? `${cidade} - ${estado}` : cidade || estado, cep]
    .filter(Boolean)
    .join(", ");

  const hasCoordinates = latitude && longitude;

  const navigationApps = [
    {
      id: "maps",
      label: "Maps",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/32px-Google_Maps_icon_%282020%29.svg.png",
      getUrl: () =>
        hasCoordinates
          ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
    },
    {
      id: "waze",
      label: "Waze",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Waze_icon.svg/32px-Waze_icon.svg.png",
      getUrl: () =>
        hasCoordinates
          ? `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
          : `https://waze.com/ul?q=${encodeURIComponent(fullAddress)}`,
    },
    {
      id: "uber",
      label: "Uber",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Uber_logo_2018.png/48px-Uber_logo_2018.png",
      getUrl: () =>
        hasCoordinates
          ? `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}`
          : `https://m.uber.com/`,
    },
    {
      id: "99",
      label: "99",
      icon: null,
      getUrl: () => `https://99app.com/`,
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
          <a
            key={app.id}
            href={app.getUrl()}
            target="_blank"
            rel="noopener noreferrer"
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
          </a>
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
}: {
  isOpen: boolean;
  onClose: () => void;
  beneficio?: string;
  regras?: string;
  validade?: string;
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal - Bottom Sheet no mobile */}
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full">
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
          <div className="sticky bottom-0 bg-white p-5 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#240046] text-white font-semibold rounded-xl hover:bg-[#3C096C] transition-colors"
            >
              Entendi
            </button>
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
    <div className="fixed bottom-16 sm:bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 p-4 sm:hidden">
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
            <Gift className="w-6 h-6 text-white" />
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
// SKELETON LOADING
// =============================================================================

const PageSkeleton = () => (
  <div className="min-h-screen bg-white animate-pulse">
    {/* Hero Skeleton */}
    <div className="w-full h-[60vh] bg-zinc-200" />

    {/* Content Skeleton */}
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-3">
        <div className="h-8 bg-zinc-200 rounded-lg w-3/4" />
        <div className="h-5 bg-zinc-200 rounded-lg w-1/2" />
      </div>

      <div className="h-40 bg-zinc-200 rounded-2xl" />

      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-zinc-200 rounded-xl" />
        ))}
      </div>

      <div className="space-y-3">
        <div className="h-6 bg-zinc-200 rounded-lg w-1/4" />
        <div className="h-4 bg-zinc-200 rounded-lg w-full" />
        <div className="h-4 bg-zinc-200 rounded-lg w-5/6" />
      </div>
    </div>
  </div>
);

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

const EstabelecimentoPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [estabelecimento, setEstabelecimento] = useState<Estabelecimento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Fetch estabelecimento data
  useEffect(() => {
    const fetchEstabelecimento = async () => {
      setIsLoading(true);
      try {
        // Tenta buscar por slug primeiro
        let { data, error } = await supabase
          .from("estabelecimentos")
          .select("*")
          .eq("slug", slug)
          .eq("ativo", true)
          .single();

        // Se não encontrar por slug, tenta por ID
        if (error || !data) {
          const { data: dataById, error: errorById } = await supabase
            .from("estabelecimentos")
            .select("*")
            .eq("id", slug)
            .eq("ativo", true)
            .single();

          if (errorById || !dataById) {
            // Usa mock para desenvolvimento
            setEstabelecimento(MOCK_ESTABELECIMENTO);
          } else {
            setEstabelecimento(dataById);
          }
        } else {
          setEstabelecimento(data);
        }
      } catch (err) {
        console.error("Erro ao buscar estabelecimento:", err);
        setEstabelecimento(MOCK_ESTABELECIMENTO);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstabelecimento();
  }, [slug]);

  // Handlers
  const handleBack = () => navigate(-1);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };

  const handleShare = async () => {
    if (navigator.share && estabelecimento) {
      try {
        await navigator.share({
          title: estabelecimento.nome_fantasia,
          text: `Confira o benefício de aniversário de ${estabelecimento.nome_fantasia} no Aniversariante VIP!`,
          url: window.location.href,
        });
      } catch {
        // Fallback: copiar link
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  };

  const handleShowRules = () => setShowRulesModal(true);

  // Loading state
  if (isLoading) return <PageSkeleton />;

  // Not found
  if (!estabelecimento) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-zinc-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">Estabelecimento não encontrado</h1>
          <p className="text-zinc-500 mb-6">O local que você procura não existe ou foi removido.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#240046] text-white font-semibold rounded-xl hover:bg-[#3C096C] transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Dados processados
  const fotos = estabelecimento.fotos?.length
    ? estabelecimento.fotos
    : estabelecimento.imagem_url
      ? [estabelecimento.imagem_url]
      : ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"];

  const categoria = Array.isArray(estabelecimento.categoria) ? estabelecimento.categoria[0] : estabelecimento.categoria;

  const localizacao = [estabelecimento.bairro, estabelecimento.cidade].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-white pb-32 sm:pb-6">
      {/* ========== HERO GALLERY ========== */}
      <HeroGallery
        fotos={fotos}
        nome={estabelecimento.nome_fantasia}
        onBack={handleBack}
        onFavorite={handleFavorite}
        onShare={handleShare}
        isFavorited={isFavorited}
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
          {estabelecimento.verificado && (
            <div className="flex items-center gap-1.5 mt-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Parceiro verificado</span>
            </div>
          )}

          {/* Especialidades */}
          {estabelecimento.especialidades && estabelecimento.especialidades.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {estabelecimento.especialidades.map((esp, index) => (
                <span key={index} className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full">
                  {esp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* BENEFÍCIO EM DESTAQUE */}
        {estabelecimento.descricao_beneficio && (
          <div className="pb-6">
            <BenefitCard
              beneficio={estabelecimento.descricao_beneficio}
              validade={estabelecimento.validade_beneficio}
              onShowRules={handleShowRules}
            />
          </div>
        )}

        {/* AÇÕES RÁPIDAS */}
        <div className="pb-6">
          <QuickActions
            whatsapp={estabelecimento.whatsapp}
            instagram={estabelecimento.instagram}
            telefone={estabelecimento.telefone}
            website={estabelecimento.website}
          />
        </div>

        {/* SOBRE */}
        <AboutSection descricao={estabelecimento.descricao} />

        {/* HORÁRIO */}
        <HoursSection horario={estabelecimento.horario_funcionamento} />

        {/* LOCALIZAÇÃO */}
        <LocationSection
          endereco={estabelecimento.endereco}
          bairro={estabelecimento.bairro}
          cidade={estabelecimento.cidade}
          estado={estabelecimento.estado}
          cep={estabelecimento.cep}
          latitude={estabelecimento.latitude}
          longitude={estabelecimento.longitude}
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
        beneficio={estabelecimento.descricao_beneficio}
        regras={estabelecimento.regras_beneficio}
        validade={estabelecimento.validade_beneficio}
      />

      {/* ========== BOTTOM NAV ========== */}
      <BottomNav />
    </div>
  );
};

export default EstabelecimentoPage;
