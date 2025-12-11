// EstabelecimentoDetalhePremium.tsx - Página Premium Clean

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, X, Copy, MessageCircle, Send, Facebook, Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { getEstabelecimentoSEO } from "@/constants/seo";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useEstablishmentMetrics } from "@/hooks/useEstablishmentMetrics";
import {
  formatWhatsApp,
  formatInstagram,
  formatPhoneLink,
  formatWebsite,
  getWhatsAppMessage,
} from "@/lib/contactUtils";
import { gerarBioAutomatica, separarBeneficio } from "@/lib/bioUtils";
import LoginRequiredModal from "@/components/LoginRequiredModal";

// Componentes Premium Clean
import EstablishmentHero from "@/components/estabelecimento/EstablishmentHero";
import BenefitCard from "@/components/estabelecimento/BenefitCard";
import AboutSection from "@/components/estabelecimento/AboutSection";
import ContactButtons from "@/components/estabelecimento/ContactButtons";
import BusinessHours from "@/components/estabelecimento/BusinessHours";
import LocationSection from "@/components/estabelecimento/LocationSection";
import PartnerCTA from "@/components/estabelecimento/PartnerCTA";
import BottomNav from "@/components/BottomNav";

// ===== GALERIA DE FOTOS INLINE =====
interface GaleriaFotosInlineProps {
  photos: string[];
  establishmentName: string;
}

