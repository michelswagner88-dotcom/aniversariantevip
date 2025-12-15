// src/components/estabelecimento/BenefitCard.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Calendar, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BenefitCardProps {
  beneficio: string;
  validadeTexto?: string;
  regras?: string;
  estabelecimentoId: string;
  userId: string | null;
  isModalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
}

const BenefitCard = ({
  beneficio,
  validadeTexto = "mes_aniversario",
  regras,
  estabelecimentoId,
  userId,
  isModalOpen = false,
  onModalOpenChange,
}: BenefitCardProps) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const modalOpen = onModalOpenChange ? isModalOpen : internalModalOpen;
  const setModalOpen = onModalOpenChange || setInternalModalOpen;

  const getValidadeDisplay = (validade: string) => {
    const map: Record<string, string> = {
      dia_aniversario: "No dia do aniversario",
      semana_aniversario: "Na semana do aniversario",
      mes_aniversario: "No mes do aniversario",
    };
    return map[validade] || validade;
  };

  const handleVerBeneficio = () => {
    if (!userId) {
      toast.error("Faca login para ver o beneficio");
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      <section className="px-4 mt-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#240046] rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-1">
                  Beneficio de Aniversario
                </p>
                <h2 className="text-lg font-semibold text-white leading-snug">{beneficio}</h2>
                <p className="flex items-center gap-1.5 mt-2 text-sm text-white/70">
                  <Calendar className="w-4 h-4" />
                  {getValidadeDisplay(validadeTexto)}
                </p>
              </div>
            </div>

            <button
              onClick={handleVerBeneficio}
              className="w-full mt-5 py-3.5 rounded-xl bg-white text-[#240046] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              Ver como usar
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            <motion.div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-auto"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Como usar</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-5">
                <div className="bg-[#240046]/5 rounded-xl p-4 mb-6">
                  <p className="font-medium text-gray-900">{beneficio}</p>
                  <p className="text-sm text-gray-500 mt-1">{getValidadeDisplay(validadeTexto)}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-sm font-medium text-gray-500 uppercase">Passo a passo</p>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#240046] text-white flex items-center justify-center text-sm font-medium shrink-0">
                      1
                    </div>
                    <p className="text-gray-700 pt-0.5">Apresente documento com foto</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#240046] text-white flex items-center justify-center text-sm font-medium shrink-0">
                      2
                    </div>
                    <p className="text-gray-700 pt-0.5">Informe que e seu aniversario</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#240046] text-white flex items-center justify-center text-sm font-medium shrink-0">
                      3
                    </div>
                    <p className="text-gray-700 pt-0.5">Aproveite seu beneficio!</p>
                  </div>
                </div>

                {regras && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-amber-800 mb-1">Regras</p>
                    <p className="text-sm text-amber-700">{regras}</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t p-5">
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full py-3.5 rounded-xl bg-[#240046] text-white font-semibold active:scale-[0.98] transition-transform"
                >
                  Entendi
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
