// =============================================================================
// BENEFIT CARD v2 - ANIVERSARIANTE VIP
// src/components/estabelecimento/BenefitCard.tsx
// Bottom Sheet premium estilo Airbnb - Clean, branco, minimalista
// =============================================================================

import { useState } from "react";
import { Gift, Calendar, Sparkles, X, ShieldCheck, CheckCircle2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// =============================================================================
// TYPES
// =============================================================================

interface BenefitCardProps {
  beneficio: string;
  validadeTexto?: string;
  tipoBeneficio?: "cortesia" | "brinde" | "desconto" | "bonus" | "gratis";
  regras?: string;
  estabelecimentoId: string;
  estabelecimentoNome?: string;
  userId: string | null;
  whatsappUrl?: string;
  isModalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIPO_CONFIG: Record<string, { emoji: string; label: string; bgColor: string; textColor: string }> = {
  cortesia: { emoji: "🎁", label: "Cortesia", bgColor: "bg-violet-100", textColor: "text-violet-700" },
  brinde: { emoji: "🎀", label: "Brinde", bgColor: "bg-pink-100", textColor: "text-pink-700" },
  desconto: { emoji: "💰", label: "Desconto", bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
  bonus: { emoji: "⭐", label: "Bônus", bgColor: "bg-amber-100", textColor: "text-amber-700" },
  gratis: { emoji: "🆓", label: "Grátis", bgColor: "bg-blue-100", textColor: "text-blue-700" },
};

const VALIDADE_CONFIG: Record<string, { label: string; short: string }> = {
  dia_aniversario: { label: "Válido no dia do aniversário", short: "No dia" },
  semana_aniversario: { label: "Válido na semana do aniversário", short: "Na semana" },
  mes_aniversario: { label: "Válido no mês do aniversário", short: "No mês" },
  sempre: { label: "Válido o ano todo", short: "Sempre" },
};

const DEFAULT_STEPS = [
  "Vá ao estabelecimento no período de validade",
  "Apresente um documento com foto e data de nascimento",
  "Aproveite seu benefício exclusivo!",
];

// =============================================================================
// COMPONENT
// =============================================================================

const BenefitCard = ({
  beneficio,
  validadeTexto = "mes_aniversario",
  tipoBeneficio,
  regras,
  estabelecimentoId,
  estabelecimentoNome,
  userId,
  whatsappUrl,
  isModalOpen = false,
  onModalOpenChange,
}: BenefitCardProps) => {
  // Estado do modal (controlado ou não)
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const sheetOpen = onModalOpenChange ? isModalOpen : internalModalOpen;
  const setSheetOpen = onModalOpenChange || setInternalModalOpen;

  // Configurações derivadas
  const tipoConfig = tipoBeneficio ? TIPO_CONFIG[tipoBeneficio] : null;
  const validadeConfig = VALIDADE_CONFIG[validadeTexto] || VALIDADE_CONFIG.mes_aniversario;

  // Parse das regras em lista
  const regrasList = regras
    ? regras
        .split(/[.;]/)
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
    : [];

  // Handler para abrir sheet
  const handleVerBeneficio = () => {
    if (!userId) {
      toast.error("Faça login para ver o benefício");
      return;
    }
    setSheetOpen(true);
  };

  return (
    <>
      {/* ================================================================= */}
      {/* CARD DO BENEFÍCIO - Fundo roxo escuro */}
      {/* ================================================================= */}
      <section className="px-4 mt-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#240046] rounded-2xl p-5">
            <div className="flex items-start gap-4">
              {/* Ícone */}
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Badge tipo benefício */}
                  {tipoConfig && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5",
                        "text-xs font-bold rounded-full",
                        tipoConfig.bgColor,
                        tipoConfig.textColor,
                      )}
                    >
                      <span>{tipoConfig.emoji}</span>
                      <span>{tipoConfig.label}</span>
                    </span>
                  )}

                  {/* Badge validade */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 text-white/90 text-xs font-medium rounded-full">
                    <Calendar className="w-3 h-3" />
                    {validadeConfig.short}
                  </span>
                </div>

                {/* Texto do benefício */}
                <h2 className="text-lg font-semibold text-white leading-snug">{beneficio}</h2>
              </div>
            </div>

            {/* Botão CTA */}
            <button
              onClick={handleVerBeneficio}
              className={cn(
                "w-full mt-5 py-3.5 rounded-xl",
                "bg-white text-[#240046]",
                "font-semibold text-sm",
                "flex items-center justify-center gap-2",
                "active:scale-[0.98] transition-transform",
                "min-h-[48px]",
              )}
            >
              <Sparkles className="w-5 h-5" />
              Ver regras e como usar
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM SHEET - Estilo Airbnb Premium */}
      {/* ================================================================= */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className={cn("h-[88dvh] rounded-t-3xl p-0", "bg-white border-t border-zinc-200", "flex flex-col")}
        >
          {/* --------------------------------------------------------------- */}
          {/* HEADER - Fixo */}
          {/* --------------------------------------------------------------- */}
          <SheetHeader className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-zinc-100">
            {/* Indicador de arraste */}
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full bg-zinc-300" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Ícone */}
                <div className="w-11 h-11 rounded-xl bg-[#240046]/10 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-[#240046]" />
                </div>

                <div>
                  <SheetTitle className="text-lg font-semibold text-zinc-900 text-left">
                    Como usar seu benefício
                  </SheetTitle>
                  {estabelecimentoNome && <p className="text-sm text-zinc-500 mt-0.5">Em {estabelecimentoNome}</p>}
                </div>
              </div>

              {/* Botão fechar */}
              <SheetClose asChild>
                <button
                  className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 text-zinc-600" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* --------------------------------------------------------------- */}
          {/* CONTEÚDO - ScrollArea */}
          {/* --------------------------------------------------------------- */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-5 py-5 space-y-6">
              {/* CARD ÚNICO: SEU BENEFÍCIO */}
              <section className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-zinc-700">Seu benefício</span>

                  {/* Badge tipo */}
                  {tipoConfig && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1",
                        "text-xs font-bold rounded-full",
                        tipoConfig.bgColor,
                        tipoConfig.textColor,
                      )}
                    >
                      {tipoConfig.emoji} {tipoConfig.label}
                    </span>
                  )}

                  {/* Badge validade */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 border border-zinc-300 text-zinc-600 text-xs font-medium rounded-full">
                    <Calendar className="w-3 h-3" />
                    {validadeConfig.short}
                  </span>
                </div>

                {/* Descrição */}
                <p className="text-lg font-semibold text-zinc-900 leading-snug">{beneficio}</p>

                {/* Microtexto de confiança */}
                <div className="flex items-start gap-2 mt-4 pt-4 border-t border-zinc-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Apresente no estabelecimento e siga as condições abaixo. Leve documento com foto e data de
                    nascimento.
                  </p>
                </div>
              </section>

              {/* REGRAS E CONDIÇÕES (só se houver) */}
              {regrasList.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">Regras e condições</h3>
                  <ul className="space-y-2.5">
                    {regrasList.map((regra, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-zinc-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{regra}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Separador */}
              {regrasList.length > 0 && <Separator className="bg-zinc-100" />}

              {/* PASSO A PASSO */}
              <section>
                <h3 className="text-sm font-semibold text-zinc-700 mb-4">Passo a passo</h3>
                <div className="space-y-4">
                  {DEFAULT_STEPS.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {/* Bolinha numerada */}
                      <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-zinc-700">{index + 1}</span>
                      </div>
                      <p className="text-sm text-zinc-600 pt-1 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Espaço extra */}
              <div className="h-4" />
            </div>
          </ScrollArea>

          {/* --------------------------------------------------------------- */}
          {/* FOOTER STICKY */}
          {/* --------------------------------------------------------------- */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-zinc-200 bg-white space-y-3">
            {/* Botões */}
            <div className="flex gap-3">
              {/* Botão primário */}
              <button
                onClick={() => setSheetOpen(false)}
                className={cn(
                  "flex-1 h-12 text-base font-semibold",
                  "bg-[#240046] hover:bg-[#3C096C] text-white",
                  "rounded-xl transition-all duration-150",
                  "active:scale-[0.98]",
                  "flex items-center justify-center gap-2",
                )}
              >
                <Gift className="w-5 h-5" />
                Entendi
              </button>

              {/* Botão WhatsApp (só se tiver URL) */}
              {whatsappUrl && (
                <button
                  onClick={() => window.open(whatsappUrl, "_blank")}
                  className={cn(
                    "h-12 px-4",
                    "border border-zinc-300 hover:border-emerald-400 hover:bg-emerald-50",
                    "rounded-xl transition-all duration-150",
                    "active:scale-[0.98]",
                    "flex items-center justify-center",
                  )}
                  aria-label="Falar no WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </button>
              )}
            </div>

            {/* Microtexto */}
            <p className="text-[11px] text-zinc-400 text-center">
              {validadeConfig.label}. Benefício sujeito à disponibilidade.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BenefitCard;
