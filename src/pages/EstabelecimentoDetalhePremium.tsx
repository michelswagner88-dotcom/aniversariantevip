// EstabelecimentoDetalhePremium.tsx - Página Premium Clean

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, X, Copy, MessageCircle, Send, Facebook, Linkedin, Instagram } from "lucide-react";
import { useWindowSize } from "@/hooks/useWindowSize";
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
import { gerarBioAutomatica, separarBeneficio, getValidadeTexto } from "@/lib/bioUtils";
import CupomModal from "@/components/CupomModal";
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

interface EstabelecimentoDetalhePremiumProps {
  estabelecimentoIdProp?: string | null;
}

const EstabelecimentoDetalhePremium = ({ estabelecimentoIdProp }: EstabelecimentoDetalhePremiumProps = {}) => {
  const { id: idFromParams } = useParams();
  const id = estabelecimentoIdProp || idFromParams;
  const navigate = useNavigate();

  const [estabelecimento, setEstabelecimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCupomModal, setShowCupomModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { width, height } = useWindowSize();
  const { isFavorito, toggleFavorito } = useFavoritos(userId);
  const hasTrackedView = useRef(false);

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
    } = supabase.auth.onAuthStateChange((event, session) => {
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
  }, [id, navigate]);

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
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(
        `https://99app.com/app/ride?destination_latitude=${estabelecimento.latitude}&destination_longitude=${estabelecimento.longitude}&destination_title=${encodeURIComponent(estabelecimento.nome_fantasia)}`,
        "_blank",
      );
    } else {
      window.open(`https://99app.com/`, "_blank");
    }
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

  const beneficioData = estabelecimento.beneficio_titulo
    ? {
        titulo: estabelecimento.beneficio_titulo,
        validade: estabelecimento.beneficio_validade || "dia_aniversario",
        regras: estabelecimento.beneficio_regras || estabelecimento.regras_utilizacao,
      }
    : separarBeneficio(estabelecimento.descricao_beneficio);

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

      {/* Benefício */}
      <BenefitCard
        beneficio={beneficioData.titulo}
        validadeTexto={beneficioData.validade}
        regras={beneficioData.regras}
        estabelecimentoId={id!}
        userId={userId}
        onEmitirCupom={() => setShowCupomModal(true)}
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
        onWhatsApp={handleWhatsApp}
        onInstagram={handleInstagram}
        onPhone={handlePhone}
        onSite={handleSite}
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
      {/* Safe area bottom para iPhones com home indicator */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EBEBEB] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="p-4">
          <button
            onClick={() => {
              if (!userId) {
                setShowLoginModal(true);
                return;
              }
              setShowCupomModal(true);
            }}
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
            <Gift className="w-5 h-5" />
            Ver Benefício de Aniversário
          </button>
        </div>
      </div>

      {/* === MODALS === */}

      <CupomModal isOpen={showCupomModal} onClose={() => setShowCupomModal(false)} estabelecimento={estabelecimento} />

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
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#222222]">Compartilhar</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#717171]" />
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
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-[#717171]">{item.name}</span>
                  </button>
                ))}
              </div>

              {/* Copiar link */}
              <button
                onClick={copyToClipboard}
                className="w-full py-3.5 bg-[#F7F7F7] hover:bg-[#EBEBEB] rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Copy className="w-5 h-5 text-[#717171]" />
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
