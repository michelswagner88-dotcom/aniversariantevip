// =============================================================================
// ESTABLISHMENT BENEFIT - Configuração do benefício para aniversariantes
// =============================================================================

import { useState, useEffect } from "react";
import { Gift, Calendar, Check, Save, Loader2, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

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
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo_beneficio: "",
    descricao_beneficio: "",
    periodo_validade_beneficio: "mes_aniversario",
    regras_utilizacao: "",
  });

  // Sync form with estabelecimento data
  useEffect(() => {
    if (estabelecimento) {
      setForm({
        tipo_beneficio: estabelecimento.tipo_beneficio || "",
        descricao_beneficio: estabelecimento.descricao_beneficio || "",
        periodo_validade_beneficio: estabelecimento.periodo_validade_beneficio || "mes_aniversario",
        regras_utilizacao: estabelecimento.regras_utilizacao || "",
      });
    }
  }, [estabelecimento]);

  // Handle save
  const handleSave = async () => {
    if (!form.tipo_beneficio) {
      toast.error("Selecione um tipo de benefício");
      return;
    }

    if (!form.descricao_beneficio.trim()) {
      toast.error("Descreva o benefício");
      return;
    }

    setSaving(true);

    try {
      const success = await onUpdate({
        tipo_beneficio: form.tipo_beneficio,
        descricao_beneficio: form.descricao_beneficio,
        periodo_validade_beneficio: form.periodo_validade_beneficio,
        regras_utilizacao: form.regras_utilizacao || null,
      });

      if (success) {
        toast.success("Benefício atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Error saving benefit:", error);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const selectedTipo = TIPOS_BENEFICIO.find((t) => t.id === form.tipo_beneficio);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Benefício de Aniversário</h1>
        <p className="text-muted-foreground mt-1">Configure o que você oferece para aniversariantes</p>
      </div>

      {/* Tip Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Dica para atrair mais clientes</p>
            <p className="text-sm text-muted-foreground mt-1">
              Benefícios claros e atrativos aumentam a taxa de conversão. Seja específico sobre o que o aniversariante
              ganha!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Benefício */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Tipo de Benefício
          </CardTitle>
          <CardDescription>Selecione o tipo que melhor descreve sua oferta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TIPOS_BENEFICIO.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => setForm({ ...form, tipo_beneficio: tipo.id })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 text-center",
                  form.tipo_beneficio === tipo.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/50 hover:border-muted-foreground/50",
                )}
              >
                <span className="text-3xl block mb-2">{tipo.emoji}</span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    form.tipo_beneficio === tipo.id ? "text-primary" : "text-foreground",
                  )}
                >
                  {tipo.label}
                </span>
                {form.tipo_beneficio === tipo.id && <Check className="w-4 h-4 text-primary mx-auto mt-2" />}
              </button>
            ))}
          </div>
          {selectedTipo && <p className="text-sm text-muted-foreground mt-3">{selectedTipo.description}</p>}
        </CardContent>
      </Card>

      {/* Descrição do Benefício */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Descrição do Benefício</CardTitle>
          <CardDescription>Descreva claramente o que o aniversariante ganha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={form.descricao_beneficio}
            onChange={(e) => setForm({ ...form, descricao_beneficio: e.target.value })}
            rows={3}
            className="bg-muted border-border text-foreground resize-none"
            placeholder="Ex: Sobremesa grátis para o aniversariante + 10% de desconto para a mesa"
          />
          <p className="text-xs text-muted-foreground">
            Seja específico e atrativo. Evite termos vagos como "benefício especial".
          </p>
        </CardContent>
      </Card>

      {/* Período de Validade */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Período de Validade
          </CardTitle>
          <CardDescription>Quando o aniversariante pode usar o benefício</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={form.periodo_validade_beneficio}
            onValueChange={(value) => setForm({ ...form, periodo_validade_beneficio: value })}
            className="space-y-3"
          >
            {PERIODOS_VALIDADE.map((periodo) => (
              <label
                key={periodo.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  form.periodo_validade_beneficio === periodo.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/50 hover:border-muted-foreground/50",
                )}
              >
                <RadioGroupItem value={periodo.id} className="border-muted-foreground" />
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      form.periodo_validade_beneficio === periodo.id ? "text-primary" : "text-foreground",
                    )}
                  >
                    {periodo.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{periodo.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Regras de Utilização */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-500" />
            Regras de Utilização
            <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </CardTitle>
          <CardDescription>Condições para usar o benefício</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={form.regras_utilizacao}
            onChange={(e) => setForm({ ...form, regras_utilizacao: e.target.value })}
            rows={4}
            className="bg-muted border-border text-foreground resize-none"
            placeholder="Ex: Válido de segunda a sexta. Apresentar documento com foto. Consumação mínima de R$50 por pessoa. Não acumulativo com outras promoções."
          />
          <p className="text-xs text-muted-foreground">Seja claro nas regras para evitar mal-entendidos.</p>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Pré-visualização</CardTitle>
          <CardDescription>Como os aniversariantes vão ver seu benefício</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              {selectedTipo && <span className="text-2xl">{selectedTipo.emoji}</span>}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Benefício de Aniversário</p>
                {selectedTipo && (
                  <span className="inline-block px-2 py-0.5 bg-primary/20 rounded-full text-xs text-primary mt-1">
                    {selectedTipo.label}
                  </span>
                )}
              </div>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {form.descricao_beneficio || "Descreva seu benefício..."}
            </p>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {PERIODOS_VALIDADE.find((p) => p.id === form.periodo_validade_beneficio)?.label}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 px-8">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Benefício
        </Button>
      </div>
    </div>
  );
}

export default EstablishmentBenefit;
