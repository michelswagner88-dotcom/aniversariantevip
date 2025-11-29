import { useState, useRef } from 'react';
import { X, Download, Share2, Gift, Calendar, FileText, Smartphone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface CupomModalProps {
  isOpen: boolean;
  onClose: () => void;
  estabelecimento: any;
}

const CupomModal = ({ isOpen, onClose, estabelecimento }: CupomModalProps) => {
  const cupomRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cupomRef.current) return;
    
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(cupomRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `cupom-${estabelecimento.nome_fantasia?.replace(/\s+/g, '-').toLowerCase() || 'aniversariante-vip'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Cupom salvo!');
    } catch (err) {
      toast.error('Erro ao baixar cupom');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const text = `🎂 Meu benefício de aniversário no ${estabelecimento.nome_fantasia}!\n\n🎁 ${estabelecimento.descricao_beneficio}\n\nDescubra mais em: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Cupom de Aniversário',
          text,
          url: window.location.href,
        });
      } catch (err) {
        // Usuário cancelou
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copiado para compartilhar!');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🎂 Meu benefício de aniversário no ${estabelecimento.nome_fantasia}!\n\n🎁 ${estabelecimento.descricao_beneficio}\n\n📍 ${estabelecimento.bairro}, ${estabelecimento.cidade}\n\nDescubra mais: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddToWallet = () => {
    toast.info('Em breve: Adicionar à Carteira Apple/Google');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Seu Benefício</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Cupom Visual */}
        <div className="p-4">
          <div 
            ref={cupomRef}
            className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-2xl overflow-hidden"
          >
            {/* Padrão decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Conteúdo do cupom */}
            <div className="relative p-6">
              
              {/* Logo do site */}
              <div className="text-center mb-4">
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
                  Benefício Exclusivo
                </p>
                <h3 className="text-white text-xl font-bold">
                  ANIVERSARIANTE VIP
                </h3>
              </div>

              {/* Divisor pontilhado */}
              <div className="border-t-2 border-dashed border-white/30 my-4 relative">
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-900 rounded-full" />
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-900 rounded-full" />
              </div>

              {/* Estabelecimento */}
              <div className="text-center mb-4">
                {estabelecimento.logo_url && (
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-white/30">
                    <img 
                      src={estabelecimento.logo_url} 
                      alt={estabelecimento.nome_fantasia}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h4 className="text-white text-lg font-bold">
                  {estabelecimento.nome_fantasia}
                </h4>
                <p className="text-white/60 text-sm">
                  {estabelecimento.categoria?.[0]}
                </p>
              </div>

              {/* Benefício */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                      Benefício
                    </p>
                    <p className="text-white font-medium">
                      {estabelecimento.descricao_beneficio || 'Benefício especial de aniversário'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Regras do Estabelecimento */}
              {estabelecimento.regras_utilizacao && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                        Regras do Estabelecimento
                      </p>
                      <p className="text-white/90 text-sm">
                        {estabelecimento.regras_utilizacao}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Validade */}
              {estabelecimento.periodo_validade_beneficio && (
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-4 bg-white/10 rounded-lg py-2 px-4">
                  <Calendar className="w-4 h-4" />
                  <span>Válido: {estabelecimento.periodo_validade_beneficio}</span>
                </div>
              )}

              {/* REGRAS GERAIS - FIXO EM TODOS OS CUPONS */}
              <div className="bg-black/20 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                      Regras Gerais
                    </p>
                    <ul className="text-white/70 text-xs space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>Obrigatório apresentação de documento com foto.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>Cortesia válida quando há consumo no local.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>Informações podem sofrer alteração sem aviso prévio, confirme com o estabelecimento.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Rodapé do cupom */}
              <div className="text-center mt-4 pt-4 border-t border-white/20">
                <p className="text-white/40 text-xs">
                  Apresente este cupom no estabelecimento
                </p>
                <p className="text-white/30 text-[10px] mt-1">
                  aniversariantevip.com.br
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          
          {/* Botões principais */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Salvando...' : 'Baixar'}
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          </div>

          {/* Botões secundários */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleWhatsAppShare}
              className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>

            <Button
              onClick={handleAddToWallet}
              className="bg-gray-800 hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Carteira
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CupomModal;
