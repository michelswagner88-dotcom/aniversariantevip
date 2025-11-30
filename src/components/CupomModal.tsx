import { useState, useRef } from 'react';
import { X, Download, Share2, Gift, Calendar, FileText, Wallet, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
    toast.info('Google Wallet em breve!');
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

        {/* Cupom Visual Premium */}
        <div className="p-4">
          <div 
            ref={cupomRef}
            className="relative bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_-15px_rgba(139,92,246,0.6)]"
          >
            {/* Glow decorativo */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Conteúdo do cupom */}
            <div className="relative">
              
              {/* Header VIP Premium */}
              <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-2">
                    <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold">
                      Benefício Exclusivo
                    </span>
                  </div>
                  <h3 className="text-white text-2xl font-bold tracking-tight">
                    ANIVERSARIANTE VIP
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Estabelecimento */}
                <div className="text-center pb-4 border-b border-white/10">
                  {estabelecimento.logo_url && (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                      <img 
                        src={estabelecimento.logo_url} 
                        alt={estabelecimento.nome_fantasia}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h4 className="text-white text-xl font-bold mb-1">
                    {estabelecimento.nome_fantasia}
                  </h4>
                  <p className="text-white/60 text-sm">
                    📍 {estabelecimento.categoria?.[0]}
                  </p>
                </div>

                {/* Benefício */}
                <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-violet-300 text-xs uppercase tracking-wider mb-1 font-semibold">
                        Seu Benefício
                      </p>
                      <p className="text-white font-medium text-base leading-relaxed">
                        {estabelecimento.descricao_beneficio || 'Benefício especial de aniversário'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validade */}
                {estabelecimento.periodo_validade_beneficio && (
                  <div className="flex items-center justify-center gap-2 text-white/80 text-sm bg-white/5 rounded-lg py-2.5 px-4 border border-white/10">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span>Válido: {estabelecimento.periodo_validade_beneficio}</span>
                  </div>
                )}

                {/* Regras Colapsáveis */}
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-center gap-2 text-white/60 hover:text-white/80 text-sm py-2 transition-colors">
                      <FileText className="w-4 h-4" />
                      <span>Ver regras de utilização</span>
                      <span className="text-xs">▼</span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 space-y-3">
                      {/* Regras do Estabelecimento */}
                      {estabelecimento.regras_utilizacao && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/60 text-xs uppercase tracking-wider mb-2 font-semibold">
                            Regras do Estabelecimento
                          </p>
                          <p className="text-white/80 text-sm leading-relaxed">
                            {estabelecimento.regras_utilizacao}
                          </p>
                        </div>
                      )}
                      
                      {/* Regras Gerais */}
                      <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-amber-300 text-xs uppercase tracking-wider mb-2 font-semibold">
                              Regras Gerais
                            </p>
                            <ul className="text-white/70 text-xs space-y-1.5">
                              <li>• Obrigatório apresentação de documento com foto.</li>
                              <li>• Cortesia válida quando há consumo no local.</li>
                              <li>• Informações podem sofrer alteração sem aviso prévio.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Rodapé */}
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-white/30 text-[10px]">
                    aniversariantevip.com.br
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Ações Premium */}
        <div className="p-4 border-t border-gray-800">
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleShare}
              className="bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 border-violet-500/30 flex flex-col items-center justify-center gap-1.5 h-auto py-3 shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs font-medium">Compartilhar</span>
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 border-fuchsia-500/30 flex flex-col items-center justify-center gap-1.5 h-auto py-3 shadow-lg hover:shadow-fuchsia-500/25 transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs font-medium">{downloading ? 'Salvando...' : 'Salvar'}</span>
            </Button>

            <Button
              onClick={handleAddToWallet}
              className="bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 border-pink-500/30 flex flex-col items-center justify-center gap-1.5 h-auto py-3 shadow-lg hover:shadow-pink-500/25 transition-all"
            >
              <Wallet className="w-5 h-5" />
              <span className="text-xs font-medium">Carteira</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CupomModal;
