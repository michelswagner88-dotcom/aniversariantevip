import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, MapPin, Phone, Globe, Instagram, Clock, 
  Navigation, Share2, Heart, Gift, MessageCircle, Star,
  ChevronRight, ExternalLink
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

      setEstabelecimento(data);
      setLoading(false);
    };

    fetchEstabelecimento();
  }, [id, navigate]);

  // Handler do botão Ver Benefício
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

  // Compartilhar
  const handleShare = async () => {
    const url = window.location.href;
    const text = `Confira ${estabelecimento.nome_fantasia} no Aniversariante VIP!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: estabelecimento.nome_fantasia, text, url });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  // Abrir WhatsApp
  const handleWhatsApp = () => {
    if (!estabelecimento.whatsapp && !estabelecimento.telefone) {
      toast.error('WhatsApp não disponível');
      return;
    }
    const numero = estabelecimento.whatsapp || estabelecimento.telefone;
    window.open(`https://wa.me/55${numero.replace(/\D/g, '')}`, '_blank');
  };

  // Abrir no Maps
  const handleMaps = () => {
    const endereco = `${estabelecimento.logradouro}, ${estabelecimento.numero} - ${estabelecimento.bairro}, ${estabelecimento.cidade}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank');
  };

  // Abrir Instagram
  const handleInstagram = () => {
    if (!estabelecimento.instagram) {
      toast.error('Instagram não disponível');
      return;
    }
    const insta = estabelecimento.instagram.replace('@', '');
    window.open(`https://instagram.com/${insta}`, '_blank');
  };

  // Ligar
  const handleLigar = () => {
    if (!estabelecimento.telefone) {
      toast.error('Telefone não disponível');
      return;
    }
    window.open(`tel:${estabelecimento.telefone.replace(/\D/g, '')}`, '_blank');
  };

  // Ícone da categoria
  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      'Restaurante': '🍽️',
      'Bar': '🍺',
      'Academia': '💪',
      'Salão de Beleza': '💇',
      'Barbearia': '✂️',
      'Cafeteria': '☕',
      'Casa Noturna': '🎉',
      'Confeitaria': '🍰',
      'Entretenimento': '🎬',
      'Hospedagem': '🏨',
      'Loja de Presentes': '🎁',
      'Moda e Acessórios': '👗',
      'Saúde e Suplementos': '💊',
      'Serviços': '🔧',
      'Outros Comércios': '🏪',
    };
    return icons[categoria] || '📍';
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!estabelecimento) return null;

  const categoria = estabelecimento.categoria?.[0] || 'Estabelecimento';
  const categoriaIcon = getCategoriaIcon(categoria);

  return (
    <div className="min-h-screen bg-background">
      
      {/* ==================== HEADER COM FOTO ==================== */}
      <div className="relative">
        
        {/* Foto de capa */}
        <div className="h-72 md:h-96 relative overflow-hidden">
          {estabelecimento.logo_url ? (
            <img 
              src={estabelecimento.logo_url} 
              alt={estabelecimento.nome_fantasia}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center">
              <span className="text-8xl">
                {categoriaIcon}
              </span>
            </div>
          )}
          
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Botões flutuantes no topo */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          
          {/* Voltar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          {/* Ações */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!isLoggedIn) {
                  setShowLoginModal(true);
                  return;
                }
                setIsFavorito(!isFavorito);
                toast.success(isFavorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
              }}
              className="w-10 h-10 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-full border border-white/10"
            >
              <Heart className={`w-5 h-5 transition-colors ${isFavorito ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="w-10 h-10 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-full border border-white/10"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

      </div>

      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <div className="relative z-10 -mt-20 px-4 pb-32">
        <div className="max-w-2xl mx-auto">
          
          {/* Card principal com informações */}
          <div className="bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl">
            
            {/* Categoria badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{categoriaIcon}</span>
              <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-sm font-medium rounded-full border border-violet-500/30">
                {categoria}
              </span>
            </div>

            {/* Nome */}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {estabelecimento.nome_fantasia || estabelecimento.razao_social}
            </h1>

            {/* Endereço */}
            <button 
              onClick={handleMaps}
              className="flex items-start gap-2 text-gray-400 hover:text-violet-400 transition-colors mb-6 text-left group"
            >
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0 group-hover:text-violet-400" />
              <p className="text-sm">
                {estabelecimento.bairro} • {estabelecimento.cidade}/{estabelecimento.estado}
              </p>
              <ExternalLink className="w-3 h-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* ==================== BOTÕES DE AÇÃO ==================== */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              
              {/* Rotas */}
              <button
                onClick={handleMaps}
                className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all hover:scale-105 border border-transparent hover:border-blue-500/30 group"
              >
                <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Navigation className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">Rotas</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all hover:scale-105 border border-transparent hover:border-green-500/30 group"
              >
                <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-green-400 transition-colors">WhatsApp</span>
              </button>

              {/* Instagram */}
              <button
                onClick={handleInstagram}
                className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all hover:scale-105 border border-transparent hover:border-pink-500/30 group"
              >
                <div className="w-11 h-11 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-pink-400 transition-colors">Instagram</span>
              </button>

              {/* Ligar */}
              <button
                onClick={handleLigar}
                className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all hover:scale-105 border border-transparent hover:border-violet-500/30 group"
              >
                <div className="w-11 h-11 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                  <Phone className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-violet-400 transition-colors">Ligar</span>
              </button>

            </div>

            {/* ==================== INFORMAÇÕES ==================== */}
            <div className="space-y-3">
              
              {/* Horário de funcionamento */}
              {estabelecimento.horario_funcionamento && (
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">Horário de Funcionamento</h3>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {estabelecimento.horario_funcionamento}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Telefone */}
              {estabelecimento.telefone && (
                <button
                  onClick={handleLigar}
                  className="w-full bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-violet-500/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                      <Phone className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">Telefone</h3>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {estabelecimento.telefone}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
                  </div>
                </button>
              )}

              {/* WhatsApp */}
              {estabelecimento.whatsapp && estabelecimento.whatsapp !== estabelecimento.telefone && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-green-500/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">WhatsApp</h3>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {estabelecimento.whatsapp}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-green-400 transition-colors" />
                  </div>
                </button>
              )}

              {/* Instagram */}
              {estabelecimento.instagram && (
                <button
                  onClick={handleInstagram}
                  className="w-full bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-pink-500/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                      <Instagram className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">Instagram</h3>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {estabelecimento.instagram}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-pink-400 transition-colors" />
                  </div>
                </button>
              )}

              {/* Site */}
              {estabelecimento.site && (
                <button
                  onClick={() => window.open(estabelecimento.site, '_blank')}
                  className="w-full bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-violet-500/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                      <Globe className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">Site</h3>
                      <p className="text-gray-400 text-sm mt-0.5 truncate">
                        {estabelecimento.site}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
                  </div>
                </button>
              )}

            </div>

          </div>

          {/* ==================== MAPA ==================== */}
          {estabelecimento.latitude && estabelecimento.longitude && (
            <div className="mt-6">
              <h3 className="font-semibold text-white mb-3 px-2">📍 Localização</h3>
              <div 
                className="h-48 bg-gray-900 rounded-3xl overflow-hidden cursor-pointer relative group border border-white/10"
                onClick={handleMaps}
              >
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${estabelecimento.latitude},${estabelecimento.longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:purple%7C${estabelecimento.latitude},${estabelecimento.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&style=feature:all|element:geometry|color:0x1a1a2e&style=feature:road|element:geometry|color:0x2a2a3e&style=feature:water|element:geometry|color:0x0d0d1a`}
                  alt="Mapa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                    <span className="text-white font-medium flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Abrir no Maps
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== BOTÃO FIXO - VER BENEFÍCIO ==================== */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <Button
            onClick={handleVerBeneficio}
            disabled={beneficioAberto}
            className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-lg py-6 h-auto rounded-2xl shadow-lg shadow-violet-500/25 relative overflow-hidden group disabled:opacity-50"
          >
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {/* Ícone com animação */}
            <div className={`relative transition-all duration-500 ${beneficioAberto ? 'scale-125' : ''}`}>
              {beneficioAberto ? (
                <div className="relative">
                  {/* Tampa do presente subindo */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-white animate-ping" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                  <Gift className="w-6 h-6 animate-pulse" />
                  {/* Confetes */}
                  <div className="absolute -top-4 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.1s' }} />
                  <div className="absolute -top-3 right-0 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute -top-4 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
                </div>
              ) : (
                <Gift className="w-5 h-5" />
              )}
            </div>
            
            <span className={`ml-2 transition-all duration-300 ${beneficioAberto ? 'opacity-0' : 'opacity-100'}`}>
              Ver Benefício de Aniversário
            </span>
            
            {beneficioAberto && (
              <span className="ml-2 animate-pulse">
                Abrindo...
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Modal do Cupom */}
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