const GaleriaFotosInline = ({ photos, establishmentName }: GaleriaFotosInlineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Limitar a 10 fotos
  const displayPhotos = photos.slice(0, 10);

  if (displayPhotos.length === 0) return null;

  // Verificar scroll
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll horizontal
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Abrir lightbox
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  // Navegação no lightbox
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* GALERIA CARROSSEL */}
      <div className="relative mx-4 sm:mx-6 mt-4 sm:mt-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-semibold text-[#240046]">Fotos</h2>
            <span className="text-xs sm:text-sm text-[#3C096C]">
              {displayPhotos.length} {displayPhotos.length === 1 ? "foto" : "fotos"}
            </span>
          </div>

          {/* Container do carrossel */}
          <div className="relative group">
            {/* Botão esquerda */}
            {displayPhotos.length > 2 && (
              <button
                onClick={() => scroll("left")}
                aria-label="Fotos anteriores"
                className={`
                  absolute left-2 top-1/2 -translate-y-1/2 z-10
                  min-w-[44px] min-h-[44px] w-11 h-11 rounded-full 
                  bg-white/90 sm:bg-white shadow-lg
                  flex items-center justify-center
                  transition-all duration-200
                  active:scale-95
                  ${canScrollLeft ? "opacity-100 hover:scale-110" : "opacity-0 pointer-events-none"}
                `}
              >
                <ChevronLeft className="w-5 h-5 text-[#240046]" />
              </button>
            )}

            {/* Scroll container */}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="
                flex gap-2 sm:gap-3
                overflow-x-auto
                scroll-smooth
                snap-x snap-mandatory
                -mx-4 px-4 sm:mx-0 sm:px-0
                pb-2
              "
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => openLightbox(index)}
                  aria-label={`Ver foto ${index + 1} de ${displayPhotos.length}`}
                  className={`
                    flex-shrink-0 snap-start
                    overflow-hidden rounded-xl
                    transition-transform duration-200
                    active:scale-[0.98]
                    ${displayPhotos.length === 1 ? "w-full aspect-video" : "w-[65vw] sm:w-[260px] aspect-[4/3]"}
                  `}
                >
                  <img
                    src={photo}
                    alt={`${establishmentName} - Foto ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {/* Botão direita */}
            {displayPhotos.length > 2 && (
              <button
                onClick={() => scroll("right")}
                aria-label="Próximas fotos"
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2 z-10
                  min-w-[44px] min-h-[44px] w-11 h-11 rounded-full 
                  bg-white/90 sm:bg-white shadow-lg
                  flex items-center justify-center
                  transition-all duration-200
                  active:scale-95
                  ${canScrollRight ? "opacity-100 hover:scale-110" : "opacity-0 pointer-events-none"}
                `}
              >
                <ChevronRight className="w-5 h-5 text-[#240046]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Galeria de fotos em tela cheia"
          >
            {/* Botão fechar */}
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Fechar galeria"
              className="absolute top-4 right-4 z-10 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Contador */}
            <div className="absolute top-4 left-4 text-white/70 text-sm" aria-live="polite">
              {currentIndex + 1} / {displayPhotos.length}
            </div>

            {/* Navegação */}
            {displayPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  aria-label="Foto anterior"
                  className="absolute left-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  aria-label="Próxima foto"
                  className="absolute right-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Imagem */}
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={displayPhotos[currentIndex]}
              alt={`${establishmentName} - Foto ${currentIndex + 1}`}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Miniaturas - só desktop */}
            {displayPhotos.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex gap-2">
                {displayPhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    aria-label={`Ir para foto ${index + 1}`}
                    aria-current={index === currentIndex ? "true" : "false"}
                    className={`
                      w-16 h-12 rounded-lg overflow-hidden transition-all duration-200
                      ${index === currentIndex ? "ring-2 ring-white scale-110" : "opacity-50 hover:opacity-80"}
                    `}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Dots - só mobile */}
            {displayPhotos.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 sm:hidden">
                {displayPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    aria-label={`Ir para foto ${index + 1}`}
                    aria-current={index === currentIndex ? "true" : "false"}
                    className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center"
                  >
                    <span
                      className={`
                        rounded-full transition-all duration-300
                        ${index === currentIndex ? "w-6 h-3 bg-white" : "w-3 h-3 bg-white/40"}
                      `}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ===== FIM GALERIA DE FOTOS INLINE =====

interface EstabelecimentoDetalhePremiumProps {
  estabelecimentoIdProp?: string | null;
}

const EstabelecimentoDetalhePremium = ({ estabelecimentoIdProp }: EstabelecimentoDetalhePremiumProps = {}) => {
  const { id: idFromParams } = useParams();
  const id = estabelecimentoIdProp || idFromParams;
  const navigate = useNavigate();

  const [estabelecimento, setEstabelecimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { isFavorito, toggleFavorito } = useFavoritos(userId);
  const hasTrackedView = useRef(false);

  const {
    trackPageView,
    trackWhatsAppClick,
    trackPhoneClick,
    trackInstagramClick,
    trackSiteClick,
    trackDirectionsClick,
    trackShare,
    trackFavorite,
    trackEvent,
  } = useEstablishmentMetrics();

  // SEO dinâmico
  useSEO(
    estabelecimento
      ? getEstabelecimentoSEO(estabelecimento)
      : { title: "Carregando...", description: "Carregando informações do estabelecimento..." },
  );

  // Verificar autenticação
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
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Buscar estabelecimento
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

      // Gerar bio se não existir
      if (!data.bio) {
        data.bio = gerarBioAutomatica({
          nome_fantasia: data.nome_fantasia,
          categoria: data.categoria,
          cidade: data.cidade,
          bairro: data.bairro,
        });
      }

      setEstabelecimento(data);
      setLoading(false);

      // Rastrear visualização
      if (!hasTrackedView.current && data.id) {
        trackPageView(data.id);
        hasTrackedView.current = true;
      }

      document.title = `${data.nome_fantasia} - Aniversariante VIP`;
    };
    fetchEstabelecimento();
  }, [id, navigate, trackPageView]);

  // === HANDLERS ===

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
    setShowShareModal(true);
  };

  // Handler para o botão fixo mobile
  const handleVerBeneficioMobile = async () => {
    if (id) {
      await trackEvent(id, "benefit_click");
    }

    if (!userId) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      setShowLoginModal(true);
      return;
    }

    setShowBenefitModal(true);
  };

  const handleWhatsApp = () => {
    const numero = estabelecimento.whatsapp || estabelecimento.telefone;
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
    const instagramUrl = formatInstagram(estabelecimento.instagram);
    if (!instagramUrl) {
      toast.error("Instagram não disponível");
      return;
    }
    if (id) trackInstagramClick(id);
    window.open(instagramUrl, "_blank");
  };

  const handlePhone = () => {
    const phoneLink = formatPhoneLink(estabelecimento.telefone);
    if (!phoneLink) {
      toast.error("Telefone não disponível");
      return;
    }
    if (id) trackPhoneClick(id);
    window.location.href = phoneLink;
  };

  const handleSite = () => {
    const siteUrl = formatWebsite(estabelecimento.site);
    if (!siteUrl) {
      toast.error("Site não disponível");
      return;
    }
    if (id) trackSiteClick(id);
    window.open(siteUrl, "_blank");
  };

  const handleCardapio = () => {
    if (!estabelecimento.link_cardapio) {
      toast.error("Cardápio não disponível");
      return;
    }
    window.open(estabelecimento.link_cardapio, "_blank");
  };

  const getEnderecoCompleto = () => {
    if (!estabelecimento) return "";
    return [
      estabelecimento.logradouro,
      estabelecimento.numero,
      estabelecimento.bairro,
      estabelecimento.cidade,
      estabelecimento.estado,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleOpenMaps = () => {
    if (id) trackDirectionsClick(id, "google_maps");
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getEnderecoCompleto())}`,
      "_blank",
    );
  };

  const handleOpenWaze = () => {
    if (id) trackDirectionsClick(id, "waze");
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(
        `https://waze.com/ul?ll=${estabelecimento.latitude},${estabelecimento.longitude}&navigate=yes`,
        "_blank",
      );
    } else {
      window.open(`https://waze.com/ul?q=${encodeURIComponent(getEnderecoCompleto())}`, "_blank");
    }
  };

  const handleOpenUber = () => {
    if (id) trackDirectionsClick(id, "uber");
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(
        `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${estabelecimento.latitude}&dropoff[longitude]=${estabelecimento.longitude}&dropoff[nickname]=${encodeURIComponent(estabelecimento.nome_fantasia)}`,
        "_blank",
      );
    } else {
      window.open(`https://m.uber.com/`, "_blank");
    }
  };

  const handleOpen99 = () => {
    if (id) trackDirectionsClick(id, "99");
    window.open(`https://99app.com/`, "_blank");
  };

  // === SHARE HANDLERS ===

  const shareToNetwork = (network: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`🎂 Confira ${estabelecimento?.nome_fantasia} no Aniversariante VIP!`);

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (network === "instagram") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado! Cole no seu Stories do Instagram");
      setShowShareModal(false);
      return;
    }

    if (shareUrls[network]) {
      window.open(shareUrls[network], "_blank", "width=600,height=400");
    }
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copiado!");
    setShowShareModal(false);
  };

  // === LOADING STATE ===

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Skeleton do Hero */}
        <div className="w-full aspect-[4/3] sm:aspect-[16/10] max-h-[50vh] bg-slate-200 animate-pulse" />

        {/* Skeleton das infos */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-2xl animate-pulse mt-6" />
        </div>
      </div>
    );
  }

  if (!estabelecimento) return null;

  // === PREPARAR DADOS ===

  const galeriaFotos = estabelecimento?.galeria_fotos || [];
  const fotoAvatar = galeriaFotos.length > 0 ? galeriaFotos[0] : estabelecimento.logo_url;

  // Preparar dados do benefício com tipagem segura
  const beneficioRaw = estabelecimento.beneficio_titulo
    ? {
        titulo: estabelecimento.beneficio_titulo,
        validade: estabelecimento.beneficio_validade || "dia_aniversario",
        regras: estabelecimento.beneficio_regras || estabelecimento.regras_utilizacao,
      }
    : separarBeneficio(estabelecimento.descricao_beneficio);

  const beneficioData = {
    titulo: beneficioRaw.titulo || "Benefício exclusivo para aniversariantes",
    validade: beneficioRaw.validade || "dia_aniversario",
    regras: "regras" in beneficioRaw ? beneficioRaw.regras : estabelecimento.regras_utilizacao || undefined,
  };

  // === RENDER ===

  return (
    <div className="min-h-screen bg-white pb-28 sm:pb-24 md:pb-8">
      {/* Hero */}
      <EstablishmentHero
        establishment={{
          nome_fantasia: estabelecimento.nome_fantasia,
          photo_url: fotoAvatar,
          categoria: estabelecimento.categoria,
          bairro: estabelecimento.bairro,
          cidade: estabelecimento.cidade,
          especialidades: estabelecimento.especialidades,
          is_verified: true,
        }}
        onBack={handleBack}
        onFavorite={handleFavorite}
        onShare={handleShare}
        isFavorited={id ? isFavorito(id) : false}
      />

      {/* Galeria de Fotos - Inline */}
      {galeriaFotos.length > 1 && (
        <GaleriaFotosInline photos={galeriaFotos} establishmentName={estabelecimento.nome_fantasia} />
      )}

      {/* Benefício - com controle externo do modal */}
      <BenefitCard
        beneficio={beneficioData.titulo}
        validadeTexto={beneficioData.validade}
        regras={beneficioData.regras}
        estabelecimentoId={id!}
        userId={userId}
        isModalOpen={showBenefitModal}
        onModalOpenChange={setShowBenefitModal}
      />

      {/* Sobre */}
      {estabelecimento.bio && (
        <AboutSection bio={estabelecimento.bio} tags={estabelecimento.especialidades?.slice(0, 3)} />
      )}

      {/* Contatos */}
      <ContactButtons
        whatsapp={estabelecimento.whatsapp || estabelecimento.telefone}
        instagram={estabelecimento.instagram}
        phone={estabelecimento.telefone}
        site={estabelecimento.site}
        cardapio={estabelecimento.link_cardapio}
        onWhatsApp={handleWhatsApp}
        onInstagram={handleInstagram}
        onPhone={handlePhone}
        onSite={handleSite}
        onCardapio={handleCardapio}
      />

      {/* Horário */}
      {estabelecimento.horario_funcionamento && <BusinessHours hours={estabelecimento.horario_funcionamento} />}

      {/* Localização */}
      <LocationSection
        establishment={{
          logradouro: estabelecimento.logradouro,
          numero: estabelecimento.numero,
          bairro: estabelecimento.bairro,
          cidade: estabelecimento.cidade,
          estado: estabelecimento.estado,
          cep: estabelecimento.cep,
          latitude: estabelecimento.latitude,
          longitude: estabelecimento.longitude,
        }}
        onOpenMaps={handleOpenMaps}
        onOpenWaze={handleOpenWaze}
        onOpenUber={handleOpenUber}
        onOpen99={handleOpen99}
      />

      {/* CTA Parceiro */}
      <PartnerCTA />

      {/* === BOTÃO FIXO MOBILE === */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EBEBEB] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="p-4">
          <button
            onClick={handleVerBeneficioMobile}
            aria-label="Ver benefício de aniversário"
            className="
              w-full 
              min-h-[52px]
              py-4
              bg-gradient-to-r from-[#240046] to-[#3C096C]
              text-white
              font-semibold
              rounded-xl
              flex items-center justify-center gap-2
              active:scale-[0.98]
              transition-transform
            "
          >
            <Gift className="w-5 h-5" aria-hidden="true" />
            Ver Benefício de Aniversário
          </button>
        </div>
      </div>

      {/* === MODALS === */}

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        returnUrl={window.location.pathname}
      />

      {/* Modal de Compartilhamento */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowShareModal(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 id="share-modal-title" className="text-lg font-bold text-[#222222]">
                  Compartilhar
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  aria-label="Fechar modal de compartilhamento"
                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#F7F7F7] flex items-center justify-center hover:bg-[#EBEBEB] active:scale-95 transition-all"
                >
                  <X className="w-5 h-5 text-[#717171]" aria-hidden="true" />
                </button>
              </div>

              {/* Redes */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { name: "WhatsApp", icon: MessageCircle, color: "bg-[#25D366]", network: "whatsapp" },
                  { name: "Telegram", icon: Send, color: "bg-[#0088cc]", network: "telegram" },
                  { name: "Facebook", icon: Facebook, color: "bg-[#1877f2]", network: "facebook" },
                  {
                    name: "Instagram",
                    icon: Instagram,
                    color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
                    network: "instagram",
                  },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => shareToNetwork(item.network)}
                    aria-label={`Compartilhar no ${item.name}`}
                    className="flex flex-col items-center gap-2 min-h-[72px]"
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-xs text-[#717171]">{item.name}</span>
                  </button>
                ))}
              </div>

              {/* Copiar link */}
              <button
                onClick={copyToClipboard}
                aria-label="Copiar link para área de transferência"
                className="w-full py-3.5 min-h-[48px] bg-[#F7F7F7] hover:bg-[#EBEBEB] active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Copy className="w-5 h-5 text-[#717171]" aria-hidden="true" />
                <span className="font-medium text-[#222222]">Copiar link</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default EstabelecimentoDetalhePremium;
