import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DiaHorario {
  aberto: boolean;
  inicio: string;
  fim: string;
}

interface HorarioSemana {
  segunda: DiaHorario;
  terca: DiaHorario;
  quarta: DiaHorario;
  quinta: DiaHorario;
  sexta: DiaHorario;
  sabado: DiaHorario;
  domingo: DiaHorario;
}

const DIAS = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
] as const;

const ABREVIACAO: Record<string, string> = {
  segunda: "Seg",
  terca: "Ter",
  quarta: "Qua",
  quinta: "Qui",
  sexta: "Sex",
  sabado: "Sáb",
  domingo: "Dom",
};

const DEFAULT_HORARIO: HorarioSemana = {
  segunda: { aberto: true, inicio: "08:00", fim: "18:00" },
  terca: { aberto: true, inicio: "08:00", fim: "18:00" },
  quarta: { aberto: true, inicio: "08:00", fim: "18:00" },
  quinta: { aberto: true, inicio: "08:00", fim: "18:00" },
  sexta: { aberto: true, inicio: "08:00", fim: "18:00" },
  sabado: { aberto: false, inicio: "08:00", fim: "18:00" },
  domingo: { aberto: false, inicio: "08:00", fim: "18:00" },
};

interface HorarioFuncionamentoModalProps {
  value: string;
  onChange: (formatted: string) => void;
  onClose: () => void;
}

export function HorarioFuncionamentoModal({ value, onChange, onClose }: HorarioFuncionamentoModalProps) {
  const [horario, setHorario] = useState<HorarioSemana>(DEFAULT_HORARIO);

  // Try to parse existing value (if it's structured JSON)
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object") {
          setHorario({ ...DEFAULT_HORARIO, ...parsed });
        }
      } catch {
        // Not JSON, keep default
      }
    }
  }, []);

  const updateDia = (dia: keyof HorarioSemana, updates: Partial<DiaHorario>) => {
    setHorario((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], ...updates },
    }));
  };

  const formatHorarioToText = (): string => {
    return DIAS.map(({ key }) => {
      const dia = horario[key as keyof HorarioSemana];
      const abrev = ABREVIACAO[key];
      return dia.aberto ? `${abrev}: ${dia.inicio}-${dia.fim}` : `${abrev}: Fechado`;
    }).join(", ");
  };

  const handleSave = () => {
    const formatted = formatHorarioToText();
    onChange(formatted);
    toast.success("Horário salvo!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Horário de Funcionamento
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {DIAS.map(({ key, label }) => {
            const dia = horario[key as keyof HorarioSemana];
            return (
              <div
                key={key}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={dia.aberto}
                  onChange={(e) =>
                    updateDia(key as keyof HorarioSemana, { aberto: e.target.checked })
                  }
                  className="w-5 h-5 accent-primary rounded"
                />
                <span className="text-foreground text-sm w-20 font-medium">
                  {label}
                </span>
                {dia.aberto ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={dia.inicio}
                      onChange={(e) =>
                        updateDia(key as keyof HorarioSemana, { inicio: e.target.value })
                      }
                      className="px-2 py-1.5 border border-border rounded-lg w-24 text-sm text-foreground bg-background"
                    />
                    <span className="text-muted-foreground text-sm">às</span>
                    <input
                      type="time"
                      value={dia.fim}
                      onChange={(e) =>
                        updateDia(key as keyof HorarioSemana, { fim: e.target.value })
                      }
                      className="px-2 py-1.5 border border-border rounded-lg w-24 text-sm text-foreground bg-background"
                    />
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Fechado</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HorarioFuncionamentoModal;
