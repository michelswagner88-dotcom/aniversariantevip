// =============================================================================
// BENEFIT SHEET - ANIVERSARIANTE VIP
// Premium Bottom Sheet estilo Airbnb
// Mobile-first, clean, minimalista
// =============================================================================

import { useMemo } from "react";
import {
  Gift,
  Calendar,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 border-0">
        {/* =============================================================== */}
        {/* HEADER - Fixo no topo */}
        {/* =============================================================== */}
        <SheetHeader className="sticky top-0 z-10 bg-background px-6 pt-4 pb-4 border-b border-border/50">
          {/* Indicador de arraste (mobile pattern) */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Ícone em bloco suave */}
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                <Gift className="w-6 h-6 text-primary" />
              </div>

              <div className="flex flex-col">
                <SheetTitle className="text-lg font-semibold text-foreground text-left">
                  Como usar seu benefício
                </SheetTitle>
                {estabelecimentoNome && (
                  <span className="text-sm text-muted-foreground">
                    Em {estabelecimentoNome}
                  </span>
                )}
              </div>
            </div>

            {/* Botão fechar */}
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* =============================================================== */}
        {/* CONTEÚDO - ScrollArea */}
        {/* =============================================================== */}
        <ScrollArea className="flex-1 h-[calc(85vh-180px)]">
          <div className="px-6 py-6 space-y-6">
            {/* ----------------------------------------------------------- */}
            {/* CARD ÚNICO: SEU BENEFÍCIO */}
            {/* ----------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              {/* Linha de badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary/15 text-primary border-0 font-medium">
                  Seu benefício
                </Badge>

                {/* Badge tipo (se houver) */}
                {tipoConfig && (
                  <Badge variant="outline" className="text-xs border-muted-foreground/30">
                    {tipoConfig.emoji} {tipoConfig.label}
                  </Badge>
                )}

                {/* Badge validade */}
                <Badge variant="outline" className="text-xs border-muted-foreground/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  {validadeConfig.short}
                </Badge>
              </div>

              {/* Descrição do benefício */}
              <p className="text-base font-medium text-foreground leading-relaxed">
                {beneficio || "Benefício exclusivo para aniversariantes!"}
              </p>

              {/* Microtexto de confiança */}
              <div className="flex items-start gap-2 mt-4 pt-3 border-t border-primary/10">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Apresente no estabelecimento e siga as condições abaixo.
                  Leve documento com foto e data de nascimento.
                </span>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* REGRAS E CONDIÇÕES (só se houver) */}
            {/* ----------------------------------------------------------- */}
            {regrasList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Regras e condições
                </h3>

                <ul className="space-y-2">
                  {regrasList.map((regra, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {regra}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Separador visual */}
            {regrasList.length > 0 && <Separator className="bg-border/50" />}

            {/* ----------------------------------------------------------- */}
            {/* PASSO A PASSO */}
            {/* ----------------------------------------------------------- */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Passo a passo
              </h3>

              <div className="space-y-4">
                {stepsToShow.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    {/* Bolinha numerada */}
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Espaço extra para não ficar atrás do footer */}
            <div className="h-4" />
          </div>
        </ScrollArea>

        {/* =============================================================== */}
        {/* FOOTER STICKY */}
        {/* =============================================================== */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border/50 px-6 py-4 pb-safe">
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
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "rounded-xl transition-all duration-150",
                "active:scale-[0.98]"
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
                  "border-border hover:border-emerald-400 hover:bg-emerald-50",
                  "rounded-xl transition-all duration-150",
                  "active:scale-[0.98]"
                )}
                aria-label="Falar no WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </Button>
            )}
          </div>

          {/* Microtexto */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            {validadeConfig.label}. Benefício sujeito à disponibilidade.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BenefitSheet;
