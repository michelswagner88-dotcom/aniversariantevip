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
      {/* Card de Benefício - SEMPRE VISÍVEL */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Background com gradiente premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />
        <div className="absolute inset-0 rounded-2xl border border-purple-500/30" />
        <div className="absolute inset-0 shimmer-premium" />

        <div className="relative p-5 md:p-6">
          {/* Header */}
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

          {/* Linha tracejada decorativa */}
          <div className="border-t border-dashed border-purple-500/30 my-4 relative">
            <div className="absolute -left-7 -top-3 w-6 h-6 rounded-full bg-slate-950" />
            <div className="absolute -right-7 -top-3 w-6 h-6 rounded-full bg-slate-950" />
          </div>

          {/* Benefício - SEMPRE VISÍVEL */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-4 border border-purple-500/20">
            <p className="text-lg md:text-xl text-white font-medium leading-relaxed text-center">
              🎁 {beneficio || 'Benefício exclusivo para aniversariantes!'}
            </p>
          </div>

          {/* Validade - SEMPRE VISÍVEL */}
          <div className="flex items-center justify-center gap-2 text-sm text-purple-300/90 mb-4">
            <Calendar className="w-4 h-4" />
            <span>Válido: {getValidadeTexto(validadeTexto)}</span>
          </div>

          {/* Botão Ver Regras - REGISTRA CLIQUE */}
          <motion.button
            onClick={handleVerRegras}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-white border border-white/10"
          >
            <Eye className="w-5 h-5 text-purple-400" />
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
              className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-purple-500/30 max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 bg-gradient-to-b from-purple-900/30 to-transparent">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-400" />
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
                <div className="bg-purple-500/20 rounded-xl p-4 text-center border border-purple-500/30">
                  <p className="text-sm text-purple-300 mb-1">Você ganha:</p>
                  <p className="text-lg font-bold text-white">
                    🎁 {beneficio || 'Benefício exclusivo para aniversariantes!'}
                  </p>
                </div>

                {/* Regras */}
                {regras && (
                  <div>
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      Regras de uso
                    </h3>
                    <div className="text-gray-300 text-sm space-y-2 whitespace-pre-line bg-slate-800/50 p-4 rounded-xl">
                      {regras}
                    </div>
                  </div>
                )}

                {/* Dica */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-sm text-yellow-200 flex items-start gap-2">
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
                      Emita seu cupom abaixo
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Apresente o cupom no estabelecimento
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
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  <Gift className="w-5 h-5" />
                  Emitir Meu Cupom
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
