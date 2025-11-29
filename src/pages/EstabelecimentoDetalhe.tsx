import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, MapPin, Phone, Globe, Instagram, Clock, 
  Share2, Heart, Gift, MessageCircle, ExternalLink,
  Navigation, UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CupomModal from '@/components/CupomModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';

const EstabelecimentoDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estabelecimento, setEstabelecimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCupomModal, setShowCupomModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isFavorito, setIsFavorito] = useState(false);
  const [beneficioAberto, setBeneficioAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
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
    };
    fetchEstabelecimento();
  }, [id, navigate]);

  // Handlers
  const handleVerBeneficio = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setBeneficioAberto(true);
    setTimeout(() => {
      setShowCupomModal(true);
      setBeneficioAberto(false);
    }, 800);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Confira ${estabelecimento.nome_fantasia} no Aniversariante VIP!`;
    if (navigator.share) {
      try { await navigator.share({ title: estabelecimento.nome_fantasia, text, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
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

  return (
    <div className="min-h-screen bg-background pb-28">
      
      {/* ========== HEADER COM FOTO ========== */}
      <div className="relative">
        <div className="h-64 md:h-80 relative overflow-hidden">
          {estabelecimento.logo_url ? (
            <img 
              src={estabelecimento.logo_url} 
              alt={estabelecimento.nome_fantasia}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center">
              <span className="text-7xl">{getCategoriaIcon(categoria)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

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
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!isLoggedIn) { setShowLoginModal(true); return; }
                setIsFavorito(!isFavorito);
                toast.success(isFavorito ? 'Removido dos favoritos' : 'Salvo nos favoritos');
              }}
              className="w-10 h-10 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 rounded-full"
            >
              <Heart className={`w-5 h-5 ${isFavorito ? 'fill-red-500 text-red-500' : ''}`} />
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
          </div>

          {/* ========== HORÁRIO DE FUNCIONAMENTO ========== */}
          {estabelecimento.horario_funcionamento && (
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
          )}

          {/* ========== COMO CHEGAR ========== */}
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
            {estabelecimento.latitude && estabelecimento.longitude && (
              <div 
                onClick={handleGoogleMaps}
                className="h-32 bg-gray-800 rounded-xl overflow-hidden mb-4 cursor-pointer relative group"
              >
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${estabelecimento.latitude},${estabelecimento.longitude}&zoom=15&size=600x200&maptype=roadmap&markers=color:purple%7C${estabelecimento.latitude},${estabelecimento.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&style=feature:all|element:geometry|color:0xf5f5f5&style=feature:poi|visibility:off`}
                  alt="Mapa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium flex items-center gap-2 transition-opacity">
                    <ExternalLink className="w-4 h-4" />
                    Abrir no Maps
                  </span>
                </div>
              </div>
            )}

            {/* Botões de navegação */}
            <div className="grid grid-cols-4 gap-2">
              
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
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Waze_logo.svg/2048px-Waze_logo.svg.png" 
                    alt="Waze"
                    className="w-6 h-6"
                  />
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

        </div>
      </div>

      {/* ========== BOTÃO FIXO - VER BENEFÍCIO ========== */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-30">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleVerBeneficio}
            disabled={beneficioAberto}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-lg py-6 h-auto rounded-xl shadow-lg shadow-violet-500/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {beneficioAberto ? (
              <>
                <Gift className="w-5 h-5 animate-bounce mr-2" />
                <span className="animate-pulse">Abrindo...</span>
              </>
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Ver Benefício de Aniversário
              </>
            )}
          </Button>
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

    </div>
  );
};

export default EstabelecimentoDetalhe;