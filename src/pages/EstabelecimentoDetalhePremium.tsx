// EstabelecimentoDetalhePremium.tsx - Página Premium Redesenhada

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Gift, Sparkles, Copy, MessageCircle, Send, Facebook, Twitter, Linkedin } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useSEO } from '@/hooks/useSEO';
import { getEstabelecimentoSEO } from '@/constants/seo';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useEstablishmentMetrics } from '@/hooks/useEstablishmentMetrics';
import { 
  formatWhatsApp, 
  formatInstagram, 
  formatPhoneLink, 
  getWhatsAppMessage 
} from '@/lib/contactUtils';
import { gerarBioAutomatica } from '@/lib/bioUtils';
import CupomModal from '@/components/CupomModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';

// Componentes Premium
import EstablishmentHero from '@/components/estabelecimento/EstablishmentHero';
import BenefitCard from '@/components/estabelecimento/BenefitCard';
import AboutSection from '@/components/estabelecimento/AboutSection';
import ContactButtons from '@/components/estabelecimento/ContactButtons';
import BusinessHours from '@/components/estabelecimento/BusinessHours';
import LocationSection from '@/components/estabelecimento/LocationSection';
import PartnerCTA from '@/components/estabelecimento/PartnerCTA';
import EstablishmentSkeleton from '@/components/estabelecimento/EstablishmentSkeleton';
import BottomNav from '@/components/BottomNav';

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
  const [showBenefitRules, setShowBenefitRules] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { width, height } = useWindowSize();
  const { isFavorito, toggleFavorito } = useFavoritos(userId);
  const hasTrackedView = useRef(false);
  
  const { 
    trackPageView, 
    trackBenefitClick, 
    trackWhatsAppClick, 
    trackPhoneClick, 
    trackInstagramClick,
    trackDirectionsClick, 
    trackShare, 
    trackFavorite 
  } = useEstablishmentMetrics();

  // SEO dinâmico
  useSEO(
    estabelecimento 
      ? getEstabelecimentoSEO(estabelecimento)
      : { title: 'Carregando...', description: 'Carregando informações do estabelecimento...' }
  );

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Buscar estabelecimento
  useEffect(() => {
    const fetchEstabelecimento = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('public_estabelecimentos')
        .select('*')
        .eq('id', id)
        .eq('ativo', true)
        .maybeSingle();

      if (error || !data) {
        toast.error('Estabelecimento não encontrado');
        navigate('/explorar');
        return;
      }

      // Gerar bio se não existir
      if (!data.bio) {
        data.bio = gerarBioAutomatica({
          nome_fantasia: data.nome_fantasia,
          categoria: data.categoria,
          cidade: data.cidade,
          bairro: data.bairro
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

  // Handlers
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

  const shareToNetwork = (network: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`🎂 Confira ${estabelecimento?.nome_fantasia} no Aniversariante VIP! 📍 ${estabelecimento?.bairro}, ${estabelecimento?.cidade}`);
    
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (shareUrls[network]) {
      window.open(shareUrls[network], '_blank', 'width=600,height=400');
    }
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado!');
    setShowShareModal(false);
  };

  const handleShowRules = () => {
    if (!userId) {
      setShowLoginModal(true);
      return;
    }
    if (id) trackBenefitClick(id);
    setShowBenefitRules(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleWhatsApp = () => {
    const numero = estabelecimento.whatsapp || estabelecimento.telefone;
    const formattedNumber = formatWhatsApp(numero);
    if (!formattedNumber) { 
      toast.error('WhatsApp não disponível'); 
      return; 
    }
    if (id) trackWhatsAppClick(id);
    const message = getWhatsAppMessage(estabelecimento.nome_fantasia, estabelecimento.categoria?.[0]);
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleInstagram = () => {
    const instagramUrl = formatInstagram(estabelecimento.instagram);
    if (!instagramUrl) { 
      toast.error('Instagram não disponível'); 
      return; 
    }
    if (id) trackInstagramClick(id);
    window.open(instagramUrl, '_blank');
  };

  const handlePhone = () => {
    const phoneLink = formatPhoneLink(estabelecimento.telefone);
    if (!phoneLink) { 
      toast.error('Telefone não disponível'); 
      return; 
    }
    if (id) trackPhoneClick(id);
    window.location.href = phoneLink;
  };

  const getEnderecoCompleto = () => {
    if (!estabelecimento) return '';
    return [
      estabelecimento.logradouro,
      estabelecimento.numero,
      estabelecimento.bairro,
      estabelecimento.cidade,
      estabelecimento.estado
    ].filter(Boolean).join(', ');
  };

  const handleOpenMaps = () => {
    if (id) trackDirectionsClick(id, 'google_maps');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getEnderecoCompleto())}`, '_blank');
  };

  const handleOpenWaze = () => {
    if (id) trackDirectionsClick(id, 'waze');
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://waze.com/ul?ll=${estabelecimento.latitude},${estabelecimento.longitude}&navigate=yes`, '_blank');
    } else {
      window.open(`https://waze.com/ul?q=${encodeURIComponent(getEnderecoCompleto())}`, '_blank');
    }
  };

  const handleOpenUber = () => {
    if (id) trackDirectionsClick(id, 'uber');
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${estabelecimento.latitude}&dropoff[longitude]=${estabelecimento.longitude}&dropoff[nickname]=${encodeURIComponent(estabelecimento.nome_fantasia)}`, '_blank');
    } else {
      window.open(`https://m.uber.com/`, '_blank');
    }
  };

  const handleOpen99 = () => {
    if (id) trackDirectionsClick(id, '99');
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://99app.com/app/ride?destination_latitude=${estabelecimento.latitude}&destination_longitude=${estabelecimento.longitude}&destination_title=${encodeURIComponent(estabelecimento.nome_fantasia)}`, '_blank');
    } else {
      window.open(`https://99app.com/`, '_blank');
    }
  };

  // Loading state
  if (loading) {
    return <EstablishmentSkeleton />;
  }

  if (!estabelecimento) return null;

  // Preparar dados
  const galeriaFotos = estabelecimento?.galeria_fotos || [];
  const fotoAvatar = galeriaFotos.length > 0 ? galeriaFotos[0] : null;
  const benefitDescription = estabelecimento.beneficio_titulo || estabelecimento.descricao_beneficio || 'Benefício especial para aniversariantes';
  const benefitValidity = estabelecimento.periodo_validade_beneficio || estabelecimento.beneficio_validade || 'Dia do aniversário';

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          colors={['#a855f7', '#ec4899', '#f97316', '#fbbf24']}
        />
      )}

      {/* Hero Section Premium */}
      <EstablishmentHero 
        establishment={{
          nome_fantasia: estabelecimento.nome_fantasia,
          photo_url: fotoAvatar,
          categoria: estabelecimento.categoria,
          bairro: estabelecimento.bairro,
          cidade: estabelecimento.cidade,
          is_verified: true,
        }}
        onBack={handleBack}
        onFavorite={handleFavorite}
        onShare={handleShare}
        isFavorited={id ? isFavorito(id) : false}
      />
      
      {/* Conteúdo Principal */}
      <div className="relative z-10">
        {/* Card de Benefício Premium */}
        <BenefitCard 
          benefit={{
            description: benefitDescription,
            validity: benefitValidity,
            rules: estabelecimento.regras_utilizacao || estabelecimento.beneficio_regras,
          }}
          onShowRules={handleShowRules}
        />
        
        {/* Seção Sobre Premium */}
        {estabelecimento.bio && (
          <AboutSection 
            bio={estabelecimento.bio}
            tags={estabelecimento.especialidades?.slice(0, 3)}
          />
        )}
        
        {/* Botões de Contato Premium */}
        <ContactButtons 
          whatsapp={estabelecimento.whatsapp || estabelecimento.telefone}
          instagram={estabelecimento.instagram}
          phone={estabelecimento.telefone}
          onWhatsApp={handleWhatsApp}
          onInstagram={handleInstagram}
          onPhone={handlePhone}
        />
        
        {/* Horário de Funcionamento Premium */}
        {estabelecimento.horario_funcionamento && (
          <BusinessHours 
            hours={estabelecimento.horario_funcionamento}
          />
        )}
        
        {/* Localização Premium */}
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
        
        {/* CTA para Parceiros Premium */}
        <PartnerCTA />
      </div>

      {/* Botão Flutuante Mobile */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 md:hidden"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />
        
        <button
          onClick={handleShowRules}
          className="
            relative w-full py-4 rounded-2xl 
            bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500
            bg-[length:200%_auto]
            text-white font-bold 
            flex items-center justify-center gap-2 
            shadow-lg shadow-purple-500/30
            transition-all duration-300
            hover:scale-[1.02]
            active:scale-[0.98]
            animate-gradient-flow
          "
        >
          <Gift className="w-5 h-5" />
          Ver Benefício de Aniversário
          <Sparkles className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Modal de Regras do Benefício */}
      <AnimatePresence>
        {showBenefitRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowBenefitRules(false)}
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="
                relative w-full max-w-md 
                bg-gradient-to-br from-[#1a1025] via-[#1f1030] to-[#1a1025]
                rounded-t-3xl sm:rounded-3xl 
                p-6 
                border border-purple-500/20
                max-h-[80vh] overflow-y-auto
                scrollbar-premium
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur-xl opacity-20 -z-10" />
              
              {/* Handle bar */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />
              
              {/* Close button */}
              <button 
                onClick={() => setShowBenefitRules(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              {/* Content */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                  <Gift className="w-8 h-8 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Seu Benefício</h2>
                <p className="text-purple-300 font-semibold">{benefitDescription}</p>
              </div>
              
              {/* Validade */}
              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Validade</h3>
                <p className="text-white">{benefitValidity}</p>
              </div>
              
              {/* Regras */}
              {(estabelecimento.regras_utilizacao || estabelecimento.beneficio_regras) && (
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Regras de Utilização</h3>
                  <p className="text-white text-sm leading-relaxed">
                    {estabelecimento.regras_utilizacao || estabelecimento.beneficio_regras}
                  </p>
                </div>
              )}
              
              {/* CTA Emitir Cupom */}
              <button
                onClick={() => {
                  setShowBenefitRules(false);
                  setShowCupomModal(true);
                }}
                className="
                  w-full py-4 rounded-2xl
                  bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500
                  bg-[length:200%_auto]
                  text-white font-bold
                  flex items-center justify-center gap-2
                  shadow-lg shadow-purple-500/30
                  transition-all duration-300
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  animate-gradient-flow
                "
              >
                <Sparkles className="w-5 h-5" />
                Emitir Cupom Agora
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CupomModal
        isOpen={showCupomModal}
        onClose={() => setShowCupomModal(false)}
        estabelecimento={estabelecimento}
      />

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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 pb-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Compartilhar</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Share Options Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => shareToNetwork('whatsapp')}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">WhatsApp</span>
                </button>

                <button
                  onClick={() => shareToNetwork('telegram')}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">Telegram</span>
                </button>

                <button
                  onClick={() => shareToNetwork('facebook')}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Facebook className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">Facebook</span>
                </button>

                <button
                  onClick={() => shareToNetwork('twitter')}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Twitter className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">X</span>
                </button>

                <button
                  onClick={() => shareToNetwork('linkedin')}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Linkedin className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">LinkedIn</span>
                </button>
              </div>

              {/* Copy Link Button */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-3 py-4 bg-muted rounded-2xl hover:bg-muted/80 transition-colors"
              >
                <Copy className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Copiar link</span>
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
