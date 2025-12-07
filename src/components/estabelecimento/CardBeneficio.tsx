import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Calendar, Eye, FileText, X, Sparkles, Info, Check } from 'lucide-react';
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
    // 1. SEMPRE registrar métrica de clique antes de qualquer verificação
    await trackEvent(estabelecimentoId, 'benefit_click');

    // 2. Verificar se está logado
    if (!userId) {
      // Salvar onde estava para voltar depois do login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/auth', {
        state: { mensagem: 'Faça login para ver as regras do benefício' },
      });
      return;
    }

    // 3. Se logado, abrir modal com as regras
    setModalAberto(true);
  };

  return (
    <>
      {/* Card de Benefício - Design Minimalista Glass Effect */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
      >
        <div className="p-5 md:p-6">
          {/* Benefício - Grande e claro */}
          <p className="text-lg md:text-xl text-white font-medium leading-relaxed text-center mb-3">
            🎁 {beneficio || 'Benefício exclusivo para aniversariantes!'}
          </p>

          {/* Validade - Discreta */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-5">
            <Calendar className="w-4 h-4" />
            <span>Válido: {getValidadeTexto(validadeTexto)}</span>
          </div>

          {/* Botão - Gradiente Cosmic */}
          <motion.button
            onClick={handleVerRegras}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/25"
          >
            <Sparkles className="w-5 h-5" />
            Ver regras e como usar
          </motion.button>
        </div>
      </motion.div>

      {/* Modal de Regras */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setModalAberto(false)}
            />

            {/* Conteúdo do Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-fuchsia-400" />
                    Como usar seu benefício
                  </h2>
                  <button
                    onClick={() => setModalAberto(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5 space-y-5 overflow-y-auto max-h-[60vh]">
                {/* Benefício */}
                <div className="bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-xl p-4 text-center border border-fuchsia-500/30">
                  <p className="text-sm text-fuchsia-300 mb-1">Você ganha:</p>
                  <p className="text-lg font-bold text-white">
                    🎁 {beneficio || 'Benefício exclusivo para aniversariantes!'}
                  </p>
                </div>

                {/* Regras */}
                {regras && (
                  <div>
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-fuchsia-400" />
                      Regras de uso
                    </h3>
                    <div className="text-gray-300 text-sm space-y-2 whitespace-pre-line bg-slate-800/50 p-4 rounded-xl">
                      {regras}
                    </div>
                  </div>
                )}

                {/* Dica */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-sm text-amber-200 flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                      <strong>Dica:</strong> Leve um documento com foto para confirmar sua data de nascimento no estabelecimento.
                    </span>
                  </p>
                </div>

                {/* Checklist */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                    Passos para usar
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Veja seu benefício abaixo
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Apresente seu benefício no local
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Mostre documento com data de nascimento
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Aproveite seu benefício! 🎉
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-white/10 bg-slate-900/80 space-y-3">
                <motion.button
                  onClick={() => {
                    setModalAberto(false);
                    onEmitirCupom();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/25"
                >
                  <Gift className="w-5 h-5" />
                  Ver Meu Benefício
                </motion.button>

                <button
                  onClick={() => setModalAberto(false)}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium transition-colors"
                >
                  Entendi!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CardBeneficio;