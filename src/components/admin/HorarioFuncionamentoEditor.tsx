import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

export function HorarioFuncionamentoEditor({ value, onChange }: HorarioFuncionamentoEditorProps) {
  const parseValue = (): HorarioSemana => {
    if (!value) return {};
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  };

  const [horarios, setHorarios] = useState<HorarioSemana>(parseValue());

  const updateHorario = (dia: string, updates: Partial<DiaHorario>) => {
    const newHorarios = {
      ...horarios,
      [dia]: {
        ...horarios[dia as keyof HorarioSemana],
        ...updates,
      },
    };
    setHorarios(newHorarios);
    onChange(JSON.stringify(newHorarios));
  };

  const toggleDia = (dia: string) => {
    const currentDia = horarios[dia as keyof HorarioSemana];
    updateHorario(dia, {
      aberto: !currentDia?.aberto,
      inicio: currentDia?.inicio || '08:00',
      fim: currentDia?.fim || '18:00',
    });
  };

  return (
    <div className="space-y-3">
      {diasSemana.map(({ key, label }) => {
        const dia = horarios[key as keyof HorarioSemana];
        return (
          <div key={key} className="border border-white/10 rounded-lg p-3 bg-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">{label}</Label>
              <Switch
                checked={dia?.aberto || false}
                onCheckedChange={() => toggleDia(key)}
              />
            </div>

            {dia?.aberto && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-slate-400">Abertura</Label>
                  <Input
                    type="time"
                    value={dia.inicio || '08:00'}
                    onChange={(e) => updateHorario(key, { inicio: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Fechamento</Label>
                  <Input
                    type="time"
                    value={dia.fim || '18:00'}
                    onChange={(e) => updateHorario(key, { fim: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dia.is24h || false}
                      onChange={(e) => updateHorario(key, { 
                        is24h: e.target.checked,
                        inicio: '00:00',
                        fim: '23:59'
                      })}
                      className="rounded"
                    />
                    <span className="text-slate-400">24h</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
