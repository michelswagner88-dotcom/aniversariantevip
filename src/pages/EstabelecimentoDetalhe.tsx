import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Clock,
  Share2,
  Heart,
  Gift,
  MessageCircle,
  UtensilsCrossed,
  Copy,
  Send,
  Linkedin,
  Facebook,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Store,
  ArrowRight,
} from "lucide-react";
import {
  getValidatedContacts,
  formatWhatsApp,
  formatInstagram,
  formatPhoneLink,
  formatWebsite,
  getWhatsAppMessage,
} from "@/lib/contactUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CupomModal from "@/components/CupomModal";
import LazyMap from "@/components/LazyMap";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useEstablishmentMetrics } from "@/hooks/useEstablishmentMetrics";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useSEO } from "@/hooks/useSEO";
import { getEstabelecimentoSEO } from "@/constants/seo";
import { SkeletonEstablishmentPage } from "@/components/skeletons";
import CardBeneficio from "@/components/estabelecimento/CardBeneficio";
import { gerarBioAutomatica, separarBeneficio, getValidadeTexto } from "@/lib/bioUtils";

interface EstabelecimentoDetalheProps {
  estabelecimentoIdProp?: string | null;
}

const EstabelecimentoDetalhe = ({ estabelecimentoIdProp }: EstabelecimentoDetalheProps = {}) => {
  const { id: idFromParams } = useParams();
  const id = estabelecimentoIdProp || idFromParams;
  const navigate = useNavigate();
  const [estabelecimento, setEstabelecimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // SEO dinâmico do estabelecimento
  useSEO(
    estabelecimento
      ? getEstabelecimentoSEO(estabelecimento)
      : { title: "Carregando...", description: "Carregando informações do estabelecimento..." },
  );
  const [showCupomModal, setShowCupomModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showLogoExpanded, setShowLogoExpanded] = useState(false);

  const { width, height } = useWindowSize();

  // Hook de favoritos
  const { isFavorito, toggleFavorito } = useFavoritos(userId);

  // Hook de métricas
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

  // Buscar fotos do Google Places como fallback (COM CACHE)
  const fetchGooglePlacesPhotos = async (establishmentId: string, establishmentName: string, address: string) => {
    try {
      setLoadingPhotos(true);
      const { data, error } = await supabase.functions.invoke("fetch-google-photos", {
        body: { establishmentId, establishmentName, address },
      });

      if (error) {
        console.error("Erro ao chamar edge function:", error);
        return;
      }

      if (data?.photos && data.photos.length > 0) {
        setEstabelecimento((prev: any) => ({
          ...prev,
          galeria_fotos: data.photos,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar fotos do Google Places:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

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

      setEstabelecimento(data);
      setLoading(false);

      // Rastrear visualização da página (apenas uma vez)
      if (!hasTrackedView.current && data.id) {
        trackPageView(data.id);
        hasTrackedView.current = true;
      }

      if (!data.galeria_fotos || data.galeria_fotos.length === 0) {
        const endereco = [data.logradouro, data.numero, data.bairro, data.cidade, data.estado]
          .filter(Boolean)
          .join(", ");
        await fetchGooglePlacesPhotos(data.id, data.nome_fantasia, endereco);
      }

      document.title = `${data.nome_fantasia} - Aniversariante VIP`;
    };
    fetchEstabelecimento();
  }, [id, navigate]);

  // Handlers
  const handleVerBeneficio = () => {
    if (!userId) {
      setShowLoginModal(true);
      return;
    }
    // Rastrear clique no benefício
    if (id) trackBenefitClick(id);
    setShowBenefitModal(true);
  };

  const handleEmitirCupom = () => {
    setShowBenefitModal(false);
    setShowCupomModal(true);
  };

  const handleFavorito = async () => {
    if (!userId || !id) {
      setShowLoginModal(true);
      return;
    }
    const button = document.getElementById("favorito-btn");
    if (button) {
      button.classList.add("animate-heartbeat");
      setTimeout(() => button.classList.remove("animate-heartbeat"), 1200);
    }
    // Rastrear favorito
    trackFavorite(id);
    await toggleFavorito(id);
  };

  const handleShare = () => {
    // Rastrear compartilhamento
    if (id) trackShare(id);
    setShowShareSheet(true);
  };

  const getShareText = () =>
    `🎂 Confira ${estabelecimento.nome_fantasia} no Aniversariante VIP!\n\n📍 ${estabelecimento.bairro}, ${estabelecimento.cidade}`;
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

  const handleWhatsApp = () => {
    const numero = estabelecimento.whatsapp || estabelecimento.telefone;
    const formattedNumber = formatWhatsApp(numero);
    if (!formattedNumber) {
      toast.error("WhatsApp não disponível");
      return;
    }
    // Rastrear clique no WhatsApp
    if (id) trackWhatsAppClick(id);
    const message = getWhatsAppMessage(estabelecimento.nome_fantasia, estabelecimento.categoria);
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleInstagram = () => {
    const instagramUrl = formatInstagram(estabelecimento.instagram);
    if (!instagramUrl) {
      toast.error("Instagram não disponível");
      return;
    }
    // Rastrear clique no Instagram
    if (id) trackInstagramClick(id);
    window.open(instagramUrl, "_blank");
  };

  const handleLigar = () => {
    const phoneLink = formatPhoneLink(estabelecimento.telefone);
    if (!phoneLink) {
      toast.error("Telefone não disponível");
      return;
    }
    // Rastrear clique no telefone
    if (id) trackPhoneClick(id);
    window.location.href = phoneLink;
  };

  const handleSite = () => {
    const siteUrl = formatWebsite(estabelecimento.site);
    if (!siteUrl) {
      toast.error("Site não disponível");
      return;
    }
    // Rastrear clique no site
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

  // Helper para montar endereço sem valores null/undefined
  const formatarEndereco = (...partes: (string | null | undefined)[]) => partes.filter(Boolean).join(", ");

  const getEnderecoCompleto = () =>
    formatarEndereco(
      estabelecimento.logradouro,
      estabelecimento.numero,
      estabelecimento.bairro,
      estabelecimento.cidade,
      estabelecimento.estado,
    );

  const handleGoogleMaps = () => {
    if (id) trackDirectionsClick(id, "google_maps");
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getEnderecoCompleto())}`,
      "_blank",
    );
  };

  const handleWaze = () => {
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

  const handleUber = () => {
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

  const handle99 = () => {
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

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      Restaurante: "🍽️",
      Bar: "🍺",
      Academia: "💪",
      "Salão de Beleza": "💇",
      Barbearia: "✂️",
      Cafeteria: "☕",
      "Casa Noturna": "🎉",
      Confeitaria: "🍰",
      Entretenimento: "🎬",
      Hospedagem: "🏨",
      Loja: "🛍️",
      Serviços: "🔧",
      "Outros Comércios": "🏪",
    };
    return icons[categoria] || "📍";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SkeletonEstablishmentPage />
      </div>
    );
  }

  if (!estabelecimento) return null;

  const categoria = estabelecimento.categoria?.[0] || "Estabelecimento";
  const mostraCardapio = ["Bar", "Restaurante"].includes(categoria);

  // Montar array de fotos: APENAS galeria manual (sem fallback para logo_url errado)
  const galeriaFotos = estabelecimento?.galeria_fotos || [];
  const temFotosGaleria = galeriaFotos.length > 0;

  // Foto do avatar: galeria[0] > inicial do nome com gradient
  const fotoAvatar = temFotosGaleria ? galeriaFotos[0] : null;
  const inicialNome = (estabelecimento.nome_fantasia || "E").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 pb-8 animate-in fade-in duration-500">
      {/* ========== HERO IMAGE COM FOTO DE CAPA ========== */}
      <div className="relative">
        {/* Foto de capa - largura total */}
        <div className="w-full h-52 sm:h-72 overflow-hidden">
          {fotoAvatar ? (
            <img src={fotoAvatar} alt={estabelecimento.nome_fantasia} className="w-full h-full object-cover" />
          ) : (
            /* Fallback: gradient abstrato se não tiver foto */
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
              <motion.div
                className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-40"
                style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
                animate={{
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-30"
                style={{ background: "radial-gradient(circle, hsl(280, 80%, 60%) 0%, transparent 70%)" }}
                animate={{
                  x: [0, -40, 0],
                  y: [0, 30, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
              />
            </div>
          )}
          {/* Overlay gradiente para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-slate-950" />
        </div>

        {/* Botões sobre a capa */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              id="favorito-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFavorito}
              className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${id && isFavorito(id) ? "fill-red-500 text-red-500" : "text-white"}`}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* Foto de perfil sobrepondo a capa */}
        <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative"
          >
            {/* Glow ring */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 opacity-60 blur-lg animate-pulse" />

            {/* Container do avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => fotoAvatar && setShowLogoExpanded(true)}
              className={`relative w-28 h-28 rounded-2xl border-4 border-slate-950 overflow-hidden shadow-xl ${fotoAvatar ? "cursor-pointer" : ""}`}
            >
              {fotoAvatar ? (
                <img src={fotoAvatar} alt={estabelecimento.nome_fantasia} className="w-full h-full object-cover" />
              ) : (
                /* Inicial do nome com gradient premium */
                <div className="w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center">
                  <span className="text-5xl font-black text-white drop-shadow-lg">{inicialNome}</span>
                </div>
              )}
            </motion.div>

            {/* Badge verificado */}
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-slate-950">
              <Check className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ========== ESPAÇO + INFO CENTRALIZADO ========== */}
      <div className="pt-[72px] pb-4 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white"
        >
          {estabelecimento.nome_fantasia || estabelecimento.razao_social}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-2"
        >
          <span className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
            <span>{getCategoriaIcon(categoria)}</span>
            {categoria}
          </span>

          {(estabelecimento.bairro || estabelecimento.cidade) && (
            <span className="flex items-center gap-1 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              {estabelecimento.bairro || estabelecimento.cidade}
            </span>
          )}
        </motion.div>

        {/* Especialidades/Subcategorias */}
        {estabelecimento.especialidades?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-1.5 mt-2"
          >
            {estabelecimento.especialidades.slice(0, 3).map((spec: string) => (
              <span
                key={spec}
                className="px-3 py-1 rounded-full bg-purple-500/15 text-xs text-purple-300 border border-purple-500/25"
              >
                {spec}
              </span>
            ))}
          </motion.div>
        )}
      </div>

      {/* ========== CONTEÚDO PRINCIPAL COM ESPAÇAMENTO ========== */}
      <div className="px-4 space-y-6 pb-8">
        {/* 1. CARD DE BENEFÍCIO */}
        {(() => {
          const beneficioData = estabelecimento.beneficio_titulo
            ? {
                titulo: estabelecimento.beneficio_titulo,
                validade: estabelecimento.beneficio_validade || "dia_aniversario",
                detalhes: estabelecimento.beneficio_regras || estabelecimento.regras_utilizacao,
              }
            : separarBeneficio(estabelecimento.descricao_beneficio);

          return (
            <CardBeneficio
              beneficio={beneficioData.titulo}
              validadeTexto={beneficioData.validade}
              regras={beneficioData.detalhes}
              estabelecimentoId={id!}
              userId={userId}
              onEmitirCupom={() => setShowCupomModal(true)}
            />
          );
        })()}

        {/* 2. SEÇÃO SOBRE (BIO) */}
        {estabelecimento.bio && estabelecimento.bio.trim() !== "" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-2xl bg-card/50 border border-white/10"
          >
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Store className="w-4 h-4 text-purple-400" />
              </div>
              Sobre
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm">{estabelecimento.bio}</p>
          </motion.div>
        )}

        {/* 3. BOTÕES DE CONTATO */}
        {(() => {
          const hasWhatsApp = !!formatWhatsApp(estabelecimento.whatsapp || estabelecimento.telefone);
          const hasInstagram = !!formatInstagram(estabelecimento.instagram);
          const hasPhone = !!formatPhoneLink(estabelecimento.telefone);
          const hasCardapio = mostraCardapio && !!estabelecimento.link_cardapio;
          const hasSite = !!formatWebsite(estabelecimento.site);

          const validButtonsCount = [hasWhatsApp, hasInstagram, hasPhone, hasCardapio, hasSite].filter(Boolean).length;

          if (validButtonsCount === 0) return null;

          const gridCols =
            validButtonsCount <= 2
              ? "grid-cols-2"
              : validButtonsCount === 3
                ? "grid-cols-3"
                : validButtonsCount === 4
                  ? "grid-cols-4"
                  : "grid-cols-5";

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className={`grid ${gridCols} gap-3`}>
                {formatWhatsApp(estabelecimento.whatsapp || estabelecimento.telefone) && (
                  <motion.button
                    onClick={handleWhatsApp}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all bg-gradient-to-b from-green-500/15 to-green-600/25 border-green-500/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/10"
                  >
                    <MessageCircle className="w-6 h-6 text-green-400" />
                    <span className="text-xs font-medium text-gray-200">WhatsApp</span>
                  </motion.button>
                )}

                {formatInstagram(estabelecimento.instagram) && (
                  <motion.button
                    onClick={handleInstagram}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all bg-gradient-to-b from-pink-500/15 to-pink-600/25 border-pink-500/30 hover:border-pink-400/50 hover:shadow-lg hover:shadow-pink-500/10"
                  >
                    <Instagram className="w-6 h-6 text-pink-400" />
                    <span className="text-xs font-medium text-gray-200">Instagram</span>
                  </motion.button>
                )}

                {formatPhoneLink(estabelecimento.telefone) && (
                  <motion.button
                    onClick={handleLigar}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all bg-gradient-to-b from-blue-500/15 to-blue-600/25 border-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <Phone className="w-6 h-6 text-blue-400" />
                    <span className="text-xs font-medium text-gray-200">Ligar</span>
                  </motion.button>
                )}

                {mostraCardapio && estabelecimento.link_cardapio && (
                  <motion.button
                    onClick={handleCardapio}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all bg-gradient-to-b from-orange-500/15 to-orange-600/25 border-orange-500/30 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10"
                  >
                    <UtensilsCrossed className="w-6 h-6 text-orange-400" />
                    <span className="text-xs font-medium text-gray-200">Cardápio</span>
                  </motion.button>
                )}

                {formatWebsite(estabelecimento.site) && (
                  <motion.button
                    onClick={handleSite}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all bg-gradient-to-b from-violet-500/15 to-violet-600/25 border-violet-500/30 hover:border-violet-400/50 hover:shadow-lg hover:shadow-violet-500/10"
                  >
                    <Globe className="w-6 h-6 text-violet-400" />
                    <span className="text-xs font-medium text-gray-200">Site</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* 4. HORÁRIO DE FUNCIONAMENTO */}
        {estabelecimento.horario_funcionamento && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Horário de Funcionamento</h4>
                  <p className="text-white/80 text-sm mt-1">{estabelecimento.horario_funcionamento}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. COMO CHEGAR (LOCALIZAÇÃO) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <LazyMap
            endereco={[estabelecimento.logradouro, estabelecimento.numero, estabelecimento.complemento]
              .filter(Boolean)
              .join(", ")}
            latitude={estabelecimento.latitude}
            longitude={estabelecimento.longitude}
            nomeEstabelecimento={estabelecimento.nome_fantasia}
            bairro={estabelecimento.bairro}
            cep={estabelecimento.cep}
            cidade={estabelecimento.cidade}
            estado={estabelecimento.estado}
          />
        </motion.div>

        {/* 6. CTA PARA ESTABELECIMENTOS */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/80 via-pink-900/60 to-purple-900/80 p-6 text-center">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-pink-500/30 rounded-full blur-3xl" />

            <div className="relative">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                <Store className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">Quer sua página assim?</h3>
              <p className="text-purple-200 text-sm mb-5 max-w-xs mx-auto">
                Cadastre seu estabelecimento e atraia aniversariantes todos os meses!
              </p>

              <motion.button
                onClick={() => navigate("/seja-parceiro")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#240046] to-[#3C096C] text-white font-bold text-sm shadow-lg shadow-purple-500/25"
              >
                Cadastrar meu negócio
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {galeriaFotos.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => (prev === 0 ? galeriaFotos.length - 1 : prev - 1));
                  }}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => (prev === galeriaFotos.length - 1 ? 0 : prev + 1));
                  }}
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </motion.button>
              </>
            )}

            <motion.img
              key={currentPhotoIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={galeriaFotos[currentPhotoIndex]}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {galeriaFotos.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentPhotoIndex ? "bg-white w-6" : "bg-white/40 w-2"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MODAL DE BENEFÍCIO REVELADO ========== */}
      <AnimatePresence>
        {showBenefitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowBenefitModal(false)}
            />

            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={["#8B5CF6", "#D946EF", "#F472B6", "#FFD700", "#FFF"]}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl border border-purple-500/30 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-600/20 to-transparent" />

              <div className="relative p-6 text-center">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                  <Gift className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-1">🎉 Parabéns!</h2>
                <p className="text-purple-300 mb-6">Você desbloqueou um benefício exclusivo</p>

                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 mb-6">
                  <p className="text-lg text-white leading-relaxed">
                    {estabelecimento.descricao_beneficio || "Benefício exclusivo para aniversariantes!"}
                  </p>
                </div>

                {estabelecimento.regras_utilizacao && (
                  <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Regras de Utilização
                    </h4>
                    <p className="text-sm text-gray-300">{estabelecimento.regras_utilizacao}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <motion.button
                    onClick={handleEmitirCupom}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold transition-colors"
                  >
                    <Gift className="w-5 h-5" />
                    Emitir Meu Cupom
                  </motion.button>

                  {(estabelecimento.whatsapp || estabelecimento.telefone) && (
                    <motion.button
                      onClick={handleWhatsApp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Falar no WhatsApp
                    </motion.button>
                  )}

                  <button
                    onClick={() => setShowBenefitModal(false)}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modais */}
      <CupomModal isOpen={showCupomModal} onClose={() => setShowCupomModal(false)} estabelecimento={estabelecimento} />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        returnUrl={window.location.pathname}
      />

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="bg-slate-900 border-slate-800">
          <SheetHeader>
            <SheetTitle className="text-white text-center">Compartilhar</SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/20">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-gray-300">WhatsApp</span>
            </button>

            <button
              onClick={handleShareInstagram}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
                }}
              >
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-300">Instagram</span>
            </button>

            <button
              onClick={handleShareFacebook}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600/20">
                <Facebook className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs text-gray-300">Facebook</span>
            </button>

            <button
              onClick={handleShareX}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-xs text-gray-300">X</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky-500/20">
                <Send className="w-6 h-6 text-sky-500" />
              </div>
              <span className="text-xs text-gray-300">Telegram</span>
            </button>

            <button
              onClick={handleShareLinkedin}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-700/20">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-300">LinkedIn</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 p-4 bg-violet-500/20 rounded-xl hover:bg-violet-500/30 transition-colors mt-2"
          >
            <Copy className="w-5 h-5 text-violet-400" />
            <span className="text-white font-medium">Copiar Link</span>
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EstabelecimentoDetalhe;
