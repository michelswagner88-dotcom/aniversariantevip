import { useState, useEffect, useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface DiaHorario {
  aberto: boolean;
  inicio: string;
  fim: string;
  is24h?: boolean;
}

interface HorarioSemana {
  seg?: DiaHorario;
  ter?: DiaHorario;
  qua?: DiaHorario;
  qui?: DiaHorario;
  sex?: DiaHorario;
  sab?: DiaHorario;
  dom?: DiaHorario;
}

interface HorarioFuncionamentoEditorProps {
  value: string | null;
  onChange: (json: string) => void;
}

const diasSemana = [
  { key: "seg", label: "Segunda-feira" },
  { key: "ter", label: "Terça-feira" },
  { key: "qua", label: "Quarta-feira" },
  { key: "qui", label: "Quinta-feira" },
  { key: "sex", label: "Sexta-feira" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
] as const;

type DiaKey = (typeof diasSemana)[number]["key"];

const parseValue = (value: string | null): HorarioSemana => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export function HorarioFuncionamentoEditor({ value, onChange }: HorarioFuncionamentoEditorProps) {
  const [horarios, setHorarios] = useState<HorarioSemana>(() => parseValue(value));
  const uniqueId = useId();

  // Sincronizar estado quando value mudar externamente
  useEffect(() => {
    setHorarios(parseValue(value));
  }, [value]);

  const updateHorario = (dia: DiaKey, updates: Partial<DiaHorario>) => {
    const newHorarios = {
      ...horarios,
      [dia]: {
        ...horarios[dia],
        ...updates,
      },
    };
    setHorarios(newHorarios);
    onChange(JSON.stringify(newHorarios));
  };

  const toggleDia = (dia: DiaKey) => {
    const currentDia = horarios[dia];
    updateHorario(dia, {
      aberto: !currentDia?.aberto,
      inicio: currentDia?.inicio || "08:00",
      fim: currentDia?.fim || "18:00",
    });
  };

  const toggle24h = (dia: DiaKey, checked: boolean) => {
    updateHorario(dia, {
      is24h: checked,
      inicio: checked ? "00:00" : "08:00",
      fim: checked ? "23:59" : "18:00",
    });
  };

  return (
    <div className="space-y-3">
      {diasSemana.map(({ key, label }) => {
        const dia = horarios[key];
        const switchId = `${uniqueId}-${key}-switch`;
        const aberturaId = `${uniqueId}-${key}-abertura`;
        const fechamentoId = `${uniqueId}-${key}-fechamento`;
        const is24hId = `${uniqueId}-${key}-24h`;

        return (
          <div key={key} className="border border-white/10 rounded-lg p-3 bg-slate-800/50">
            <div className="flex items-center justify-between mb-2 min-h-[44px]">
              <Label htmlFor={switchId} className="text-sm font-medium cursor-pointer">
                {label}
              </Label>
              <Switch
                id={switchId}
                checked={dia?.aberto || false}
                onCheckedChange={() => toggleDia(key)}
                aria-label={`${label} - ${dia?.aberto ? "Aberto" : "Fechado"}`}
              />
            </div>

            {dia?.aberto && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor={aberturaId} className="text-xs text-slate-400">
                    Abertura
                  </Label>
                  <Input
                    id={aberturaId}
                    type="time"
                    value={dia.inicio || "08:00"}
                    onChange={(e) => updateHorario(key, { inicio: e.target.value })}
                    className="min-h-[44px]"
                    disabled={dia.is24h}
                  />
                </div>

                <div>
                  <Label htmlFor={fechamentoId} className="text-xs text-slate-400">
                    Fechamento
                  </Label>
                  <Input
                    id={fechamentoId}
                    type="time"
                    value={dia.fim || "18:00"}
                    onChange={(e) => updateHorario(key, { fim: e.target.value })}
                    className="min-h-[44px]"
                    disabled={dia.is24h}
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex items-center gap-2 min-h-[44px]">
                    <Checkbox
                      id={is24hId}
                      checked={dia.is24h || false}
                      onCheckedChange={(checked) => toggle24h(key, checked === true)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={is24hId} className="text-sm text-slate-400 cursor-pointer">
                      Aberto 24h
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
