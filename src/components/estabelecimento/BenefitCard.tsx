// BenefitCard.tsx - Golden Ticket Style Premium 2025
// Tendências: Gradientes vibrantes, Glow effects, Animações suaves

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Calendar, ChevronRight, X, Clock, CheckCircle2, Sparkles } from "lucide-react";
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
  validadeTexto = "dia_aniversario",
  regras,
  estabelecimentoId,
  userId,
  isModalOpen = false,
  onModalOpenChange,
}: BenefitCardProps) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const modalOpen = onModalOpenChange ? isModalOpen : internalModalOpen;
  const setModalOpen = onModalOpenChange || setInternalModalOpen;

  // Converter validade para texto legível
  const getValidadeDisplay = (validade: string) => {
    const map: Record<string, { text: string; icon: string }> = {
      dia_aniversario: { text: "No dia do aniversário", icon: "🎂" },
      semana_aniversario: { text: "Na semana do aniversário", icon: "📅" },
      mes_aniversario: { text: "No mês do aniversário", icon: "🗓️" },
      dia: { text: "No dia do aniversário", icon: "🎂" },
      semana: { text: "Na semana do aniversário", icon: "📅" },
      mes: { text: "No mês do aniversário", icon: "🗓️" },
    };
    return map[validade] || { text: validade, icon: "📅" };
  };

  const validadeInfo = getValidadeDisplay(validadeTexto);

  const handleVerBeneficio = () => {
    if (!userId) {
      toast.error("Faça login para ver o benefício completo");
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      {/* BENEFIT CARD - Golden Ticket Style */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        className="mx-4 sm:mx-6 -mt-12 sm:-mt-16 relative z-20"
      >
        <div className="max-w-3xl mx-auto">
          {/* Card Principal */}
          <div
            className="
              relative overflow-hidden
              rounded-3xl
              bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5A189A]
              shadow-[0_20px_60px_rgba(124,58,237,0.4)]
              border border-white/10
            "
          >
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%),
                                  radial-gradient(circle at 40% 80%, rgba(255,255,255,0.05) 0%, transparent 30%)`,
              }}
            />

            {/* Linha decorativa estilo ticket */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-white rounded-r-full opacity-10" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-white rounded-l-full opacity-10" />

            {/* Conteúdo */}
            <div className="relative p-6 sm:p-8">
              {/* Header com ícone */}
              <div className="flex items-start gap-4 mb-4">
                {/* Ícone animado */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  className="
                    w-14 h-14 rounded-2xl
                    bg-gradient-to-br from-amber-400 to-orange-500
                    flex items-center justify-center
                    shadow-lg shadow-amber-500/30
                    shrink-0
                  "
                >
                  <Gift className="w-7 h-7 text-white" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  {/* Label */}
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400 uppercase tracking-wider">
                      Benefício de Aniversário
                    </span>
                  </div>

                  {/* Título do benefício */}
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{beneficio}</h2>
                </div>
              </div>

              {/* Validade */}
              <div className="flex items-center gap-2 mb-6 text-white/80">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {validadeInfo.icon} Válido: {validadeInfo.text}
                </span>
              </div>

              {/* Linha pontilhada decorativa */}
              <div
                className="
                border-t border-dashed border-white/20 
                my-4
                relative
              "
              >
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white" />
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white" />
              </div>

              {/* Botão Ver Como Usar */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerBeneficio}
                className="
                  w-full py-4
                  bg-white
                  text-[#240046] font-semibold
                  rounded-2xl
                  flex items-center justify-center gap-2
                  shadow-lg shadow-black/10
                  hover:shadow-xl hover:shadow-black/20
                  transition-all duration-300
                  group
                "
              >
                <span>Ver como usar</span>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>

            {/* Efeito de brilho no canto */}
            <div
              className="
                absolute -top-20 -right-20 
                w-40 h-40 
                bg-gradient-to-br from-white/20 to-transparent 
                rounded-full 
                blur-3xl
              "
            />
          </div>
        </div>
      </motion.div>

      {/* MODAL DE DETALHES */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="benefit-modal-title"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="
                relative w-full max-w-lg
                bg-white rounded-t-3xl sm:rounded-3xl
                overflow-hidden
                max-h-[90vh]
              "
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              {/* Header gradiente */}
              <div
                className="
                bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5A189A]
                p-6 pb-12
              "
              >
                {/* Botão fechar */}
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Fechar"
                  className="
                    absolute top-4 right-4
                    w-10 h-10 rounded-full
                    bg-white/20 backdrop-blur-sm
                    flex items-center justify-center
                    hover:bg-white/30 active:scale-95
                    transition-all
                  "
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Ícone */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                  className="
                    w-16 h-16 rounded-2xl
                    bg-gradient-to-br from-amber-400 to-orange-500
                    flex items-center justify-center
                    shadow-lg shadow-black/20
                    mb-4
                  "
                >
                  <Gift className="w-8 h-8 text-white" />
                </motion.div>

                <h3 id="benefit-modal-title" className="text-2xl font-bold text-white mb-2">
                  {beneficio}
                </h3>

                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {validadeInfo.icon} {validadeInfo.text}
                  </span>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 -mt-6 bg-white rounded-t-3xl relative">
                {/* Como usar */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-[#222222] mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Como utilizar
                  </h4>

                  <ol className="space-y-4">
                    {[
                      "Apresente um documento com foto no estabelecimento",
                      "Informe que é seu mês de aniversário",
                      "Aproveite seu benefício exclusivo!",
                    ].map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span
                          className="
                          w-7 h-7 rounded-full shrink-0
                          bg-gradient-to-br from-[#240046] to-[#3C096C]
                          text-white text-sm font-bold
                          flex items-center justify-center
                        "
                        >
                          {index + 1}
                        </span>
                        <span className="text-[#484848] pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Regras */}
                {regras && (
                  <div
                    className="
                    p-4 rounded-2xl
                    bg-amber-50 border border-amber-200
                  "
                  >
                    <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Regras e observações
                    </h4>
                    <p className="text-sm text-amber-700 leading-relaxed">{regras}</p>
                  </div>
                )}

                {/* Botão fechar */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalOpen(false)}
                  className="
                    w-full mt-6 py-4
                    bg-gradient-to-r from-[#240046] to-[#3C096C]
                    text-white font-semibold
                    rounded-2xl
                    shadow-lg shadow-purple-500/25
                    hover:shadow-xl hover:shadow-purple-500/30
                    transition-all
                  "
                >
                  Entendi!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BenefitCard;
