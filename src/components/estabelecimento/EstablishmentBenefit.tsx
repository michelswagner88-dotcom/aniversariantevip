// =============================================================================
// ESTABLISHMENT BENEFIT - Configuração do benefício LIGHT
// Tema Light Premium estilo Stripe/Linear
// =============================================================================

import { useState, useEffect } from "react";
import { Gift, Calendar, Check, Save, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { InlineSaveTextarea } from "@/components/ui/InlineSaveTextarea";
import { useFieldUpdate } from "@/hooks/useFieldUpdate";
import { PanelSection } from "@/components/panel/PanelSection";

// =============================================================================
// TYPES
// =============================================================================

interface EstabelecimentoData {
  id: string;
  descricao_beneficio: string | null;
  tipo_beneficio: string | null;
  periodo_validade_beneficio: string | null;
  regras_utilizacao: string | null;
}

interface EstablishmentBenefitProps {
  estabelecimento: EstabelecimentoData | null;
  loading: boolean;
  onUpdate: (updates: Partial<EstabelecimentoData>) => Promise<boolean>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIPOS_BENEFICIO = [
  { id: "cortesia", emoji: "🎁", label: "Cortesia", description: "Ex: Sobremesa grátis, entrada gratuita" },
  { id: "brinde", emoji: "🎀", label: "Brinde", description: "Ex: Um brinde especial, presente" },
  { id: "desconto", emoji: "💰", label: "Desconto", description: "Ex: 20% de desconto, 50% off" },
  { id: "bonus", emoji: "⭐", label: "Bônus", description: "Ex: Pontos em dobro, upgrade" },
  { id: "gratis", emoji: "🆓", label: "Grátis", description: "Ex: Produto ou serviço grátis" },
];

const PERIODOS_VALIDADE = [
  { id: "dia_aniversario", label: "No dia do aniversário", description: "Válido apenas no dia exato" },
  { id: "semana_aniversario", label: "Na semana do aniversário", description: "Válido durante toda a semana" },
  { id: "mes_aniversario", label: "No mês do aniversário", description: "Válido durante todo o mês" },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function EstablishmentBenefit({ estabelecimento, loading, onUpdate }: EstablishmentBenefitProps) {
  const [tipoBeneficio, setTipoBeneficio] = useState("");
  const [periodoValidade, setPeriodoValidade] = useState("mes_aniversario");
  const [savingTipo, setSavingTipo] = useState(false);
  const [savingPeriodo, setSavingPeriodo] = useState(false);

  const { createFieldSaver } = useFieldUpdate({
    estabelecimentoId: estabelecimento?.id || "",
    onSuccess: (field) => {
      console.log(`[Benefit] Campo ${field} salvo com sucesso`);
    },
    onError: (field, error) => {
      console.error(`[Benefit] Erro ao salvar ${field}:`, error);
    },
  });

  useEffect(() => {
    if (estabelecimento) {
      setTipoBeneficio(estabelecimento.tipo_beneficio || "");
      setPeriodoValidade(estabelecimento.periodo_validade_beneficio || "mes_aniversario");
    }
  }, [estabelecimento]);

  const handleSaveTipo = async (tipo: string) => {
    if (!tipo) {
      toast.error("Selecione um tipo de benefício");
      return;
    }

    setSavingTipo(true);
    try {
      const success = await onUpdate({ tipo_beneficio: tipo });
      if (success) {
        setTipoBeneficio(tipo);
        toast.success("Tipo de benefício salvo!");
      }
    } catch (error) {
      toast.error("Erro ao salvar tipo de benefício");
    } finally {
      setSavingTipo(false);
    }
  };

  const handleSavePeriodo = async (periodo: string) => {
    setSavingPeriodo(true);
    try {
      const success = await onUpdate({ periodo_validade_beneficio: periodo });
      if (success) {
        setPeriodoValidade(periodo);
        toast.success("Período de validade salvo!");
      }
    } catch (error) {
      toast.error("Erro ao salvar período");
    } finally {
      setSavingPeriodo(false);
    }
  };

  const selectedTipo = TIPOS_BENEFICIO.find((t) => t.id === tipoBeneficio);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-[#E7E7EA] animate-pulse rounded" />
        <div className="h-4 w-96 bg-[#E7E7EA] animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#E7E7EA] animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Benefício de Aniversário</h1>
        <p className="text-[#6B7280] mt-1">Configure o que você oferece para aniversariantes</p>
      </div>

      {/* Tip Card */}
      <div className="bg-[#240046]/5 border border-[#240046]/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-white border border-[#E7E7EA]">
          <Sparkles className="w-5 h-5 text-[#240046]" />
        </div>
        <div>
          <p className="font-medium text-[#111827]">Dica para atrair mais clientes</p>
          <p className="text-sm text-[#6B7280] mt-1">
            Benefícios claros e atrativos aumentam a taxa de conversão. Seja específico sobre o que o aniversariante
            ganha!
          </p>
        </div>
      </div>

      {/* Tipo de Benefício */}
      <PanelSection
        title="Tipo de Benefício"
        description="Selecione o tipo que melhor descreve sua oferta"
        icon={<Gift className="w-5 h-5 text-pink-500" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TIPOS_BENEFICIO.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => setTipoBeneficio(tipo.id)}
                disabled={savingTipo}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-150 text-center",
                  tipoBeneficio === tipo.id
                    ? "border-[#240046] bg-[#240046]/5"
                    : "border-[#E7E7EA] bg-white hover:border-[#D1D1D6]",
                  savingTipo && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="text-3xl block mb-2">{tipo.emoji}</span>
                <span className={cn("text-sm font-medium", tipoBeneficio === tipo.id ? "text-[#240046]" : "text-[#111827]")}>
                  {tipo.label}
                </span>
                {tipoBeneficio === tipo.id && <Check className="w-4 h-4 text-[#240046] mx-auto mt-2" />}
              </button>
            ))}
          </div>

          {selectedTipo && <p className="text-sm text-[#6B7280]">{selectedTipo.description}</p>}

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              onClick={() => handleSaveTipo(tipoBeneficio)}
              disabled={savingTipo || tipoBeneficio === estabelecimento?.tipo_beneficio}
              className={cn(
                "min-w-[100px] bg-[#240046] hover:bg-[#3C096C]",
                tipoBeneficio === estabelecimento?.tipo_beneficio && "opacity-50"
              )}
            >
              {savingTipo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : tipoBeneficio === estabelecimento?.tipo_beneficio ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  Salvo
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </PanelSection>

      {/* Descrição do Benefício */}
      <PanelSection title="Descrição do Benefício" description="Descreva claramente o que o aniversariante ganha">
        <InlineSaveTextarea
          id="descricao_beneficio"
          label=""
          value={estabelecimento?.descricao_beneficio || ""}
          placeholder="Ex: Sobremesa grátis para o aniversariante + 10% de desconto para a mesa"
          rows={3}
          maxLength={500}
          required
          normalize
          helperText="Seja específico e atrativo. Evite termos vagos como 'benefício especial'."
          onSave={createFieldSaver("descricao_beneficio")}
        />
      </PanelSection>

      {/* Período de Validade */}
      <PanelSection
        title="Período de Validade"
        description="Quando o aniversariante pode usar o benefício"
        icon={<Calendar className="w-5 h-5 text-blue-500" />}
      >
        <div className="space-y-4">
          <RadioGroup value={periodoValidade} onValueChange={setPeriodoValidade} className="space-y-3">
            {PERIODOS_VALIDADE.map((periodo) => (
              <label
                key={periodo.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150",
                  periodoValidade === periodo.id
                    ? "border-[#240046] bg-[#240046]/5"
                    : "border-[#E7E7EA] bg-white hover:border-[#D1D1D6]",
                  savingPeriodo && "opacity-50 cursor-not-allowed"
                )}
              >
                <RadioGroupItem value={periodo.id} className="border-[#9CA3AF]" disabled={savingPeriodo} />
                <div>
                  <p className={cn("font-medium", periodoValidade === periodo.id ? "text-[#240046]" : "text-[#111827]")}>
                    {periodo.label}
                  </p>
                  <p className="text-sm text-[#6B7280]">{periodo.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              onClick={() => handleSavePeriodo(periodoValidade)}
              disabled={savingPeriodo || periodoValidade === estabelecimento?.periodo_validade_beneficio}
              className={cn(
                "min-w-[100px] bg-[#240046] hover:bg-[#3C096C]",
                periodoValidade === estabelecimento?.periodo_validade_beneficio && "opacity-50"
              )}
            >
              {savingPeriodo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : periodoValidade === estabelecimento?.periodo_validade_beneficio ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  Salvo
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </PanelSection>

      {/* Regras de Utilização */}
      <PanelSection
        title="Regras de Utilização"
        description="Condições para usar o benefício (opcional)"
      >
        <InlineSaveTextarea
          id="regras_utilizacao"
          label=""
          value={estabelecimento?.regras_utilizacao || ""}
          placeholder="Ex: Válido de segunda a sexta. Apresentar documento com foto. Consumação mínima de R$50 por pessoa. Não acumulativo com outras promoções."
          rows={4}
          maxLength={1000}
          normalize
          helperText="Seja claro nas regras para evitar mal-entendidos."
          onSave={createFieldSaver("regras_utilizacao")}
        />
      </PanelSection>

      {/* Preview */}
      <PanelSection title="Pré-visualização" description="Como os aniversariantes vão ver seu benefício">
        <div className="bg-[#F7F7F8] rounded-xl p-5 border border-[#E7E7EA]">
          <div className="flex items-center gap-3 mb-3">
            {selectedTipo && <span className="text-2xl">{selectedTipo.emoji}</span>}
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide">Benefício de Aniversário</p>
              {selectedTipo && (
                <span className="inline-block px-2 py-0.5 bg-[#240046]/10 rounded-full text-xs text-[#240046] mt-1 font-medium">
                  {selectedTipo.label}
                </span>
              )}
            </div>
          </div>
          <p className="text-lg font-semibold text-[#111827]">
            {estabelecimento?.descricao_beneficio || "Descreva seu benefício..."}
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm text-[#6B7280]">
            <Calendar className="w-4 h-4" />
            {PERIODOS_VALIDADE.find((p) => p.id === periodoValidade)?.label}
          </div>
          {estabelecimento?.regras_utilizacao && (
            <div className="mt-3 pt-3 border-t border-[#E7E7EA]">
              <p className="text-xs text-[#6B7280]">
                <strong>Regras:</strong> {estabelecimento.regras_utilizacao}
              </p>
            </div>
          )}
        </div>
      </PanelSection>
    </div>
  );
}

export default EstablishmentBenefit;
