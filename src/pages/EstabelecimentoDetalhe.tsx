import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, MapPin, Phone, Globe, Instagram, Clock, 
  Navigation, Share2, Heart, Gift, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CupomModal from '@/components/CupomModal';

const EstabelecimentoDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estabelecimento, setEstabelecimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCupomModal, setShowCupomModal] = useState(false);
  const [isFavorito, setIsFavorito] = useState(false);

  useEffect(() => {
    const fetchEstabelecimento = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('estabelecimentos')
        .select('*')
        .eq('id', id)
        .eq('ativo', true)
        .single();

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

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Confira ${estabelecimento.nome_fantasia} no Aniversariante VIP!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: estabelecimento.nome_fantasia, text, url });
      } catch (err) {
        // Usuário cancelou
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  const handleWhatsApp = () => {
    if (!estabelecimento.whatsapp && !estabelecimento.telefone) {
      toast.error('WhatsApp não disponível');
      return;
    }
    const numero = estabelecimento.whatsapp || estabelecimento.telefone;
    window.open(`https://wa.me/55${numero.replace(/\D/g, '')}`, '_blank');
  };

  const handleMaps = () => {
    const endereco = `${estabelecimento.logradouro}, ${estabelecimento.numero} - ${estabelecimento.bairro}, ${estabelecimento.cidade}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank');
  };

  const handleInstagram = () => {
    if (!estabelecimento.instagram) {
      toast.error('Instagram não disponível');
      return;
    }
    const insta = estabelecimento.instagram.replace('@', '');
    window.open(`https://instagram.com/${insta}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!estabelecimento) return null;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header com foto */}
      <div className="relative">
        {/* Foto de capa */}
        <div className="h-64 md:h-80 bg-gray-800">
          {estabelecimento.logo_url ? (
            <img 
              src={estabelecimento.logo_url} 
              alt={estabelecimento.nome_fantasia}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <span className="text-6xl font-bold text-white/30">
                {estabelecimento.nome_fantasia?.charAt(0) || '?'}
              </span>
            </div>
          )}
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Botões flutuantes */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorito(!isFavorito)}
              className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
            >
              <Heart className={`w-5 h-5 ${isFavorito ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 pb-32 -mt-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          
          {/* Categoria */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-sm font-medium rounded-full">
              {estabelecimento.categoria?.[0] || 'Estabelecimento'}
            </span>
          </div>

          {/* Nome */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {estabelecimento.nome_fantasia || estabelecimento.razao_social}
          </h1>

          {/* Endereço */}
          <div className="flex items-start gap-2 text-gray-400 mb-6">
            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
            <p className="text-sm">
              {estabelecimento.logradouro}, {estabelecimento.numero}
              {estabelecimento.complemento && ` - ${estabelecimento.complemento}`}
              <br />
              {estabelecimento.bairro} • {estabelecimento.cidade}/{estabelecimento.estado}
            </p>
          </div>

          {/* Botões de ação rápida */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            <button
              onClick={handleMaps}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400">Rotas</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs text-gray-400">WhatsApp</span>
            </button>

            <button
              onClick={handleInstagram}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                <Instagram className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-xs text-gray-400">Instagram</span>
            </button>

            <button
              onClick={() => estabelecimento.site && window.open(estabelecimento.site, '_blank')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-xs text-gray-400">Site</span>
            </button>
          </div>

          {/* Informações */}
          <div className="space-y-4 mb-8">
            
            {/* Horário de funcionamento */}
            {estabelecimento.horario_funcionamento && (
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold text-white">Horário de Funcionamento</h3>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  {estabelecimento.horario_funcionamento}
                </p>
              </div>
            )}

            {/* Telefone */}
            {estabelecimento.telefone && (
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="font-semibold text-white">Telefone</h3>
                    <p className="text-gray-400 text-sm">
                      {estabelecimento.telefone}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Mini mapa */}
          {estabelecimento.latitude && estabelecimento.longitude && (
            <div className="mb-8">
              <h3 className="font-semibold text-white mb-3">Localização</h3>
              <div 
                className="h-40 bg-gray-800 rounded-xl overflow-hidden cursor-pointer relative group"
                onClick={handleMaps}
              >
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${estabelecimento.latitude},${estabelecimento.longitude}&zoom=15&size=600x200&maptype=roadmap&markers=color:purple%7C${estabelecimento.latitude},${estabelecimento.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&style=feature:all|element:geometry|color:0xf5f5f5&style=feature:poi|visibility:off`}
                  alt="Mapa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white font-medium transition-opacity">
                    Abrir no Maps
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Botão fixo - Ver Benefício */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => setShowCupomModal(true)}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-lg py-6 h-auto rounded-xl shadow-lg shadow-violet-500/25"
          >
            <Gift className="w-5 h-5 mr-2" />
            Ver Benefício de Aniversário
          </Button>
        </div>
      </div>

      {/* Modal do Cupom */}
      <CupomModal
        isOpen={showCupomModal}
        onClose={() => setShowCupomModal(false)}
        estabelecimento={estabelecimento}
      />

    </div>
  );
};

export default EstabelecimentoDetalhe;
