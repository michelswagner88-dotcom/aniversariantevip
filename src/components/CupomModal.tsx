import { useState, useRef } from 'react';
import { X, Download, Share2, Gift, Calendar, FileText, Wallet, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';

interface CupomModalProps {
  isOpen: boolean;
  onClose: () => void;
  estabelecimento: any;
}

// Função para formatar validade em texto amigável
const formatValidity = (validity: string | null | undefined): string => {
  if (!validity) return 'Válido no DIA do aniversário';
  
  const normalized = validity.toLowerCase().trim();
  
  const validityMap: Record<string, string> = {
    'dia_aniversario': 'Válido no DIA do aniversário',
    'dia': 'Válido no DIA do aniversário',
    'semana_aniversario': 'Válido na SEMANA do aniversário',
    'semana': 'Válido na SEMANA do aniversário',
    'mes_aniversario': 'Válido no MÊS do aniversário',
    'mes': 'Válido no MÊS do aniversário',
    'mês': 'Válido no MÊS do aniversário',
  };
  
  return validityMap[normalized] || 'Válido no DIA do aniversário';
};

// Regras gerais da plataforma (sempre as mesmas)
const generalRules = [
  'Obrigatório apresentação de documento com foto e data de nascimento',
  'Cortesia válida quando há consumo no local',
  'Sujeito à disponibilidade do estabelecimento',
  'Informações podem sofrer alteração sem aviso prévio',
];

const CupomModal = ({ isOpen, onClose, estabelecimento }: CupomModalProps) => {
  const cupomRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [showRules, setShowRules] = useState(false);

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
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-gray-900 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        
        {/* Header Gradiente Premium */}
        <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-6 py-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="relative">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3 uppercase tracking-wider">
              Benefício Exclusivo
            </span>
            
            <h2 className="text-2xl font-bold text-white">
              ANIVERSARIANTE VIP
            </h2>
          </div>
        </div>

        {/* Cupom Visual */}
        <div className="p-6" ref={cupomRef}>
          
          {/* Logo + Nome do Estabelecimento */}
          <div className="flex flex-col items-center mb-6 -mt-12">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-gray-800 shadow-lg bg-gray-800">
              {estabelecimento.logo_url || estabelecimento.galeria_fotos?.[0] ? (
                <img 
                  src={estabelecimento.logo_url || estabelecimento.galeria_fotos?.[0]} 
                  alt={estabelecimento.nome_fantasia}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {estabelecimento.nome_fantasia?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white text-center mt-3">
              {estabelecimento.nome_fantasia}
            </h3>
            
            <p className="text-gray-400 text-sm mt-1">
              📍 {estabelecimento.categoria?.[0] || 'Estabelecimento'}
            </p>
          </div>
          
          {/* ========== SEU BENEFÍCIO ========== */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/20 shrink-0">
                <Gift className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-2">
                  Seu Benefício
                </p>
                <p className="text-white font-medium leading-relaxed">
                  {estabelecimento.descricao_beneficio || 'Benefício especial de aniversário'}
                </p>
              </div>
            </div>
          </div>
          
          {/* ========== VALIDADE - SEPARADO ========== */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl mb-4">
            <Calendar className="w-5 h-5 text-pink-400" />
            <span className="text-white font-medium">
              {formatValidity(estabelecimento.periodo_validade_beneficio)}
            </span>
          </div>
          
          {/* ========== VER REGRAS (expansível) ========== */}
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-center gap-2 text-gray-400 text-sm py-3 hover:text-gray-300 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Ver regras de utilização</span>
            {showRules ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {/* Regras expandidas */}
          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 mt-2">
                  
                  {/* CONDIÇÕES DO BENEFÍCIO (específicas do estabelecimento) */}
                  {estabelecimento.regras_utilizacao && (
                    <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Condições do Benefício
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {estabelecimento.regras_utilizacao}
                      </p>
                    </div>
                  )}
                  
                  {/* REGRAS GERAIS (sempre as mesmas) */}
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Regras Gerais
                    </h4>
                    <ul className="space-y-2">
                      {generalRules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-violet-400 mt-0.5">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* URL */}
          <p className="text-center text-gray-600 text-xs mt-6">
            aniversariantevip.com.br
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-3 border-t border-gray-800">
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1.5 py-4 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs">Compartilhar</span>
          </button>
          
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex flex-col items-center gap-1.5 py-4 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors border-x border-gray-800 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs">{downloading ? 'Salvando...' : 'Salvar'}</span>
          </button>
          
          <button
            onClick={handleAddToWallet}
            className="flex flex-col items-center gap-1.5 py-4 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Carteira</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default CupomModal;
