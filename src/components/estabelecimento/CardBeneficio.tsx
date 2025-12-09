import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Calendar, FileText, X, Sparkles, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEstablishmentMetrics } from '@/hooks/useEstablishmentMetrics';
import { getValidadeTexto } from '@/lib/bioUtils';

interface CardBeneficioProps {
  beneficio: string;
  validadeTexto: string;
  regras?: string;
  estabelecimentoId: string;
  userId: string | null;
  onEmitirCupom: () => void;
}

export const CardBeneficio = ({
  beneficio,
  validadeTexto,
  regras,
  estabelecimentoId,
  userId,
  onEmitirCupom,
}: CardBeneficioProps) => {
  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);
  const { trackEvent } = useEstablishmentMetrics();

  const handleVerRegras = async () => {
    await trackEvent(estabelecimentoId, 'benefit_click');

    if (!userId) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/auth', {
        state: { mensagem: 'Faça login para ver as regras do benefício' },
      });
      return;
    }

    setModalAberto(true);
  };

  return (
    <>
      {/* Card de Benefício - Design Clean Premium */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Gradient border sutil */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#240046] to-[#3C096C] opacity-30 blur-sm" />
        <div className="absolute inset-[1px] rounded-2xl bg-slate-900/95" />
        
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#240046]/10 via-transparent to-[#3C096C]/10 pointer-events-none" />
        
        <div className="relative p-6 md:p-8 space-y-5">
          {/* Ícone com pulse premium */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#240046]/30 flex items-center justify-center border border-[#240046]/40 shadow-lg shadow-[#240046]/20">
              <Gift className="w-8 h-8 text-[#A78BFA]" />
            </div>
          </motion.div>

          {/* Benefício - Grande e impactante */}
          <div className="text-center">
            <p className="text-xl md:text-2xl text-white font-bold leading-tight tracking-tight">
              {beneficio || 'Benefício exclusivo para aniversariantes!'}
            </p>
          </div>

          {/* Validade - Elegante */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Calendar className="w-4 h-4 text-[#A78BFA]" />
              <span className="text-sm text-gray-300">
                Válido: <span className="text-[#A78BFA] font-medium">{getValidadeTexto(validadeTexto)}</span>
              </span>
            </div>
          </div>

          {/* Botão Clean - SEM shimmer excessivo */}
          <button
            onClick={handleVerRegras}
            className="
              w-full py-4 
              bg-gradient-to-r from-[#240046] to-[#3C096C]
              hover:from-[#3C096C] hover:to-[#5B21B6]
              text-white font-semibold text-base
              rounded-xl
              transition-all duration-300
              hover:scale-[1.02] active:scale-[0.98]
              shadow-lg shadow-[#240046]/30
              flex items-center justify-center gap-2
            "
          >
            <Sparkles className="w-5 h-5" />
            Ver regras e como usar o benefício
          </button>
        </div>
      </motion.div>

      {/* Modal de Regras - Premium */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop blur premium */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setModalAberto(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl"
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#240046] to-[#3C096C] opacity-20" />
              <div className="absolute inset-[1px] rounded-3xl bg-slate-900" />
              
              <div className="relative">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-b from-[#240046]/15 to-transparent">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#240046] to-[#3C096C] flex items-center justify-center">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      Como usar seu benefício
                    </h2>
                    <button
                      onClick={() => setModalAberto(false)}
                      className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                  {/* Benefício highlight */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#240046]/20 to-[#3C096C]/20" />
                    <div className="relative p-5 text-center border border-[#240046]/30 rounded-2xl">
                      <p className="text-sm text-[#A78BFA] mb-2">Você ganha:</p>
                      <p className="text-lg font-bold text-white">
                        🎁 {beneficio || 'Benefício exclusivo!'}
                      </p>
                    </div>
                  </div>

                  {/* Regras */}
                  {regras && (
                    <div>
                      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A78BFA]" />
                        Regras de uso
                      </h3>
                      <div className="text-gray-300 text-sm space-y-2 whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5">
                        {regras}
                      </div>
                    </div>
                  )}

                  {/* Dica */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm text-amber-200 flex items-start gap-3">
                      <span className="text-xl">💡</span>
                      <span>
                        <strong>Dica:</strong> Leve um documento com foto para confirmar sua data de nascimento.
                      </span>
                    </p>
                  </div>

                  {/* Checklist elegante */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-medium">
                      Passos para usar
                    </p>
                    <ul className="space-y-3 text-sm text-gray-300">
                      {[
                        'Veja seu benefício abaixo',
                        'Apresente seu benefício no local',
                        'Mostre documento com data de nascimento',
                        'Aproveite seu benefício! 🎉'
                      ].map((step, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          </div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-slate-900/80 space-y-3">
                  <button
                    onClick={() => {
                      setModalAberto(false);
                      onEmitirCupom();
                    }}
                    className="
                      w-full py-4 
                      bg-gradient-to-r from-[#240046] to-[#3C096C]
                      hover:from-[#3C096C] hover:to-[#5B21B6]
                      text-white font-semibold text-base
                      rounded-xl
                      transition-all duration-300
                      hover:scale-[1.02] active:scale-[0.98]
                      shadow-lg shadow-[#240046]/30
                      flex items-center justify-center gap-2
                    "
                  >
                    <Gift className="w-5 h-5" />
                    Ver Meu Benefício
                  </button>

                  <button
                    onClick={() => setModalAberto(false)}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors border border-white/10"
                  >
                    Entendi!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CardBeneficio;
