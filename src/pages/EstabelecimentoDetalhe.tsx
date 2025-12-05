import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, MapPin, Phone, Globe, Instagram, Clock, 
  Share2, Heart, Gift, MessageCircle, ExternalLink,
  UtensilsCrossed, Copy, Send, Linkedin, Facebook,
  Camera, X, ChevronLeft, ChevronRight, Check, Sparkles, ZoomIn, Store, ArrowRight, BadgeCheck, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CupomModal from '@/components/CupomModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useEstablishmentMetrics } from '@/hooks/useEstablishmentMetrics';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useSEO } from '@/hooks/useSEO';
import { getEstabelecimentoSEO } from '@/constants/seo';

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
      : { title: 'Carregando...', description: 'Carregando informações do estabelecimento...' }
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
  
  const { width, height } = useWindowSize();

  // Hook de favoritos
  const { isFavorito, toggleFavorito } = useFavoritos(userId);

  // Hook de métricas
  const { 
    trackPageView, 
    trackBenefitClick, 
    trackWhatsAppClick, 
    trackPhoneClick, 
    trackDirectionsClick, 
    trackShare, 
    trackFavorite 
  } = useEstablishmentMetrics();
  const hasTrackedView = useRef(false);

  // Parallax effect para o header
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 500], [0, 150]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

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

  // Buscar fotos do Google Places como fallback (COM CACHE)
  const fetchGooglePlacesPhotos = async (
    establishmentId: string,
    establishmentName: string,
    address: string
  ) => {
    try {
      setLoadingPhotos(true);
      const { data, error } = await supabase.functions.invoke('fetch-google-photos', {
        body: { establishmentId, establishmentName, address }
      });

      if (error) {
        console.error('Erro ao chamar edge function:', error);
        return;
      }

      if (data?.photos && data.photos.length > 0) {
        setEstabelecimento((prev: any) => ({
          ...prev,
          galeria_fotos: data.photos
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar fotos do Google Places:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

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

      setEstabelecimento(data);
      setLoading(false);

      // Rastrear visualização da página (apenas uma vez)
      if (!hasTrackedView.current && data.id) {
        trackPageView(data.id);
        hasTrackedView.current = true;
      }

      if (!data.galeria_fotos || data.galeria_fotos.length === 0) {
        const endereco = `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.cidade}, ${data.estado}`;
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
    const button = document.getElementById('favorito-btn');
    if (button) {
      button.classList.add('animate-heartbeat');
      setTimeout(() => button.classList.remove('animate-heartbeat'), 1200);
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

  const getShareText = () => `🎂 Confira ${estabelecimento.nome_fantasia} no Aniversariante VIP!\n\n📍 ${estabelecimento.bairro}, ${estabelecimento.cidade}`;
  const getShareUrl = () => window.location.href;

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareText() + '\n\n' + getShareUrl())}`, '_blank');
    setShowShareSheet(false);
  };

  const handleShareInstagram = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success('Link copiado! Cole no seu Stories ou Direct do Instagram 📸');
    setShowShareSheet(false);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank');
    setShowShareSheet(false);
  };

  const handleShareX = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`, '_blank');
    setShowShareSheet(false);
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareText())}`, '_blank');
    setShowShareSheet(false);
  };

  const handleShareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`, '_blank');
    setShowShareSheet(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success('Link copiado!');
    setShowShareSheet(false);
  };

  const handleWhatsApp = () => {
    const numero = estabelecimento.whatsapp || estabelecimento.telefone;
    if (!numero) { toast.error('WhatsApp não disponível'); return; }
    // Rastrear clique no WhatsApp
    if (id) trackWhatsAppClick(id);
    window.open(`https://wa.me/55${numero.replace(/\D/g, '')}`, '_blank');
  };

  const handleInstagram = () => {
    if (!estabelecimento.instagram) { toast.error('Instagram não disponível'); return; }
    window.open(`https://instagram.com/${estabelecimento.instagram.replace('@', '')}`, '_blank');
  };

  const handleLigar = () => {
    if (!estabelecimento.telefone) { toast.error('Telefone não disponível'); return; }
    // Rastrear clique no telefone
    if (id) trackPhoneClick(id);
    window.open(`tel:${estabelecimento.telefone.replace(/\D/g, '')}`);
  };

  const handleSite = () => {
    if (!estabelecimento.site) { toast.error('Site não disponível'); return; }
    window.open(estabelecimento.site, '_blank');
  };

  const handleCardapio = () => {
    if (!estabelecimento.link_cardapio) { toast.error('Cardápio não disponível'); return; }
    window.open(estabelecimento.link_cardapio, '_blank');
  };

  const getEnderecoCompleto = () => 
    `${estabelecimento.logradouro}, ${estabelecimento.numero} - ${estabelecimento.bairro}, ${estabelecimento.cidade}, ${estabelecimento.estado}`;

  const handleGoogleMaps = () => {
    if (id) trackDirectionsClick(id, 'google_maps');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getEnderecoCompleto())}`, '_blank');
  };

  const handleWaze = () => {
    if (id) trackDirectionsClick(id, 'waze');
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://waze.com/ul?ll=${estabelecimento.latitude},${estabelecimento.longitude}&navigate=yes`, '_blank');
    } else {
      window.open(`https://waze.com/ul?q=${encodeURIComponent(getEnderecoCompleto())}`, '_blank');
    }
  };

  const handleUber = () => {
    if (id) trackDirectionsClick(id, 'uber');
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${estabelecimento.latitude}&dropoff[longitude]=${estabelecimento.longitude}&dropoff[nickname]=${encodeURIComponent(estabelecimento.nome_fantasia)}`, '_blank');
    } else {
      window.open(`https://m.uber.com/`, '_blank');
    }
  };

  const handle99 = () => {
    if (id) trackDirectionsClick(id, '99');
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://99app.com/app/ride?destination_latitude=${estabelecimento.latitude}&destination_longitude=${estabelecimento.longitude}&destination_title=${encodeURIComponent(estabelecimento.nome_fantasia)}`, '_blank');
    } else {
      window.open(`https://99app.com/`, '_blank');
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      'Restaurante': '🍽️', 'Bar': '🍺', 'Academia': '💪', 'Salão de Beleza': '💇',
      'Barbearia': '✂️', 'Cafeteria': '☕', 'Casa Noturna': '🎉', 'Confeitaria': '🍰',
      'Entretenimento': '🎬', 'Hospedagem': '🏨', 'Loja': '🛍️',
      'Serviços': '🔧', 'Outros Comércios': '🏪',
    };
    return icons[categoria] || '📍';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!estabelecimento) return null;

  const categoria = estabelecimento.categoria?.[0] || 'Estabelecimento';
  const mostraCardapio = ['Bar', 'Restaurante'].includes(categoria);
  const fotosParaExibir = estabelecimento?.galeria_fotos || [];
  const fotoPrincipal = fotosParaExibir.length > 0 ? fotosParaExibir[0] : estabelecimento.logo_url;
  const temFotos = fotosParaExibir.length > 0 || estabelecimento.logo_url;

  return (
    <div className="min-h-screen bg-slate-950 pb-24 md:pb-8">
      
      {/* ========== HERO SECTION IMERSIVA ========== */}
      <div className="relative h-[45vh] md:h-[55vh] w-full overflow-hidden">
        <motion.img
          src={fotoPrincipal || '/placeholder-estabelecimento.png'}
          style={{ y: headerY }}
          className="absolute inset-0 w-full h-full object-cover scale-110"
          alt={estabelecimento.nome_fantasia}
        />
        
        {/* Overlays gradiente premium */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
        
        {/* Header com botões */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10"
        >
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <div className="flex gap-2">
            <motion.button 
              id="favorito-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFavorito}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
            >
              <Heart className={`w-5 h-5 transition-colors ${id && isFavorito(id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
            >
              <Share2 className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </motion.div>
        
        {/* Conteúdo sobre a imagem */}
        <motion.div 
          style={{ opacity: headerOpacity }}
          className="absolute bottom-0 left-0 right-0 p-5"
        >
          {/* Selos */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-purple-600/90 backdrop-blur-sm text-xs font-semibold text-white flex items-center gap-1.5">
              <span>{getCategoriaIcon(categoria)}</span>
              {categoria}
            </span>
            
            <span className="px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm text-xs font-semibold text-white flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verificado
            </span>
          </div>
          
          {/* Nome */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg"
          >
            {estabelecimento.nome_fantasia || estabelecimento.razao_social}
          </motion.h1>
          
          {/* Especialidades */}
          {estabelecimento.especialidades?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-1.5 mb-3"
            >
              {estabelecimento.especialidades.slice(0, 3).map((spec: string, i: number) => (
                <span 
                  key={spec} 
                  className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs text-white border border-white/20"
                >
                  {spec}
                </span>
              ))}
            </motion.div>
          )}
          
          {/* Localização */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 text-white/90 text-sm"
          >
            <MapPin className="w-4 h-4" />
            <span>{estabelecimento.bairro} • {estabelecimento.cidade}/{estabelecimento.estado}</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ========== AVATAR/LOGO FLUTUANTE ========== */}
      <div className="relative z-20 px-4 -mt-10">
        <div className="flex items-end gap-4">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            className="relative"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-900 border-4 border-slate-900 shadow-2xl overflow-hidden">
              {estabelecimento.logo_url ? (
                <img src={estabelecimento.logo_url} alt="Logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {estabelecimento.nome_fantasia?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-slate-900 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </motion.div>
          
          <div className="flex-1 pb-2">
            <p className="text-gray-400 text-xs">Parceiro Aniversariante VIP</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium text-white">4.8</span>
              </div>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-sm">Benefício exclusivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== GOLDEN TICKET - CARD DO BENEFÍCIO ========== */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="mx-4 mt-6"
      >
        <motion.button
          onClick={handleVerBeneficio}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />
          <div className="absolute inset-0 rounded-2xl border border-purple-500/30" />
          <div className="absolute inset-0 shimmer-premium" />
          
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-purple-300 text-xs font-medium uppercase tracking-wider">
                    Benefício Exclusivo
                  </p>
                  <p className="text-white font-bold">Aniversariante VIP</p>
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            
            <div className="border-t border-dashed border-purple-500/30 my-4 relative">
              <div className="absolute -left-7 -top-3 w-6 h-6 rounded-full bg-slate-950" />
              <div className="absolute -right-7 -top-3 w-6 h-6 rounded-full bg-slate-950" />
            </div>
            
            <div className="text-center py-2">
              <p className="text-lg md:text-xl text-white font-medium leading-relaxed">
                🎁 Toque para revelar seu benefício
              </p>
              <p className="text-purple-300/70 text-sm mt-2">
                Exclusivo para aniversariantes
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-purple-500/20">
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronRight className="w-5 h-5 text-purple-400" />
              </motion.div>
              <span className="text-purple-400 text-sm font-medium">
                Toque para ver
              </span>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* ========== SEÇÃO DE AÇÕES RÁPIDAS ========== */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-4 mt-6"
      >
        <div className={`grid ${mostraCardapio ? 'grid-cols-5' : 'grid-cols-4'} gap-2`}>
          {/* WhatsApp */}
          <motion.button
            onClick={handleWhatsApp}
            disabled={!estabelecimento.whatsapp && !estabelecimento.telefone}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all bg-gradient-to-b from-green-500/20 to-green-600/20 border-green-500/30 text-green-400 hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium text-gray-300">WhatsApp</span>
          </motion.button>

          {/* Instagram */}
          <motion.button
            onClick={handleInstagram}
            disabled={!estabelecimento.instagram}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all bg-gradient-to-b from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400 hover:bg-pink-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Instagram className="w-5 h-5" />
            <span className="text-[10px] font-medium text-gray-300">Instagram</span>
          </motion.button>

          {/* Ligar */}
          <motion.button
            onClick={handleLigar}
            disabled={!estabelecimento.telefone}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all bg-gradient-to-b from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px] font-medium text-gray-300">Ligar</span>
          </motion.button>

          {/* Cardápio */}
          {mostraCardapio && (
            <motion.button
              onClick={handleCardapio}
              disabled={!estabelecimento.link_cardapio}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all bg-gradient-to-b from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="text-[10px] font-medium text-gray-300">Cardápio</span>
            </motion.button>
          )}

          {/* Site */}
          <motion.button
            onClick={handleSite}
            disabled={!estabelecimento.site}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all bg-gradient-to-b from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-medium text-gray-300">Site</span>
          </motion.button>
        </div>
      </motion.section>

      {/* ========== GALERIA DE FOTOS PREMIUM ========== */}
      {temFotos && fotosParaExibir.length > 0 && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mx-4 mt-6"
        >
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" />
            Fotos
            <span className="text-gray-500 text-sm font-normal">({fotosParaExibir.length})</span>
            {loadingPhotos && (
              <div className="ml-2 w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            )}
          </h3>
          
          <div className="grid grid-cols-4 gap-2">
            {fotosParaExibir.slice(0, 4).map((photo: string, index: number) => (
              <motion.button
                key={index}
                onClick={() => { setCurrentPhotoIndex(index); setLightboxOpen(true); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
              <img 
                  src={photo} 
                  alt={`Foto ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {index === 3 && fotosParaExibir.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold">+{fotosParaExibir.length - 4}</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* ========== HORÁRIO DE FUNCIONAMENTO PREMIUM ========== */}
      {estabelecimento.horario_funcionamento && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-4 mt-6"
        >
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Horário de Funcionamento</h4>
                <p className="text-gray-400 text-sm mt-1">{estabelecimento.horario_funcionamento}</p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ========== SEÇÃO LOCALIZAÇÃO PREMIUM ========== */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mx-4 mt-6"
      >
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30">
                <MapPin className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Como Chegar</h4>
                <p className="text-gray-400 text-sm mt-1">
                  {estabelecimento.logradouro}, {estabelecimento.numero}
                  {estabelecimento.complemento && ` - ${estabelecimento.complemento}`}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {estabelecimento.bairro} • CEP: {estabelecimento.cep}
                </p>
              </div>
            </div>
          </div>
          
          {/* Mini mapa decorativo */}
          <div 
            onClick={handleGoogleMaps}
            className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 relative cursor-pointer group"
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(139,92,246,0.1) 10px, rgba(139,92,246,0.1) 11px),
                                repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(139,92,246,0.1) 10px, rgba(139,92,246,0.1) 11px)`
            }} />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/50 animate-pulse">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium flex items-center gap-2 transition-opacity">
                <ExternalLink className="w-4 h-4" />
                Abrir no Google Maps
              </span>
            </div>
          </div>
          
          {/* Botões de navegação */}
          <div className="grid grid-cols-4 divide-x divide-slate-700/50">
            <motion.button
              onClick={handleGoogleMaps}
              whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="py-3 flex flex-col items-center gap-1.5 transition-colors"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/1024px-Google_Maps_icon_%282020%29.svg.png" 
                alt="Google Maps"
                loading="lazy"
                decoding="async"
                className="w-6 h-6"
              />
              <span className="text-xs text-gray-400">Maps</span>
            </motion.button>

            <motion.button
              onClick={handleWaze}
              whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="py-3 flex flex-col items-center gap-1.5 transition-colors"
            >
              <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">W</span>
              </div>
              <span className="text-xs text-gray-400">Waze</span>
            </motion.button>

            <motion.button
              onClick={handleUber}
              whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="py-3 flex flex-col items-center gap-1.5 transition-colors"
            >
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">Uber</span>
              </div>
              <span className="text-xs text-gray-400">Uber</span>
            </motion.button>

            <motion.button
              onClick={handle99}
              whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="py-3 flex flex-col items-center gap-1.5 transition-colors"
            >
              <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                <span className="text-black text-[10px] font-bold">99</span>
              </div>
              <span className="text-xs text-gray-400">99</span>
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ========== CTA PARA ESTABELECIMENTOS ========== */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-4 mt-10 mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/80 via-pink-900/60 to-purple-900/80 p-6 text-center">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-pink-500/30 rounded-full blur-3xl" />
          
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Store className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              Quer sua página assim?
            </h3>
            <p className="text-purple-200 text-sm mb-5 max-w-xs mx-auto">
              Cadastre seu estabelecimento e atraia aniversariantes todos os meses!
            </p>
            
            <motion.button 
              onClick={() => navigate('/seja-parceiro')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-purple-900 font-bold text-sm shadow-lg shadow-purple-500/25"
            >
              Cadastrar meu negócio
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ========== BOTÃO FLUTUANTE MOBILE ========== */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 md:hidden"
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800" />
        
        <motion.button
          onClick={handleVerBeneficio}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_200%] animate-gradient-x text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
        >
          <Gift className="w-5 h-5" />
          Ver Benefício de Aniversário
          <Sparkles className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* ========== LIGHTBOX MODAL ========== */}
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
            
            {fotosParaExibir.length > 1 && (
              <>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setCurrentPhotoIndex(prev => prev === 0 ? fotosParaExibir.length - 1 : prev - 1);
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
                    setCurrentPhotoIndex(prev => prev === fotosParaExibir.length - 1 ? 0 : prev + 1);
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
              src={fotosParaExibir[currentPhotoIndex]} 
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {fotosParaExibir.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(index); }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentPhotoIndex ? 'bg-white w-6' : 'bg-white/40 w-2'
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
              colors={['#8B5CF6', '#D946EF', '#F472B6', '#FFD700', '#FFF']}
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
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                  <Gift className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-white mb-1">
                  🎉 Parabéns!
                </h2>
                <p className="text-purple-300 mb-6">
                  Você desbloqueou um benefício exclusivo
                </p>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 mb-6">
                  <p className="text-lg text-white leading-relaxed">
                    {estabelecimento.descricao_beneficio || 'Benefício exclusivo para aniversariantes!'}
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

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="bg-slate-900 border-slate-800">
          <SheetHeader>
            <SheetTitle className="text-white text-center">Compartilhar</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
            <button onClick={handleShareWhatsApp} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/20">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-gray-300">WhatsApp</span>
            </button>

            <button onClick={handleShareInstagram} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-300">Instagram</span>
            </button>

            <button onClick={handleShareFacebook} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600/20">
                <Facebook className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs text-gray-300">Facebook</span>
            </button>

            <button onClick={handleShareX} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-300">X</span>
            </button>

            <button onClick={handleShareTelegram} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky-500/20">
                <Send className="w-6 h-6 text-sky-500" />
              </div>
              <span className="text-xs text-gray-300">Telegram</span>
            </button>

            <button onClick={handleShareLinkedin} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-700/20">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-300">LinkedIn</span>
            </button>
          </div>

          <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 p-4 bg-violet-500/20 rounded-xl hover:bg-violet-500/30 transition-colors mt-2">
            <Copy className="w-5 h-5 text-violet-400" />
            <span className="text-white font-medium">Copiar Link</span>
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EstabelecimentoDetalhe;
