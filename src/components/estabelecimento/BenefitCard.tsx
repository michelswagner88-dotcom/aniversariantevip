// BenefitCard.tsx - Card de Benefício Clean Premium

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Calendar, ChevronRight, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEstablishmentMetrics } from "@/hooks/useEstablishmentMetrics";
import { getValidadeTexto } from "@/lib/bioUtils";

interface BenefitCardProps {
  beneficio: string;
  validadeTexto: string;
  regras?: string;
  estabelecimentoId: string;
  userId: string | null;
  onEmitirCupom: () => void;
}

const BenefitCard = ({
  beneficio,
  validadeTexto,
  regras,
  estabelecimentoId,
  userId,
  onEmitirCupom,
}: BenefitCardProps) => {
  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);
  const { trackEvent } = useEstablishmentMetrics();

  const handleVerBeneficio = async () => {
    await trackEvent(estabelecimentoId, "benefit_click");

    if (!userId) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/auth", {
        state: { mensagem: "Faça login para ver seu benefício" },
      });
      return;
    }

    setModalAberto(true);
  };

  return (
    <>
      {/* ===== CARD DE BENEFÍCIO ===== */}
      {/* mt-4 no mobile, mt-6 no desktop */}
      <div className="mx-4 sm:mx-6 mt-4 sm:mt-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="
              bg-gradient-to-r from-[#240046] to-[#3C096C]
              rounded-2xl
              p-4 sm:p-6
              shadow-lg
            "
          >
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs sm:text-sm font-medium mb-1">Benefício de Aniversário</p>
                <p className="text-white text-base sm:text-lg md:text-xl font-bold leading-snug">
                  {beneficio || "Benefício exclusivo para aniversariantes!"}
                </p>
              </div>
            </div>

            {/* Validade */}
            <div className="flex items-center gap-2 mt-4 text-white/80">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Válido: {getValidadeTexto(validadeTexto)}</span>
            </div>

            {/* Botão - min 48px de altura para touch */}
            <button
              onClick={handleVerBeneficio}
              className="
                w-full mt-4 sm:mt-5
                py-3.5 sm:py-4 px-4
                bg-white
                text-[#240046]
                font-semibold
                text-sm sm:text-base
                rounded-xl
                flex items-center justify-center gap-2
                transition-all duration-200
                active:scale-[0.98]
              "
            >
              Ver como usar
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== MODAL DE REGRAS ===== */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setModalAberto(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="
                relative 
                w-full 
                max-w-lg 
                bg-white 
                rounded-t-3xl sm:rounded-2xl
                max-h-[85vh]
                overflow-hidden
              "
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-[#EBEBEB] px-5 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#222222]">Como usar seu benefício</h2>
                <button
                  onClick={() => setModalAberto(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center hover:bg-[#EBEBEB] transition-colors"
                >
                  <X className="w-4 h-4 text-[#717171]" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-5 space-y-5 overflow-y-auto max-h-[60vh]">
                {/* Benefício em destaque */}
                <div className="bg-gradient-to-r from-[#240046] to-[#3C096C] rounded-xl p-4 text-center">
                  <p className="text-white/70 text-sm mb-1">Você ganha:</p>
                  <p className="text-white text-lg font-bold">🎁 {beneficio}</p>
                </div>

                {/* Validade */}
                <div className="bg-[#F7F7F7] rounded-xl p-4">
                  <p className="text-sm text-[#717171] mb-1">Validade</p>
                  <p className="text-[#222222] font-medium">{getValidadeTexto(validadeTexto)}</p>
                </div>

                {/* Regras */}
                {regras && (
                  <div className="bg-[#F7F7F7] rounded-xl p-4">
                    <p className="text-sm text-[#717171] mb-2">Regras de utilização</p>
                    <p className="text-[#222222] text-sm leading-relaxed whitespace-pre-line">{regras}</p>
                  </div>
                )}

                {/* Passos */}
                <div className="border border-[#EBEBEB] rounded-xl p-4">
                  <p className="text-sm text-[#717171] mb-3 font-medium">Passo a passo</p>
                  <ul className="space-y-3">
                    {[
                      "Vá até o estabelecimento",
                      "Apresente este benefício",
                      "Mostre documento com data de nascimento",
                      "Aproveite! 🎉",
                    ].map((step, i) => (
                      <li key={i} className="flex items-center gap-3 text-[#222222] text-sm">
                        <div className="w-6 h-6 rounded-full bg-[#240046] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dica */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    💡 <strong>Dica:</strong> Leve um documento com foto para confirmar sua data de nascimento.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-[#EBEBEB] p-5 space-y-3">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    onEmitirCupom();
                  }}
                  className="
                    w-full py-3.5
                    bg-gradient-to-r from-[#240046] to-[#3C096C]
                    text-white
                    font-semibold
                    rounded-xl
                    flex items-center justify-center gap-2
                    transition-all duration-200
                    hover:opacity-95
                    active:scale-[0.98]
                  "
                >
                  <Gift className="w-5 h-5" />
                  Gerar Meu Cupom
                </button>

                <button
                  onClick={() => setModalAberto(false)}
                  className="
                    w-full py-3
                    bg-[#F7F7F7]
                    text-[#717171]
                    font-medium
                    rounded-xl
                    transition-colors
                    hover:bg-[#EBEBEB]
                  "
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BenefitCard;
