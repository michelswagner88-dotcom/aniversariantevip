import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, MapPin, Phone, Globe, Instagram, Clock, 
  Share2, Heart, Gift, MessageCircle, ExternalLink,
  Navigation, UtensilsCrossed, Copy, Send, Linkedin, Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CupomModal from '@/components/CupomModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { useFavoritos } from '@/hooks/useFavoritos';
import { SafeImage } from '@/components/SafeImage';
import GaleriaFotosViewer from '@/components/GaleriaFotosViewer';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { motion, useScroll, useTransform } from 'framer-motion';

interface EstabelecimentoDetalheProps {
  estabelecimentoIdProp?: string | null;
}

const EstabelecimentoDetalhe = ({ estabelecimentoIdProp }: EstabelecimentoDetalheProps = {}) => {
  const { id: idFromParams } = useParams();
  const id = estabelecimentoIdProp || idFromParams;
  const navigate = useNavigate();
  const [estabelecimento, setEstabelecimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCupomModal, setShowCupomModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [beneficioAberto, setBeneficioAberto] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Hook de favoritos
  const { isFavorito, toggleFavorito } = useFavoritos(userId);

  // Parallax effect para o header
  const { scrollYProgress } = useScroll();
  
  const headerY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

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

      // Chamar edge function para buscar fotos (com cache automático)
      const { data, error } = await supabase.functions.invoke('fetch-google-photos', {
        body: { establishmentId, establishmentName, address }
      });

      if (error) {
        console.error('Erro ao chamar edge function:', error);
        return;
      }

      if (data?.photos && data.photos.length > 0) {
        // Atualizar o estado local com as fotos cacheadas
        setEstabelecimento((prev: any) => ({
          ...prev,
          galeria_fotos: data.photos
        }));
        
        if (data.cached) {
          console.log('✅ Fotos carregadas do cache');
        } else {
          console.log(`📸 ${data.photos.length} fotos baixadas e salvas no cache`);
        }
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

      // Debug: verificar dados do endereço
      console.log('📍 Endereço do estabelecimento:', {
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep
      });

      setEstabelecimento(data);
      setLoading(false);

      // Buscar fotos do Google Places se não houver galeria (com cache automático)
      if (!data.galeria_fotos || data.galeria_fotos.length === 0) {
        console.log('🔍 Galeria vazia, buscando fotos do Google Places...');
        const endereco = `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.cidade}, ${data.estado}`;
        await fetchGooglePlacesPhotos(data.id, data.nome_fantasia, endereco);
      }
      
      // Meta tags para SEO
      document.title = `${data.nome_fantasia} - Aniversariante VIP`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `${data.descricao_beneficio || 'Benefício exclusivo de aniversário'} - ${data.bairro}, ${data.cidade}`
        );
      }
      
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', window.location.href);
      }
    };
    fetchEstabelecimento();
  }, [id, navigate]);

  // Handlers
  const handleVerBeneficio = () => {
    if (!userId) {
      setShowLoginModal(true);
      return;
    }
    setBeneficioAberto(true);
    setTimeout(() => {
      setShowCupomModal(true);
      setBeneficioAberto(false);
    }, 800);
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
    await toggleFavorito(id);
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };

  const getShareText = () => {
    return `🎂 Confira ${estabelecimento.nome_fantasia} no Aniversariante VIP!\n\n📍 ${estabelecimento.bairro}, ${estabelecimento.cidade}`;
  };

  const getShareUrl = () => window.location.href;

  const handleShareWhatsApp = () => {
    const text = getShareText();
    const url = getShareUrl();
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
    setShowShareSheet(false);
  };

  const handleShareInstagram = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success('Link copiado! Cole no seu Stories ou Direct do Instagram 📸');
    setShowShareSheet(false);
  };

  const handleShareFacebook = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setShowShareSheet(false);
  };

  const handleShareX = () => {
    const text = getShareText();
    const url = getShareUrl();
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareSheet(false);
  };

  const handleShareTelegram = () => {
    const text = getShareText();
    const url = getShareUrl();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    setShowShareSheet(false);
  };

  const handleShareLinkedin = () => {
    const url = getShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
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
    window.open(`https://wa.me/55${numero.replace(/\D/g, '')}`, '_blank');
  };

  const handleInstagram = () => {
    if (!estabelecimento.instagram) { toast.error('Instagram não disponível'); return; }
    window.open(`https://instagram.com/${estabelecimento.instagram.replace('@', '')}`, '_blank');
  };

  const handleLigar = () => {
    if (!estabelecimento.telefone) { toast.error('Telefone não disponível'); return; }
    window.open(`tel:${estabelecimento.telefone.replace(/\D/g, '')}`);
  };

  const handleSite = () => {
    if (!estabelecimento.site) { 
      toast.error('Site não disponível'); 
      return; 
    }
    window.open(estabelecimento.site, '_blank');
  };

  const handleCardapio = () => {
    if (!estabelecimento.link_cardapio) { 
      toast.error('Cardápio não disponível'); 
      return; 
    }
    window.open(estabelecimento.link_cardapio, '_blank');
  };

  // URLs de navegação
  const getEnderecoCompleto = () => {
    return `${estabelecimento.logradouro}, ${estabelecimento.numero} - ${estabelecimento.bairro}, ${estabelecimento.cidade}, ${estabelecimento.estado}`;
  };

  const handleGoogleMaps = () => {
    const endereco = getEnderecoCompleto();
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank');
  };

  const handleWaze = () => {
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://waze.com/ul?ll=${estabelecimento.latitude},${estabelecimento.longitude}&navigate=yes`, '_blank');
    } else {
      const endereco = getEnderecoCompleto();
      window.open(`https://waze.com/ul?q=${encodeURIComponent(endereco)}`, '_blank');
    }
  };

  const handleUber = () => {
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${estabelecimento.latitude}&dropoff[longitude]=${estabelecimento.longitude}&dropoff[nickname]=${encodeURIComponent(estabelecimento.nome_fantasia)}`, '_blank');
    } else {
      window.open(`https://m.uber.com/`, '_blank');
    }
  };

  const handle99 = () => {
    if (estabelecimento.latitude && estabelecimento.longitude) {
      window.open(`https://99app.com/app/ride?destination_latitude=${estabelecimento.latitude}&destination_longitude=${estabelecimento.longitude}&destination_title=${encodeURIComponent(estabelecimento.nome_fantasia)}`, '_blank');
    } else {
      window.open(`https://99app.com/`, '_blank');
    }
  };

  // Ícone da categoria
  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      'Restaurante': '🍽️', 'Bar': '🍺', 'Academia': '💪', 'Salão de Beleza': '💇',
      'Barbearia': '✂️', 'Cafeteria': '☕', 'Casa Noturna': '🎉', 'Confeitaria': '🍰',
      'Entretenimento': '🎬', 'Hospedagem': '🏨', 'Loja de Presentes': '🎁',
      'Moda e Acessórios': '👗', 'Saúde e Suplementos': '💊', 'Serviços': '🔧',
      'Outros Comércios': '🏪',
    };
    return icons[categoria] || '📍';
  };

  // Loading
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
  const gridCols = mostraCardapio ? 'grid-cols-5' : 'grid-cols-4';

  // Determinar fotos a exibir
  const fotosParaExibir = estabelecimento?.galeria_fotos || [];
  
  // Usar logo_url como foto principal apenas se não houver galeria
  const fotoPrincipal = fotosParaExibir.length > 0 ? null : estabelecimento.logo_url;
  const temFotos = fotosParaExibir.length > 0 || estabelecimento.logo_url;

  return (
    <div className="min-h-screen bg-background pb-8">
      
      {/* ========== HEADER COM FOTO E PARALLAX ========== */}
      <div className="relative">
        <motion.div 
          className="h-64 md:h-80 relative overflow-hidden"
          style={{ y: headerY, opacity: headerOpacity }}
        >
          {fotosParaExibir[0] || estabelecimento.logo_url ? (
            <img 
              src={fotosParaExibir[0] || estabelecimento.logo_url} 
              alt={estabelecimento.nome_fantasia}
              className="w-full h-full object-cover scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center">
              <span className="text-7xl">{getCategoriaIcon(categoria)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </motion.div>

        {/* Botões topo */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              id="favorito-btn"
              variant="ghost"
              size="icon"
              onClick={handleFavorito}
              className="w-10 h-10 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 rounded-full"
            >
              <Heart className={`w-5 h-5 transition-colors ${id && isFavorito(id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="w-10 h-10 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ========== CONTEÚDO ========== */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* ========== CARD PRINCIPAL ========== */}
          <RevealOnScroll delay={0.1}>
            <div className="bg-gray-900/90 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
            
            {/* Categoria */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{getCategoriaIcon(categoria)}</span>
              <span className="text-violet-400 text-sm font-medium">{categoria}</span>
            </div>

            {/* Nome */}
            <h1 className="text-2xl font-bold text-white mb-1">
              {estabelecimento.nome_fantasia || estabelecimento.razao_social}
            </h1>

            {/* Endereço curto */}
            <p className="text-gray-400 text-sm mb-5">
              {estabelecimento.bairro} • {estabelecimento.cidade}/{estabelecimento.estado}
            </p>

            {/* ========== BOTÕES DE AÇÃO ========== */}
            <div className={`grid ${gridCols} gap-2`}>
              
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                disabled={!estabelecimento.whatsapp && !estabelecimento.telefone}
                className="flex flex-col items-center gap-1 p-2 bg-gray-800/80 rounded-xl hover:bg-green-500/20 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-green-400">WhatsApp</span>
              </button>

              {/* Instagram */}
              <button
                onClick={handleInstagram}
                disabled={!estabelecimento.instagram}
                className="flex flex-col items-center gap-1 p-2 bg-gray-800/80 rounded-xl hover:bg-pink-500/20 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 bg-pink-500/20 rounded-full flex items-center justify-center group-hover:bg-pink-500/30">
                  <Instagram className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-pink-400">Instagram</span>
              </button>

              {/* Ligar */}
              <button
                onClick={handleLigar}
                disabled={!estabelecimento.telefone}
                className="flex flex-col items-center gap-1 p-2 bg-gray-800/80 rounded-xl hover:bg-blue-500/20 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-blue-400">Ligar</span>
              </button>

              {/* Cardápio */}
              {mostraCardapio && (
                <button
                  onClick={handleCardapio}
                  disabled={!estabelecimento.link_cardapio}
                  className="flex flex-col items-center gap-1 p-2 bg-gray-800/80 rounded-xl hover:bg-orange-500/20 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-9 h-9 bg-orange-500/20 rounded-full flex items-center justify-center group-hover:bg-orange-500/30">
                    <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-orange-400">Cardápio</span>
                </button>
              )}

              {/* Site */}
              <button
                onClick={handleSite}
                disabled={!estabelecimento.site}
                className="flex flex-col items-center gap-1 p-2 bg-gray-800/80 rounded-xl hover:bg-violet-500/20 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 bg-violet-500/20 rounded-full flex items-center justify-center group-hover:bg-violet-500/30">
                  <Globe className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-violet-400">Site</span>
              </button>

            </div>

            {/* ========== BOTÃO VER BENEFÍCIO - Premium com animação ========== */}
            <div className="mt-6 flex justify-center">
              <ShimmerButton
                onClick={(e) => {
                  // Adiciona animação ao ícone antes de executar a ação
                  const icon = e.currentTarget.querySelector('.gift-icon');
                  if (icon) {
                    icon.classList.add('animate-gift-open');
                    setTimeout(() => icon.classList.remove('animate-gift-open'), 600);
                  }
                  // Pequeno delay para a animação completar antes de abrir modal
                  setTimeout(handleVerBeneficio, 300);
                }}
                className="px-8 py-3 text-base font-semibold rounded-2xl shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                background="linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #db2777 100%)"
              >
                <Gift className="gift-icon w-5 h-5 mr-2.5" />
                Ver Benefício
              </ShimmerButton>
            </div>
          </div>
          </RevealOnScroll>

          {/* ========== GALERIA DE FOTOS ========== */}
          {temFotos && (
            <RevealOnScroll delay={0.3}>
            <div className="bg-gray-900/90 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  📸 Fotos
                </h3>
                {loadingPhotos && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span>Carregando fotos...</span>
                  </div>
                )}
              </div>
              <GaleriaFotosViewer 
                fotoPrincipal={fotoPrincipal}
                galeriaFotos={fotosParaExibir}
              />
            </div>
            </RevealOnScroll>
          )}

          {/* ========== HORÁRIO DE FUNCIONAMENTO ========== */}
          {estabelecimento.horario_funcionamento && (
            <RevealOnScroll delay={0.4}>
            <div className="bg-gray-900/90 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Horário</p>
                  <p className="text-white text-sm">{estabelecimento.horario_funcionamento}</p>
                </div>
              </div>
            </div>
            </RevealOnScroll>
          )}

          {/* ========== COMO CHEGAR ========== */}
          <RevealOnScroll delay={0.5}>
          <div className="bg-gray-900/90 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
            
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-violet-400" />
              <h2 className="text-white font-semibold">Como Chegar</h2>
            </div>

            {/* Endereço completo */}
            <p className="text-gray-400 text-sm mb-4">
              {estabelecimento.logradouro && `${estabelecimento.logradouro}, `}
              {estabelecimento.numero}
              {estabelecimento.complemento && ` - ${estabelecimento.complemento}`}
              <br />
              {estabelecimento.bairro} - {estabelecimento.cidade}/{estabelecimento.estado}
              {estabelecimento.cep && ` • CEP: ${estabelecimento.cep}`}
            </p>

            {/* Mini mapa clicável */}
            {estabelecimento.latitude && estabelecimento.longitude ? (
              <div 
                onClick={handleGoogleMaps}
                className="h-32 bg-gray-800 rounded-xl overflow-hidden mb-4 cursor-pointer relative group"
              >
                <SafeImage
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${estabelecimento.latitude},${estabelecimento.longitude}&zoom=15&size=600x200&maptype=roadmap&markers=color:purple%7C${estabelecimento.latitude},${estabelecimento.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&style=feature:all|element:geometry|color:0xf5f5f5&style=feature:poi|visibility:off`}
                  alt="Mapa"
                  fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='200' viewBox='0 0 600 200'%3E%3Crect fill='%231e293b' width='600' height='200'/%3E%3Cg transform='translate(300,100)'%3E%3Ccircle fill='%238b5cf6' r='30'/%3E%3Cpath d='M0,-20 L10,15 L-10,15 Z' fill='white'/%3E%3C/g%3E%3C/svg%3E"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium flex items-center gap-2 transition-opacity">
                    <ExternalLink className="w-4 h-4" />
                    Abrir no Maps
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-400 text-xs flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Mapa não disponível. Use os botões abaixo para navegar.
                </p>
              </div>
            )}

            {/* Botões de navegação */}
            <div className="grid grid-cols-4 gap-2 mb-24">
              
              {/* Google Maps */}
              <button
                onClick={handleGoogleMaps}
                className="flex flex-col items-center gap-1.5 p-3 bg-gray-800/80 rounded-xl hover:bg-gray-700 transition-all"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/1024px-Google_Maps_icon_%282020%29.svg.png" 
                    alt="Google Maps"
                    className="w-6 h-6"
                  />
                </div>
                <span className="text-[10px] text-gray-400">Maps</span>
              </button>

              {/* Waze */}
              <button
                onClick={handleWaze}
                className="flex flex-col items-center gap-1.5 p-3 bg-gray-800/80 rounded-xl hover:bg-gray-700 transition-all"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Waze ghost body - iconic shape */}
                    <path d="M256 64C167.634 64 96 135.634 96 224C96 268.418 112.946 308.758 140.8 338.4C140.8 338.4 148.8 346.4 148.8 362.4C148.8 378.4 140.8 386.4 140.8 386.4L140.8 416C140.8 433.673 155.127 448 172.8 448H339.2C356.873 448 371.2 433.673 371.2 416V386.4C371.2 386.4 363.2 378.4 363.2 362.4C363.2 346.4 371.2 338.4 371.2 338.4C399.054 308.758 416 268.418 416 224C416 135.634 344.366 64 256 64Z" fill="#33D6ED"/>
                    
                    {/* Left eye */}
                    <circle cx="208" cy="224" r="28" fill="white"/>
                    <circle cx="208" cy="224" r="14" fill="#1A1A1A"/>
                    
                    {/* Right eye */}
                    <circle cx="304" cy="224" r="28" fill="white"/>
                    <circle cx="304" cy="224" r="14" fill="#1A1A1A"/>
                    
                    {/* Smile */}
                    <path d="M196 288C196 288 216 312 256 312C296 312 316 288 316 288" stroke="white" strokeWidth="16" strokeLinecap="round"/>
                    
                    {/* Bottom wave details (iconic Waze ghost) */}
                    <path d="M140.8 416C140.8 416 156.8 432 172.8 432C188.8 432 204.8 416 220.8 416C236.8 416 252.8 432 268.8 432C284.8 432 300.8 416 316.8 416C332.8 416 348.8 432 364.8 432C380.8 432 396.8 416 396.8 416" stroke="#1FB6CC" strokeWidth="12" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-[10px] text-gray-400">Waze</span>
              </button>

              {/* Uber */}
              <button
                onClick={handleUber}
                className="flex flex-col items-center gap-1.5 p-3 bg-gray-800/80 rounded-xl hover:bg-gray-700 transition-all"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black">
                  <span className="text-white text-xs font-bold">Uber</span>
                </div>
                <span className="text-[10px] text-gray-400">Uber</span>
              </button>

              {/* 99 */}
              <button
                onClick={handle99}
                className="flex flex-col items-center gap-1.5 p-3 bg-gray-800/80 rounded-xl hover:bg-gray-700 transition-all"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-400">
                  <span className="text-black text-xs font-bold">99</span>
                </div>
                <span className="text-[10px] text-gray-400">99</span>
              </button>

            </div>
          </div>
          </RevealOnScroll>


        </div>
      </div>

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
            
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(37, 211, 102, 0.2)' }}>
                <MessageCircle className="w-6 h-6" style={{ color: '#25D366' }} />
              </div>
              <span className="text-xs text-gray-300">WhatsApp</span>
            </button>

            {/* Instagram */}
            <button
              onClick={handleShareInstagram}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' 
              }}>
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-300">Instagram</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(24, 119, 242, 0.2)' }}>
                <Facebook className="w-6 h-6" style={{ color: '#1877F2' }} />
              </div>
              <span className="text-xs text-gray-300">Facebook</span>
            </button>

            {/* X (Twitter) */}
            <button
              onClick={handleShareX}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-300">X</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleShareTelegram}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 136, 204, 0.2)' }}>
                <Send className="w-6 h-6" style={{ color: '#0088cc' }} />
              </div>
              <span className="text-xs text-gray-300">Telegram</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleShareLinkedin}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(10, 102, 194, 0.2)' }}>
                <Linkedin className="w-6 h-6" style={{ color: '#0A66C2' }} />
              </div>
              <span className="text-xs text-gray-300">LinkedIn</span>
            </button>
          </div>

          {/* Copiar Link */}
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