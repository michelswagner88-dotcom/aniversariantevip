// =============================================================================
// BENEFIT SHEET - ANIVERSARIANTE VIP
// Premium Bottom Sheet estilo Airbnb
// Mobile-first, clean, minimalista
// =============================================================================

import { useMemo } from "react";
import { Gift, Calendar, MessageCircle, ShieldCheck, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// =============================================================================
// TYPES
// =============================================================================

interface BenefitSheetProps {
  isOpen: boolean;
  onClose: () => void;
  estabelecimentoNome: string;
  beneficio: string;
  tipoBeneficio?: "cortesia" | "brinde" | "desconto" | "bonus" | "gratis";
  validade?: "dia_aniversario" | "semana_aniversario" | "mes_aniversario" | "sempre";
  regras?: string;
  passos?: string[];
  whatsappUrl?: string;
  onUsarBeneficio: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIPO_BENEFICIO_CONFIG: Record<string, { label: string; emoji: string }> = {
  cortesia: { label: "Cortesia", emoji: "🎁" },
  brinde: { label: "Brinde", emoji: "🎀" },
  desconto: { label: "Desconto", emoji: "💰" },
  bonus: { label: "Bônus", emoji: "⭐" },
  gratis: { label: "Grátis", emoji: "🆓" },
};

const VALIDADE_CONFIG: Record<string, { label: string; short: string }> = {
  dia_aniversario: { label: "Válido no dia do aniversário", short: "No dia" },
  semana_aniversario: { label: "Válido na semana do aniversário", short: "Na semana" },
  mes_aniversario: { label: "Válido no mês do aniversário", short: "No mês" },
  sempre: { label: "Válido o ano todo", short: "Sempre" },
};

// Passos padrão caso não sejam fornecidos
const DEFAULT_STEPS = [
  "Vá ao estabelecimento no período de validade",
  "Apresente um documento com foto e data de nascimento",
  "Aproveite seu benefício exclusivo!",
];

// =============================================================================
// COMPONENT
// =============================================================================

export const BenefitSheet = ({
  isOpen,
  onClose,
  estabelecimentoNome,
  beneficio,
  tipoBeneficio,
  validade = "dia_aniversario",
  regras,
  passos,
  whatsappUrl,
  onUsarBeneficio,
}: BenefitSheetProps) => {
  // Configurações derivadas
  const tipoConfig = tipoBeneficio ? TIPO_BENEFICIO_CONFIG[tipoBeneficio] : null;
  const validadeConfig = VALIDADE_CONFIG[validade] || VALIDADE_CONFIG.dia_aniversario;

  // Parse das regras em lista (se vier como texto separado por . ou ;)
  const regrasList = useMemo(() => {
    if (!regras) return [];
    return regras
      .split(/[.;]/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  }, [regras]);

  // Passos a exibir
  const stepsToShow = passos && passos.length > 0 ? passos : DEFAULT_STEPS;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        // 88dvh de altura, cantos arredondados, sem padding padrão
        className={cn("h-[88dvh] rounded-t-3xl p-0", "bg-white border-t border-zinc-200", "flex flex-col")}
      >
        {/* =============================================================== */}
        {/* HEADER - Fixo no topo */}
        {/* =============================================================== */}
        <SheetHeader className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-zinc-100">
          {/* Indicador de arraste (mobile pattern) */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-zinc-300" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Ícone em bloco suave */}
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

        {/* =============================================================== */}
        {/* CONTEÚDO - ScrollArea */}
        {/* =============================================================== */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 space-y-6">
            {/* ----------------------------------------------------------- */}
            {/* CARD ÚNICO: SEU BENEFÍCIO */}
            {/* ----------------------------------------------------------- */}
            <section className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50" aria-labelledby="benefit-title">
              {/* Linha de badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span id="benefit-title" className="text-sm font-semibold text-zinc-700">
                  Seu benefício
                </span>

                {/* Badge tipo (se houver) */}
                {tipoConfig && (
                  <Badge
                    variant="secondary"
                    className="bg-[#240046]/10 text-[#240046] hover:bg-[#240046]/15 font-medium"
                  >
                    {tipoConfig.emoji} {tipoConfig.label}
                  </Badge>
                )}

                {/* Badge validade */}
                <Badge variant="outline" className="border-zinc-300 text-zinc-600 font-normal">
                  <Calendar className="w-3 h-3 mr-1" />
                  {validadeConfig.short}
                </Badge>
              </div>

              {/* Descrição do benefício */}
              <p className="text-lg font-semibold text-zinc-900 leading-snug">
                {beneficio || "Benefício exclusivo para aniversariantes!"}
              </p>

              {/* Microtexto de confiança */}
              <div className="flex items-start gap-2 mt-4 pt-4 border-t border-zinc-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Apresente no estabelecimento e siga as condições abaixo. Leve documento com foto e data de nascimento.
                </p>
              </div>
            </section>

            {/* ----------------------------------------------------------- */}
            {/* REGRAS E CONDIÇÕES (só se houver) */}
            {/* ----------------------------------------------------------- */}
            {regrasList.length > 0 && (
              <section aria-labelledby="rules-title">
                <h3 id="rules-title" className="text-sm font-semibold text-zinc-700 mb-3">
                  Regras e condições
                </h3>

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

            {/* Separador visual */}
            {regrasList.length > 0 && <Separator className="bg-zinc-100" />}

            {/* ----------------------------------------------------------- */}
            {/* PASSO A PASSO */}
            {/* ----------------------------------------------------------- */}
            <section aria-labelledby="steps-title">
              <h3 id="steps-title" className="text-sm font-semibold text-zinc-700 mb-4">
                Passo a passo
              </h3>

              <div className="space-y-4">
                {stepsToShow.map((step, index) => (
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

            {/* Espaço extra para não ficar atrás do footer */}
            <div className="h-4" />
          </div>
        </ScrollArea>

        {/* =============================================================== */}
        {/* FOOTER STICKY */}
        {/* =============================================================== */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-zinc-200 bg-white space-y-3">
          {/* Botões de ação */}
          <div className="flex gap-3">
            {/* Botão primário - Usar benefício */}
            <Button
              onClick={() => {
                onUsarBeneficio();
                onClose();
              }}
              className={cn(
                "flex-1 h-12 text-base font-semibold",
                "bg-[#240046] hover:bg-[#3C096C] text-white",
                "rounded-xl transition-all duration-150",
                "active:scale-[0.98]",
              )}
            >
              <Gift className="w-5 h-5 mr-2" />
              Usar benefício
            </Button>

            {/* Botão secundário - WhatsApp (só se tiver URL) */}
            {whatsappUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(whatsappUrl, "_blank")}
                className={cn(
                  "h-12 px-4",
                  "border-zinc-300 hover:border-emerald-400 hover:bg-emerald-50",
                  "rounded-xl transition-all duration-150",
                  "active:scale-[0.98]",
                )}
                aria-label="Falar no WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </Button>
            )}
          </div>

          {/* Microtexto */}
          <p className="text-[11px] text-zinc-400 text-center">
            {validadeConfig.label}. Benefício sujeito à disponibilidade.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BenefitSheet;
