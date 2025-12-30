// =============================================================================
// CARD BENEFÍCIO v2 - ANIVERSARIANTE VIP
// Card limpo + Bottom Sheet premium (BenefitSheet)
// Mobile-first, estilo Airbnb
// =============================================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEstablishmentMetrics } from "@/hooks/useEstablishmentMetrics";
import { BenefitSheet } from "./BenefitSheet";
import { formatWhatsApp, getWhatsAppMessage } from "@/lib/contactUtils";

// =============================================================================
// TYPES
// =============================================================================

interface CardBeneficioProps {
  beneficio: string;
  tipoBeneficio?: "cortesia" | "brinde" | "desconto" | "bonus" | "gratis";
  validade?: "dia_aniversario" | "semana_aniversario" | "mes_aniversario" | "sempre";
  regras?: string;
  estabelecimentoId: string;
  estabelecimentoNome: string;
  estabelecimentoCategoria?: string;
  whatsapp?: string;
  telefone?: string;
  userId: string | null;
  onEmitirCupom: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIPO_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  cortesia: { emoji: "🎁", label: "Cortesia", color: "text-violet-700 bg-violet-100" },
  brinde: { emoji: "🎀", label: "Brinde", color: "text-pink-700 bg-pink-100" },
  desconto: { emoji: "💰", label: "Desconto", color: "text-emerald-700 bg-emerald-100" },
  bonus: { emoji: "⭐", label: "Bônus", color: "text-amber-700 bg-amber-100" },
  gratis: { emoji: "🆓", label: "Grátis", color: "text-blue-700 bg-blue-100" },
};

const VALIDADE_LABEL: Record<string, string> = {
  dia_aniversario: "No dia do aniversário",
  semana_aniversario: "Na semana do aniversário",
  mes_aniversario: "No mês do aniversário",
  sempre: "Válido o ano todo",
};

// =============================================================================
// COMPONENT
// =============================================================================

export const CardBeneficio = ({
  beneficio,
  tipoBeneficio,
  validade = "dia_aniversario",
  regras,
  estabelecimentoId,
  estabelecimentoNome,
  estabelecimentoCategoria,
  whatsapp,
  telefone,
  userId,
  onEmitirCupom,
}: CardBeneficioProps) => {
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { trackBenefitClick } = useEstablishmentMetrics();

  // Configurações derivadas
  const tipoConfig = tipoBeneficio ? TIPO_CONFIG[tipoBeneficio] : null;
  const validadeLabel = VALIDADE_LABEL[validade] || VALIDADE_LABEL.dia_aniversario;

  // Montar URL do WhatsApp
  const whatsappNumber = formatWhatsApp(whatsapp || telefone);
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        getWhatsAppMessage(estabelecimentoNome, estabelecimentoCategoria),
      )}`
    : undefined;

  // Handler para abrir o sheet
  const handleVerRegras = async () => {
    // Rastrear clique
    if (estabelecimentoId) {
      trackBenefitClick(estabelecimentoId);
    }

    // Se não estiver logado, redirecionar para auth
    if (!userId) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/auth", {
        state: { mensagem: "Faça login para ver as regras do benefício" },
      });
      return;
    }

    // Abrir sheet
    setSheetOpen(true);
  };

  return (
    <>
      {/* ================================================================= */}
      {/* CARD DO BENEFÍCIO - Design Clean */}
      {/* ================================================================= */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Ícone */}
          <div className="w-12 h-12 rounded-xl bg-[#240046]/10 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-[#240046]" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Badge tipo benefício */}
              {tipoConfig && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1",
                    "text-xs font-bold rounded-full",
                    tipoConfig.color,
                  )}
                >
                  <span>{tipoConfig.emoji}</span>
                  <span>{tipoConfig.label}</span>
                </span>
              )}

              {/* Badge validade */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-full">
                <Calendar className="w-3 h-3" />
                {validadeLabel}
              </span>
            </div>

            {/* Texto do benefício */}
            <h3 className="text-lg font-semibold text-zinc-900 leading-snug">
              {beneficio || "Benefício exclusivo para aniversariantes!"}
            </h3>
          </div>
        </div>

        {/* Botão CTA */}
        <button
          onClick={handleVerRegras}
          className={cn(
            "w-full mt-5 py-3.5 px-4",
            "bg-[#240046] hover:bg-[#3C096C] text-white",
            "font-semibold rounded-xl",
            "transition-all duration-150",
            "active:scale-[0.98]",
            "flex items-center justify-center gap-2",
            "min-h-[48px]", // Touch target
          )}
        >
          <Sparkles className="w-5 h-5" />
          Ver regras e como usar
        </button>
      </div>

      {/* ================================================================= */}
      {/* BOTTOM SHEET - BenefitSheet */}
      {/* ================================================================= */}
      <BenefitSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        estabelecimentoNome={estabelecimentoNome}
        beneficio={beneficio}
        tipoBeneficio={tipoBeneficio}
        validade={validade}
        regras={regras}
        whatsappUrl={whatsappUrl}
        onUsarBeneficio={onEmitirCupom}
      />
    </>
  );
};

export default CardBeneficio;
